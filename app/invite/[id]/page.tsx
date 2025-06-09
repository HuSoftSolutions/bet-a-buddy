"use client";

import { useAuth } from "@/contexts/AuthContext";
import { acceptInvitation } from "@/firebase/services/matchService";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function InvitePage() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [matchId, setMatchId] = useState<string | null>(null);

  // Store invitation ID in localStorage when the page loads
  useEffect(() => {
    if (id && typeof id === 'string') {
      localStorage.setItem('pendingInvitation', id);
    }
  }, [id]);

  // Process invitation when user is authenticated
  useEffect(() => {
    if (loading) return;

    const processInvitation = async () => {
      if (!user) {
        // User is not logged in, redirect to login
        router.push('/login');
        return;
      }

      if (!id || typeof id !== 'string') {
        setError("Invalid invitation link");
        return;
      }

      setIsProcessing(true);
      setError(null);

      try {
        const result = await acceptInvitation(id, user.uid);
        if (result.success) {
          setSuccess(true);
          setMatchId(result.matchId);
          // Clear the pending invitation from localStorage
          localStorage.removeItem('pendingInvitation');
          // Redirect to the match page after a short delay
          setTimeout(() => {
            router.push(`/matches/${result.matchId}`);
          }, 2000);
        } else {
          setError("Failed to accept invitation. It may be invalid or expired.");
        }
      } catch (err) {
        console.error("Error accepting invitation:", err);
        setError("An error occurred while processing your invitation.");
      } finally {
        setIsProcessing(false);
      }
    };

    processInvitation();
  }, [id, user, loading, router]);

  if (loading || isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl font-semibold text-primary">
            {loading ? "Loading..." : "Processing invitation..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl font-semibold text-red-600">{error}</p>
          <Link href="/dashboard" className="mt-4 inline-block text-primary hover:text-red-700">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl font-semibold text-green-600">
            Invitation accepted successfully!
          </p>
          <p className="mt-2 text-gray-600">
            Redirecting you to the match...
          </p>
          {matchId && (
            <Link href={`/matches/${matchId}`} className="mt-4 inline-block text-primary hover:text-red-700">
              Go to Match
            </Link>
          )}
        </div>
      </div>
    );
  }

  return null;
}
