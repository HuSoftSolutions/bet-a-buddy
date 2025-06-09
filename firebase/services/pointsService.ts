import { db } from '@/firebase/config';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

/**
 * Get the total points for a user
 */
export async function getUserPoints(userId: string): Promise<number> {
  try {
    // Get user document to check total points
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return 0;
    }
    
    return userDoc.data()?.points || 0;
  } catch (error) {
    console.error('Error getting user points:', error);
    return 0;
  }
}

/**
 * Get points history for a user
 */
export async function getUserPointsHistory(userId: string): Promise<any[]> {
  try {
    const pointsHistoryCollection = collection(db, 'pointsHistory');
    const q = query(
      pointsHistoryCollection,
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting points history:', error);
    return [];
  }
}

/**
 * Check if a user has received points for a specific match
 */
export async function hasReceivedPointsForMatch(userId: string, matchId: string): Promise<boolean> {
  try {
    // First check the points history
    const pointsHistoryCollection = collection(db, 'pointsHistory');
    const pointsQuery = query(
      pointsHistoryCollection,
      where('userId', '==', userId),
      where('matchId', '==', matchId)
    );
    
    const pointsSnapshot = await getDocs(pointsQuery);
    if (!pointsSnapshot.empty) {
      return true;
    }
    
    // Then check if the match has been marked as having points awarded
    const matchDoc = await getDoc(doc(db, 'matches', matchId));
    if (matchDoc.exists() && matchDoc.data().pointsAwarded) {
      // Match has points awarded, but this user doesn't have a record
      // This could happen if they were added to the match after points were awarded
      return true;
    }
    
    // Finally check if there's a match result with points awarded
    const resultsCollection = collection(db, 'matchResults');
    const resultQuery = query(
      resultsCollection,
      where('matchId', '==', matchId),
      where('pointsAwarded', '==', true)
    );
    
    const resultSnapshot = await getDocs(resultQuery);
    return !resultSnapshot.empty;
  } catch (error) {
    console.error('Error checking if user received points for match:', error);
    return false;
  }
}
