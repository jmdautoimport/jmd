import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Booking } from "@shared/schema";
import { getAllBookingsFirebase, updateBookingStatusFirebase, deleteBookingFirebase } from "@/lib/bookingsFirebase";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw, Calendar, Phone, Mail, Car, Trash2, Clock, Eye, MessageSquare } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const STATUS_LABELS: Record<string, string> = {
    pending: "New",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
};

const STATUS_VARIANTS: Record<string, "secondary" | "default" | "outline" | "destructive"> = {
    pending: "secondary",
    confirmed: "default",
    completed: "outline",
    cancelled: "destructive",
};

export default function AdminBookings() {
    const { toast } = useToast();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const { data: bookings, isLoading } = useQuery<Booking[]>({
        queryKey: ["bookings"],
        queryFn: getAllBookingsFirebase,
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            updateBookingStatusFirebase(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
            toast({
                title: "Booking updated",
                description: "The booking status has been updated.",
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteBookingFirebase(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
            toast({
                title: "Booking deleted",
                description: "The booking has been removed.",
            });
        },
    });

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await queryClient.invalidateQueries({ queryKey: ["bookings"] });
        setIsRefreshing(false);
    };

    return (
        <div className="text-left">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Inspection Bookings</h1>
                    <p className="text-muted-foreground">Manage scheduled vehicle inspections and customer appointments</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} className="font-bold">
                        <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            <Card className="shadow-sm">
                <CardHeader className="border-b">
                    <CardTitle className="font-bold">Upcoming Inspections</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-6 space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-48" />
                                        <Skeleton className="h-3 w-32" />
                                    </div>
                                    <Skeleton className="h-6 w-24" />
                                </div>
                            ))}
                        </div>
                    ) : !bookings || bookings.length === 0 ? (
                        <div className="text-center py-20">
                            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                            <p className="text-muted-foreground font-medium">No bookings yet. Customer inspection requests will appear here.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="font-bold uppercase text-[10px] tracking-widest pl-6">Appointment</TableHead>
                                        <TableHead className="font-bold uppercase text-[10px] tracking-widest">Customer</TableHead>
                                        <TableHead className="font-bold uppercase text-[10px] tracking-widest">Vehicle</TableHead>
                                        <TableHead className="font-bold uppercase text-[10px] tracking-widest">Status</TableHead>
                                        <TableHead className="font-bold uppercase text-[10px] tracking-widest pr-6">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bookings.map((booking) => (
                                        <TableRow 
                                            key={booking.id} 
                                            className="hover:bg-muted/30 transition-colors cursor-pointer"
                                            onClick={() => setSelectedBooking(booking)}
                                        >
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex items-center gap-2 font-bold text-sm">
                                                    <Calendar className="h-4 w-4 text-primary" />
                                                    {booking.inspectionDate ? format(new Date(booking.inspectionDate), "MMM dd, yyyy") : "N/A"}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold mt-1">
                                                    <Clock className="h-3 w-3" />
                                                    {booking.inspectionTime}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold text-sm">{booking.fullName}</div>
                                                <div className="flex flex-col gap-1 mt-1">
                                                    <div className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                                        <Mail className="h-3 w-3" /> {booking.email}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                                        <Phone className="h-3 w-3" /> {booking.phoneNumber}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-[10px] font-bold uppercase">
                                                        <Car className="h-3 w-3 mr-1" /> {booking.carName}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <Select
                                                    defaultValue={booking.status}
                                                    onValueChange={(value) =>
                                                        statusMutation.mutate({ id: booking.id, status: value })
                                                    }
                                                >
                                                    <SelectTrigger className="w-[140px] h-8 text-xs font-bold rounded-lg">
                                                        <SelectValue placeholder="Status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(STATUS_LABELS).map(([status, label]) => (
                                                            <SelectItem key={status} value={status}>
                                                                <Badge variant={STATUS_VARIANTS[status]} className="text-[10px] font-bold uppercase py-0">{label}</Badge>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => setSelectedBooking(booking)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => {
                                                            if (confirm("Are you sure you want to delete this booking?")) {
                                                                deleteMutation.mutate(booking.id);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex justify-between items-start pr-8">
                            <div>
                                <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                                    Booking Details
                                </DialogTitle>
                                <DialogDescription className="sr-only">
                                    View details for inspection booking from {selectedBooking?.fullName}
                                </DialogDescription>
                                <div className="flex gap-2 mt-2">
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold uppercase">
                                        <Calendar className="h-3 w-3 mr-1" /> Inspection
                                    </Badge>
                                    <Badge variant={selectedBooking ? STATUS_VARIANTS[selectedBooking.status] : "outline"} className="text-[10px] font-bold uppercase">
                                        {selectedBooking ? STATUS_LABELS[selectedBooking.status] : ""}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </DialogHeader>

                    {selectedBooking && (
                        <div className="space-y-8 py-4">
                            {/* Customer & Appointment Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Mail className="h-3 w-3" /> Customer Information
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="text-lg font-bold">{selectedBooking.fullName}</div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Mail className="h-4 w-4" /> {selectedBooking.email}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Phone className="h-4 w-4" /> {selectedBooking.phoneNumber}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Calendar className="h-3 w-3" /> Appointment Time
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="text-sm font-bold flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-primary" />
                                            {selectedBooking.inspectionDate ? format(new Date(selectedBooking.inspectionDate), "PPPP") : "N/A"}
                                        </div>
                                        <div className="text-sm font-bold flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-primary" />
                                            {selectedBooking.inspectionTime}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Vehicle Details */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Car className="h-3 w-3" /> Vehicle Information
                                </h3>
                                <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                                    <div className="font-bold text-slate-900">{selectedBooking.carName}</div>
                                    <div className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-wider">ID: {selectedBooking.carId}</div>
                                </div>
                            </div>

                            {/* Additional Notes */}
                            {selectedBooking.notes && (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <MessageSquare className="h-3 w-3" /> Additional Notes
                                    </h3>
                                    <div className="p-4 rounded-xl bg-muted/50 border border-muted-foreground/10 text-sm whitespace-pre-wrap italic">
                                        "{selectedBooking.notes}"
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-4">
                                <DialogClose asChild>
                                    <Button variant="outline" className="font-bold">Close Details</Button>
                                </DialogClose>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
