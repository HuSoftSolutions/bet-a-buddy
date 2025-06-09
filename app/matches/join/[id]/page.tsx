"use client";

import { useAuth } from "@/contexts/AuthContext";
import { getMatch, joinMatchWithInvite } from "@/firebase/services/matchService";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function JoinMatch() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [matchTitle, setMatchTitle] = useState<string | null>(null);
  const [isAlreadyJoined, setIsAlreadyJoined] = useState(false);

  useEffect(() => {
    // If not logged in, save the invite link to localStorage and redirect to login
    if (!loading && !user) {
      if (typeof window !== 'undefined' && id) {
        localStorage.setItem('pendingMatchInvite', typeof id === 'string' ? id : id[0]);
      }
      router.push("/login");
      return;
    }

    // If logged in, check if the match exists
    const checkMatch = async () => {
      if (!id || typeof id !== 'string' || !user) return;
      
      try {
        const match = await getMatch(id);
        if (!match) {
          setError("Match not found");
          return;
        }
        
        setMatchTitle(match.title);
        
        // Check if user is already a participant
        if (match.participants.includes(user.uid)) {
          setIsAlreadyJoined(true);
        }
      } catch (err) {
        console.error("Error checking match:", err);
        setError("Failed to load match details");
      }
    };

    if (user) {
      checkMatch();
    }
  }, [id, user, loading, router]);

  const handleJoinMatch = async () => {
    if (!id || typeof id !== 'string' || !user) return;
    
    setIsJoining(true);
    setError(null);
    
    try {
      const joined = await joinMatchWithInvite(id, user.uid, user.email || '');
      if (joined) {
        setSuccess(true);
        // Redirect to match page after a short delay
        setTimeout(() => {
          router.push(`/matches/${id}`);
        }, 1500);
      }
    } catch (err) {
      console.error("Error joining match:", err);
      setError("Failed to join match");
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-primary">Join Match</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
            <div className="mt-4">
              <Link href="/dashboard" className="text-primary hover:underline">
                Return to Dashboard
              </Link>
            </div>
          </div>
        )}
        
        {success ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <p>Successfully joined the match!</p>
            <p className="mt-2">Redirecting to match page...</p>
          </div>
        ) : isAlreadyJoined ? (
          <div className="space-y-6">
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
              <p>You are already a participant in this match.</p>
            </div>
            <Link href={`/matches/${id}`}>
              <button className="w-full bg-primary hover:bg-red-700 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline transition-colors">
                Go to Match
              </button>
            </Link>
          </div>
        ) : matchTitle && (
          <div className="space-y-6">
            <p className="text-gray-700">
              You&apos;ve been invited to join <span className="font-semibold">{matchTitle}</span>
            </p>
            
            <button
              onClick={handleJoinMatch}
              disabled={isJoining}
              className="w-full bg-primary hover:bg-red-700 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline transition-colors disabled:opacity-70"
            >
              {isJoining ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Joining...
                </div>
              ) : (
                "Join Match"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
