import { db } from '@/firebase/config';
import { Location, Match, MatchInvitation } from '@/types/match';
import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";

// Collection references
const matchesCollection = collection(db, 'matches');
const invitationsCollection = collection(db, 'matchInvitations');

// Create a new match
export async function createMatch(
  hostId: string,
  title: string,
  hostEmail: string,
  location?: string,
  address?: Location,
  numberOfHoles: 9 | 18 = 18
): Promise<string> {
  try {
    const timestamp = Date.now();
    const newMatch: Omit<Match, 'id'> = {
      hostId,
      title,
      status: 'pending',
      participants: [hostId], // Host is automatically a participant
      participantEmails: {
        [hostId]: hostEmail // Store host's email
      },
      createdAt: timestamp,
      updatedAt: timestamp,
      location,
      address,
      numberOfHoles,
      type: 'invite' // Always set to invite-only
    };

    const docRef = await addDoc(matchesCollection, newMatch);
    return docRef.id;
  } catch (error) {
    console.error('Error creating match:', error);
    throw error;
  }
}

// Get a match by ID
export async function getMatch(matchId: string): Promise<Match | null> {
  try {
    const matchRef = doc(matchesCollection, matchId);
    const matchSnap = await getDoc(matchRef);
    
    if (!matchSnap.exists()) {
      return null;
    }
    
    return {
      id: matchSnap.id,
      ...matchSnap.data()
    } as Match;
  } catch (error) {
    console.error('Error getting match:', error);
    throw error;
  }
}

// Update a match
export async function updateMatch(matchId: string, updates: Partial<Match>): Promise<void> {
  try {
    await updateDoc(doc(db, 'matches', matchId), updates);
  } catch (error) {
    console.error('Error updating match:', error);
    throw error;
  }
}

// Get all public matches
export async function getPublicMatches(): Promise<Match[]> {
  try {
    const q = query(
      matchesCollection,
      where('type', '==', 'public'),
      where('status', 'in', ['pending', 'active']),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
  } catch (error) {
    console.error('Error getting public matches:', error);
    throw error;
  }
}

// Get current matches for a user
export async function getCurrentMatchesForUser(userId: string): Promise<Match[]> {
  try {
    const q = query(
      matchesCollection,
      where('participants', 'array-contains', userId),
      where('status', 'in', ['pending', 'active']),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
  } catch (error) {
    console.error('Error getting current matches for user:', error);
    throw error;
  }
}

// Get match history for a user
export async function getMatchHistoryForUser(userId: string, currentUserId?: string): Promise<Match[]> {
  try {
    console.log(`Fetching match history for user: ${userId}, currentUser: ${currentUserId || 'self'}`);
    
    // If viewing own profile (currentUserId is undefined or same as userId)
    if (!currentUserId || currentUserId === userId) {
      console.log("Fetching all matches for own profile");
      
      // Get matches where the user is a participant
      const participantQuery = query(
        matchesCollection,
        where('participants', 'array-contains', userId)
      );
      
      // Get matches where the user is a host
      const hostQuery = query(
        matchesCollection,
        where('hostId', '==', userId)
      );
      
      const [participantSnapshot, hostSnapshot] = await Promise.all([
        getDocs(participantQuery),
        getDocs(hostQuery)
      ]);
      
      console.log(`Found ${participantSnapshot.docs.length} matches where user is a participant`);
      console.log(`Found ${hostSnapshot.docs.length} matches where user is a host`);
      
      // Combine results, removing duplicates
      const matchMap = new Map();
      
      participantSnapshot.forEach(doc => {
        matchMap.set(doc.id, { id: doc.id, ...doc.data() });
      });
      
      hostSnapshot.forEach(doc => {
        matchMap.set(doc.id, { id: doc.id, ...doc.data() });
      });
      
      const matches = Array.from(matchMap.values()) as Match[];
      console.log(`Combined ${matches.length} unique matches for user's own profile`);
      
      // Sort by date (newest first)
      return matches.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } 
    // If viewing a friend's profile
    else {
      console.log("Fetching shared matches for friend's profile");
      
      // Get matches where both users are participants
      const sharedMatchesQuery = query(
        matchesCollection,
        where('participants', 'array-contains', userId)
      );
      
      const sharedMatchesSnapshot = await getDocs(sharedMatchesQuery);
      console.log(`Found ${sharedMatchesSnapshot.docs.length} potential shared matches`);
      
      // Filter to only include matches where currentUserId is also a participant
      const sharedMatches = sharedMatchesSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }) as Match)
        .filter(match => {
          const isCurrentUserParticipant = match.participants.includes(currentUserId);
          const isCurrentUserHost = match.hostId === currentUserId;
          return isCurrentUserParticipant || isCurrentUserHost;
        });
      
      console.log(`Filtered to ${sharedMatches.length} truly shared matches`);
      
      // Sort by date (newest first)
      return sharedMatches.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }
  } catch (error) {
    console.error('Error getting match history for user:', error);
    // Return empty array instead of throwing
    return [];
  }
}

