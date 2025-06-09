"use client";

import DashboardLayout from '@/components/DashboardLayout';
// import LocationPermission from '@/components/LocationPermission';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { IoNotificationsOutline, IoShieldOutline } from 'react-icons/io5';

export default function Settings() {
  const { user, loading } = useAuth();
  const router = useRouter();
  // const [locationEnabled, setLocationEnabled] = useState(false);
  // const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // const handleLocationPermissionChange = (granted: boolean) => {
  //   setLocationEnabled(granted);
  //   // You could save this preference to the user's profile in your database
  // };

  return (
    <DashboardLayout 
      title="Settings" 
      description="Manage your account preferences and permissions" 
      currentPage="settings"
    >
      <div className="space-y-6">
        {/* App Permissions Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center">
            <div>
              <h2 className="font-semibold text-xl text-gray-800">App Permissions</h2>
              <p className="text-gray-500 text-sm mt-1">Manage location and device access</p>
            </div>
          </div>
          {/* <div className="p-6">
            <div className="space-y-4">
              <LocationPermission onPermissionChange={handleLocationPermissionChange} />
            </div>
          </div> */}
        </div>

        {/* Notification Preferences Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center">
            <IoNotificationsOutline className="text-xl text-primary mr-3" />
            <div>
              <h2 className="font-semibold text-xl text-gray-800">Notification Preferences</h2>
              <p className="text-gray-500 text-sm mt-1">Control how and when you receive alerts</p>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Match Invitations</h3>
                  <p className="text-sm text-gray-500">Receive notifications for new match invites</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Match Updates</h3>
                  <p className="text-sm text-gray-500">Receive notifications for match status changes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Buddy Points</h3>
                  <p className="text-sm text-gray-500">Receive notifications when you earn points</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Settings Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center">
            <IoShieldOutline className="text-xl text-primary mr-3" />
            <div>
              <h2 className="font-semibold text-xl text-gray-800">Privacy Settings</h2>
              <p className="text-gray-500 text-sm mt-1">Control your data and visibility</p>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Profile Visibility</h3>
                  <p className="text-sm text-gray-500">Allow other users to see your profile</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Match History Privacy</h3>
                  <p className="text-sm text-gray-500">Allow others to see your match history</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Account Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-semibold text-xl text-gray-800">Account</h2>
            <p className="text-gray-500 text-sm mt-1">Manage your account details</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-800">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
