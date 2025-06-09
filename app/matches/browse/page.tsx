"use client";

import DashboardLayout from "@/components/DashboardLayout";
import GoogleMaps from "@/components/GoogleMaps";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebase/config";
import { Match } from "@/types/match";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoFilterOutline, IoLocationOutline, IoSearchOutline, IoTimeOutline } from "react-icons/io5";

export default function BrowseMatches() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    const fetchMatches = async () => {
      if (!user) return;
      
      try {
        const matchesCollection = collection(db, "matches");
        // Query for all matches that are pending or active
        const q = query(
          matchesCollection,
          where("status", "in", ["pending", "active"])
        );
        
        const querySnapshot = await getDocs(q);
        const availableMatches = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as Match[];
        
        setMatches(availableMatches);
      } catch (err) {
        console.error("Error fetching matches:", err);
        setError("Failed to load matches");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchMatches();
    }
  }, [user, loading, router]);

  const filteredMatches = matches.filter(match => 
    match.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (match.description && match.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout 
      title="Browse Matches" 
      description="Find public matches near you" 
      currentPage="matches"
    >
      {/* Search and View Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IoSearchOutline className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search matches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setViewMode("map")} 
            className={`p-2 rounded-lg ${viewMode === "map" ? "bg-primary text-white" : "bg-gray-200 text-gray-700"} transition-colors`}
          >
            <IoLocationOutline className="text-xl" />
          </button>
          <button 
            onClick={() => setViewMode("list")} 
            className={`p-2 rounded-lg ${viewMode === "list" ? "bg-primary text-white" : "bg-gray-200 text-gray-700"} transition-colors`}
          >
            <IoFilterOutline className="text-xl" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Map View */}
      {viewMode === "map" && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="h-[500px]">
            <GoogleMaps 
              matches={filteredMatches} 
              height="500px"
              zoom={10}
            />
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <>
          {filteredMatches.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoLocationOutline className="text-2xl text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">No public matches available.</p>
              <Link
                href="/matches/create"
                className="inline-block bg-primary hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Create a Match
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMatches.map((match) => (
                <div key={match.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <h2 className="font-semibold text-xl mb-2 text-gray-800">{match.title}</h2>
                    {match.description && (
                      <p className="text-gray-600 mb-4 line-clamp-2">{match.description}</p>
                    )}
                    <div className="flex justify-between items-center mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        match.status === 'active' ? 'bg-green-100 text-green-800' : 
                        'bg-yellow-100 text-yellow-800'
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
        </>
      )}
    </DashboardLayout>
  );
}
