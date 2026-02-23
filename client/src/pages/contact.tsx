import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWebsiteSettings } from "@/hooks/use-website-settings";
import { SEO } from "@/components/seo";
import { createInquiryFirebase } from "@/lib/inquiriesFirebase";
import { useMutation } from "@tanstack/react-query";

export default function Contact() {
  const { toast } = useToast();
  const { isLoading: isSettingsLoading, ...settings } = useWebsiteSettings();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    subject: "",
    message: "",
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const result = await createInquiryFirebase(data);
      
      // Trigger notification
      try {
        const notifyRes = await fetch("/api/notify/inquiry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!notifyRes.ok) {
          const errorText = await notifyRes.text();
          throw new Error(`Notification failed (${notifyRes.status}): ${errorText}`);
        }
      } catch (notifyErr) {
        throw notifyErr;
      }
      
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Message sent!",
        description: "Thank you for contacting us. We'll get back to you soon.",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        subject: "",
        message: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Error sending message",
        description: "Please try again later or contact us directly.",
        variant: "destructive",
      });
      console.error("Error submitting contact form:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Split name into first and last name for the schema
    const nameParts = formData.name.trim().split(" ");
    const firstName = nameParts[0] || "Unknown";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "-";

    mutation.mutate({
      firstName,
      lastName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      notes: `Subject: ${formData.subject}\n\nMessage: ${formData.message}`,
      carId: "", // Generic inquiry
      carName: "Contact Form Inquiry",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    ...(settings?.address ? [{
      icon: MapPin,
      title: "Address",
      details: [settings.address],
    }] : []),
    ...(settings?.phone ? [{
      icon: Phone,
      title: "Phone",
      details: [settings.phone, "Mon-Fri: 9:00 AM - 6:00 PM"],
    }] : []),
    ...(settings?.email ? [{
      icon: Mail,
      title: "Email",
      details: [settings.email],
    }] : []),
    {
      icon: Clock,
      title: "Business Hours",
      details: [
        "Monday - Friday: 9:00 AM - 6:00 PM", 
        "Saturday: 10:00 AM - 4:00 PM", 
        "Sunday: 10:00 AM - 4:00 PM",
        "Open with Appointments too"
      ],
    },
  ];

  return (
    <>
      <SEO
        title={`Contact Us - ${settings?.websiteName || "Auto Import Specialists"}`}
        description="Get in touch with our import specialists. We're here to help with your sourcing, shipping, and compliance needs."
      />
      <div className="min-h-screen bg-background text-left">
        {/* Hero Section */}
        <section className="bg-card border-b">
          <div className="max-w-7xl mx-auto px-6 pt-24 pb-16 md:pt-32 md:pb-24">
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 uppercase">Contact Us</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Have a question or need assistance? We're here to help. Reach out to us through
                any of the methods below, and we'll get back to you as soon as possible.
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card className="p-8">
                <h2 className="text-3xl font-bold mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+61 469 440 944"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Location / Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="e.g. Sydney, NSW"
                      />
                    </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="What is this regarding?"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Tell us how we can help..."
                      rows={6}
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
                    {mutation.isPending ? (
                      <>
                        Sending...
                        <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
                <p className="text-muted-foreground mb-8">
                  We're available to answer your questions and help you find the perfect vehicle
                  for your needs. Choose the method that works best for you.
                </p>
              </div>

              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <info.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">{info.title}</h3>
                        {info.details.map((detail, i) => (
                          <p key={i} className="text-muted-foreground">
                            {detail}
                          </p>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-6 bg-primary/5 border-primary/20">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Response Time</h3>
                    <p className="text-sm text-muted-foreground">
                      We typically respond to inquiries within 24 hours during business days.
                      For urgent matters, please call us directly.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

