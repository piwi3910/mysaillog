import { Vessel } from './vessel';
import { CrewMember } from './crew';

export type VesselStackParamList = {
  VesselsList: undefined;
  VesselDetails: { vessel: Vessel };
  AddVessel: { vessel?: Vessel };
};

export type CrewStackParamList = {
  CrewList: undefined;
  CrewMemberDetails: { crewMember: CrewMember };
  AddCrewMember: { crewMember?: CrewMember };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends VesselStackParamList, CrewStackParamList {}
  }
}