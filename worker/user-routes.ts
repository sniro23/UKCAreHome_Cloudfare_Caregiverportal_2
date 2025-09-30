import { Hono } from "hono";
import type { Env } from './core-utils';
import { CaregiverEntity, PatientEntity, RosterShiftEntity, AppNotificationEntity, ShiftRequestEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import { PatientLog, ShiftRequest } from "@shared/types";
// For MVP, we'll hardcode the caregiver ID. In a real app, this would come from an auth token.
const CAREGIVER_ID = 'cgr-123';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Seed data on first request
  app.use('/api/*', async (c, next) => {
    await Promise.all([
      CaregiverEntity.ensureSeed(c.env),
      PatientEntity.ensureSeed(c.env),
      RosterShiftEntity.ensureSeed(c.env),
      AppNotificationEntity.ensureSeed(c.env),
      ShiftRequestEntity.ensureSeed(c.env),
    ]);
    await next();
  });
  // --- AUTH ---
  app.post('/api/auth/login', async (c) => {
    const { email, password } = await c.req.json();
    if (email === 'caregiver@example.com' && password === 'password') {
      const caregiver = new CaregiverEntity(c.env, CAREGIVER_ID);
      const profile = await caregiver.getState();
      return ok(c, { user: profile, token: 'mock-jwt-token' });
    }
    return bad(c, 'Invalid credentials');
  });
  // --- PROFILE ---
  app.get('/api/profile', async (c) => {
    const caregiver = new CaregiverEntity(c.env, CAREGIVER_ID);
    return ok(c, await caregiver.getState());
  });
  app.put('/api/profile', async (c) => {
    const data = await c.req.json();
    const caregiver = new CaregiverEntity(c.env, CAREGIVER_ID);
    const updated = await caregiver.updatePersonalInfo(data);
    return ok(c, updated);
  });
  app.put('/api/profile/preferences', async (c) => {
    const data = await c.req.json();
    const caregiver = new CaregiverEntity(c.env, CAREGIVER_ID);
    const updated = await caregiver.updatePreferences(data);
    return ok(c, updated);
  });
  app.post('/api/profile/documents', async (c) => {
    const { name } = await c.req.json(); // In real app, would handle file upload
    const caregiver = new CaregiverEntity(c.env, CAREGIVER_ID);
    const updatedProfile = await caregiver.addDocument({
        name,
        type: 'compliance',
        uploadedAt: new Date().toISOString(),
        url: '#'
    });
    return ok(c, updatedProfile.documents);
  });
  app.delete('/api/profile/documents/:id', async (c) => {
    const docId = c.req.param('id');
    const caregiver = new CaregiverEntity(c.env, CAREGIVER_ID);
    const updatedProfile = await caregiver.removeDocument(docId);
    return ok(c, updatedProfile.documents);
  });
  // --- ROSTER ---
  app.get('/api/roster', async (c) => {
    const page = await RosterShiftEntity.list(c.env);
    return ok(c, page.items);
  });
  app.get('/api/roster/requests', async (c) => {
    const page = await ShiftRequestEntity.list(c.env);
    // In a real app, filter by caregiver ID. Here we return all.
    const requests = page.items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return ok(c, requests);
  });
  app.post('/api/roster/requests', async (c) => {
    const { shiftId, reason } = await c.req.json<{ shiftId: string, reason: string }>();
    if (!shiftId || !reason) return bad(c, 'Missing shiftId or reason');
    const shiftEntity = new RosterShiftEntity(c.env, shiftId);
    if (!(await shiftEntity.exists())) return notFound(c, 'Shift not found');
    const shiftDetails = await shiftEntity.getState();
    const newRequest: Omit<ShiftRequest, 'id'> = {
        shiftId,
        reason,
        requestedById: CAREGIVER_ID,
        status: 'pending',
        createdAt: new Date().toISOString(),
        shiftDetails: {
            start: shiftDetails.start,
            end: shiftDetails.end,
            location: shiftDetails.location,
        }
    };
    const createdRequest = await ShiftRequestEntity.create(c.env, { ...newRequest, id: crypto.randomUUID() });
    return ok(c, createdRequest);
  });
  // --- DUTY ---
  app.post('/api/duty/clock-in', async (c) => {
    const { latitude, longitude } = await c.req.json();
    if (typeof latitude !== 'number' || typeof longitude !== 'number') return bad(c, 'Invalid location data');
    console.log(`Clocking in at ${latitude}, ${longitude}`);
    return ok(c, { status: 'clocked-in', startTime: new Date().toISOString() });
  });
  app.post('/api/duty/clock-out', async (c) => {
    console.log('Clocking out');
    return ok(c, { status: 'clocked-out' });
  });
  // --- PATIENTS ---
  app.get('/api/patients', async (c) => {
    const page = await PatientEntity.list(c.env);
    return ok(c, page.items);
  });
  app.get('/api/patients/:id', async (c) => {
    const id = c.req.param('id');
    const patient = new PatientEntity(c.env, id);
    if (!(await patient.exists())) return notFound(c, 'Patient not found');
    return ok(c, await patient.getState());
  });
  app.post('/api/patients/:id/logs', async (c) => {
    const id = c.req.param('id');
    const { type, notes } = await c.req.json<{ type: PatientLog['type'], notes: string }>();
    if (!type || !notes) return bad(c, 'Missing log type or notes');
    const patient = new PatientEntity(c.env, id);
    if (!(await patient.exists())) return notFound(c, 'Patient not found');
    const updatedPatientState = await patient.addLog({
        caregiverId: CAREGIVER_ID,
        timestamp: new Date().toISOString(),
        type,
        notes,
    });
    return ok(c, updatedPatientState.logs[0]);
  });
  // --- NOTIFICATIONS ---
  app.get('/api/notifications', async (c) => {
    const page = await AppNotificationEntity.list(c.env);
    page.items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return ok(c, page.items);
  });
  app.get('/api/notifications/latest', async (c) => {
    const allNotifications = (await AppNotificationEntity.list(c.env)).items;
    const latestUnreadAlerts = allNotifications
      .filter(n => !n.read && n.type === 'alert')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 1);
    return ok(c, latestUnreadAlerts);
  });
  app.post('/api/notifications/read', async (c) => {
    const { ids } = await c.req.json<{ ids: string[] }>();
    if (!Array.isArray(ids)) return bad(c, 'Invalid request body');
    await Promise.all(ids.map(id => {
        const notification = new AppNotificationEntity(c.env, id);
        return notification.markAsRead();
    }));
    return ok(c, { success: true });
  });
  // --- DASHBOARD ---
  app.get('/api/dashboard/summary', async (c) => {
    const now = new Date();
    const allShifts = (await RosterShiftEntity.list(c.env)).items;
    const allPatients = (await PatientEntity.list(c.env)).items;
    const allNotifications = (await AppNotificationEntity.list(c.env)).items;
    const upcomingShift = allShifts
        .filter(s => new Date(s.start) > now)
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0];
    const allLogs = allPatients.flatMap(p => p.logs.map(log => ({...log, patientName: p.name})));
    const latestLogs = allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 3);
    const quickViewPatients = allPatients.slice(0, 4);
    const summary = {
        upcomingShift: upcomingShift || null,
        assignedPatientsCount: allPatients.length,
        pendingTasksCount: 12, // mock
        unreadNotificationsCount: allNotifications.filter(n => !n.read).length,
        latestLogs,
        quickViewPatients,
    };
    return ok(c, summary);
  });
}