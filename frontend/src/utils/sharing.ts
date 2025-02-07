import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Trip, Vessel } from '../types';

export const shareTrip = async (trip: Trip, vessel: Vessel) => {
  const tripDetails = generateTripReport(trip, vessel);
  const filePath = `${FileSystem.documentDirectory}trip_${trip.id}.txt`;

  try {
    await FileSystem.writeAsStringAsync(filePath, tripDetails);
    await Sharing.shareAsync(filePath, {
      mimeType: 'text/plain',
      dialogTitle: 'Share Trip Log',
    });
    await FileSystem.deleteAsync(filePath);
  } catch (error) {
    console.error('Error sharing trip:', error);
    throw error;
  }
};

const generateTripReport = (trip: Trip, vessel: Vessel): string => {
  const sections = [
    `Trip Log - ${new Date(trip.startTime).toLocaleDateString()}`,
    '',
    `Vessel: ${vessel.name}`,
    `Registration: ${vessel.registrationNumber}`,
    '',
    'Trip Details',
    `Start Time: ${new Date(trip.startTime).toLocaleString()}`,
    `End Time: ${new Date(trip.endTime).toLocaleString()}`,
    `Duration: ${calculateDuration(trip)} minutes`,
    `Distance: ${calculateDistance(trip.route).toFixed(2)} nm`,
    '',
    'Weather Conditions',
    ...generateWeatherReport(trip.weatherLog),
    '',
    'Crew Members',
    ...trip.crew.map(member => `- ${member.name} (${member.role})`),
    '',
    'Route Points',
    ...trip.route.map((point, index) => 
      `${index + 1}. ${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}`
    ),
  ];

  return sections.join('\n');
};

const calculateDuration = (trip: Trip): number => {
  return Math.round((trip.endTime - trip.startTime) / (1000 * 60));
};

const calculateDistance = (route: Trip['route']): number => {
  let totalDistance = 0;
  for (let i = 1; i < route.length; i++) {
    totalDistance += getDistanceBetweenPoints(
      route[i - 1].latitude,
      route[i - 1].longitude,
      route[i].latitude,
      route[i].longitude
    );
  }
  return totalDistance;
};

const generateWeatherReport = (weatherLog: Trip['weatherLog']): string[] => {
  return weatherLog.map(entry => {
    const time = new Date(entry.timestamp).toLocaleTimeString();
    return [
      `Time: ${time}`,
      `Conditions: ${entry.notes}`,
      `Wind Speed: ${entry.windSpeed} knots`,
      `Wind Direction: ${entry.windDirection}°`,
      `Pressure: ${entry.pressure} hPa`,
      ''
    ];
  }).flat();
};

const getDistanceBetweenPoints = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 3440.065; // Earth's radius in nautical miles
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};
