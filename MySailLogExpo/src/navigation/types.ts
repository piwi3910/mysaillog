import { NavigatorScreenParams } from '@react-navigation/native';
import { Vessel } from '../models/types';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type TripStackParamList = {
  TripList: undefined;
  TripDetails: { tripId: string };
  NewTrip: undefined;
  EditTrip: { tripId: string };
  VesselSelector: {
    currentVesselId?: string;
    onSelect: (vessel: Vessel) => void;
  };
};

export type VesselStackParamList = {
  VesselList: undefined;
  VesselDetails: { vesselId: string };
  NewVessel: undefined;
  EditVessel: { vesselId: string };
};

export type SettingsStackParamList = {
  SettingsList: undefined;
  Profile: undefined;
  Notifications: undefined;
  Units: undefined;
  Privacy: undefined;
  About: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Trips: NavigatorScreenParams<TripStackParamList>;
  Vessels: NavigatorScreenParams<VesselStackParamList>;
  Weather: undefined;
  Settings: NavigatorScreenParams<SettingsStackParamList>;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

// Helper type for nested navigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}