import { User, Chat, ChatMessage, RosterShift, Patient, AppNotification, ShiftRequest } from './types';
import { addDays, startOfMonth, setHours, setMinutes, setSeconds, subHours, subMinutes, subDays } from 'date-fns';
export const MOCK_USERS: ReadonlyArray<User> = [{ id: 'u1', name: 'Alice' }, { id: 'u2', name: 'Bob' }, { id: 'u3', name: 'Charlie' }];
export const MOCK_CHATS: ReadonlyArray<Chat> = [{ id: 'c1', title: 'General' }, { id: 'c2', title: 'Random' }];
export const MOCK_CHAT_MESSAGES: ReadonlyArray<ChatMessage> = [
{ id: 'm1', chatId: 'c1', userId: 'u1', text: 'Hello', ts: Date.now() - 20000 },
{ id: 'm2', chatId: 'c1', userId: 'u2', text: 'Hi there', ts: Date.now() - 10000 },
{ id: 'm3', chatId: 'c2', userId: 'u3', text: 'Anyone here?', ts: Date.now() - 5000 }];
const today = new Date();
const startOfThisMonth = startOfMonth(today);
const createShift = (dayOffset: number, startHour: number, endHour: number, location: string, patients: string[]): RosterShift => {
  const startDate = setSeconds(setMinutes(setHours(addDays(startOfThisMonth, dayOffset), startHour), 0), 0);
  const endDate = setSeconds(setMinutes(setHours(addDays(startOfThisMonth, dayOffset), endHour), 0), 0);
  return {
    id: `shift-${dayOffset}-${startHour}`,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    location: location,
    assignedPatients: patients,
    status: 'confirmed'
  };
};
export const MOCK_SHIFTS: RosterShift[] = [
createShift(2, 8, 16, 'Maple House, Wing A', ['Olivia Martin', 'Jackson Lee']),
createShift(4, 14, 22, 'Oak Villa, Floor 2', ['Sophia Williams', 'Liam Brown']),
createShift(5, 8, 16, 'Maple House, Wing B', ['Ava Jones', 'Noah Garcia']),
createShift(9, 8, 16, 'Maple House, Wing A', ['Olivia Martin', 'Jackson Lee']),
createShift(11, 14, 22, 'Oak Villa, Floor 2', ['Sophia Williams', 'Liam Brown']),
createShift(12, 8, 16, 'Maple House, Wing B', ['Ava Jones', 'Noah Garcia']),
createShift(15, 22, 6, 'Night Float', ['Emergency Cover']),
createShift(16, 8, 16, 'Maple House, Wing A', ['Olivia Martin', 'Jackson Lee']),
createShift(18, 14, 22, 'Oak Villa, Floor 2', ['Sophia Williams', 'Liam Brown']),
createShift(19, 8, 16, 'Maple House, Wing B', ['Ava Jones', 'Noah Garcia']),
createShift(23, 8, 16, 'Maple House, Wing A', ['Olivia Martin', 'Jackson Lee']),
createShift(25, 14, 22, 'Oak Villa, Floor 2', ['Sophia Williams', 'Liam Brown']),
createShift(26, 8, 16, 'Maple House, Wing B', ['Ava Jones', 'Noah Garcia']),
createShift(29, 22, 6, 'Night Float', ['Emergency Cover'])];
export const MOCK_PATIENTS: Patient[] = [
{
  id: 'p1',
  name: 'Olivia Martin',
  avatar: 'https://i.pravatar.cc/150?u=olivia-martin',
  room: 'Room 101',
  status: 'stable',
  keyInfo: ['Allergies: Penicillin', 'Mobility: Walker'],
  lastCheckin: subMinutes(new Date(), 30).toISOString(),
  logs: []
},
{
  id: 'p2',
  name: 'Jackson Lee',
  avatar: 'https://i.pravatar.cc/150?u=jackson-lee',
  room: 'Room 102',
  status: 'needs-attention',
  keyInfo: ['Diabetic', 'Low sodium diet'],
  lastCheckin: subHours(new Date(), 2).toISOString(),
  logs: []
},
{
  id: 'p3',
  name: 'Sophia Williams',
  avatar: 'https://i.pravatar.cc/150?u=sophia-williams',
  room: 'Room 103',
  status: 'stable',
  keyInfo: ['Hearing impaired (Right ear)', 'Family visit at 2 PM'],
  lastCheckin: subMinutes(new Date(), 45).toISOString(),
  logs: []
},
{
  id: 'p4',
  name: 'Liam Brown',
  avatar: 'https://i.pravatar.cc/150?u=liam-brown',
  room: 'Room 104',
  status: 'critical',
  keyInfo: ['Fall risk', 'Post-op recovery'],
  lastCheckin: subHours(new Date(), 4).toISOString(),
  logs: []
}];
export const MOCK_NOTIFICATIONS: AppNotification[] = [
{
  id: 'n1',
  type: 'alert',
  title: 'Fall detected: Liam Brown (Room 104)',
  description: 'A fall has been detected by the wearable sensor. Immediate assistance required.',
  timestamp: subMinutes(new Date(), 5).toISOString(),
  read: false
},
{
  id: 'n2',
  type: 'roster',
  title: 'Roster Change Approved',
  description: 'Your request to change your shift on 25th Dec has been approved.',
  timestamp: subHours(new Date(), 1).toISOString(),
  read: false
},
{
  id: 'n3',
  type: 'message',
  title: 'New message from Admin',
  description: 'Please remember to complete the mandatory training by Friday.',
  timestamp: subHours(new Date(), 3).toISOString(),
  read: true
},
{
  id: 'n4',
  type: 'system',
  title: 'System Maintenance Scheduled',
  description: 'The system will be down for maintenance on Sunday from 2 AM to 3 AM.',
  timestamp: subDays(new Date(), 1).toISOString(),
  read: true
},
{
  id: 'n5',
  type: 'roster',
  title: 'New Roster Published',
  description: 'The roster for the upcoming week has been published. Please review your shifts.',
  timestamp: subDays(new Date(), 2).toISOString(),
  read: true
}];
export const MOCK_SHIFT_REQUESTS: ShiftRequest[] = [
{
  id: 'req1',
  shiftId: MOCK_SHIFTS[4].id,
  requestedById: 'cgr-123',
  reason: "I have a doctor's appointment that I cannot reschedule.",
  status: 'approved',
  createdAt: subDays(new Date(), 5).toISOString(),
  shiftDetails: {
    start: MOCK_SHIFTS[4].start,
    end: MOCK_SHIFTS[4].end,
    location: MOCK_SHIFTS[4].location
  }
},
{
  id: 'req2',
  shiftId: MOCK_SHIFTS[6].id,
  requestedById: 'cgr-123',
  reason: "Family emergency, need to travel out of town.",
  status: 'pending',
  createdAt: subDays(new Date(), 2).toISOString(),
  shiftDetails: {
    start: MOCK_SHIFTS[6].start,
    end: MOCK_SHIFTS[6].end,
    location: MOCK_SHIFTS[6].location
  }
},
{
  id: 'req3',
  shiftId: MOCK_SHIFTS[8].id,
  requestedById: 'cgr-123',
  reason: "Not feeling well, requesting sick leave.",
  status: 'rejected',
  createdAt: subDays(new Date(), 10).toISOString(),
  shiftDetails: {
    start: MOCK_SHIFTS[8].start,
    end: MOCK_SHIFTS[8].end,
    location: MOCK_SHIFTS[8].location
  }
}];