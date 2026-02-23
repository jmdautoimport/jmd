import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBookingSchema, InsertBooking } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { createBookingFirebase } from "@/lib/bookingsFirebase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
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
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Clock, User, Phone, Mail, Car as CarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SEO } from "@/components/seo";

export default function Booking() {
    const [location, setLocation] = useLocation();
    const { toast } = useToast();

    // Get car details from query params
    const searchParams = new URLSearchParams(window.location.search);
    const carName = searchParams.get("car") || "";
    const carId = searchParams.get("id") || "";

    const form = useForm<InsertBooking>({
        resolver: zodResolver(insertBookingSchema),
        defaultValues: {
            carName: carName,
            carId: carId,
            inspectionDate: "",
            inspectionTime: "",
            fullName: "",
            phoneNumber: "",
            email: "",
            notes: "",
        },
    });

    const mutation = useMutation({
        mutationFn: async (data: InsertBooking) => {
            const result = await createBookingFirebase(data);

            // Trigger notification
            try {
                // Adapt booking data to the notification format
                const notifyData = {
                    firstName: data.fullName.split(" ")[0] || "Unknown",
                    lastName: data.fullName.split(" ").slice(1).join(" ") || "-",
                    email: data.email,
                    phone: data.phoneNumber,
                    serviceType: `Inspection: ${data.carName}`,
                    date: data.inspectionDate,
                    time: data.inspectionTime,
                    notes: data.notes || `Car ID: ${data.carId}`
                };

                await fetch("/api/notify/booking", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(notifyData),
                });
            } catch (notifyErr) {
                console.warn("Failed to send notification:", notifyErr);
            }

            return result;
        },
        onSuccess: () => {
            toast({
                title: "Booking Submitted",
                description: "We've received your inspection request and will contact you shortly.",
            });
            setLocation("/");
        },
        onError: (error) => {
            toast({
                title: "Booking Failed",
                description: "There was an error submitting your request. Please try again.",
                variant: "destructive",
            });
        },
    });

    function onSubmit(data: InsertBooking) {
        mutation.mutate(data);
    }

    const timeSlots = [
        "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
        "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
    ];

    return (
        <>
            <SEO
                title="Book an Inspection"
                description="Schedule a professional viewing of your selected vehicle at our specialized facility. Specialized vehicle import service in Australia."
            />
            <div className="pt-24 pb-16 md:pt-32 md:pb-24 bg-background min-h-screen">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase font-outfit">
                            Book for Inspection
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
                            Schedule a professional viewing of your selected vehicle at our specialized facility.
                        </p>
                    </div>

                    <div className="max-w-2xl mx-auto">
                        <Card className="border-2 shadow-2xl overflow-hidden bg-card">
                            <CardContent className="p-8 md:p-12">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                        {/* Car Details */}
                                        <FormField
                                            control={form.control}
                                            name="carName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                        <CarIcon className="h-4 w-4 text-primary" /> Selected Car
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter car details"
                                                            {...field}
                                                            value={field.value || ""}
                                                            className="h-12 bg-muted/30 border-muted focus:border-primary transition-all rounded-xl font-medium"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Inspection Date */}
                                            <FormField
                                                control={form.control}
                                                name="inspectionDate"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                            <CalendarIcon className="h-4 w-4 text-primary" /> Inspection Date
                                                        </FormLabel>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <FormControl>
                                                                    <Button
                                                                        variant={"outline"}
                                                                        className={cn(
                                                                            "h-12 pl-3 text-left font-medium bg-muted/30 border-muted hover:bg-muted/50 rounded-xl transition-all",
                                                                            !field.value && "text-muted-foreground"
                                                                        )}
                                                                    >
                                                                        {field.value ? (
                                                                            format(new Date(field.value), "PPP")
                                                                        ) : (
                                                                            <span>Select Date</span>
                                                                        )}
                                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                    </Button>
                                                                </FormControl>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0" align="start">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={field.value ? new Date(field.value) : undefined}
                                                                    onSelect={(date) => field.onChange(date?.toISOString())}
                                                                    disabled={(date) =>
                                                                        date < new Date() || date < new Date("1900-01-01")
                                                                    }
                                                                    initialFocus
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Inspection Time */}
                                            <FormField
                                                control={form.control}
                                                name="inspectionTime"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-primary" /> Inspection Time
                                                        </FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-12 bg-muted/30 border-muted focus:border-primary transition-all rounded-xl font-medium text-left">
                                                                    <SelectValue placeholder="Select time" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {timeSlots.map((time) => (
                                                                    <SelectItem key={time} value={time}>
                                                                        {time}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Personal Details */}
                                        <FormField
                                            control={form.control}
                                            name="fullName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                        <User className="h-4 w-4 text-primary" /> Full Name
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter your full name"
                                                            {...field}
                                                            value={field.value || ""}
                                                            className="h-12 bg-muted/30 border-muted focus:border-primary transition-all rounded-xl font-medium"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="phoneNumber"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                            <Phone className="h-4 w-4 text-primary" /> Phone Number
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Enter your phone number"
                                                                {...field}
                                                                value={field.value || ""}
                                                                className="h-12 bg-muted/30 border-muted focus:border-primary transition-all rounded-xl font-medium"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                            <Mail className="h-4 w-4 text-primary" /> Email
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Enter your email"
                                                                {...field}
                                                                value={field.value || ""}
                                                                className="h-12 bg-muted/30 border-muted focus:border-primary transition-all rounded-xl font-medium"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="notes"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                        Additional Notes
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Any specific questions or requirements?"
                                                            {...field}
                                                            value={field.value || ""}
                                                            className="min-h-[100px] bg-muted/30 border-muted focus:border-primary transition-all rounded-xl font-medium"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <Button
                                            type="submit"
                                            disabled={mutation.isPending}
                                            className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-tighter text-xl rounded-xl shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            {mutation.isPending ? "Confirming..." : "Confirm Booking"}
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
