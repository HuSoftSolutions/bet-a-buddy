"use client";

import { useCallback, useEffect, useState } from 'react';
import { IoLocationOutline, IoLocationSharp } from 'react-icons/io5';

interface LocationPermissionProps {
  onPermissionChange?: (granted: boolean) => void;
}

export default function LocationPermission({ onPermissionChange }: LocationPermissionProps) {
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'unavailable'>('prompt');
  const [isLoading, setIsLoading] = useState(true);



  const checkPermissionByRequest = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      () => {
        setPermissionStatus('granted');
        if (onPermissionChange) onPermissionChange(true);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionStatus('denied');
        } else {
          setPermissionStatus('prompt');
        }
        if (onPermissionChange) onPermissionChange(false);
      }
    );
  }, [onPermissionChange]);

  const checkLocationPermission = useCallback(async () => {
    setIsLoading(true);
    
    // Check if geolocation is available in the browser
    if (!navigator.geolocation) {
      setPermissionStatus('unavailable');
      if (onPermissionChange) onPermissionChange(false);
      setIsLoading(false);
      return;
    }

    // Check if permissions API is available
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        
        setPermissionStatus(result.state as 'prompt' | 'granted' | 'denied');
        if (onPermissionChange) onPermissionChange(result.state === 'granted');
        
        // Listen for permission changes
        result.addEventListener('change', () => {
          setPermissionStatus(result.state as 'prompt' | 'granted' | 'denied');
          if (onPermissionChange) onPermissionChange(result.state === 'granted');
        });
      } catch (error) {
        console.error('Error checking location permission:', error);
        // Fallback: try to get location to check permission
        checkPermissionByRequest();
      }
    } else {
      // Fallback for browsers without permissions API
      checkPermissionByRequest();
    }
    
    setIsLoading(false);
  }, [onPermissionChange, checkPermissionByRequest]);

  useEffect(() => {
    checkLocationPermission();
  }, [checkLocationPermission]);

  const requestPermission = () => {
    if (permissionStatus === 'denied') {
      // If already denied, guide user to browser settings
      alert('Location permission was denied. Please enable location access in your browser settings to use this feature.');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      () => {
        setPermissionStatus('granted');
        if (onPermissionChange) onPermissionChange(true);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionStatus('denied');
          if (onPermissionChange) onPermissionChange(false);
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg">
        <div className="animate-pulse">Loading location settings...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {permissionStatus === 'granted' ? (
            <IoLocationSharp className="text-green-500 text-xl" />
          ) : (
            <IoLocationOutline className="text-gray-500 text-xl" />
          )}
          <div>
            <h3 className="font-medium">Location Access</h3>
            <p className="text-sm text-gray-500">
              {permissionStatus === 'granted' && 'Location access is enabled'}
              {permissionStatus === 'denied' && 'Location access is blocked'}
              {permissionStatus === 'prompt' && 'Allow access to your location'}
              {permissionStatus === 'unavailable' && 'Location services not available'}
            </p>
          </div>
        </div>
        
        {permissionStatus !== 'granted' && permissionStatus !== 'unavailable' && (
          <button
            onClick={requestPermission}
            className="bg-primary hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            {permissionStatus === 'denied' ? 'Update Settings' : 'Enable'}
          </button>
        )}
        
        {permissionStatus === 'granted' && (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Enabled
          </span>
        )}
      </div>
      
      {permissionStatus === 'granted' && (
        <p className="text-xs text-gray-500 mt-2">
          Your location is used to show nearby matches and provide directions.
        </p>
      )}
      
      {permissionStatus === 'denied' && (
        <p className="text-xs text-gray-500 mt-2">
          Without location access, we can&apos;t show nearby matches or provide accurate directions.
        </p>
      )}
    </div>
  );
}
