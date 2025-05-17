"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push("/login");
    } else if (user) {
      // Set user name from email (or display name if available)
      setUserName(user.displayName || user.email?.split("@")[0] || "User");
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl font-semibold text-primary">Loading...</p>
        </div>
      </div>
    );
  }

  // Only render dashboard content if user is authenticated
  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header/Navigation */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {userName}!</span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Dashboard</h2>
          <p className="text-gray-600 mb-4">
            Welcome to your Bet A Buddy Sports dashboard. This is where you'll manage your matches, 
            track your points, and redeem rewards.
          </p>
          
          {/* Dashboard Sections - Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Current Matches Card */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium text-lg mb-2 text-gray-800">Current Matches</h3>
              <p className="text-gray-500 text-sm">No active matches.</p>
              <div className="flex mt-4 space-x-2">
                <button className="text-primary font-medium text-sm hover:text-red-700 transition-colors">
                  Find a Match
                </button>
                <button className="text-primary font-medium text-sm hover:text-red-700 transition-colors">
                  Host a Match
                </button>
              </div>
            </div>
            
            {/* Match History Card */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium text-lg mb-2 text-gray-800">Match History</h3>
              <p className="text-gray-500 text-sm">No previous matches.</p>
              <button className="mt-4 text-primary font-medium text-sm hover:text-red-700 transition-colors">
                View All
              </button>
            </div>
            
            {/* Points Card */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium text-lg mb-2 text-gray-800">Buddy Points</h3>
              <p className="text-2xl font-bold text-gray-800">0</p>
              <p className="text-gray-500 text-sm">Points earned</p>
              <button className="mt-4 text-primary font-medium text-sm hover:text-red-700 transition-colors">
                View History
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
