export interface Vessel {
  id: string;
  name: string;
  registrationNumber: string;
  mmsi?: string; // Maritime Mobile Service Identity for AIS
  callSign?: string;
  make?: string;
  model?: string;
  yearBuilt?: number;
  length?: number;
  beam?: number;
  draft?: number;
  displacement?: number;
  engineType?: string;
  enginePower?: string;
  fuelCapacity?: number;
  waterCapacity?: number;
  image?: string;
  documents?: {
    name: string;
    url: string;
    type: string;
  }[];
  // Safety equipment
  safetyEquipment?: {
    lifeRafts: number;
    lifeJackets: number;
    fireExtinguishers: number;
    flares: number;
    firstAidKits: number;
    epirb?: boolean;
    vhfRadio?: boolean;
    radar?: boolean;
  };
  // Insurance details
  insurance?: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
  };
  notes?: string;
}