export interface CrewMember {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  image?: string;
  // Emergency contact
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  // Qualifications and certifications
  qualifications?: {
    name: string;
    issueDate: string;
    expiryDate?: string;
    issuingAuthority: string;
    certificateNumber?: string;
  }[];
  // Medical information
  medical?: {
    bloodType?: string;
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
  };
  // Role and experience
  role?: string;
  experience?: {
    yearsOfExperience: number;
    vesselTypes?: string[];
    specialSkills?: string[];
  };
  // Availability
  availability?: {
    preferredDays?: string[];
    notes?: string;
  };
  notes?: string;
  // Document storage
  documents?: {
    name: string;
    url: string;
    type: string;
    expiryDate?: string;
  }[];
}