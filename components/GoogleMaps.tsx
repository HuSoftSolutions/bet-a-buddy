"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { useLoadScript, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { Match } from '@/types/match';
import Link from 'next/link';

interface GoogleMapsProps {
  matches?: Match[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  useUserLocation?: boolean;
}

interface MarkerInfo {
  position: { lat: number; lng: number };
  address: string;
  matchCount: number;
  matchIds: string[];
}

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem'
};

// Define libraries array outside component to prevent unnecessary re-renders
const libraries: ("places")[] = ['places'];

export default function GoogleMaps({ 
  matches = [], 
  center, 
  zoom = 10, 
  height = '400px',
  useUserLocation = true 
}: GoogleMapsProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(center || { lat: 42.6526, lng: -73.7562 });
  const [markers, setMarkers] = useState<MarkerInfo[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MarkerInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  // Set load error if API fails to load
  useEffect(() => {
    if (loadError) {
      console.error("Google Maps API load error:", loadError);
      setError("Failed to load Google Maps. Please check your internet connection and try again.");
    }
  }, [loadError]);

  // Get user's location only if useUserLocation is true
  useEffect(() => {
    if (useUserLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);
          if (!center) {
            setMapCenter(userPos);
          }
        },
        (error) => {
          // Log geolocation errors
          console.log('Geolocation error:', error.message);
        }
      );
    }
  }, [center, useUserLocation]);

  // Group matches by location
  useEffect(() => {
    if (!matches.length) return;

    const locationMap = new Map<string, MarkerInfo>();
    
    matches.forEach(match => {
      if (match.address && match.address.lat && match.address.lng) {
        const locationKey = `${match.address.lat.toFixed(5)},${match.address.lng.toFixed(5)}`;
        
        if (!locationMap.has(locationKey)) {
          locationMap.set(locationKey, {
            position: { lat: match.address.lat, lng: match.address.lng },
            address: match.address.address,
            matchCount: 1,
            matchIds: [match.id]
          });
        } else {
          const info = locationMap.get(locationKey)!;
          info.matchCount += 1;
          info.matchIds.push(match.id);
        }
      }
    });
    
    setMarkers(Array.from(locationMap.values()));
  }, [matches]);

  // Fit bounds whenever markers or user location changes
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    
    if (markers.length > 0 || userLocation) {
      const bounds = new google.maps.LatLngBounds();
      
      // Add marker positions to bounds
      markers.forEach(marker => {
        bounds.extend(marker.position);
      });
      
      // Add user location to bounds if available
      if (userLocation) {
        bounds.extend(userLocation);
      }
      
      // Only fit bounds if we have points to fit
      if (markers.length > 0 || userLocation) {
        // Fit the bounds with padding
        mapRef.current.fitBounds(bounds, {
          top: 50,
          right: 50,
          bottom: 50,
          left: 50
        });
        
        // If there's only one point, set an appropriate zoom level
        if ((markers.length === 0 && userLocation) || 
            (markers.length === 1 && !userLocation)) {
          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.setZoom(11); // Appropriate zoom for a single point
            }
          }, 100);
        }
      }
    }
  }, [markers, userLocation, mapLoaded]);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setMapLoaded(true);
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
    setMapLoaded(false);
  }, []);

  // Show error message if API fails to load
  if (error) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9', borderRadius: '0.5rem' }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ color: '#e53e3e', marginBottom: '10px' }}>{error}</p>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Please make sure you have a valid Google Maps API key and that your domain is authorized.
          </p>
        </div>
      </div>
    );
  }

  // Show loading indicator while API is loading
  if (!isLoaded) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9', borderRadius: '0.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <p>Loading maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height }}>
      <GoogleMap
        mapContainerStyle={{ ...containerStyle, height }}
        center={mapCenter}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
          }
        }}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
            title="Your location"
          />
        )}

        {/* Match location markers */}
        {markers.map((marker, index) => (
          <Marker
            key={`${marker.position.lat}-${marker.position.lng}-${index}`}
            position={marker.position}
            onClick={() => setSelectedMarker(marker)}
            label={{
              text: marker.matchCount.toString(),
              color: 'white',
              fontWeight: 'bold'
            }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#e53e3e',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 14 + Math.min(marker.matchCount * 2, 10)
            }}
            title={`${marker.matchCount} match(es) available`}
          />
        ))}

        {/* Info window for selected marker */}
        {selectedMarker && (
          <InfoWindow
            position={selectedMarker.position}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div style={{ padding: '8px', maxWidth: '200px' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>{selectedMarker.address}</h3>
              <p>{selectedMarker.matchCount} match{selectedMarker.matchCount !== 1 ? 'es' : ''} available</p>
              <Link 
                href="/matches/browse" 
                style={{ color: '#e53e3e', fontWeight: 'bold', textDecoration: 'underline', display: 'inline-block', marginTop: '8px' }}
              >
                View Matches
              </Link>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
