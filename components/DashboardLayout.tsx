"use client";

import { useAuth } from '@/contexts/AuthContext';
import { db } from "@/firebase/config";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { IoArrowBackOutline, IoCalendarOutline, IoGolfOutline, IoHomeOutline, IoLocationOutline, IoLogOutOutline, IoPersonOutline, IoSettingsOutline } from 'react-icons/io5';
import { getUserPoints } from "@/firebase/services/pointsService";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  currentPage: 'dashboard' | 'matches' | 'history' | 'settings';
  showBackButton?: boolean;
}

export default function DashboardLayout({ 
  children, 
  title, 
  description, 
  currentPage,
  showBackButton = false
}: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [pendingRequests, setPendingRequests] = useState(0);
  const [userPoints, setUserPoints] = useState(0);
  
  // Listen for friend requests in real-time
  useEffect(() => {
    if (!user) return;
    
    const friendRequestsQuery = query(
      collection(db, 'friendRequests'),
      where('recipientId', '==', user.uid),
      where('status', '==', 'pending')
    );
    
    const unsubscribe = onSnapshot(friendRequestsQuery, (snapshot) => {
      setPendingRequests(snapshot.docs.length);
    }, (error) => {
      console.error("Error listening for friend requests:", error);
    });
    
    return () => unsubscribe();
  }, [user]);
  
  // Add this useEffect to fetch user points
  useEffect(() => {
    if (!user) return;
    
    const fetchUserPoints = async () => {
      try {
        const points = await getUserPoints(user.uid);
        setUserPoints(points);
      } catch (err) {
        console.error("Error fetching user points:", err);
      }
    };
    
    fetchUserPoints();
  }, [user]);
  
  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Determine current page from pathname instead of prop
  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      {/* Sidebar - desktop only */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-md z-10 hidden lg:block">
        <div className="p-6">
          <div className="flex justify-center mb-8">
            <Image src="/logo.png" width={120} height={40} alt="Bet A Buddy" className="h-10 w-auto" />
          </div>
          
          <div className="space-y-6">
            {/* User Profile in Sidebar */}
            <div className="bg-gray-50 rounded-xl p-4">
              <Link href={`/users/${user?.uid}`} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center">
                    <p className="font-medium text-gray-800 truncate hover:text-primary transition-colors">
                      {user?.email}
                    </p>
                    {pendingRequests > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {pendingRequests}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Member since {new Date(user?.metadata?.creationTime || Date.now()).toLocaleDateString()}
                  </p>
                  
                  {/* Points Display */}
                  <div className="mt-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-medium text-gray-700">{userPoints} Buddy Points</span>
                  </div>
                </div>
              </Link>
            </div>
            
            <nav className="space-y-1">
              <Link href="/dashboard" className={`flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 ${isActive('/dashboard') && !isActive('/dashboard/') ? 'bg-gray-100 font-medium' : ''}`}>
                <IoHomeOutline className="mr-3 text-xl" />
                Dashboard
              </Link>
              
              {/* Temporarily hidden Find Matches link */}
              {/* <Link href="/matches/browse" className={`flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 ${isActive('/matches/browse') ? 'bg-gray-100 font-medium' : ''}`}>
                <IoSearchOutline className="mr-3 text-xl" />
                Find Matches
              </Link> */}
              
              <Link href="/matches/history" className={`flex items-center space-x-3 p-3 rounded-lg ${isActive('/matches/history') ? 'bg-primary bg-opacity-10 text-primary font-medium' : 'hover:bg-gray-50 text-gray-700 font-medium transition-colors'}`}>
                <IoCalendarOutline className="text-xl" />
                <span>Match History</span>
              </Link>
              <Link href="/settings" className={`flex items-center space-x-3 p-3 rounded-lg ${isActive('/settings') ? 'bg-primary bg-opacity-10 text-primary font-medium' : 'hover:bg-gray-50 text-gray-700 font-medium transition-colors'}`}>
                <IoSettingsOutline className="text-xl" />
                <span>Settings</span>
              </Link>
            </nav>
            
            <div className="pt-4 mt-4 border-t border-gray-200">
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-3 p-3 rounded-lg w-full text-left hover:bg-gray-50 text-gray-700 font-medium transition-colors"
              >
                <IoLogOutOutline className="text-xl" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <button 
                onClick={() => router.back()}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <IoArrowBackOutline className="text-xl" />
              </button>
            )}
            <h1 className="text-xl font-bold text-gray-800">{title}</h1>
          </div>
          <Image src="/logo.png" width={100} height={32} alt="Bet A Buddy" className="h-8 w-auto" />
        </div>
        
        <div className="p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-6 hidden lg:block">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
            {description && <p className="text-gray-600">{description}</p>}
          </div>
          
          {/* Page Content */}
          {children}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 grid grid-cols-4 p-3 lg:hidden z-10">
        <Link href="/dashboard" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/dashboard') && !isActive('/dashboard/') ? 'text-primary' : 'text-gray-600'}`}>
          <IoHomeOutline className="text-xl mb-1" />
          <span className="text-xs">Home</span>
        </Link>
        
        {/* Temporarily hidden Find Matches link */}
        {/* <Link href="/matches/browse" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/matches/browse') ? 'text-primary' : 'text-gray-600'}`}>
          <IoSearchOutline className="text-xl mb-1" />
          <span className="text-xs">Find</span>
        </Link> */}
        
        <Link href={`/users/${user?.uid}`} className={`flex flex-col items-center justify-center w-full h-full ${isActive(`/users/${user?.uid}`) ? 'text-primary' : 'text-gray-600'}`}>
          <IoPersonOutline className="text-xl mb-1" />
          <span className="text-xs">Profile</span>
        </Link>
        
        <Link href="/matches/history" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/matches/history') ? 'text-primary' : 'text-gray-600'}`}>
          <IoCalendarOutline className="text-xl mb-1" />
          <span className="text-xs">History</span>
        </Link>
        
        <Link href="/settings" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/settings') ? 'text-primary' : 'text-gray-600'}`}>
          <IoSettingsOutline className="text-xl mb-1" />
          <span className="text-xs">Settings</span>
        </Link>
      </div>
    </div>
  );
}
