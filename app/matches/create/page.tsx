"use client";

import GooglePlacesAutocomplete from "@/components/GooglePlacesAutocomplete";
import { useAuth } from "@/contexts/AuthContext";
import { createMatch } from "@/firebase/services/matchService";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IoCheckmarkOutline, IoCopyOutline } from "react-icons/io5";

export default function CreateMatch() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState<{
    address: string;
    lat: number;
    lng: number;
    placeId: string;
    locationName?: string;
  } | null>(null);
  const [numberOfHoles, setNumberOfHoles] = useState<9 | 18>(18);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);

  // Redirect if not logged in
  if (!loading && !user) {
    router.push("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError("You must be logged in to create a match");
      return;
    }
    
    if (!title.trim()) {
      setError("Match title is required");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const newMatchId = await createMatch(
        user.uid,
        title,
        user.email || '',
        address?.locationName || undefined,
        address || undefined,
        numberOfHoles
      );
      
      setMatchId(newMatchId);
      
      // Generate invite link
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/matches/join/${newMatchId}`;
      setInviteLink(link);
    } catch (err) {
      console.error("Error creating match:", err);
      setError("Failed to create match. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const goToMatch = () => {
    if (matchId) {
      router.push(`/matches/${matchId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-primary">Create a Match</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {matchId ? (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              Match created successfully!
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-2">Invite Players</h2>
              <p className="text-gray-600 mb-3">Share this link to invite players to your match:</p>
              
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
            
            <button
              onClick={goToMatch}
              className="w-full bg-primary hover:bg-red-700 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline transition-colors"
            >
              Go to Match
            </button>
          </div>
        ) : (
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
              <label className="block text-gray-800 text-sm font-bold mb-2" htmlFor="address">
                Location
              </label>
              <GooglePlacesAutocomplete
                onPlaceSelect={(place) => {
                  // Extract location name from the address components if available
                  // Typically the first part of the address is the location name
                  const locationName = place.address.split(',')[0].trim();
                  setAddress({
                    ...place,
                    locationName
                  });
                }}
                placeholder="Search for a golf course or address"
              />
              {address && (
                <p className="mt-2 text-sm text-green-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  {address.address}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-800 text-sm font-bold mb-2">
                Number of Holes
              </label>
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${numberOfHoles === 9 ? 'font-semibold text-primary' : 'text-gray-500'}`}>9 Holes</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={numberOfHoles === 18}
                    onChange={() => setNumberOfHoles(numberOfHoles === 9 ? 18 : 9)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
                <span className={`text-sm ${numberOfHoles === 18 ? 'font-semibold text-primary' : 'text-gray-500'}`}>18 Holes</span>
              </div>
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
                    Creating...
                  </div>
                ) : (
                  "Create Match"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
