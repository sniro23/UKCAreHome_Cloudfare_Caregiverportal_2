export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface User {
  id: string;
  name: string;
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number;
}
// New types for CareConnect Portal
export interface WorkPreferences {
  availability: 'full-time' | 'part-time' | 'flexible';
  shiftPreferences: string[];
}
export interface CaregiverDocument {
  id: string;
  name: string;
  type: 'passport' | 'compliance' | 'other';
  uploadedAt: string; // ISO date string
  url: string;
}
export interface CaregiverProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  avatar?: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
  preferences: WorkPreferences;
  documents: CaregiverDocument[];
}
// Phase 2: Roster types
export interface RosterShift {
    id: string;
    start: string; // ISO date string
    end: string; // ISO date string
    location: string;
    assignedPatients: string[];
    status: 'confirmed' | 'pending' | 'cancelled';
}
export interface ShiftRequest {
    id: string;
    shiftId: string;
    requestedById: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string; // ISO date string
    shiftDetails: {
        start: string;
        end: string;
        location: string;
    };
}
// Phase 3: Duty Log types
export interface DutyLog {
    id: string;
    caregiverId: string;
    clockInTime: string; // ISO date string
    clockOutTime: string; // ISO date string
    clockInLocation: {
        latitude: number;
        longitude: number;
    };
    clockOutLocation: {
        latitude: number;
        longitude: number;
    };
}
// Phase 7: Patient Log types
export interface MealLogItem {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  details: string; // e.g., "Ate 75% of meal"
}
export interface MedicationLogItem {
  medicationName: string;
  dosage: string;
  administered: boolean;
}
export interface PatientLog {
  id: string;
  patientId: string;
  caregiverId: string;
  timestamp: string; // ISO date string
  type: 'activity' | 'incident' | 'meal' | 'medication';
  notes: string;
  patientName?: string; // Optional: denormalized for convenience
}
// Phase 4: Patient and Notification types
export interface Patient {
  id: string;
  name: string;
  avatar: string;
  room: string;
  status: 'stable' | 'needs-attention' | 'critical';
  keyInfo: string[]; // e.g., ['Allergies: Peanuts', 'Mobility: Wheelchair']
  lastCheckin: string; // ISO date string
  logs: PatientLog[];
}
export interface AppNotification {
  id: string;
  type: 'roster' | 'alert' | 'message' | 'system';
  title: string;
  description: string;
  timestamp: string; // ISO date string
  read: boolean;
}
// Phase 9: Dashboard Summary type
export interface DashboardSummary {
    upcomingShift: RosterShift | null;
    assignedPatientsCount: number;
    pendingTasksCount: number;
    unreadNotificationsCount: number;
    latestLogs: PatientLog[];
    quickViewPatients: Patient[];
}