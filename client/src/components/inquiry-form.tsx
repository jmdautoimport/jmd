import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInquirySchema, type InsertInquiry } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { createInquiryFirebase } from "@/lib/inquiriesFirebase";
import { useQueryClient } from "@tanstack/react-query";

interface InquiryFormProps {
    carId: string;
    carName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function InquiryForm({
    carId,
    carName,
    open,
    onOpenChange,
}: InquiryFormProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<InsertInquiry>({
        resolver: zodResolver(insertInquirySchema),
        defaultValues: {
            carId,
            carName,
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            address: "",
            notes: "",
            budget: "",
            modelPreference: "",
            yearRange: "",
        },
    });

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            form.reset({
                carId,
                carName,
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                address: "",
                notes: "",
                budget: "",
                modelPreference: "",
                yearRange: "",
            });
        }
    }, [open, carId, carName, form]);

    const onSubmit = async (data: InsertInquiry) => {
        setIsSubmitting(true);
        try {
            await createInquiryFirebase(data);

            // Trigger notification (non-fatal)
            try {
                const notifyRes = await fetch("/api/notify/inquiry", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });

                // We don't throw here even if !notifyRes.ok
                if (!notifyRes.ok) {
                    const errorText = await notifyRes.text();
                    console.warn(`Notification failed (${notifyRes.status}): ${errorText}`);
                }
            } catch (notifyErr) {
                console.warn("Failed to send notification:", notifyErr);
            }

            await queryClient.invalidateQueries({ queryKey: ["inquiries"] });

            toast({
                title: "Inquiry Sent!",
                description: `Your inquiry for ${carName} has been received. We'll contact you soon!`,
            });

            form.reset();
            onOpenChange(false);
        } catch (error) {
            console.error("Inquiry submission error:", error);
            toast({
                title: "Submission Failed",
                description: error instanceof Error ? error.message : "There was an error sending your inquiry.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Inquire about {carName}</DialogTitle>
                    <DialogDescription>
                        Fill out the form below and our team will provide you with more details about importing this vehicle.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input type="tel" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location / Address</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Message (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            className="min-h-32"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-4 pt-4">
                            <Button
                                type="submit"
                                className="flex-1"
                                size="lg"
                                disabled={isSubmitting}
                            >
                                <Send className="mr-2 h-4 w-4" />
                                {isSubmitting ? "Sending..." : "Submit Inquiry"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
