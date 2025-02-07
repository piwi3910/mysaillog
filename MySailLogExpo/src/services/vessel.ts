import { Vessel } from '../models/types';
import { query, queryOne, execute, sqlValue, buildSet } from './database';
import { generateId } from '../utils/crypto';

export async function getVessels(userId: string): Promise<Vessel[]> {
  try {
    const sql = `SELECT * FROM vessels WHERE ownerId = ${sqlValue(userId)} ORDER BY name ASC`;
    return await query<Vessel>(sql);
  } catch (error) {
    throw new Error(`Failed to get vessels: ${error}`);
  }
}

export async function getVessel(vesselId: string): Promise<Vessel | null> {
  try {
    const sql = `SELECT * FROM vessels WHERE id = ${sqlValue(vesselId)}`;
    return await queryOne<Vessel>(sql);
  } catch (error) {
    throw new Error(`Failed to get vessel: ${error}`);
  }
}

export async function createVessel(
  vesselData: Omit<Vessel, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Vessel> {
  const id = generateId();
  const now = new Date().toISOString();
  const vessel: Vessel = {
    ...vesselData,
    id,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const insertData = {
      id: vessel.id,
      ownerId: vessel.ownerId,
      name: vessel.name,
      type: vessel.type,
      length: vessel.length,
      homePort: vessel.homePort,
      registrationNumber: vessel.registrationNumber,
      createdAt: vessel.createdAt,
      updatedAt: vessel.updatedAt,
    } as const;

    const fields = Object.keys(insertData);
    const placeholders = fields.map(field => sqlValue(insertData[field as keyof typeof insertData]));
    const sql = `INSERT INTO vessels (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
    
    await execute(sql);
    return vessel;
  } catch (error) {
    throw new Error(`Failed to create vessel: ${error}`);
  }
}

export async function updateVessel(
  vesselId: string,
  updates: Partial<Omit<Vessel, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Vessel> {
  const now = new Date().toISOString();
  const updateData = {
    ...updates,
    updatedAt: now,
  };

  try {
    const sql = `UPDATE vessels SET ${buildSet(updateData)} WHERE id = ${sqlValue(vesselId)}`;
    await execute(sql);

    const vessel = await getVessel(vesselId);
    if (!vessel) {
      throw new Error('Vessel not found after update');
    }
    return vessel;
  } catch (error) {
    throw new Error(`Failed to update vessel: ${error}`);
  }
}

export async function deleteVessel(vesselId: string): Promise<void> {
  try {
    const sql = `DELETE FROM vessels WHERE id = ${sqlValue(vesselId)}`;
    await execute(sql);
  } catch (error) {
    throw new Error(`Failed to delete vessel: ${error}`);
  }
}