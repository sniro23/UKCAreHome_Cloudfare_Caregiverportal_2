import { useEffect, useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, MapPin, Users, Send, Loader2, CalendarDays, History, CheckCircle, XCircle, Hourglass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRosterStore } from '@/stores/roster-store';
import { RosterShift, ShiftRequest } from '@shared/types';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
const CalendarSkeleton = () => (
    <div className="grid grid-cols-7 col-span-7 gap-px">
        {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="relative flex flex-col bg-background p-2 min-h-[120px]">
                <div className="flex justify-end">
                    <Skeleton className="h-6 w-6 rounded-full" />
                </div>
                <div className="mt-2 space-y-1">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                </div>
            </div>
        ))}
    </div>
);
const RequestStatusBadge = ({ status }: { status: ShiftRequest['status'] }) => {
    const statusConfig = {
        pending: { icon: <Hourglass className="h-4 w-4" />, text: 'Pending', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
        approved: { icon: <CheckCircle className="h-4 w-4" />, text: 'Approved', className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
        rejected: { icon: <XCircle className="h-4 w-4" />, text: 'Rejected', className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' },
    };
    const config = statusConfig[status];
    return <Badge variant="secondary" className={cn('gap-2', config.className)}>{config.icon}<span>{config.text}</span></Badge>;
};
const MyRequestsTab = () => {
    const shiftRequests = useRosterStore(state => state.shiftRequests);
    const isLoadingRequests = useRosterStore(state => state.isLoadingRequests);
    const fetchShiftRequests = useRosterStore(state => state.fetchShiftRequests);
    useEffect(() => {
        fetchShiftRequests();
    }, [fetchShiftRequests]);
    return (
        <Card>
            <CardHeader>
                <CardTitle>My Shift Change Requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoadingRequests ? (
                    Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
                ) : shiftRequests.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">You have not made any shift change requests.</p>
                ) : (
                    shiftRequests.map(req => (
                        <div key={req.id} className="p-4 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <p className="font-semibold">Request for shift on {format(new Date(req.shiftDetails.start), 'MMM do, yyyy')}</p>
                                <p className="text-sm text-muted-foreground">{format(new Date(req.shiftDetails.start), 'HH:mm')} - {format(new Date(req.shiftDetails.end), 'HH:mm')} at {req.shiftDetails.location}</p>
                                <p className="text-sm mt-2 italic">"{req.reason}"</p>
                            </div>
                            <RequestStatusBadge status={req.status} />
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
};
export function RosterPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedShift, setSelectedShift] = useState<RosterShift | null>(null);
  const [isRequestingChange, setIsRequestingChange] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [changeReason, setChangeReason] = useState('');
  // CRITICAL FIX: Select state primitives individually to prevent re-renders.
  const shifts = useRosterStore(state => state.shifts);
  const isLoading = useRosterStore(state => state.isLoading);
  const fetchShifts = useRosterStore(state => state.fetchShifts);
  const submitShiftRequest = useRosterStore(state => state.submitShiftRequest);
  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);
  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(firstDayOfMonth),
    end: endOfWeek(lastDayOfMonth),
  });
  const shiftsByDate = useMemo(() => {
    const map = new Map<string, RosterShift[]>();
    shifts.forEach((shift) => {
      const dateKey = format(new Date(shift.start), 'yyyy-MM-dd');
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)?.push(shift);
    });
    return map;
  }, [shifts]);
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => setCurrentMonth(new Date());
  const handleShiftClick = (shift: RosterShift) => setSelectedShift(shift);
  const handleRequestChange = () => setIsRequestingChange(true);
  const handleSubmitRequest = async () => {
    if (!changeReason.trim() || !selectedShift) {
      toast.error('Please provide a reason for the change request.');
      return;
    }
    setIsSubmitting(true);
    try {
        await submitShiftRequest(selectedShift.id, changeReason);
        toast.success('Shift change request submitted successfully.');
        setIsRequestingChange(false);
        setSelectedShift(null);
        setChangeReason('');
    } catch (error) {
        toast.error('Failed to submit request.');
    } finally {
        setIsSubmitting(false);
    }
  };
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return (
    <div className="flex h-full flex-col">
      <Tabs defaultValue="calendar" className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <TabsList>
                <TabsTrigger value="calendar"><CalendarDays className="mr-2 h-4 w-4" /> Calendar View</TabsTrigger>
                <TabsTrigger value="requests"><History className="mr-2 h-4 w-4" /> My Requests</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePrevMonth}><ChevronLeft className="h-4 w-4" /></Button>
                <h1 className="text-xl md:text-2xl font-bold font-display text-center w-48">{format(currentMonth, 'MMMM yyyy')}</h1>
                <Button variant="outline" size="icon" onClick={handleNextMonth}><ChevronRight className="h-4 w-4" /></Button>
                <Button variant="outline" onClick={handleToday}>Today</Button>
            </div>
        </div>
        <TabsContent value="calendar">
            <div className="grid grid-cols-7 flex-1 gap-px bg-border rounded-lg overflow-hidden border">
                {weekDays.map((day) => (
                    <div key={day} className="bg-muted/50 p-2 text-center text-sm font-medium text-muted-foreground">{day}</div>
                ))}
                {isLoading ? <CalendarSkeleton /> : daysInMonth.map((day) => {
                    const dayShifts = shiftsByDate.get(format(day, 'yyyy-MM-dd')) || [];
                    return (
                        <div key={day.toString()} className={cn('relative flex flex-col bg-background p-2 min-h-[120px] transition-colors duration-200', !isSameMonth(day, currentMonth) && 'bg-muted/30 text-muted-foreground')}>
                            <time dateTime={format(day, 'yyyy-MM-dd')} className={cn('flex items-center justify-center h-8 w-8 rounded-full font-semibold ml-auto', isToday(day) && 'bg-primary text-primary-foreground')}>
                                {format(day, 'd')}
                            </time>
                            <div className="mt-2 flex flex-col gap-1">
                                {dayShifts.map((shift) => (
                                    <motion.button key={shift.id} onClick={() => handleShiftClick(shift)} className="w-full text-left p-1.5 rounded-md bg-primary/10" whileHover={{ scale: 1.05, backgroundColor: 'hsl(var(--primary) / 0.2)' }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
                                        <p className="text-xs font-semibold text-primary truncate">{format(new Date(shift.start), 'HH:mm')} - {format(new Date(shift.end), 'HH:mm')}</p>
                                        <p className="text-xs text-foreground/80 truncate">{shift.location}</p>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </TabsContent>
        <TabsContent value="requests">
            <MyRequestsTab />
        </TabsContent>
      </Tabs>
      <Dialog open={!!selectedShift} onOpenChange={() => setSelectedShift(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Shift Details</DialogTitle>
            <DialogDescription>{selectedShift && format(new Date(selectedShift.start), 'eeee, MMMM do yyyy')}</DialogDescription>
          </DialogHeader>
          {selectedShift && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3"><Clock className="h-5 w-5 text-primary" /><div><p className="font-semibold">{format(new Date(selectedShift.start), 'HH:mm')} - {format(new Date(selectedShift.end), 'HH:mm')}</p><p className="text-sm text-muted-foreground">Shift Time</p></div></div>
              <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-primary" /><div><p className="font-semibold">{selectedShift.location}</p><p className="text-sm text-muted-foreground">Location</p></div></div>
              <div className="flex items-start gap-3"><Users className="h-5 w-5 text-primary mt-1" /><div><p className="font-semibold">Assigned Patients</p><div className="flex flex-wrap gap-2 mt-1">{selectedShift.assignedPatients.map((patient) => (<Badge key={patient} variant="secondary">{patient}</Badge>))}</div></div></div>
              <Button className="w-full mt-4" onClick={handleRequestChange}><Send className="mr-2 h-4 w-4" />Request Change</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={isRequestingChange} onOpenChange={() => setIsRequestingChange(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Shift Change</DialogTitle>
            <DialogDescription>Please provide a reason for your request. This will be sent to the administrator for approval.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid gap-2"><Label htmlFor="reason">Reason for Request</Label><Textarea id="reason" placeholder="e.g., Doctor's appointment, family emergency..." value={changeReason} onChange={(e) => setChangeReason(e.target.value)} rows={4} /></div>
            <Button className="w-full" onClick={handleSubmitRequest} disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Submit Request</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}