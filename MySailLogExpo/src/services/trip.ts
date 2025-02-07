import { Trip, TripStatus, Location, Waypoint, WeatherRecord, CrewMember } from '../models/types';
import { query, queryOne, execute, sqlValue, buildSet } from './database';
import { generateId } from '../utils/crypto';

export async function getTrips(userId: string): Promise<Trip[]> {
  try {
    const sql = `SELECT * FROM trips WHERE ownerId = ${sqlValue(userId)} ORDER BY startTime DESC`;
    const rows = await query<any>(sql);
    
    return rows.map(row => ({
      ...row,
      waypoints: JSON.parse(row.waypoints || '[]') as Waypoint[],
      weatherRecords: JSON.parse(row.weatherRecords || '[]') as WeatherRecord[],
      crewMembers: JSON.parse(row.crewMembers || '[]') as CrewMember[],
      startLocation: row.startLocation ? JSON.parse(row.startLocation) as Location : null,
      endLocation: row.endLocation ? JSON.parse(row.endLocation) as Location : null,
    }));
  } catch (error) {
    throw new Error(`Failed to get trips: ${error}`);
  }
}

export async function getTrip(tripId: string): Promise<Trip | null> {
  try {
    const sql = `SELECT * FROM trips WHERE id = ${sqlValue(tripId)}`;
    const row = await queryOne<any>(sql);
    
    if (!row) {
      return null;
    }

    return {
      ...row,
      waypoints: JSON.parse(row.waypoints || '[]') as Waypoint[],
      weatherRecords: JSON.parse(row.weatherRecords || '[]') as WeatherRecord[],
      crewMembers: JSON.parse(row.crewMembers || '[]') as CrewMember[],
      startLocation: row.startLocation ? JSON.parse(row.startLocation) as Location : null,
      endLocation: row.endLocation ? JSON.parse(row.endLocation) as Location : null,
    };
  } catch (error) {
    throw new Error(`Failed to get trip: ${error}`);
  }
}

export async function startTrip(
  tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'endTime' | 'distance' | 'duration'>
): Promise<Trip> {
  const id = generateId();
  const now = new Date().toISOString();
  const trip: Trip = {
    ...tripData,
    id,
    createdAt: now,
    updatedAt: now,
    endTime: null,
    distance: null,
    duration: null,
  };

  try {
    const insertData = {
      id: trip.id,
      ownerId: trip.ownerId,
      vesselId: trip.vesselId,
      name: trip.name,
      status: trip.status,
      startTime: trip.startTime,
      endTime: trip.endTime,
      distance: trip.distance,
      duration: trip.duration,
      notes: trip.notes,
      startLocation: trip.startLocation ? JSON.stringify(trip.startLocation) : null,
      endLocation: trip.endLocation ? JSON.stringify(trip.endLocation) : null,
      waypoints: JSON.stringify(trip.waypoints),
      weatherRecords: JSON.stringify(trip.weatherRecords),
      crewMembers: JSON.stringify(trip.crewMembers),
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
    } as const;

    const fields = Object.keys(insertData);
    const placeholders = fields.map(field => sqlValue(insertData[field as keyof typeof insertData]));
    const sql = `INSERT INTO trips (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
    
    await execute(sql);
    return trip;
  } catch (error) {
    throw new Error(`Failed to create trip: ${error}`);
  }
}

export async function endTrip(tripId: string): Promise<Trip> {
  const now = new Date().toISOString();

  try {
    const updates = {
      status: 'completed' as TripStatus,
      endTime: now,
      updatedAt: now,
    };

    const sql = `UPDATE trips SET ${buildSet(updates)} WHERE id = ${sqlValue(tripId)}`;
    await execute(sql);

    const trip = await getTrip(tripId);
    if (!trip) {
      throw new Error('Trip not found after update');
    }
    return trip;
  } catch (error) {
    throw new Error(`Failed to end trip: ${error}`);
  }
}

export async function updateTrip(
  tripId: string,
  updates: Partial<Trip>
): Promise<Trip> {
  const now = new Date().toISOString();
  const updateData: Record<string, any> = {};

  // Handle each field appropriately
  Object.entries(updates).forEach(([key, value]) => {
    if (value === undefined) return;

    switch (key) {
      case 'startLocation':
      case 'endLocation':
        updateData[key] = value ? JSON.stringify(value) : null;
        break;
      case 'waypoints':
      case 'weatherRecords':
      case 'crewMembers':
        updateData[key] = JSON.stringify(value);
        break;
      default:
        updateData[key] = value;
    }
  });

  updateData.updatedAt = now;

  try {
    const sql = `UPDATE trips SET ${buildSet(updateData)} WHERE id = ${sqlValue(tripId)}`;
    await execute(sql);

    const trip = await getTrip(tripId);
    if (!trip) {
      throw new Error('Trip not found after update');
    }
    return trip;
  } catch (error) {
    throw new Error(`Failed to update trip: ${error}`);
  }
}

export async function deleteTrip(tripId: string): Promise<void> {
  try {
    const sql = `DELETE FROM trips WHERE id = ${sqlValue(tripId)}`;
    await execute(sql);
  } catch (error) {
    throw new Error(`Failed to delete trip: ${error}`);
  }
}