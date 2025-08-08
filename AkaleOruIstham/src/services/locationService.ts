import * as Location from 'expo-location';
import { CAMPUS_LOCATIONS } from '../utils/constants';

export interface LocationData {
  latitude: number;
  longitude: number;
  description: string;
}

export const getCurrentLocation = async (): Promise<LocationData | null> => {
  try {
    // Request permission to access location
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      return null;
    }

    // Get current position
    const location = await Location.getCurrentPositionAsync({});
    
    // For campus app, we'll map to predefined campus locations
    const campusLocation = mapToCampusLocation(
      location.coords.latitude,
      location.coords.longitude
    );

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      description: campusLocation
    };

  } catch (error) {
    return null;
  }
};

// Mock function to map GPS coordinates to campus locations
// In a real implementation, you'd use geofencing or proximity detection
const mapToCampusLocation = (latitude: number, longitude: number): string => {
  // For demo purposes, randomly select a campus location
  // In production, you'd implement proper geolocation mapping
  const randomIndex = Math.floor(Math.random() * CAMPUS_LOCATIONS.length);
  return CAMPUS_LOCATIONS[randomIndex].description;
};

export const getLocationDescription = (latitude: number, longitude: number): string => {
  return mapToCampusLocation(latitude, longitude);
};

// Function to get a random campus location
export const getRandomCampusLocation = (): LocationData => {
  const randomLocation = CAMPUS_LOCATIONS[Math.floor(Math.random() * CAMPUS_LOCATIONS.length)];
  
  // Generate mock coordinates around a central campus point
  const baseLat = 12.9716; // Example: Bangalore coordinates
  const baseLng = 77.5946;
  
  return {
    latitude: baseLat + (Math.random() - 0.5) * 0.01, // Small random offset
    longitude: baseLng + (Math.random() - 0.5) * 0.01,
    description: randomLocation.description
  };
};
