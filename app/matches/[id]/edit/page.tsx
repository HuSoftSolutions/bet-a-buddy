"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getMatch, updateMatch } from "@/firebase/services/matchService";
import { Match } from "@/types/match";
import { IoArrowBackOutline, IoSaveOutline } from "react-icons/io5";
import GooglePlacesAutocomplete from "@/components/GooglePlacesAutocomplete";

export default function EditMatch() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [match, setMatch] = useState<Match | null>(null);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState<{
    address: string;
    lat: number;
    lng: number;
    placeId: string;
    locationName?: string;
  } | null>(null);
  const [scheduledFor, setScheduledFor] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    const fetchMatch = async () => {
      if (!id || typeof id !== 'string') return;
      
      try {
        const matchData = await getMatch(id);
        
        if (!matchData) {
          setError("Match not found");
          return;
        }
        
        // Only the host can edit the match
        if (matchData.hostId !== user?.uid) {
          setError("You don't have permission to edit this match");
          return;
        }
        
        setMatch(matchData);
        setTitle(matchData.title);
        setLocation(matchData.location || "");
        
        if (matchData.address) {
          setAddress(matchData.address);
        }
        
        if (matchData.scheduledFor) {
          // Format date for datetime-local input
          const date = new Date(matchData.scheduledFor);
          const formattedDate = date.toISOString().slice(0, 16);
          setScheduledFor(formattedDate);
        }
      } catch (err) {
        console.error("Error fetching match:", err);
        setError("Failed to load match details");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchMatch();
    }
  }, [id, user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!match || !user) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const updateData: Partial<Match> = {
        title,
        location: location || undefined,
        address: address || undefined,
      };
      
      if (scheduledFor) {
        updateData.scheduledFor = new Date(scheduledFor).toISOString();
      }
      
      await updateMatch(match.id, updateData);
      router.push(`/matches/${match.id}`);
    } catch (err) {
      console.error("Error updating match:", err);
      setError("Failed to update match");
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => router.back()}
            className="mr-4 text-gray-600 hover:text-gray-800"
          >
            <IoArrowBackOutline className="text-xl" />
          </button>
          <h1 className="text-2xl font-bold text-primary">Edit Match</h1>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-800 text-sm font-bold mb-2" htmlFor="title">
              Match Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-800 text-sm font-bold mb-2" htmlFor="location">
              Location (Optional)
            </label>
            <GooglePlacesAutocomplete
              onPlaceSelect={(place) => {
                if (place) {
                  setAddress({
                    address: place.formatted_address,
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                    placeId: place.place_id,
                    locationName: place.name
                  });
                  setLocation(place.name || place.formatted_address);
                }
              }}
              defaultValue={location}
            />
          </div>
          
          <div>
            <label className="block text-gray-800 text-sm font-bold mb-2" htmlFor="scheduledFor">
              Scheduled Date & Time (Optional)
            </label>
            <input
              id="scheduledFor"
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-red-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition-colors disabled:opacity-70"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center">
                  <IoSaveOutline className="mr-2" />
                  Save Changes
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}