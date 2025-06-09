"use client";

import { useLoadScript } from '@react-google-maps/api';
import { useEffect, useMemo, useState } from 'react';

interface GooglePlacesAutocompleteProps {
  onPlaceSelect: (place: {
    address: string;
    lat: number;
    lng: number;
    placeId: string;
    locationName?: string;
  }) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
}

// Define libraries array outside component to prevent unnecessary re-renders
const libraries: ("places")[] = ['places'];

export default function GooglePlacesAutocomplete({
  onPlaceSelect,
  placeholder = 'Enter location',
  className = '',
  defaultValue = ''
}: GooglePlacesAutocompleteProps) {
  const [address, setAddress] = useState(defaultValue);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  // Create services after the API is loaded
  const autocompleteService = useMemo(() => {
    if (isLoaded && window.google) {
      return new window.google.maps.places.AutocompleteService();
    }
    return null;
  }, [isLoaded]);

  const geocoder = useMemo(() => {
    if (isLoaded && window.google) {
      return new window.google.maps.Geocoder();
    }
    return null;
  }, [isLoaded]);

  // Set load error if API fails to load
  useEffect(() => {
    if (loadError) {
      console.error("Google Maps API load error:", loadError);
      setError("Failed to load Google Places API");
    }
  }, [loadError]);

  const handleAddressChange = async (value: string) => {
    setAddress(value);
    
    if (!autocompleteService || value.length < 3) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    try {
      const response = await autocompleteService.getPlacePredictions({
        input: value,
        componentRestrictions: { country: 'us' }, // Optional: restrict to US
        types: ['establishment', 'geocode']
      });
      
      setPredictions(response?.predictions || []);
      setShowPredictions(true);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      setPredictions([]);
      setShowPredictions(false);
    }
  };

  const handlePlaceSelect = async (placeId: string) => {
    if (!geocoder) return;

    try {
      const response = await geocoder.geocode({ placeId });
      const place = response.results[0];
      
      // Get place details to extract establishment name if available
      let locationName = '';
      
      // Try to get the establishment name from address components
      const establishment = place.address_components.find(
        component => component.types.includes('establishment')
      );
      
      if (establishment) {
        locationName = establishment.long_name;
      } else {
        // If no establishment found, use the first part of the formatted address
        locationName = place.formatted_address.split(',')[0].trim();
      }

      setAddress(place.formatted_address);
      setShowPredictions(false);
      setPredictions([]);

      onPlaceSelect({
        address: place.formatted_address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        placeId: placeId,
        locationName: locationName
      });
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };

  // Show error message if API fails to load
  if (error) {
    return (
      <div>
        <input
          type="text"
          placeholder={placeholder}
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${className}`}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <p className="text-red-500 text-xs mt-1">{error}</p>
      </div>
    );
  }

  // Show loading state while API is loading
  if (!isLoaded) return (
    <input 
      type="text"
      placeholder="Loading places..."
      className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${className}`}
      disabled
    />
  );

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${className}`}
        value={address}
        onChange={(e) => handleAddressChange(e.target.value)}
      />
      
      {showPredictions && predictions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto text-black">
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              type="button"
              onClick={() => handlePlaceSelect(prediction.place_id)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
            >
              {prediction.description}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
