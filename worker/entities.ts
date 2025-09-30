import { IndexedEntity } from "./core-utils";
import type { CaregiverProfile, Patient, RosterShift, AppNotification, CaregiverDocument, WorkPreferences, PatientLog, ShiftRequest } from "@shared/types";
import { MOCK_PATIENTS, MOCK_SHIFTS, MOCK_NOTIFICATIONS, MOCK_SHIFT_REQUESTS } from "@shared/mock-data";
import { subDays, subHours } from "date-fns";
// We'll use a single caregiver for this MVP
const MOCK_CAREGIVER_PROFILE: CaregiverProfile = {
    id: 'cgr-123',
    fullName: 'Jane Doe',
    email: 'caregiver@example.com',
    phone: '07123456789',
    address: '123 Care Street, London, UK',
    emergencyContact: {
        name: 'John Doe',
        phone: '07987654321',
    },
    preferences: {
        availability: 'full-time',
        shiftPreferences: ['day', 'evening'],
    },
    documents: [
        { id: 'doc1', name: 'DBS Certificate.pdf', type: 'compliance', uploadedAt: new Date('2023-10-15').toISOString(), url: '#' },
        { id: 'doc2', name: 'Manual Handling Cert.pdf', type: 'compliance', uploadedAt: new Date('2023-11-01').toISOString(), url: '#' },
        { id: 'doc3', name: 'Passport_Scan.jpg', type: 'passport', uploadedAt: new Date('2023-08-20').toISOString(), url: '#' },
    ]
};
const MOCK_PATIENT_LOGS: PatientLog[] = [
    { id: 'log1', patientId: 'p1', caregiverId: 'cgr-123', timestamp: subHours(new Date(), 1).toISOString(), type: 'activity', notes: 'Assisted with morning routine. Patient is in good spirits.' },
    { id: 'log2', patientId: 'p1', caregiverId: 'cgr-123', timestamp: subHours(new Date(), 3).toISOString(), type: 'meal', notes: 'Ate 80% of breakfast.' },
    { id: 'log3', patientId: 'p2', caregiverId: 'cgr-123', timestamp: subHours(new Date(), 2).toISOString(), type: 'incident', notes: 'Patient reported feeling dizzy. Blood pressure checked and recorded. Monitored for 30 mins.' },
    { id: 'log4', patientId: 'p2', caregiverId: 'cgr-123', timestamp: subHours(new Date(), 8).toISOString(), type: 'medication', notes: 'Administered evening medication as prescribed.' },
];
const MOCK_PATIENTS_WITH_LOGS: Patient[] = MOCK_PATIENTS.map(p => ({
    ...p,
    logs: MOCK_PATIENT_LOGS.filter(log => log.patientId === p.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
}));
export class CaregiverEntity extends IndexedEntity<CaregiverProfile> {
  static readonly entityName = "caregiver";
  static readonly indexName = "caregivers";
  static readonly initialState: CaregiverProfile = {
    id: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    emergencyContact: { name: "", phone: "" },
    preferences: { availability: 'full-time', shiftPreferences: [] },
    documents: []
  };
  static seedData = [MOCK_CAREGIVER_PROFILE];
  async updatePersonalInfo(data: Partial<CaregiverProfile>) {
    return this.mutate(s => ({ ...s, ...data }));
  }
  async updatePreferences(preferences: WorkPreferences) {
    return this.mutate(s => ({ ...s, preferences }));
  }
  async addDocument(doc: Omit<CaregiverDocument, 'id'>) {
    const newDoc = { ...doc, id: crypto.randomUUID() };
    return this.mutate(s => ({ ...s, documents: [...s.documents, newDoc] }));
  }
  async removeDocument(docId: string) {
    return this.mutate(s => ({ ...s, documents: s.documents.filter(d => d.id !== docId) }));
  }
}
export class PatientEntity extends IndexedEntity<Patient> {
  static readonly entityName = "patient";
  static readonly indexName = "patients";
  static readonly initialState: Patient = {
    id: "",
    name: "",
    avatar: "",
    room: "",
    status: 'stable',
    keyInfo: [],
    lastCheckin: new Date().toISOString(),
    logs: []
  };
  static seedData = MOCK_PATIENTS_WITH_LOGS;
  async addLog(log: Omit<PatientLog, 'id' | 'patientId'>) {
    const newLog: PatientLog = {
        ...log,
        id: crypto.randomUUID(),
        patientId: this.id,
    };
    return this.mutate(s => ({
        ...s,
        logs: [newLog, ...s.logs],
    }));
  }
}
export class RosterShiftEntity extends IndexedEntity<RosterShift> {
  static readonly entityName = "rostershift";
  static readonly indexName = "rostershifts";
  static readonly initialState: RosterShift = {
    id: "",
    start: "",
    end: "",
    location: "",
    assignedPatients: [],
    status: 'pending'
  };
  static seedData = MOCK_SHIFTS;
}
export class AppNotificationEntity extends IndexedEntity<AppNotification> {
  static readonly entityName = "notification";
  static readonly indexName = "notifications";
  static readonly initialState: AppNotification = {
    id: "",
    type: 'system',
    title: "",
    description: "",
    timestamp: "",
    read: false
  };
  static seedData = MOCK_NOTIFICATIONS;
  async markAsRead() {
    return this.mutate(s => ({ ...s, read: true }));
  }
}
export class ShiftRequestEntity extends IndexedEntity<ShiftRequest> {
    static readonly entityName = "shiftrequest";
    static readonly indexName = "shiftrequests";
    static readonly initialState: ShiftRequest = {
        id: "",
        shiftId: "",
        requestedById: "",
        reason: "",
        status: 'pending',
        createdAt: "",
        shiftDetails: {
            start: "",
            end: "",
            location: "",
        }
    };
    static seedData = MOCK_SHIFT_REQUESTS;
}