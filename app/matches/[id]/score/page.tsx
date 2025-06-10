"use client";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebase/config";
import { updateMatchScores } from "@/firebase/services/matchService";
import { Match } from "@/types/match";
import { doc, onSnapshot } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
    IoArrowBackOutline,
    IoArrowForwardOutline,
    IoHomeOutline
} from "react-icons/io5";

export default function ScoreEntryContainer() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allScores, setAllScores] = useState<Record<number, Record<string, number>>>({});
  const [localScores, setLocalScores] = useState<Record<number, Record<string, number>>>({});
  const [currentHole, setCurrentHole] = useState(1);
  const [totalHoles, setTotalHoles] = useState(18);
  const [isSaving, setIsSaving] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [participantColors, setParticipantColors] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Participant colors
  const getParticipantColor = useCallback((index: number) => {
    const colors = [
      'bg-primary text-white',
      'bg-blue-500 text-white',
      'bg-green-500 text-white',
      'bg-purple-500 text-white',
      'bg-yellow-500 text-gray-800',
      'bg-teal-500 text-white',
      'bg-indigo-500 text-white',
      'bg-pink-500 text-white'
    ];
    return colors[index % colors.length];
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    let unsubscribe: () => void;

    const setupMatchListener = async () => {
      if (!id || typeof id !== 'string') return;
      
      try {
        // Set up real-time listener for match updates
        const matchRef = doc(db, 'matches', id);
        unsubscribe = onSnapshot(matchRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const matchData = { id: docSnapshot.id, ...docSnapshot.data() } as Match;
            
            // Check if user has access to this match
            if (matchData.hostId === user?.uid || matchData.participants.includes(user?.uid || '')) {
              setMatch(matchData);
              setTotalHoles(matchData.numberOfHoles || 18);
              
              // Initialize all scores from existing data
              if (matchData.scores) {
                setAllScores(matchData.scores);
                // Initialize local scores with the current data from Firestore
                setLocalScores(matchData.scores);
              } else {
                // Initialize empty scores for all holes and all participants
                const initialAllScores: Record<number, Record<string, number>> = {};
                for (let i = 1; i <= (matchData.numberOfHoles || 18); i++) {
                  const holeScores: Record<string, number> = {};
                  matchData.participants.forEach(participantId => {
                    holeScores[participantId] = 0;
                  });
                  initialAllScores[i] = holeScores;
                }
                setAllScores(initialAllScores);
                setLocalScores(initialAllScores);
              }
              
              // Set up participant colors
              const colors: Record<string, string> = {};
              matchData.participants.forEach((participantId, index) => {
                if (participantId === user?.uid) {
                  colors[participantId] = 'bg-primary text-white';
                } else {
                  const colorIndex = index === 0 && participantId !== user?.uid ? 1 : index;
                  colors[participantId] = getParticipantColor(colorIndex);
                }
              });
              setParticipantColors(colors);
              setIsLoading(false);
            } else {
              setError("You don't have access to this match");
              setIsLoading(false);
            }
          } else {
            setError("Match not found");
            setIsLoading(false);
          }
        }, (error) => {
          console.error("Error in match listener:", error);
          setError("Failed to load match details");
          setIsLoading(false);
        });
      } catch (err) {
        console.error("Error setting up match listener:", err);
        setError("Failed to load match details");
        setIsLoading(false);
      }
    };

    if (user) {
      setupMatchListener();
    }

    // Clean up the listener when component unmounts
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [id, user, loading, router, getParticipantColor]);

  // Handle local score changes (without saving to Firestore)
  const handleLocalScoreChange = useCallback((hole: number, participantId: string, score: number) => {
    // Only allow users to change their own score
    if (participantId !== user?.uid) return;
    
    setLocalScores(prev => {
      const newScores = { ...prev };
      if (!newScores[hole]) {
        newScores[hole] = {};
      }
      newScores[hole] = { ...newScores[hole], [participantId]: score };
      return newScores;
    });
    
    setHasUnsavedChanges(true);
  }, [user?.uid]);

  // Save current hole scores to Firestore
  const saveCurrentHoleScores = useCallback(async () => {
    if (!match || !user) return;
    
    setIsSaving(true);
    try {
      // Only save the current user's score
      const userScore = localScores[currentHole]?.[user.uid];
      if (userScore !== undefined) {
        await updateMatchScores(match.id, currentHole, user.uid, userScore);
        
        // Update allScores to reflect the saved state
        setAllScores(prev => {
          const newScores = { ...prev };
          if (!newScores[currentHole]) {
            newScores[currentHole] = {};
          }
          newScores[currentHole] = { ...newScores[currentHole], [user.uid]: userScore };
          return newScores;
        });
        
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      console.error("Error saving scores:", err);
      setError("Failed to save scores. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [match, user, localScores, currentHole]);

  // Navigate to a different hole, saving current hole scores first if needed
  const navigateToHole = useCallback(async (holeNumber: number) => {
    // Implement wrap-around logic
    let targetHole = holeNumber;
    if (holeNumber < 1) {
      targetHole = totalHoles; // Wrap to last hole when going back from hole 1
    } else if (holeNumber > totalHoles) {
      targetHole = 1; // Wrap to first hole when going forward from last hole
    }
    
    // Save current hole scores before navigating if there are unsaved changes
    if (hasUnsavedChanges) {
      await saveCurrentHoleScores();
    }
    
    setCurrentHole(targetHole);
  }, [totalHoles, hasUnsavedChanges, saveCurrentHoleScores]);

  // Calculate total scores for all participants
  const calculateTotalScores = useCallback(() => {
    const totals: Record<string, number> = {};
    
    if (!match) return totals;
    
    match.participants.forEach(participantId => {
      let total = 0;
      // Use allScores (the saved scores from Firestore) for the leaderboard
      Object.values(allScores).forEach(holeScores => {
        if (holeScores[participantId]) {
          total += holeScores[participantId];
        }
      });
      totals[participantId] = total;
    });
    
    return totals;
  }, [match, allScores]);

  // Handle finishing the match
  const handleFinish = useCallback(async () => {
    // Save any unsaved changes before finishing
    if (hasUnsavedChanges) {
      await saveCurrentHoleScores();
    }
    
    router.push(`/matches/${id}`);
  }, [hasUnsavedChanges, saveCurrentHoleScores, router, id]);

  // In the ScoreEntryContainer component, add this function to check if a hole has scores
  const hasScoreForHole = useCallback((holeNumber: number) => {
    // Check if the current user has a score for this hole in allScores (saved scores)
    const userId = user?.uid;
    return !!allScores[holeNumber] && 
      userId !== undefined &&
      !!allScores[holeNumber][userId] && 
      allScores[holeNumber][userId] > 0;
  }, [allScores, user?.uid]);

  // Add a function to check if all holes have scores for all participants
  const allHolesHaveScores = useCallback(() => {
    if (!match) return false;
    
    for (let hole = 1; hole <= totalHoles; hole++) {
      for (const participantId of match.participants) {
        if (!allScores[hole] || !allScores[hole][participantId] || allScores[hole][participantId] <= 0) {
          return false;
        }
      }
    }
    return true;
  }, [match, allScores, totalHoles]);

  if (isLoading && !match) {
    return (
      <div className="min-h-creen flex items-center justify-center bg-gray-50">
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
            type="button"
          >
            <IoArrowBackOutline className="mr-2" />
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const totalScores = calculateTotalScores();
  const currentLocalScores = localScores[currentHole] || {};

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => router.push(`/matches/${id}`)}
            className="text-gray-600 hover:text-gray-800 flex items-center"
            type="button"
          >
            <IoArrowBackOutline className="mr-1" />
            <span className="text-gray-700">Back to Match</span>
          </button>
          <h1 className="text-xl font-bold text-center text-gray-800">{match.title}</h1>
          <button 
            onClick={() => router.push("/dashboard")}
            className="text-gray-600 hover:text-gray-800"
            type="button"
          >
            <IoHomeOutline />
          </button>
        </div>
        
        {/* Hole Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg text-gray-800">Hole {currentHole} of {totalHoles}</h2>
            <div className="flex space-x-2">
              <button 
                onClick={() => navigateToHole(currentHole - 1)}
                disabled={currentHole === 1 || isSaving}
                className="p-2 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-50 disabled:text-gray-400 transition-opacity"
                type="button"
                aria-label="Previous hole"
              >
                <IoArrowBackOutline />
              </button>
              <button 
                onClick={() => navigateToHole(currentHole + 1)}
                disabled={currentHole === totalHoles || isSaving}
                className="p-2 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-50 disabled:text-gray-400 transition-opacity"
                type="button"
                aria-label="Next hole"
              >
                <IoArrowForwardOutline />
              </button>
            </div>
          </div>
          
          {/* Hole Selector */}
          <div className="grid grid-cols-9 gap-2 mb-4">
            {Array.from({ length: totalHoles }, (_, i) => i + 1).map(holeNum => (
              <button
                key={holeNum}
                onClick={() => navigateToHole(holeNum)}
                disabled={isSaving}
                className={`p-2 rounded-lg text-center transition-colors duration-200 ${
                  holeNum === currentHole 
                    ? 'bg-primary text-white' 
                    : hasScoreForHole(holeNum)
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50 disabled:text-gray-400`}
                type="button"
                aria-label={`Go to hole ${holeNum}`}
                aria-current={holeNum === currentHole ? 'true' : 'false'}
              >
                {holeNum}
              </button>
            ))}
          </div>
        </div>
        
        {/* Match Overview */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <h2 className="font-semibold text-lg mb-3 text-gray-800">Match Overview</h2>
          <div className="space-y-3">
            {match.participants.map(participantId => (
              <div key={participantId} className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full ${participantColors[participantId]} flex items-center justify-center text-sm mr-2`}>
                    {match.participantEmails?.[participantId]?.charAt(0).toUpperCase() || (participantId === user?.uid ? "Y" : "?")}
                  </div>
                  <span className={`font-medium ${participantId === user?.uid ? 'text-primary' : 'text-gray-700'}`}>
                    {participantId === user?.uid ? "You" : match.participantEmails?.[participantId] || "Unknown Player"}
                  </span>
                </div>
                <div className="font-semibold text-gray-800">
                  {totalScores[participantId] || 0}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Leaderboard */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-lg text-gray-800">Leaderboard</h2>
            <button 
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="text-sm text-primary hover:text-red-700"
              type="button"
            >
              {showLeaderboard ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {showLeaderboard && (
            <div className="p-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Player
                    </th>
                    {Array.from({ length: totalHoles }, (_, i) => i + 1).map(hole => (
                      <th 
                        key={hole} 
                        scope="col" 
                        className={`px-3 py-2 text-center text-xs font-medium uppercase tracking-wider ${
                          hole === currentHole ? 'bg-primary text-white' : 'text-gray-500'
                        }`}
                      >
                        {hole}
                      </th>
                    ))}
                    <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {match.participants.map(participantId => {
                    const total = totalScores[participantId] || 0;
                    
                    return (
                      <tr key={participantId} className={participantId === user?.uid ? 'bg-gray-50' : ''}>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-6 h-6 rounded-full ${participantColors[participantId]} flex items-center justify-center text-xs mr-2`}>
                              {match.participantEmails?.[participantId]?.charAt(0).toUpperCase() || (participantId === user?.uid ? "Y" : "?")}
                            </div>
                            <span className={`text-xs font-medium ${participantId === user?.uid ? 'text-primary' : 'text-gray-700'}`}>
                              {participantId === user?.uid ? "You" : match.participantEmails?.[participantId] || "Unknown Player"}
                            </span>
                          </div>
                        </td>
                        
                        {Array.from({ length: totalHoles }, (_, i) => i + 1).map(hole => {
                          const score = allScores[hole]?.[participantId] || 0;
                          return (
                            <td 
                              key={hole} 
                              className={`px-3 py-2 text-center ${
                                hole === currentHole ? 'font-medium' : ''
                              } ${
                                score > 0 ? 'text-gray-800' : 'text-gray-400'
                              }`}
                            >
                              {score > 0 ? score : '-'}
                            </td>
                          );
                        })}
                        
                        <td className="px-3 py-2 text-center font-medium text-gray-800">
                          {total}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Score Entry */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-lg text-gray-800">Enter Scores for Hole {currentHole}</h2>
          </div>
          <div className="p-4 space-y-4">
            {match.participants
              .filter(participantId => participantId === user?.uid)
              .map(participantId => (
                <div key={participantId} className="flex items-center justify-between">
                  <div className="flex items-center max-w-[60%]">
                    <div className={`w-10 h-10 rounded-full ${participantColors[participantId]} flex items-center justify-center text-lg mr-3 flex-shrink-0`}>
                      {match.participantEmails?.[participantId]?.charAt(0).toUpperCase() || "Y"}
                    </div>
                    <span className="font-medium text-gray-800 text-xs truncate">
                      {match.participantEmails?.[participantId] || "Your Score"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleLocalScoreChange(currentHole, participantId, Math.max(0, (currentLocalScores[participantId] || 0) - 1))}
                      className="w-8 h-8 rounded-full bg-gray-100 text-gray-800 flex items-center justify-center"
                      disabled={isSaving}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={currentLocalScores[participantId] || 0}
                      onChange={(e) => handleLocalScoreChange(currentHole, participantId, parseInt(e.target.value) || 0)}
                      className="w-12 mx-2 p-1 text-center border rounded text-gray-800"
                      disabled={isSaving}
                    />
                    <button
                      onClick={() => handleLocalScoreChange(currentHole, participantId, (currentLocalScores[participantId] || 0) + 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 text-gray-800 flex items-center justify-center"
                      disabled={isSaving}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={() => navigateToHole(currentHole - 1)}
            disabled={isSaving}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center"
          >
            <IoArrowBackOutline className="mr-2" />
            Previous Hole
          </button>
          <button
            onClick={() => navigateToHole(currentHole + 1)}
            disabled={isSaving}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center"
          >
            Next Hole
            <IoArrowForwardOutline className="ml-2" />
          </button>
        </div>

        {/* Add Finish button that only appears when all holes have scores */}
        {allHolesHaveScores() && (
          <button
            onClick={handleFinish}
            disabled={isSaving}
            className="w-full mt-4 bg-primary hover:bg-red-600 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center"
          >
            Finish Match
            <IoHomeOutline className="ml-2" />
          </button>
        )}
      </div>
    </div>
  );
}
