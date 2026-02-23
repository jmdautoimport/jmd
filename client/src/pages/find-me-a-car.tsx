import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInquirySchema, type InsertInquiry } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { createInquiryFirebase } from "@/lib/inquiriesFirebase";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Send, CarFront, Calculator, Ship } from "lucide-react";
import { SEO } from "@/components/seo";

export default function FindMeACar() {
    const { toast } = useToast();
    const [submitted, setSubmitted] = useState(false);

    const form = useForm<InsertInquiry>({
        resolver: zodResolver(insertInquirySchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            budget: "",
            modelPreference: "",
            yearRange: "",
            notes: "",
            address: "",
        },
    });

    const mutation = useMutation({
        mutationFn: async (data: InsertInquiry) => {
            const result = await createInquiryFirebase(data);
            
            // Trigger notification
            try {
                await fetch("/api/notify/inquiry", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...data,
                        carName: "Concierge Request"
                    }),
                });
            } catch (notifyErr) {
                console.warn("Failed to send notification:", notifyErr);
            }
            
            return result;
        },
        onSuccess: () => {
            setSubmitted(true);
            toast({
                title: "Request Sent!",
                description: "We've received your request and will be in touch shortly.",
            });
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            });
        },
    });

    function onSubmit(data: InsertInquiry) {
        mutation.mutate(data);
    }

    if (submitted) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <Send className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-4xl font-bold">Request Received</h1>
                    <p className="text-xl text-muted-foreground">
                        Thank you for reaching out! Our Import specialists are already looking for your perfect car. We'll contact you within 24-48 hours.
                    </p>
                    <Button onClick={() => setSubmitted(false)} variant="outline">
                        Send Another Request
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <SEO
                title="Sourcing Service - Auto Import Specialists"
                description="Can't find your dream car in our inventory? Let us source it directly from overseas. We handle auctions, shipping, and compliance."
            />
            <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
                <div className="grid lg:grid-cols-2 gap-12 items-start text-left">
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4 uppercase">
                                Find Me the Perfect Import Car
                            </h1>
                            <p className="text-xl text-muted-foreground italic">
                                Can't find what you're looking for in our inventory? Let us source it directly from overseas for you.
                            </p>
                        </div>

                        <div className="grid gap-6">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Search className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Auction Access</h3>
                                    <p className="text-muted-foreground">We search thousands of Australian-compliant vehicles in international auctions every week.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Ship className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Full Logistics</h3>
                                    <p className="text-muted-foreground">From the auction floor to your doorstep in Australia, we handle shipping, customs, and compliance.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Calculator className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Transparent Pricing</h3>
                                    <p className="text-muted-foreground">No hidden fees. We provide a full breakdown of auction costs, shipping, and taxes.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Card className="border-2">
                        <CardHeader>
                            <CardTitle>Inquiry Form</CardTitle>
                            <CardDescription>
                                Tell us what you're looking for and your budget.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="firstName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>First Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="John" {...field} />
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
                                                        <Input placeholder="Doe" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="john@example.com" {...field} />
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
                                                        <Input placeholder="0400 000 000" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="modelPreference"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Specific Car Model(s)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Nissan Skyline R34 GTR, Toyota Supra A80" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Location / Address</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Sydney, NSW" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="yearRange"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Year Range</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. 1995-2002" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="budget"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Total Budget (AUD)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. $50,000 - $70,000" {...field} />
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
                                                <FormLabel>Additional Requirements</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Color preferences, transmission, maximum mileage, etc."
                                                        className="min-h-[100px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" className="w-full" disabled={mutation.isPending}>
                                        {mutation.isPending ? "Sending..." : "Submit Inquiry"}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
