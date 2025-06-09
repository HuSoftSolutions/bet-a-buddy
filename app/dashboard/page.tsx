"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebase/config";
import { getUserPoints } from "@/firebase/services/pointsService";
import { Match } from "@/types/match";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoAddOutline, IoTimeOutline } from "react-icons/io5";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userMatches, setUserMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);
  
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      if (!user) return;
      
      try {
        // Fetch user's points
        const points = await getUserPoints(user.uid);
        setUserPoints(points);
        
        // Fetch user's matches
        const userMatchesCollection = collection(db, "matches");
        const userMatchesQuery = query(
          userMatchesCollection,
          where("participants", "array-contains", user.uid),
          orderBy("createdAt", "desc"),
          limit(3)
        );
        
        const userMatchesSnapshot = await getDocs(userMatchesQuery);
        const userMatchesData = userMatchesSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as Match[];
        
        setUserMatches(userMatchesData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, loading, router]);

  return (
    <DashboardLayout 
      title="Dashboard" 
      description="Welcome back to Bet A Buddy" 
      currentPage="dashboard"
    >
      {/* Points Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Your Buddy Points</h2>
            <p className="text-gray-500">Earn points by playing matches and redeem them for rewards</p>
          </div>
          <div className="bg-primary bg-opacity-10 p-4 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="text-4xl font-bold text-primary">{userPoints}</div>
          <p className="text-gray-500">Total Buddy Points</p>
        </div>
        
        <div className="mt-6 border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-600">
            Play matches to earn more points. Redeem your points for prizes.
          </p>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link 
          href="/matches/create" 
          className="bg-primary hover:bg-red-700 text-white p-6 rounded-xl shadow-sm transition-colors flex items-center justify-between"
        >
          <div>
            <h3 className="font-semibold text-xl mb-1">Create a Match</h3>
            <p className="text-white text-opacity-80">Set up a new betting match</p>
          </div>
          <div className="bg-white bg-opacity-20 p-3 rounded-full">
            <IoAddOutline className="text-2xl" />
          </div>
        </Link>
        
        {/* <Link 
          href="/matches/browse" 
          className="bg-gray-800 hover:bg-gray-900 text-white p-6 rounded-xl shadow-sm transition-colors flex items-center justify-between"
        >
          <div>
            <h3 className="font-semibold text-xl mb-1">Find Matches</h3>
            <p className="text-white text-opacity-80">Browse available matches</p>
          </div>
          <div className="bg-white bg-opacity-20 p-3 rounded-full">
            <IoLocationOutline className="text-2xl" />
          </div>
        </Link> */}
      </div>
      
      {/* Your Matches */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Your Matches</h2>
          <Link href="/matches/history" className="text-primary hover:text-red-700 font-medium text-sm">
            View All
          </Link>
        </div>
        
        {isLoading ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading your matches...</p>
          </div>
        ) : userMatches.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <p className="text-gray-500 mb-4">You don&apos;t have any matches yet.</p>
            <Link
              href="/matches/create"
              className="inline-block bg-primary hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Create Your First Match
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {userMatches.map((match) => (
              <div key={match.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <h3 className="font-semibold text-xl mb-2 text-gray-800">{match.title}</h3>
                  <div className="flex justify-between items-center mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      match.status === 'active' ? 'bg-green-100 text-green-800' : 
                      match.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      match.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center">
                      <IoTimeOutline className="mr-1" />
                      {match.scheduledFor 
                        ? new Date(match.scheduledFor).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric' 
                          })
                        : new Date(match.createdAt).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric' 
                          })
                      }
                    </span>
                  </div>
                  <Link
                    href={`/matches/${match.id}`}
                    className="block w-full text-center bg-primary hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
