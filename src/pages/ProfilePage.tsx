import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  FileDown,
  Loader2,
  Paperclip,
  Trash2,
  UploadCloud,
  User,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { CaregiverDocument, CaregiverProfile, WorkPreferences } from "@shared/types";
import { api } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
const personalInfoSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Invalid phone number"),
  address: z.string().min(5, "Address is required"),
  emergencyContact: z.object({
    name: z.string().min(2, "Contact name is required"),
    phone: z.string().min(10, "Invalid phone number"),
  }),
});
const preferencesSchema = z.object({
  availability: z.enum(["full-time", "part-time", "flexible"]),
  shiftPreferences: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one shift preference.",
  }),
});
const shiftItems = [
  { id: "day", label: "Day Shifts (e.g., 8am - 4pm)" },
  { id: "evening", label: "Evening Shifts (e.g., 4pm - 12am)" },
  { id: "night", label: "Night Shifts (e.g., 12am - 8am)" },
  { id: "weekends", label: "Weekends Only" },
];
function PersonalInfoForm({ profile, onUpdate }: { profile: CaregiverProfile, onUpdate: (data: CaregiverProfile) => void }) {
  const [isSaving, setIsSaving] = useState(false);
  const form = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: profile,
  });
  useEffect(() => {
    form.reset(profile);
  }, [profile, form]);
  async function onSubmit(values: z.infer<typeof personalInfoSchema>) {
    setIsSaving(true);
    try {
      const updatedProfile = await api<CaregiverProfile>('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(values),
      });
      onUpdate(updatedProfile);
      toast.success("Personal information updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="fullName" render={({ field }) => (
            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="address" render={({ field }) => (
            <FormItem><FormLabel>Home Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <h3 className="text-lg font-medium border-t pt-6">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="emergencyContact.name" render={({ field }) => (
            <FormItem><FormLabel>Contact Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="emergencyContact.phone" render={({ field }) => (
            <FormItem><FormLabel>Contact Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
        </Button>
      </form>
    </Form>
  );
}
function PreferencesForm({ preferences, onUpdate }: { preferences: WorkPreferences, onUpdate: (data: CaregiverProfile) => void }) {
    const [isSaving, setIsSaving] = useState(false);
    const form = useForm<z.infer<typeof preferencesSchema>>({
        resolver: zodResolver(preferencesSchema),
        defaultValues: preferences,
    });
    useEffect(() => {
        form.reset(preferences);
    }, [preferences, form]);
    async function onSubmit(values: z.infer<typeof preferencesSchema>) {
        setIsSaving(true);
        try {
            const updatedProfile = await api<CaregiverProfile>('/api/profile/preferences', {
                method: 'PUT',
                body: JSON.stringify(values),
            });
            onUpdate(updatedProfile);
            toast.success("Preferences updated successfully!");
        } catch (error) {
            toast.error("Failed to update preferences.");
        } finally {
            setIsSaving(false);
        }
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField control={form.control} name="availability" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Availability</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="full-time">Full-time</SelectItem>
                                <SelectItem value="part-time">Part-time</SelectItem>
                                <SelectItem value="flexible">Flexible / Bank</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>Let us know your general work availability.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="shiftPreferences" render={() => (
                    <FormItem>
                        <div className="mb-4"><FormLabel className="text-base">Shift Preferences</FormLabel><FormDescription>Select the shifts you prefer to work.</FormDescription></div>
                        {shiftItems.map((item) => (
                            <FormField key={item.id} control={form.control} name="shiftPreferences" render={({ field }) => (
                                <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => {
                                        return checked ? field.onChange([...field.value, item.id]) : field.onChange(field.value?.filter((value) => value !== item.id));
                                    }} /></FormControl>
                                    <FormLabel className="font-normal">{item.label}</FormLabel>
                                </FormItem>
                            )} />
                        ))}
                        <FormMessage />
                    </FormItem>
                )} />
                <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Preferences
                </Button>
            </form>
        </Form>
    );
}
function DocumentsSection({ documents, onUpdate }: { documents: CaregiverDocument[], onUpdate: (docs: CaregiverDocument[]) => void }) {
    const [isUploading, setIsUploading] = useState(false);
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsUploading(true);
            try {
                // In a real app, this would be a multipart/form-data upload
                const updatedDocs = await api<CaregiverDocument[]>('/api/profile/documents', {
                    method: 'POST',
                    body: JSON.stringify({ name: file.name }),
                });
                onUpdate(updatedDocs);
                toast.success(`${file.name} uploaded successfully.`);
            } catch (error) {
                toast.error("File upload failed.");
            } finally {
                setIsUploading(false);
            }
        }
    };
    const handleDelete = async (docId: string) => {
        try {
            const updatedDocs = await api<CaregiverDocument[]>(`/api/profile/documents/${docId}`, {
                method: 'DELETE',
            });
            onUpdate(updatedDocs);
            toast.info("Document removed.");
        } catch (error) {
            toast.error("Failed to remove document.");
        }
    };
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader><CardTitle>Upload Documents</CardTitle><CardDescription>Upload your compliance and identification documents here.</CardDescription></CardHeader>
                <CardContent>
                    <div className="relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg">
                        <UploadCloud className="w-12 h-12 text-muted-foreground" />
                        <p className="mt-4 text-sm text-muted-foreground"><span className="font-semibold text-primary">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-muted-foreground">PDF, PNG, JPG up to 10MB</p>
                        <Input id="file-upload" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileUpload} disabled={isUploading} />
                        {isUploading && <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Uploaded Documents</CardTitle><CardDescription>Manage your uploaded files.</CardDescription></CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {documents.map(doc => (
                            <li key={doc.id} className="flex items-center p-3 -mx-3 transition-colors rounded-lg hover:bg-muted/50">
                                <Paperclip className="w-5 h-5 mr-4 text-muted-foreground" />
                                <div className="flex-1">
                                    <p className="font-medium">{doc.name}</p>
                                    <p className="text-sm text-muted-foreground">Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleDelete(doc.id)}><Trash2 className="w-4 h-4" /></Button>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
export function ProfilePage() {
  const [profile, setProfile] = useState<CaregiverProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api<CaregiverProfile>('/api/profile');
        setProfile(data);
      } catch (error) {
        toast.error("Failed to load profile data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);
  const handleProfileUpdate = (updatedProfile: CaregiverProfile) => {
    setProfile(updatedProfile);
  };
  const handleDocumentsUpdate = (updatedDocs: CaregiverDocument[]) => {
    if (profile) {
        setProfile({ ...profile, documents: updatedDocs });
    }
  };
  const handleExport = (format: "pdf" | "excel") => {
    if (!profile) {
        toast.error("Profile data not available for export.");
        return;
    }
    if (format === 'pdf') {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text("Caregiver Profile", 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Name: ${profile.fullName}`, 20, 40);
        doc.text(`Email: ${profile.email}`, 20, 50);
        doc.text(`Phone: ${profile.phone}`, 20, 60);
        doc.text(`Address: ${profile.address}`, 20, 70);
        doc.text(`Emergency Contact: ${profile.emergencyContact.name} (${profile.emergencyContact.phone})`, 20, 80);
        doc.text(`Availability: ${profile.preferences.availability}`, 20, 90);
        doc.text(`Shift Preferences: ${profile.preferences.shiftPreferences.join(', ')}`, 20, 100);
        doc.save(`${profile.fullName.replace(' ', '_')}_Profile.pdf`);
    } else if (format === 'excel') {
        const data = [
            { Category: "Full Name", Value: profile.fullName },
            { Category: "Email", Value: profile.email },
            { Category: "Phone", Value: profile.phone },
            { Category: "Address", Value: profile.address },
            { Category: "Emergency Contact Name", Value: profile.emergencyContact.name },
            { Category: "Emergency Contact Phone", Value: profile.emergencyContact.phone },
            { Category: "Availability", Value: profile.preferences.availability },
            { Category: "Shift Preferences", Value: profile.preferences.shiftPreferences.join(', ') },
        ];
        profile.documents.forEach((doc, i) => {
            data.push({ Category: `Document ${i+1}`, Value: `${doc.name} (Uploaded: ${new Date(doc.uploadedAt).toLocaleDateString()})` });
        });
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Profile Data");
        XLSX.writeFile(workbook, `${profile.fullName.replace(' ', '_')}_Profile.xlsx`);
    }
  };
  if (isLoading) {
    return (
        <div className="w-full max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div><Skeleton className="h-10 w-48" /><Skeleton className="h-4 w-80 mt-2" /></div>
                <div className="flex gap-2"><Skeleton className="h-10 w-32" /><Skeleton className="h-10 w-32" /></div>
            </div>
            <Skeleton className="h-10 w-full" />
            <Card><CardContent className="p-8"><Skeleton className="h-64 w-full" /></CardContent></Card>
        </div>
    );
  }
  if (!profile) {
    return <div>Error loading profile.</div>;
  }
  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information, preferences, and documents.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport("pdf")}><FileDown className="mr-2 h-4 w-4" /> Export PDF</Button>
            <Button variant="outline" onClick={() => handleExport("excel")}><FileText className="mr-2 h-4 w-4" /> Export Excel</Button>
        </div>
      </div>
      <Tabs defaultValue="personal-info" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto sm:h-10">
          <TabsTrigger value="personal-info"><User className="mr-2 h-4 w-4" /> Personal Info</TabsTrigger>
          <TabsTrigger value="preferences"><ShieldCheck className="mr-2 h-4 w-4" /> Preferences</TabsTrigger>
          <TabsTrigger value="documents"><Paperclip className="mr-2 h-4 w-4" /> Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="personal-info">
          <Card>
            <CardHeader><CardTitle>Personal Information</CardTitle><CardDescription>Update your personal details here.</CardDescription></CardHeader>
            <CardContent><PersonalInfoForm profile={profile} onUpdate={handleProfileUpdate} /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="preferences">
          <Card>
            <CardHeader><CardTitle>Work Preferences</CardTitle><CardDescription>Set your availability and preferred shift types.</CardDescription></CardHeader>
            <CardContent><PreferencesForm preferences={profile.preferences} onUpdate={handleProfileUpdate} /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="documents">
            <DocumentsSection documents={profile.documents} onUpdate={handleDocumentsUpdate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}