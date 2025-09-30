import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, HeartPulse, Info, User, Users, HeartHandshake, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Patient } from '@shared/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};
const PatientStatusBadge = ({ status }: { status: Patient['status'] }) => {
  const statusConfig = {
    stable: {
      icon: <CheckCircle2 className="h-4 w-4" />,
      text: 'Stable',
      className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    },
    'needs-attention': {
      icon: <AlertTriangle className="h-4 w-4" />,
      text: 'Needs Attention',
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    },
    critical: {
      icon: <HeartPulse className="h-4 w-4" />,
      text: 'Critical',
      className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 animate-pulse',
    },
  };
  const config = statusConfig[status];
  return (
    <Badge variant="secondary" className={cn('gap-2', config.className)}>
      {config.icon}
      <span className="font-semibold">{config.text}</span>
    </Badge>
  );
};
const PatientCard = ({ patient }: { patient: Patient }) => (
  <Card className="hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
      <Avatar className="h-16 w-16 border-2 border-primary/20">
        <AvatarImage src={patient.avatar} alt={patient.name} />
        <AvatarFallback>
          {patient.name
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </AvatarFallback>
      </Avatar>
      <div className="grid gap-1">
        <CardTitle className="text-xl font-bold font-display">{patient.name}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <User className="h-4 w-4" /> {patient.room}
        </CardDescription>
      </div>
    </CardHeader>
    <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
      <div className="flex justify-between items-center">
        <PatientStatusBadge status={patient.status} />
        <p className="text-sm text-muted-foreground">
          Last check: {formatDistanceToNow(new Date(patient.lastCheckin), { addSuffix: true })}
        </p>
      </div>
      <div className="border-t pt-4 space-y-2">
        <h4 className="text-sm font-semibold text-muted-foreground">Key Information</h4>
        <ul className="space-y-1">
          {patient.keyInfo.map((info, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <Info className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
              <span>{info}</span>
            </li>
          ))}
        </ul>
      </div>
    </CardContent>
  </Card>
);
const PatientSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="grid gap-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="border-t pt-4 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    </CardContent>
  </Card>
);
const EmptyState = ({ isFiltered }: { isFiltered: boolean }) => (
    <div className="flex flex-col items-center justify-center text-center col-span-full py-16">
        <HeartHandshake className="h-16 w-16 text-primary/50 mb-4" />
        <h2 className="text-2xl font-bold font-display">{isFiltered ? "No Matching Patients" : "No Patients Assigned"}</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
            {isFiltered ? "Try adjusting your search or filter criteria." : "Please check your roster or contact your administrator."}
        </p>
    </div>
);
export function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      try {
        const data = await api<Patient[]>('/api/patients');
        setPatients(data);
      } catch (error) {
        toast.error("Failed to load assigned patients.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatients();
  }, []);
  const filteredPatients = useMemo(() => {
    return patients
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(p => statusFilter === 'all' || p.status === statusFilter);
  }, [patients, searchTerm, statusFilter]);
  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          Assigned Patients
        </h1>
        <p className="text-muted-foreground">
          Your assigned patients for the current shift. Click a card to view details.
        </p>
      </div>
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search by patient name..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="stable">Stable</SelectItem>
                    <SelectItem value="needs-attention">Needs Attention</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
            </Select>
        </CardContent>
      </Card>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => <PatientSkeleton key={index} />)
          : filteredPatients.length > 0
            ? filteredPatients.map((patient) => (
                <motion.div key={patient.id} variants={itemVariants}>
                  <Link to={`/patients/${patient.id}`} className="block h-full">
                    <PatientCard patient={patient} />
                  </Link>
                </motion.div>
              ))
            : <EmptyState isFiltered={searchTerm !== '' || statusFilter !== 'all'} />}
      </motion.div>
    </div>
  );
}