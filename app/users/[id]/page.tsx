"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebase/config";
import { acceptFriendRequest, areFriends, getPendingFriendRequests, getUserFriends, rejectFriendRequest, removeFriend, sendFriendRequest } from "@/firebase/services/friendService";
import { getMatchHistoryForUser } from "@/firebase/services/matchService";
import { getUserProfile } from "@/firebase/services/userService";
import { getUserPoints } from "@/firebase/services/pointsService";
import { FriendRequest } from "@/types/friend";
import { Match } from "@/types/match";
import { User } from "@/types/user";
import { collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoGolfOutline, IoPersonAddOutline, IoTimeOutline, IoTrophyOutline } from "react-icons/io5";

export default function UserProfile() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userMatches, setUserMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState<number>(0);
  
  // Friend-related state variables - keeping these for future implementation
  const [isFriend, setIsFriend] = useState(false);
  const [hasSentRequest, setHasSentRequest] = useState(false);
  const [hasReceivedRequest, setHasReceivedRequest] = useState(false);
  const [allPendingRequests, setAllPendingRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  
  // These variables are unused but kept for future implementation
  const [_requestSenders, _setRequestSenders] = useState<Record<string, User>>({});
  const [_friendProfiles, _setFriendProfiles] = useState<Record<string, User>>({});
  const [_userPoints, _setUserPoints] = useState<number>(0);
  
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    const fetchUserProfile = async () => {
      if (!id || typeof id !== 'string' || !user) return;
      
      try {
        // Get basic user info first
        const userData = await getUserProfile(id);
        if (!userData) {
          setError("User not found");
          return;
        }
        
        setProfileUser(userData);
        
        // Fetch user's points
        const points = await getUserPoints(id);
        setUserPoints(points);
        
        // If viewing own profile
        if (id === user.uid) {
          try {
            // Fetch user's match history (all matches)
            const matchHistory = await getMatchHistoryForUser(id);
            setUserMatches(matchHistory);
          } catch (matchErr) {
            console.error("Error fetching own match history:", matchErr);
            // Don't set error, just show empty match history
          }
          
          setIsLoading(false);
          return;
        }
        
        // If viewing someone else's profile, check friendship status
        try {
          const friendshipStatus = await areFriends(user.uid, id);
          setIsFriend(friendshipStatus);
          
          if (friendshipStatus) {
            // If friends, try to fetch match history (only shared matches)
            try {
              const matchHistory = await getMatchHistoryForUser(id, user.uid);
              setUserMatches(matchHistory);
            } catch (matchErr) {
              console.error("Error fetching friend's match history:", matchErr);
              // Don't set error, just show empty match history
            }
          } else {
            // Check for pending friend requests
            const requests = await getPendingFriendRequests(user.uid);
            setAllPendingRequests(requests);
            
            // Check if current user has sent a request to this user
            const sentRequestQuery = await getDocs(
              query(
                collection(db, 'friendRequests'),
                where('senderId', '==', user.uid),
                where('recipientId', '==', id),
                where('status', '==', 'pending')
              )
            );
            
            if (!sentRequestQuery.empty) {
              setHasSentRequest(true);
            }
            
            // Check if this user has sent a request to current user
            const receivedRequestQuery = await getDocs(
              query(
                collection(db, 'friendRequests'),
                where('senderId', '==', id),
                where('recipientId', '==', user.uid),
                where('status', '==', 'pending')
              )
            );
            
            if (!receivedRequestQuery.empty) {
              setHasReceivedRequest(true);
            }
          }
        } catch (err) {
          console.error("Error checking friendship status:", err);
          // Don't set error, just assume not friends
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load user profile");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, [id, user, loading, router]);

  useEffect(() => {
    if (!user) return;
    
    const friendRequestsQuery = query(
      collection(db, 'friendRequests'),
      where('recipientId', '==', user.uid),
      where('status', '==', 'pending')
    );
    
    const unsubscribe = onSnapshot(friendRequestsQuery, async (snapshot) => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FriendRequest));
      setAllPendingRequests(requests);
      
      // Fetch user profiles for each sender - commented out for now
      /*
      const senders: Record<string, User> = {};
      for (const request of requests) {
        try {
          const senderProfile = await getUserProfile(request.senderId);
          if (senderProfile) {
            senders[request.senderId] = senderProfile;
          }
        } catch (err) {
          console.error(`Error fetching sender ${request.senderId}:`, err);
        }
      }
      _setRequestSenders(senders);
      */
    }, (error) => {
      console.error("Error listening for friend requests:", error);
    });
    
    return () => unsubscribe();
  }, [user]);

  const handleSendFriendRequest = async () => {
    if (!user || !profileUser) return;
    
    try {
      await sendFriendRequest(user.uid, profileUser.id as string);
      setHasSentRequest(true);
    } catch (err) {
      console.error("Error sending friend request:", err);
      setError("Failed to send friend request");
    }
  };

  // Friend request handlers - keeping these for future implementation
  const _handleAcceptFriendRequest = async (requestId: string) => {
    if (!requestId) return;
    
    try {
      await acceptFriendRequest(requestId);
      
      // If we're on the profile page of the sender, update the UI
      if (id && typeof id === 'string' && allPendingRequests.some(req => req.id === requestId && req.senderId === id)) {
        setIsFriend(true);
        setHasReceivedRequest(false);
        
        // Refresh the page to show full profile
        window.location.reload();
      }
    } catch (err) {
      console.error("Error accepting friend request:", err);
      setError("Failed to accept friend request");
    }
  };

  const _handleRejectFriendRequest = async (requestId: string) => {
    if (!requestId) return;
    
    try {
      await rejectFriendRequest(requestId);
      
      // If we're on the profile page of the sender, update the UI
      if (id && typeof id === 'string' && allPendingRequests.some(req => req.id === requestId && req.senderId === id)) {
        setHasReceivedRequest(false);
      }
    } catch (err) {
      console.error("Error rejecting friend request:", err);
      setError("Failed to reject friend request");
    }
  };

  useEffect(() => {
    if (!user) return;
    
    // Only fetch friends if we're viewing our own profile and profileUser is loaded
    if (user && profileUser && user.uid === profileUser.id) {
      const fetchFriends = async () => {
        try {
          const userFriends = await getUserFriends(user.uid);
          setFriends(userFriends);
          
          // Fetch user profiles for each friend - commented out for now
          /*
          const profiles: Record<string, User> = {};
          for (const friendId of userFriends) {
            try {
              const friendProfile = await getUserProfile(friendId);
              if (friendProfile) {
                profiles[friendId] = friendProfile;
              }
            } catch (err) {
              console.error(`Error fetching friend ${friendId}:`, err);
            }
          }
          _setFriendProfiles(profiles);
          */
        } catch (err) {
          console.error("Error fetching friends:", err);
        }
      };
      
      fetchFriends();
    }
  }, [user, profileUser]);

  const _handleRemoveFriend = async (friendId: string) => {
    if (!user) return;
    
    try {
      await removeFriend(user.uid, friendId);
      
      // Update the friends list
      setFriends(friends.filter(id => id !== friendId));
    } catch (err) {
      console.error("Error removing friend:", err);
      setError("Failed to remove friend");
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading profile...</p>
        </div>
      </div>
    );
  }

  // If not viewing own profile and not friends, show limited profile
  const showLimitedProfile = false; // Temporarily show full profile for everyone

  // Friend requests section - keeping this for future implementation
  const _renderFriendRequestsSection = () => {
    // Temporarily return null to hide the friend requests section
    return null;
  };

  // Friends section - keeping this for future implementation
  const _renderFriendsSection = () => {
    // Temporarily return null to hide the friends section
    return null;
  };

  return (
    <DashboardLayout 
      title={profileUser?.firstName ? `${profileUser.firstName}'s Profile` : "User Profile"} 
      description="View player stats and match history" 
      currentPage="dashboard"
      showBackButton={true}
    >
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {profileUser && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="font-semibold text-xl text-gray-800">Player Profile</h2>
              </div>
              <div className="p-6">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl mb-4">
                    {profileUser.firstName?.charAt(0).toUpperCase() || profileUser.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {profileUser.firstName && profileUser.lastName 
                      ? `${profileUser.firstName} ${profileUser.lastName}`
                      : profileUser.email}
                  </h3>
                  <p className="text-gray-500 mb-4">{profileUser.email}</p>
                  
                  {/* Points Display */}
                  <div className="mt-2 bg-gray-50 rounded-full px-6 py-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-gray-800">{userPoints} Buddy Points</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Match History */}
            {(!showLimitedProfile) ? (
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="font-semibold text-xl text-gray-800">Match History</h2>
                  </div>
                  <div className="p-6">
                    {userMatches.length > 0 ? (
                      <div className="space-y-4">
                        {userMatches.map((match) => (
                          <Link 
                            href={`/matches/${match.id}`} 
                            key={match.id}
                            className="block bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-medium text-gray-800">{match.title}</h3>
                                <div className="flex items-center text-gray-500 text-sm mt-1">
                                  <IoTimeOutline className="mr-1" />
                                  <span>{match.scheduledFor 
                                    ? new Date(match.scheduledFor).toLocaleDateString()
                                    : new Date(match.createdAt).toLocaleDateString()}</span>
                                  <span className="mx-2">•</span>
                                  <IoGolfOutline className="mr-1" />
                                  <span>{match.numberOfHoles} holes</span>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  match.status === 'active' ? 'bg-green-100 text-green-800' :
                                  match.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <IoTrophyOutline className="text-4xl text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No match history yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="font-semibold text-xl text-gray-800">Limited Profile View</h2>
                  </div>
                  <div className="p-6 text-center">
                    <p className="text-gray-600 mb-4">
                      You need to be friends with this user to view their full profile and match history.
                    </p>
                    {!hasSentRequest && !hasReceivedRequest && (
                      <button 
                        onClick={handleSendFriendRequest}
                        className="bg-primary hover:bg-red-600 text-white px-6 py-2 rounded-lg inline-flex items-center"
                      >
                        <IoPersonAddOutline className="mr-2" /> Send Friend Request
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
