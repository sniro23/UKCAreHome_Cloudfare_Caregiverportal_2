import { useEffect, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  Clock,
  Users,
  Bell,
  LogIn,
  LogOut,
  Loader2,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';
import { useDutyStore } from '@/stores/duty-store';
import { useGeolocation } from '@/hooks/use-geolocation';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api-client';
import { DashboardSummary, Patient, PatientLog } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};
const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};
const DutyControl = () => {
  const { status, startTime, initiateClockIn, clockOut } = useDutyStore();
  const { isLoading: isGeoLoading, error: geoError, getPosition, position } = useGeolocation();
  const [elapsedTime, setElapsedTime] = useState('');
  useEffect(() => {
    if (status === 'clocked-in' && startTime) {
      const timer = setInterval(() => {
        const distance = formatDistanceToNow(new Date(startTime), { includeSeconds: true });
        setElapsedTime(distance);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, startTime]);
  useEffect(() => {
    if (geoError) {
      toast.error('Location Error', {
        description: geoError.message,
      });
    }
  }, [geoError]);
  const handleClockIn = () => {
    getPosition();
  };
  useEffect(() => {
    if (position) {
      initiateClockIn(position.coords);
    }
  }, [position, initiateClockIn]);
  const isLoading = status === 'clocking-in' || status === 'clocking-out' || isGeoLoading;
  if (status === 'clocked-in') {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">On Duty For</p>
          <p className="text-2xl font-bold font-mono tracking-wider">{elapsedTime}</p>
        </div>
        <Button variant="destructive" size="lg" className="w-full" onClick={clockOut} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
          Clock Out
        </Button>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-4">
      <Button size="lg" className="w-full" onClick={handleClockIn} disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <LogIn className="mr-2 h-4 w-4" />
        )}
        {isGeoLoading ? 'Getting Location...' : status === 'clocking-in' ? 'Verifying...' : 'Clock In'}
      </Button>
      {status === 'error' && (
        <p className="text-sm text-destructive flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Clock-in failed. Please try again.
        </p>
      )}
    </div>
  );
};
const logIcons: Record<PatientLog['type'], React.ReactNode> = {
  activity: <ClipboardList className="h-5 w-5 text-sky-500" />,
  incident: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  meal: <Users className="h-5 w-5 text-emerald-500" />,
  medication: <Users className="h-5 w-5 text-rose-500" />,
};
const PatientStatusBadge = ({ status }: { status: Patient['status'] }) => {
  const statusConfig = {
    stable: { text: 'Stable', className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
    'needs-attention': { text: 'Needs Attention', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
    critical: { text: 'Critical', className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 animate-pulse' },
  };
  const config = statusConfig[status];
  return <Badge variant="secondary" className={cn(config.className)}>{config.text}</Badge>;
};
export function HomePage() {
  const user = useAuthStore((state) => state.user);
  const dutyStatus = useDutyStore((state) => state.status);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchSummary = async () => {
        try {
            const data = await api<DashboardSummary>('/api/dashboard/summary');
            setSummary(data);
        } catch (error) {
            toast.error("Failed to load dashboard data.");
        } finally {
            setIsLoading(false);
        }
    };
    fetchSummary();
  }, []);
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };
  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight">
            {greeting()}, {user?.fullName?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">Here's what's happening today.</p>
        </div>
        <div className="md:hidden">
            <DutyControl />
        </div>
      </div>
      <motion.div
        className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card className={cn(dutyStatus === 'clocked-in' ? 'bg-primary text-primary-foreground' : '')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Shift</CardTitle>
              <Clock className={cn(dutyStatus === 'clocked-in' ? 'text-primary-foreground/70' : 'text-muted-foreground')} />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-6 w-32 mt-1" /> : summary?.upcomingShift ? (
                  <>
                      <div className="text-2xl font-bold">{format(new Date(summary.upcomingShift.start), 'HH:mm')} - {format(new Date(summary.upcomingShift.end), 'HH:mm')}</div>
                      <p className={cn('text-xs', dutyStatus === 'clocked-in' ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                          {format(new Date(summary.upcomingShift.start), 'MMM do')} @ {summary.upcomingShift.location}
                      </p>
                  </>
              ) : (
                  <div className="text-lg font-bold">No upcoming shifts</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{summary?.assignedPatientsCount}</div>}
              <p className="text-xs text-muted-foreground">Ready for your care</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{summary?.pendingTasksCount}</div>}
              <p className="text-xs text-muted-foreground">3 overdue</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{summary?.unreadNotificationsCount}</div>}
              <p className="text-xs text-muted-foreground">Check your inbox</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      <motion.div
        className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="xl:col-span-2 hidden md:block">
          <Card>
            <CardHeader>
              <CardTitle>Duty Status</CardTitle>
              <CardDescription>Manage your shift clock-in and clock-out here.</CardDescription>
            </CardHeader>
            <CardContent>
              <DutyControl />
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>A log of recent care events.</CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link to="/patients">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-12 w-full" />) :
                 summary && summary.latestLogs.length > 0 ? summary.latestLogs.map(log => (
                  <div key={log.id} className="flex items-center">
                    {logIcons[log.type]}
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium leading-none capitalize">{log.type} log for {log.patientName}</p>
                      <p className="text-sm text-muted-foreground truncate">{log.notes}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</div>
                  </div>
                 )) : <p className="text-sm text-muted-foreground text-center py-4">No recent activity to show.</p>
                }
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Assigned Patients Quick View</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              {isLoading ? Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-12 w-full" />) :
               summary && summary.quickViewPatients.length > 0 ? summary.quickViewPatients.map(patient => (
                <div key={patient.id} className="flex items-center gap-4">
                  <Avatar className="hidden h-9 w-9 sm:flex">
                    <AvatarImage src={patient.avatar} alt={patient.name} />
                    <AvatarFallback>{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">{patient.name}</p>
                    <p className="text-sm text-muted-foreground">{patient.room}</p>
                  </div>
                  <div className="ml-auto font-medium">
                    <PatientStatusBadge status={patient.status} />
                  </div>
                </div>
               )) : <p className="text-sm text-muted-foreground text-center py-4">No patients assigned.</p>
              }
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}