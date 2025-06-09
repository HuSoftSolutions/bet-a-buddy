"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebase/config";
import { endMatch, getMatch, startMatch } from "@/firebase/services/matchService";
import { hasReceivedPointsForMatch } from "@/firebase/services/pointsService";
import { Match } from "@/types/match";
import { doc, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoArrowBackOutline, IoCalendarOutline, IoCheckmarkOutline, IoCopyOutline, IoLocationOutline, IoTimeOutline } from "react-icons/io5";

export default function MatchDetail() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState<boolean>(false);
  // Removed participantEmails state variable

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    let unsubscribe: () => void;

    const fetchMatch = async () => {
      if (!id || typeof id !== 'string') return;
      
      try {
        const matchData = await getMatch(id);
        
        if (!matchData) {
          setError("Match not found");
          return;
        }
        
        // For public matches, we don't need to check if the user is a participant
        if (matchData.hostId === user?.uid || 
            matchData.participants.includes(user?.uid || '')) {
          setMatch(matchData);
          console.log("Match access granted");
          
          // Generate invite link if user is the host
          if (matchData.hostId === user?.uid) {
            const baseUrl = window.location.origin;
            const link = `${baseUrl}/matches/join/${id}`;
            setInviteLink(link);
            setShowInviteLink(true);
          }

          // Set up real-time listener for match updates
          const matchRef = doc(db, 'matches', id);
          unsubscribe = onSnapshot(matchRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
              const updatedMatch = { id: docSnapshot.id, ...docSnapshot.data() } as Match;
              setMatch(updatedMatch);
              console.log("Match updated in real-time:", updatedMatch.status);
            }
          }, (error) => {
            console.error("Error in match listener:", error);
          });
        } else {
          setError("You don't have access to this match");
        }
      } catch (err) {
        console.error("Error fetching match:", err);
        if (err instanceof Error) {
          console.error("Error message:", err.message);
          console.error("Error stack:", err.stack);
        }
        setError("Failed to load match details. You may not have permission to view this match.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchMatch();
    }

    // Clean up the listener when component unmounts
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [id, user, loading, router]);

  // Add this useEffect right after the previous one to check if points were awarded
  useEffect(() => {
    const checkPointsAwarded = async () => {
      if (match && user) {
        const received = await hasReceivedPointsForMatch(user.uid, match.id);
        setPointsAwarded(received);
      }
    };
    
    if (match && user && match.status === 'completed') {
      checkPointsAwarded();
    }
  }, [match, user]);

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const generateInviteLink = () => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/matches/join/${match?.id}`;
    setInviteLink(link);
    setShowInviteLink(true);
  };

  const handleStartMatch = async () => {
    if (!match || !user) return;
    
    try {
      await startMatch(match.id);
      router.push(`/matches/${match.id}/score/1`);
    } catch (err) {
      console.error("Error starting match:", err);
      setError("Failed to start match");
    }
  };

  const handleEndMatch = async () => {
    if (!match || !user) return;
    
    try {
      await endMatch(match.id);
      // The UI will update automatically via the onSnapshot listener
    } catch (err) {
      console.error("Error ending match:", err);
      setError("Failed to end match");
    }
  };

  const handleEditMatch = () => {
    if (!match) return;
    router.push(`/matches/${match.id}/edit`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <p className="text-xl font-semibold text-red-600 mb-4">{error || "Match not found"}</p>
          <button 
            onClick={() => router.push("/dashboard")}
            className="bg-primary text-white px-6 py-2 rounded-full flex items-center justify-center mx-auto"
          >
            <IoArrowBackOutline className="mr-2" />
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isHost = user && match.hostId === user.uid;
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800'
  };

  // Add this function before the return statement
  const getParticipantColor = (index: number) => {
    // Array of distinct colors that work well on white and as backgrounds
    const colors = [
      'bg-primary text-white', // Primary red for the first player (usually the current user)
      'bg-blue-500 text-white',
      'bg-green-500 text-white',
      'bg-purple-500 text-white',
      'bg-yellow-500 text-gray-800', // Yellow needs dark text
      'bg-teal-500 text-white',
      'bg-indigo-500 text-white',
      'bg-pink-500 text-white'
    ];
    
    // Return color based on index, cycling through if more participants than colors
    return colors[index % colors.length];
  };

  // Create a mapping of participant IDs to colors
  const participantColors: Record<string, string> = {};
  match.participants.forEach((participantId, index) => {
    // If current user, always use the primary color (first in the array)
    if (participantId === user?.uid) {
      participantColors[participantId] = 'bg-primary text-white';
    } else {
      // For other participants, assign colors sequentially
      // Skip index 0 (primary color) if it's not the current user
      const colorIndex = index === 0 && participantId !== user?.uid ? 1 : index;
      participantColors[participantId] = getParticipantColor(colorIndex);
    }
  });

  return (
    <DashboardLayout
      title={match.title}
      description={match.description || "Match details"}
      currentPage="matches"
      showBackButton={false}
    >
      {/* Match Info Cards */}
      <div className="space-y-4 mb-6">
        {/* Details Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-lg text-gray-800">Match Details</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[match.status as keyof typeof statusColors]}`}>
              {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
            </span>
          </div>
          <div className="p-4 space-y-3">
            {match.location && (
              <div className="flex items-center">
                <div className="w-8 flex-shrink-0 text-primary">
                  <IoLocationOutline className="text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-800">{match.location}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center">
              <div className="w-8 flex-shrink-0 text-primary">
                <IoCalendarOutline className="text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium text-gray-800">{new Date(match.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            {match.scheduledFor && (
              <div className="flex items-center">
                <div className="w-8 flex-shrink-0 text-primary">
                  <IoTimeOutline className="text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Scheduled for</p>
                  <p className="font-medium text-gray-800">{new Date(match.scheduledFor).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Participants Card with consistent colors */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-lg text-gray-800">
              Participants ({match.participants.length})
            </h2>
            {match.participants.length > 0 && (
              <span className="text-sm text-gray-500">
                {match.participants.length}/{match.participants.length > 0 ? match.numberOfHoles : '-'}
              </span>
            )}
          </div>
          <div className="divide-y divide-gray-100">
            {match.participants.map((participantId, index) => (
              <Link 
                key={participantId} 
                href={`/users/${participantId}`}
                className="flex items-center p-4 hover:bg-gray-50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-full ${participantColors[participantId]} flex items-center justify-center text-lg mr-3`}>
                  {participantId === user?.uid ? "Y" : match.participantEmails?.[participantId]?.charAt(0).toUpperCase() || `P${index + 1}`}
                </div>
                <span className="font-medium text-gray-800">
                  {participantId === user?.uid ? "You" : match.participantEmails?.[participantId] || `Unknown Player`}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Match Scores Card with consistent colors */}
        {(match.status === 'active' || match.status === 'completed') && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-lg text-gray-800">Current Scores</h2>
            </div>
            <div className="p-4">
              {match.scores ? (
                <div className="space-y-4">
                  {match.participants.map((participantId, index) => {
                    // Calculate total score for this participant
                    let totalScore = 0;
                    Object.values(match.scores || {}).forEach(holeScores => {
                      if (holeScores[participantId]) {
                        totalScore += holeScores[participantId];
                      }
                    });
                    
                    // Count how many holes this participant has scored
                    const holesScored = Object.values(match.scores || {}).filter(
                      holeScores => holeScores[participantId] !== undefined
                    ).length;
                    
                    return (
                      <div key={participantId} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full ${participantColors[participantId]} flex items-center justify-center text-lg mr-3`}>
                            {participantId === user?.uid ? "Y" : match.participantEmails?.[participantId]?.charAt(0).toUpperCase() || `P${index + 1}`}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {participantId === user?.uid ? "You" : match.participantEmails?.[participantId] || `Unknown Player`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {holesScored} of {match.numberOfHoles} holes completed
                            </p>
                          </div>
                        </div>
                        <div className="text-xl font-bold text-gray-800">
                          {totalScore || 0}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No scores recorded yet</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Invite Section */}
      {isHost && showInviteLink && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="p-4">
            <p className="text-sm text-gray-500 mb-2">Share this invite link:</p>
            <div className="flex bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-grow p-3 bg-transparent text-gray-800 text-sm"
              />
              <button
                onClick={copyInviteLink}
                className="bg-primary px-4 flex items-center text-white"
              >
                {isCopied ? <IoCheckmarkOutline className="text-xl" /> : <IoCopyOutline className="text-xl" />}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      {isHost && (
        <div className="space-y-3">
          {match.status === 'pending' && (
            <button 
              onClick={handleStartMatch}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Start Match
            </button>
          )}
          {match.status === 'active' && (
            <button 
              onClick={handleEndMatch}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-colors"
            >
              End Match
            </button>
          )}
          {match.status === 'completed' && (
            <button 
              onClick={handleStartMatch}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Restart Match
            </button>
          )}
          <button 
            onClick={handleEditMatch}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Edit Match
          </button>
        </div>
      )}

      {/* Waiting message for non-hosts when match is pending */}
      {!isHost && match.status === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6 text-center mb-6">
          <div className="flex flex-col items-center">
            <IoTimeOutline className="text-3xl text-yellow-500 mb-2" />
            <h3 className="font-medium text-lg text-gray-800 mb-1">Waiting for host to start the match</h3>
            <p className="text-gray-600">
              The match host will start the game soon. You&apos;ll be able to join once it begins.
            </p>
          </div>
        </div>
      )}

      {/* Enter Match Button (for participants when match is active) */}
      {match.status === 'active' && match.participants.includes(user?.uid || '') && (
        <div className="mt-6">
          <Link href={`/matches/${match.id}/score/1`}>
            <button className="w-full bg-primary hover:bg-red-600 text-white font-medium py-3 rounded-lg transition-colors">
              Enter Match
            </button>
          </Link>
        </div>
      )}

      {match.status === 'completed' && (
        <div className="mt-4 p-3 rounded-lg bg-gray-50">
          <div className="flex items-center">
            <div className={`mr-3 ${pointsAwarded ? 'text-green-500' : 'text-gray-400'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-black">
                {pointsAwarded 
                  ? "You earned 10 points from this match!" 
                  : match.pointsAwarded 
                    ? "Points have been awarded for this match" 
                    : "Points not yet awarded for this match"}
              </p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