// Create a match invitation
export async function createMatchInvitation(
  matchId: string,
  invitedBy: string,
  email: string
): Promise<string> {
  try {
    const newInvitation: Omit<MatchInvitation, 'id'> = {
      matchId,
      invitedBy,
      email,
      createdAt: Date.now(),
      accepted: false
    };
    
    const docRef = await addDoc(invitationsCollection, newInvitation);
    return docRef.id;
  } catch (error) {
    console.error('Error creating match invitation:', error);
    throw error;
  }
}

// Get invitations for a match
export async function getInvitationsForMatch(matchId: string): Promise<MatchInvitation[]> {
  try {
    const q = query(
      invitationsCollection,
      where('matchId', '==', matchId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MatchInvitation));
  } catch (error) {
    console.error('Error getting invitations for match:', error);
    throw error;
  }
}

// Accept a match invitation
export async function acceptMatchInvitation(invitationId: string, userId: string): Promise<void> {
  try {
    // Get the invitation
    const invitationDoc = await getDoc(doc(db, 'matchInvitations', invitationId));
    
    if (!invitationDoc.exists()) {
      throw new Error('Invitation not found');
    }
    
    const invitation = { id: invitationDoc.id, ...invitationDoc.data() } as MatchInvitation;
    
    // Update the invitation
    await updateDoc(doc(db, 'matchInvitations', invitationId), {
      accepted: true,
      acceptedAt: Date.now()
    });
    
    // Add the user to the match participants
    const matchDoc = await getDoc(doc(db, 'matches', invitation.matchId));
    
    if (!matchDoc.exists()) {
      throw new Error('Match not found');
    }
    
    const match = { id: matchDoc.id, ...matchDoc.data() } as Match;
    
    if (!match.participants.includes(userId)) {
      await updateDoc(doc(db, 'matches', invitation.matchId), {
        participants: [...match.participants, userId]
      });
    }
  } catch (error) {
    console.error('Error accepting match invitation:', error);
    throw error;
  }
}

// Get matches by location
export async function getMatchesByLocation(lat: number, lng: number, radiusKm: number = 10): Promise<Match[]> {
  try {
    // Since Firestore doesn't support geospatial queries directly,
    // we'll fetch all public matches and filter them on the client side
    const publicMatches = await getPublicMatches();
    
    // Filter matches by distance
    return publicMatches.filter(match => {
      if (!match.address || !match.address.lat || !match.address.lng) return false;
      
      // Calculate distance using Haversine formula
      const distance = calculateDistance(
        lat, lng,
        match.address.lat, match.address.lng
      );
      
      return distance <= radiusKm;
    });
  } catch (error) {
    console.error('Error getting matches by location:', error);
    throw error;
  }
}

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  return distance;
}

// Generate an invite link for a match
export async function generateMatchInviteLink(matchId: string): Promise<string> {
  // This could be a short unique code or a full URL
  // For simplicity, we'll just return the match ID for now
  // In a production app, you might want to create a shorter code or use a URL shortener
  return matchId;
}

