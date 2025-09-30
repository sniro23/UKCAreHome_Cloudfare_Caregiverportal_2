import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  HeartPulse,
  ClipboardList,
  Activity,
  AlertTriangle,
  Utensils,
  Pill,
  Loader2,
  Send,
  PlusCircle,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Patient, PatientLog } from '@shared/types';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { motion, AnimatePresence } from 'framer-motion';
const logIcons = {
  activity: <Activity className="h-5 w-5 text-sky-500" />,
  incident: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  meal: <Utensils className="h-5 w-5 text-emerald-500" />,
  medication: <Pill className="h-5 w-5 text-rose-500" />,
};
const LogEntry = ({ log }: { log: PatientLog }) => {
  const author = useAuthStore((state) => state.user);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border"
    >
      <div className="flex-shrink-0 mt-1">{logIcons[log.type]}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-semibold capitalize">{log.type} Log</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
          </p>
        </div>
        <p className="text-sm text-foreground/90 mt-1">{log.notes}</p>
        <p className="text-xs text-muted-foreground mt-2">
          Logged by: <span className="font-medium">{author?.fullName}</span>
        </p>
      </div>
    </motion.div>
  );
};
const AddLogForm = ({ patientId, onLogAdded }: { patientId: string; onLogAdded: (log: PatientLog) => void }) => {
  const [logType, setLogType] = useState<PatientLog['type']>('activity');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async () => {
    if (!notes.trim()) {
      toast.error('Please enter some notes for the log.');
      return;
    }
    setIsSubmitting(true);
    try {
      const newLog = await api<PatientLog>(`/api/patients/${patientId}/logs`, {
        method: 'POST',
        body: JSON.stringify({ type: logType, notes }),
      });
      onLogAdded(newLog);
      setNotes('');
      toast.success(`${logType.charAt(0).toUpperCase() + logType.slice(1)} log added successfully.`);
    } catch (error) {
      toast.error('Failed to add log entry.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Log Entry</CardTitle>
        <CardDescription>Select a log type and add your notes below.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(logIcons) as PatientLog['type'][]).map((type) => (
            <Button
              key={type}
              variant={logType === type ? 'default' : 'outline'}
              onClick={() => setLogType(type)}
              className="capitalize"
            >
              {logIcons[type]}
              <span className="ml-2">{type}</span>
            </Button>
          ))}
        </div>
        <Textarea
          placeholder={`Enter notes for the ${logType} log...`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
        />
        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
          Add Log
        </Button>
      </CardContent>
    </Card>
  );
};
export function PatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) return;
      setIsLoading(true);
      try {
        const data = await api<Patient>(`/api/patients/${patientId}`);
        setPatient(data);
      } catch (error) {
        toast.error('Failed to load patient details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatient();
  }, [patientId]);
  const handleLogAdded = (newLog: PatientLog) => {
    setPatient(prevPatient => {
      if (!prevPatient) return null;
      const updatedLogs = [newLog, ...prevPatient.logs];
      return { ...prevPatient, logs: updatedLogs };
    });
  };
  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-8 p-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }
  if (!patient) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold">Patient not found</h2>
        <Button asChild variant="link" className="mt-4">
          <Link to="/patients">Go back to patient list</Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <div>
        <Button asChild variant="ghost" className="mb-4 -ml-4">
          <Link to="/patients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Patients
          </Link>
        </Button>
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-primary/20">
            <AvatarImage src={patient.avatar} alt={patient.name} />
            <AvatarFallback className="text-3xl">
              {patient.name.split(' ').map((n) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-4xl font-bold font-display">{patient.name}</h1>
            <p className="text-muted-foreground text-lg">Room {patient.room}</p>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><HeartPulse className="text-primary" /> Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={patient.status === 'critical' ? 'destructive' : 'secondary'} className="text-lg capitalize">{patient.status}</Badge>
              <p className="text-sm text-muted-foreground mt-2">Last check-in: {formatDistanceToNow(new Date(patient.lastCheckin), { addSuffix: true })}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ClipboardList className="text-primary" /> Care Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {patient.keyInfo.map((info, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-1">&bull;</span>
                    <span>{info}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Tabs defaultValue="logs">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="logs">Patient Logs</TabsTrigger>
              <TabsTrigger value="add-log">Add New Log</TabsTrigger>
            </TabsList>
            <TabsContent value="logs">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Feed</CardTitle>
                  <CardDescription>A chronological record of care activities and events.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto p-2">
                  <AnimatePresence>
                    {patient.logs && patient.logs.length > 0 ? (
                      patient.logs.map((log) => <LogEntry key={log.id} log={log} />)
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No log entries for this patient yet.</p>
                      </div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="add-log">
              {patientId && <AddLogForm patientId={patientId} onLogAdded={handleLogAdded} />}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}