// Join a match using an invite link
export async function joinMatchWithInvite(matchId: string, userId: string, userEmail: string): Promise<boolean> {
  try {
    const matchRef = doc(matchesCollection, matchId);
    const matchSnap = await getDoc(matchRef);
    
    if (!matchSnap.exists()) {
      throw new Error('Match not found');
    }
    
    const matchData = matchSnap.data() as Omit<Match, 'id'>;
    
    // Check if user is already a participant
    if (matchData.participants.includes(userId)) {
      return true; // Already joined
    }
    
    // Initialize participantEmails if it doesn't exist
    const participantEmails = matchData.participantEmails || {};
    
    // Add user to participants and store their email
    await updateDoc(matchRef, {
      participants: [...matchData.participants, userId],
      participantEmails: {
        ...participantEmails,
        [userId]: userEmail
      },
      updatedAt: Date.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error joining match with invite:', error);
    throw error;
  }
}

/**
 * Start a match by updating its status to 'active'
 */
export const startMatch = async (matchId: string): Promise<boolean> => {
  try {
    const matchRef = doc(db, 'matches', matchId);
    await updateDoc(matchRef, {
      status: 'active',
      startedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error starting match:", error);
    throw error;
  }
}

/**
 * Update scores for a specific hole in a match
 */
export const updateMatchScores = async (
  matchId: string, 
  holeNumber: number, 
  userId: string,
  score: number
): Promise<boolean> => {
  try {
    const matchRef = doc(db, 'matches', matchId);
    const matchSnap = await getDoc(matchRef);
    
    if (!matchSnap.exists()) {
      throw new Error('Match not found');
    }
    
    const match = matchSnap.data() as Match;
    
    // Verify user is a participant
    if (!match.participants.includes(userId)) {
      throw new Error('User is not a participant in this match');
    }
    
    // Use dot notation for nested updates - only update this user's score
    const scoreField = `scores.${holeNumber}.${userId}`;
    await updateDoc(matchRef, {
      [scoreField]: score,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error updating match scores:", error);
    throw error;
  }
}

/**
 * End a match by updating its status to 'completed' and create a match result
 */
export const endMatch = async (matchId: string): Promise<boolean> => {
  try {
    const matchRef = doc(db, 'matches', matchId);
    const matchSnap = await getDoc(matchRef);
    
    if (!matchSnap.exists()) {
      throw new Error('Match not found');
    }
    
    const match = { id: matchSnap.id, ...matchSnap.data() } as Match;
    
    // Check if all participants have completed all holes
    const allHolesCompleted = checkAllParticipantsCompletedAllHoles(match);
    
    // Update match status to completed
    await updateDoc(matchRef, {
      status: 'completed',
      completedAt: serverTimestamp()
    });
    
    // If all holes are completed, create a match result document to trigger points award
    if (allHolesCompleted) {
      // Check if a result document already exists for this match
      const resultsQuery = query(
        collection(db, 'matchResults'),
        where('matchId', '==', matchId)
      );
      const existingResults = await getDocs(resultsQuery);
      
      if (existingResults.empty) {
        // Create a new match result document
        await addDoc(collection(db, 'matchResults'), {
          matchId: matchId,
          participants: match.participants,
          scores: match.scores,
          completedAt: serverTimestamp(),
          pointsAwarded: false,
          createdAt: serverTimestamp()
        });
        
        console.log('Created match result document for points processing');
      } else {
        console.log('Match result document already exists, skipping creation');
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error ending match:", error);
    throw error;
  }
};

/**
 * Check if all participants have completed all holes in the match
 */
function checkAllParticipantsCompletedAllHoles(match: Match): boolean {
  if (!match.scores) return false;
  
  // For each participant, check if they have scores for all holes
  for (const participantId of match.participants) {
    for (let hole = 1; hole <= match.numberOfHoles; hole++) {
      // If any hole is missing a score for this participant, return false
      if (!match.scores[hole] || match.scores[hole][participantId] === undefined || match.scores[hole][participantId] <= 0) {
        return false;
      }
    }
  }
  
  return true;
}

// The client-side awardPointsToParticipants function has been removed
// as it's now handled by the Cloud Function
