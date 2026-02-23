import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import {
  getWebsiteSettings,
  saveWebsiteSettings,
  type WebsiteSettings,
} from "@/lib/websiteSettingsFirebase";
import { Upload, X, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { uploadImage, isImageFile, isValidFileSize } from "@/lib/imageUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

// Custom URL validator that accepts both full URLs and relative paths
const urlOrPath = z.string().refine(
  (val) => {
    if (!val || val.trim() === "") return true; // Allow empty strings
    try {
      new URL(val);
      return true; // Valid absolute URL
    } catch {
      return val.startsWith("/") || val.startsWith("./") || val.startsWith("../") || val.startsWith("#");
    }
  },
  {
    message: "Must be a valid URL, relative path, or anchor link (starting with / or #)",
  }
);

const websiteSettingsSchema = z.object({
  websiteName: z.string().min(1, "Website name is required"),
  logo: urlOrPath.or(z.literal("")),
  favicon: urlOrPath.or(z.literal("")),
  companyName: z.string().min(1, "Company name is required"),
  email: z.string().email("Invalid email address").or(z.literal("")),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  licenseNumber: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  facebookUrl: urlOrPath.or(z.literal("")),
  xUrl: urlOrPath.or(z.literal("")),
  instagramUrl: urlOrPath.or(z.literal("")),
  linkedinUrl: urlOrPath.or(z.literal("")),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),

  // Hero Section
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroImage: urlOrPath.or(z.literal("")),
  heroButtonText: z.string().optional(),
  heroButtonLink: urlOrPath.or(z.literal("")),
  heroLearnMoreText: z.string().optional(),
  heroLearnMoreLink: urlOrPath.or(z.literal("")),

  // Featured Section
  featuredTitle: z.string().optional(),
  featuredSubtitle: z.string().optional(),

  // How It Works Section
  howItWorksTitle: z.string().optional(),
  howItWorksSubtitle: z.string().optional(),
  howItWorksStep1Title: z.string().optional(),
  howItWorksStep1Description: z.string().optional(),
  howItWorksStep2Title: z.string().optional(),
  howItWorksStep2Description: z.string().optional(),
  howItWorksStep3Title: z.string().optional(),
  howItWorksStep3Description: z.string().optional(),

  // Stats Section
  showStatsSection: z.boolean().default(true),
  stats1Value: z.string().optional(),
  stats1Label: z.string().optional(),
  stats2Value: z.string().optional(),
  stats2Label: z.string().optional(),
  stats3Value: z.string().optional(),
  stats3Label: z.string().optional(),
  stats4Value: z.string().optional(),
  stats4Label: z.string().optional(),

  // Testimonials Section
  testimonialsTitle: z.string().optional(),
  testimonialsSubtitle: z.string().optional(),
  testimonial1Name: z.string().optional(),
  testimonial1Role: z.string().optional(),
  testimonial1Content: z.string().optional(),
  testimonial2Name: z.string().optional(),
  testimonial2Role: z.string().optional(),
  testimonial2Content: z.string().optional(),

  // CTA Section
  ctaTitle: z.string().optional(),
  ctaSubtitle: z.string().optional(),
  ctaButtonText: z.string().optional(),
  ctaButtonLink: urlOrPath.or(z.literal("")),

  // Pages
  termsAndConditions: z.string().optional(),
  maintenanceMode: z.boolean().default(false),
});

type WebsiteSettingsForm = z.infer<typeof websiteSettingsSchema>;

export default function WebsiteSettings() {
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);

  // Hero Image State
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [isUploadingHeroImage, setIsUploadingHeroImage] = useState(false);

  const { data: settings, isLoading } = useQuery<WebsiteSettings>({
    queryKey: ["websiteSettings"],
    queryFn: getWebsiteSettings,
  });

  const form = useForm<WebsiteSettingsForm>({
    resolver: zodResolver(websiteSettingsSchema),
    defaultValues: {
      websiteName: "Auto Import Specialists",
      logo: "",
      favicon: "/favicon.png",
      companyName: "Auto Import Specialists",
      email: "info@jdmautoimports.com.au",
      phone: "+61 469 440 944",
      address: "6/1353 The Horsley Drive, Wetherill Park, NSW 2164, Australia",
      licenseNumber: "NSW Motor Dealer Licence # MD094267",
      description: "JDM Auto Imports is a leading Australian importer and dealership dedicated to genuine Japanese Domestic Market vehicles. From rare performance icons to premium daily drivers, we connect Australia with Japan’s finest cars through expert sourcing, compliance, and unmatched attention to detail.",
      facebookUrl: "",
      xUrl: "",
      instagramUrl: "",
      linkedinUrl: "",
      metaDescription: "Premium vehicle imports. Specialist sourcing for luxury and performance vehicles. Full compliance handling and Australia-wide delivery.",
      metaKeywords: "vehicle imports Australia, car imports, luxury car import, performance car import, import concierge service",

      // Hero Defaults
      heroTitle: "Premium Global Imports",
      heroSubtitle: "Your trusted gateway to global vehicle markets.",
      heroImage: "",
      heroButtonText: "View Inventory",
      heroButtonLink: "/inventory",
      heroLearnMoreText: "Start Sourcing",
      heroLearnMoreLink: "/find-me-a-car",

      // Featured Defaults
      featuredTitle: "Featured Vehicles",
      featuredSubtitle: "Discover our most popular luxury and performance cars",

      // How It Works Defaults
      howItWorksTitle: "How It Works",
      howItWorksSubtitle: "Importing your dream car is simple and transparent",
      howItWorksStep1Title: "Source & Bid",
      howItWorksStep1Description: "We help you find the perfect car at international auctions and handle the bidding process",
      howItWorksStep2Title: "Shipping & Transit",
      howItWorksStep2Description: "We manage international logistics, insurance, and arrival at Australian ports",
      howItWorksStep3Title: "Compliance & Delivery",
      howItWorksStep3Description: "Full RAWS compliance and registration before delivering to your door",

      // Stats Defaults
      showStatsSection: true,
      stats1Value: "10+",
      stats1Label: "Years Experience",
      stats2Value: "200+",
      stats2Label: "Imports",
      stats3Value: "100%",
      stats3Label: "Grade Certified",
      stats4Value: "",
      stats4Label: "",

      // Testimonials Defaults
      testimonialsTitle: "What Our Customers Say",
      testimonialsSubtitle: "Hear from those who have experienced our premium service",
      testimonial1Name: "James Davidson",
      testimonial1Role: "Car Enthusiast",
      testimonial1Content: "Outstanding service! My GTR was in perfect condition upon arrival, and the compliance process was seamless. Auto Import Specialists made the whole process incredibly easy.",
      testimonial2Name: "Sarah Martinez",
      testimonial2Role: "Supra Owner",
      testimonial2Content: "Sourced my dream Supra through them. Transparent pricing and great communication throughout the shipping process. Highly recommend!",

      // CTA Defaults
      ctaTitle: "Ready to Start Your Import Project?",
      ctaSubtitle: "Contact our specialists today and secure your piece of automotive history",
      ctaButtonText: "Enquire Now",
      ctaButtonLink: "/contact",

      // Pages
      termsAndConditions: "",
      maintenanceMode: false,
    },
  });

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      form.reset({
        websiteName: settings.websiteName,
        logo: settings.logo || "",
        favicon: settings.favicon || "/favicon.png",
        companyName: settings.companyName,
        email: settings.email || "",
        phone: settings.phone || "",
        address: settings.address || "",
        licenseNumber: settings.licenseNumber || "",
        description: settings.description || "",
        facebookUrl: settings.facebookUrl || "",
        xUrl: settings.xUrl || "",
        instagramUrl: settings.instagramUrl || "",
        linkedinUrl: settings.linkedinUrl || "",
        metaDescription: settings.metaDescription || "",
        metaKeywords: settings.metaKeywords || "",

        // Hero
        heroTitle: settings.heroTitle || "Auto Import Specialists",
        heroSubtitle: settings.heroSubtitle || "Experience luxury and performance with Australia's finest collection of imported and premium vehicles.",
        heroImage: settings.heroImage || "",
        heroButtonText: settings.heroButtonText || "View Inventory",
        heroButtonLink: settings.heroButtonLink || "/inventory",
        heroLearnMoreText: settings.heroLearnMoreText || "Start Sourcing",
        heroLearnMoreLink: settings.heroLearnMoreLink || "/find-me-a-car",

        // Featured
        featuredTitle: settings.featuredTitle || "Featured Vehicles",
        featuredSubtitle: settings.featuredSubtitle || "Discover our most popular luxury and performance cars",

        // How It Works
      howItWorksTitle: settings.howItWorksTitle || "How It Works",
      howItWorksSubtitle: settings.howItWorksSubtitle || "Importing your dream car is simple and transparent",
      howItWorksStep1Title: settings.howItWorksStep1Title || "Choose Your Car",
        howItWorksStep1Description: settings.howItWorksStep1Description || "We help you find the perfect car at international auctions and handle the bidding process",
        howItWorksStep2Title: settings.howItWorksStep2Title || "Shipping & Transit",
        howItWorksStep2Description: settings.howItWorksStep2Description || "We manage international logistics, insurance, and arrival at Australian ports",
        howItWorksStep3Title: settings.howItWorksStep3Title || "Compliance & Delivery",
        howItWorksStep3Description: settings.howItWorksStep3Description || "Full RAWS compliance and registration before delivering to your door",

        // Stats
        showStatsSection: settings.showStatsSection !== undefined ? settings.showStatsSection : true,
        stats1Value: settings.stats1Value || "10+",
        stats1Label: settings.stats1Label || "Years Experience",
        stats2Value: settings.stats2Value || "200+",
        stats2Label: settings.stats2Label || "Imports",
        stats3Value: settings.stats3Value || "100%",
        stats3Label: settings.stats3Label || "Grade Certified",
        stats4Value: settings.stats4Value || "",
        stats4Label: settings.stats4Label || "",

        // Testimonials
      testimonialsTitle: settings.testimonialsTitle || "What Our Customers Say",
      testimonialsSubtitle: settings.testimonialsSubtitle || "Hear from those who have experienced our premium service",
      testimonial1Name: settings.testimonial1Name || "James Davidson",
      testimonial1Role: settings.testimonial1Role || "Car Enthusiast",
      testimonial1Content: settings.testimonial1Content || "Outstanding service! My vehicle was in perfect condition upon arrival, and the compliance process was seamless. Auto Import Specialists made the whole process incredibly easy.",
      testimonial2Name: settings.testimonial2Name || "Sarah Martinez",
      testimonial2Role: settings.testimonial2Role || "Supra Owner",
      testimonial2Content: settings.testimonial2Content || "Sourced my dream Supra through them. Transparent pricing and great communication throughout the shipping process. Highly recommend!",

        // CTA
      ctaTitle: settings.ctaTitle || "Ready to Start Your Journey?",
      ctaSubtitle: settings.ctaSubtitle || "Find your dream vehicle today and experience the road like never before",
      ctaButtonText: settings.ctaButtonText || "Start Sourcing",
      ctaButtonLink: settings.ctaButtonLink || "/find-me-a-car",

        // Pages
        termsAndConditions: settings.termsAndConditions || "",
        maintenanceMode: settings.maintenanceMode || false,
      });
      if (settings.logo) {
        setLogoPreview(settings.logo);
      }
      if (settings.favicon) {
        setFaviconPreview(settings.favicon);
      }
      if (settings.heroImage) {
        setHeroImagePreview(settings.heroImage);
      }
    }
  }, [settings, form]);

  const saveMutation = useMutation({
    mutationFn: (data: WebsiteSettingsForm) => {
      // Clean up empty strings for optional fields
      const cleanedData: WebsiteSettings = {
        websiteName: data.websiteName,
        logo: data.logo || "",
        favicon: data.favicon || "/favicon.png",
        companyName: data.companyName,
        email: data.email || "",
        phone: data.phone,
        address: data.address,
        licenseNumber: data.licenseNumber || undefined,
        description: data.description,
        facebookUrl: data.facebookUrl || undefined,
        xUrl: data.xUrl || undefined,
        instagramUrl: data.instagramUrl || undefined,
        linkedinUrl: data.linkedinUrl || undefined,
        metaDescription: data.metaDescription || undefined,
        metaKeywords: data.metaKeywords || undefined,

        // Hero Section
        heroTitle: data.heroTitle || undefined,
        heroSubtitle: data.heroSubtitle || undefined,
        heroImage: data.heroImage || "", // Use empty string for image to clear it if needed
        heroButtonText: data.heroButtonText || undefined,
        heroButtonLink: data.heroButtonLink || undefined,
        heroLearnMoreText: data.heroLearnMoreText || undefined,
        heroLearnMoreLink: data.heroLearnMoreLink || undefined,

        // Featured Section
        featuredTitle: data.featuredTitle || undefined,
        featuredSubtitle: data.featuredSubtitle || undefined,

        // How It Works Section
        howItWorksTitle: data.howItWorksTitle || undefined,
        howItWorksSubtitle: data.howItWorksSubtitle || undefined,
        howItWorksStep1Title: data.howItWorksStep1Title || undefined,
        howItWorksStep1Description: data.howItWorksStep1Description || undefined,
        howItWorksStep2Title: data.howItWorksStep2Title || undefined,
        howItWorksStep2Description: data.howItWorksStep2Description || undefined,
        howItWorksStep3Title: data.howItWorksStep3Title || undefined,
        howItWorksStep3Description: data.howItWorksStep3Description || undefined,

        // Stats Section
        showStatsSection: data.showStatsSection,
        stats1Value: data.stats1Value || undefined,
        stats1Label: data.stats1Label || undefined,
        stats2Value: data.stats2Value || undefined,
        stats2Label: data.stats2Label || undefined,
        stats3Value: data.stats3Value || undefined,
        stats3Label: data.stats3Label || undefined,
        stats4Value: data.stats4Value || undefined,
        stats4Label: data.stats4Label || undefined,

        // Testimonials Section
        testimonialsTitle: data.testimonialsTitle || undefined,
        testimonialsSubtitle: data.testimonialsSubtitle || undefined,
        testimonial1Name: data.testimonial1Name || undefined,
        testimonial1Role: data.testimonial1Role || undefined,
        testimonial1Content: data.testimonial1Content || undefined,
        testimonial2Name: data.testimonial2Name || undefined,
        testimonial2Role: data.testimonial2Role || undefined,
        testimonial2Content: data.testimonial2Content || undefined,

        // CTA Section
        ctaTitle: data.ctaTitle || undefined,
        ctaSubtitle: data.ctaSubtitle || undefined,
        ctaButtonText: data.ctaButtonText || undefined,
        ctaButtonLink: data.ctaButtonLink || undefined,

        // Pages
        termsAndConditions: data.termsAndConditions || undefined,
        maintenanceMode: data.maintenanceMode,
      };
      return saveWebsiteSettings(cleanedData);
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ["websiteSettings"] });
      toast({
        title: "Success",
        description: "Website settings saved successfully",
      });
      // Update document title if available
      document.title = `${data.websiteName} - Auto Import Specialists`;
    },
    onError: (error: unknown) => {
      console.error("Error saving website settings:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : "Failed to save website settings. Please check the console for details.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!isImageFile(file)) {
        toast({
          title: "Invalid File",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      if (!isValidFileSize(file)) {
        toast({
          title: "File Too Large",
          description: "Image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setLogoFile(file);
      const preview = URL.createObjectURL(file);
      setLogoPreview(preview);
      try {
        await uploadLogo();
      } catch {
      }
    }
  };

  const handleFaviconChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!isImageFile(file)) {
        toast({
          title: "Invalid File",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      if (!isValidFileSize(file)) {
        toast({
          title: "File Too Large",
          description: "Image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setFaviconFile(file);
      const preview = URL.createObjectURL(file);
      setFaviconPreview(preview);
      try {
        await uploadFavicon();
      } catch {
      }
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    form.setValue("logo", "");
  };

  const removeFavicon = () => {
    setFaviconFile(null);
    setFaviconPreview(null);
    form.setValue("favicon", "/favicon.png");
  };

  const uploadLogo = async (silent: boolean = false): Promise<string | null> => {
    if (!logoFile) return null;
    setIsUploadingLogo(true);
    try {
      const url = await uploadImage(logoFile);
      form.setValue("logo", url);
      setLogoFile(null);
      // setLogoPreview(url); // Keep the preview but clear the file object
      if (!silent) {
        toast({
          title: "Success",
          description: "Logo uploaded successfully",
        });
      }
      return url;
    } catch (error) {
      console.error("Logo upload error:", error);
      if (!silent) {
        toast({
          title: "Upload Error",
          description: error instanceof Error ? error.message : "Failed to upload logo",
          variant: "destructive",
        });
      }
      throw error;
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const uploadFavicon = async (silent: boolean = false): Promise<string | null> => {
    if (!faviconFile) return null;
    setIsUploadingFavicon(true);
    try {
      const url = await uploadImage(faviconFile);
      form.setValue("favicon", url);
      setFaviconFile(null);
      if (!silent) {
        toast({
          title: "Success",
          description: "Favicon uploaded successfully",
        });
      }
      return url;
    } catch (error) {
      console.error("Favicon upload error:", error);
      if (!silent) {
        toast({
          title: "Upload Error",
          description: error instanceof Error ? error.message : "Failed to upload favicon",
          variant: "destructive",
        });
      }
      throw error;
    } finally {
      setIsUploadingFavicon(false);
    }
  };

  const handleHeroImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!isImageFile(file)) {
        toast({
          title: "Invalid File",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      if (!isValidFileSize(file)) {
        toast({
          title: "File Too Large",
          description: "Image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setHeroImageFile(file);
      const preview = URL.createObjectURL(file);
      setHeroImagePreview(preview);
      try {
        await uploadHeroImage();
      } catch {
      }
    }
  };

  const removeHeroImage = () => {
    setHeroImageFile(null);
    setHeroImagePreview(null);
    form.setValue("heroImage", "");
  };

  const uploadHeroImage = async (silent: boolean = false): Promise<string | null> => {
    if (!heroImageFile) return null;
    setIsUploadingHeroImage(true);
    try {
      const url = await uploadImage(heroImageFile);
      form.setValue("heroImage", url);
      setHeroImageFile(null);
      if (!silent) {
        toast({
          title: "Success",
          description: "Hero image uploaded successfully",
        });
      }
      return url;
    } catch (error) {
      console.error("Hero image upload error:", error);
      if (!silent) {
        toast({
          title: "Upload Error",
          description: error instanceof Error ? error.message : "Failed to upload hero image",
          variant: "destructive",
        });
      }
      throw error;
    } finally {
      setIsUploadingHeroImage(false);
    }
  };

  const onSubmit = async (data: WebsiteSettingsForm) => {
    try {
      let uploadErrors: string[] = [];

      // Ensure we use the latest values from form if they were updated via individual uploads
      const currentValues = form.getValues();
      const submissionData = { ...data, ...currentValues };

      // Upload logo if a new file was selected (silent mode - no toast during submit)
      if (logoFile) {
        try {
          const logoUrl = await uploadLogo(true);
          if (logoUrl) {
            submissionData.logo = logoUrl;
          }
        } catch (error) {
          uploadErrors.push("Logo upload failed");
        }
      }

      // Upload favicon if a new file was selected
      if (faviconFile) {
        try {
          const faviconUrl = await uploadFavicon(true);
          if (faviconUrl) {
            submissionData.favicon = faviconUrl;
          }
        } catch (error) {
          uploadErrors.push("Favicon upload failed");
        }
      }

      // Upload hero image if a new file was selected
      if (heroImageFile) {
        try {
          const heroImageUrl = await uploadHeroImage(true);
          if (heroImageUrl) {
            submissionData.heroImage = heroImageUrl;
          }
        } catch (error) {
          uploadErrors.push("Hero image upload failed");
        }
      }

      // Show warning if uploads failed but still save other settings
      if (uploadErrors.length > 0) {
        toast({
          title: "Upload Warning",
          description: `${uploadErrors.join(", ")}. Other settings will still be saved.`,
          variant: "destructive",
        });
      }

      saveMutation.mutate(submissionData);
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save settings",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-10 w-48 mb-8" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Website Settings</h1>
        <p className="text-muted-foreground">
          Configure basic website information, branding, and contact details
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="general">General Settings</TabsTrigger>
              <TabsTrigger value="home">Home Page Content</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Branding & Site Status</CardTitle>
                  <CardDescription>
                    Configure site visibility and basic information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="maintenanceMode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-yellow-50/50 border-yellow-200">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base text-yellow-900 font-bold">Maintenance Mode</FormLabel>
                          <FormDescription className="text-yellow-800">
                            When enabled, public users will see a "Coming Soon" page. Admins can still access the site.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="websiteName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website Name</FormLabel>
                        <FormControl>
                          <Input placeholder=" Drive" {...field} />
                        </FormControl>
                        <FormDescription>
                          The name displayed in the browser title and navigation
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder=" Drive" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your official company name
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="logo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="flex-1"
                              />
                              {logoFile && (
                                <Button
                                  type="button"
                                  onClick={() => uploadLogo()}
                                  disabled={isUploadingLogo}
                                  size="sm"
                                  className="shrink-0"
                                >
                                  {isUploadingLogo ? "Uploading..." : "Upload Logo"}
                                </Button>
                              )}
                              {(logoPreview || field.value) && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={removeLogo}
                                  className="shrink-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            {(logoPreview || field.value) && (
                              <div className="relative w-48 h-32 border rounded-md overflow-hidden bg-muted">
                                <img
                                  src={logoPreview || field.value}
                                  alt="Logo preview"
                                  className="w-full h-full object-contain p-2"
                                />
                              </div>
                            )}
                            <Input
                              type="text"
                              placeholder="https://example.com/logo.png or /logo.png"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Upload a logo image or enter a URL/path. Recommended size: 200x60px
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="favicon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Favicon</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFaviconChange}
                                className="flex-1"
                              />
                              {faviconFile && (
                                <Button
                                  type="button"
                                  onClick={() => uploadFavicon()}
                                  disabled={isUploadingFavicon}
                                  size="sm"
                                  className="shrink-0"
                                >
                                  {isUploadingFavicon ? "Uploading..." : "Upload Favicon"}
                                </Button>
                              )}
                              {(faviconPreview || field.value) && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={removeFavicon}
                                  className="shrink-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            {(faviconPreview || field.value) && (
                              <div className="relative w-16 h-16 border rounded-md overflow-hidden bg-muted">
                                <img
                                  src={faviconPreview || field.value}
                                  alt="Favicon preview"
                                  className="w-full h-full object-contain p-1"
                                />
                              </div>
                            )}
                            <Input
                              type="text"
                              placeholder="/favicon.png"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Upload a favicon image or enter a URL/path. Recommended size: 32x32px or 64x64px
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>
                    Update your company details and description
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Specialized vehicle import service bringing the best international vehicles to Australia..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A brief description of your business
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Set your contact details displayed in the footer
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="info@example.com" {...field} />
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
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+1 234-567-8900" {...field} />
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
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="123 Street Name, City, Country"
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="licenseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motor Dealer Licence</FormLabel>
                        <FormControl>
                          <Input placeholder="NSW Motor Dealer Licence # MD000000" {...field} />
                        </FormControl>
                        <FormDescription>
                          Displayed in the footer contact information
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Social Media</CardTitle>
                  <CardDescription>
                    Add links to your social media profiles (optional)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="facebookUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook URL</FormLabel>
                          <FormControl>
                            <Input type="url" placeholder="https://facebook.com/yourpage" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="xUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>X (Twitter) URL</FormLabel>
                          <FormControl>
                            <Input type="url" placeholder="https://x.com/yourcompany" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="instagramUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram URL</FormLabel>
                          <FormControl>
                            <Input type="url" placeholder="https://instagram.com/yourhandle" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="linkedinUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn URL</FormLabel>
                          <FormControl>
                            <Input type="url" placeholder="https://linkedin.com/company/yourcompany" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>


            </TabsContent>

            <TabsContent value="home" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hero Section</CardTitle>
                  <CardDescription>
                    Customize the main banner on the home page
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="heroTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hero Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Auto Import Specialists" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="heroSubtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hero Subtitle</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Experience luxury and performance..."
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="heroImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hero Background Image</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleHeroImageChange}
                                className="flex-1"
                              />
                              {heroImageFile && (
                                <Button
                                  type="button"
                                  onClick={() => uploadHeroImage()}
                                  disabled={isUploadingHeroImage}
                                  size="sm"
                                  className="shrink-0"
                                >
                                  {isUploadingHeroImage ? "Uploading..." : "Upload Hero Image"}
                                </Button>
                              )}
                              {(heroImagePreview || field.value) && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={removeHeroImage}
                                  className="shrink-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            {(heroImagePreview || field.value) && (
                              <div className="relative w-full h-48 border rounded-md overflow-hidden bg-muted">
                                <img
                                  src={heroImagePreview || field.value}
                                  alt="Hero Preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <Input
                              type="text"
                              placeholder="https://example.com/banner.jpg"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Upload a high-quality banner image (recommended 1920x1080px)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Primary Button</h3>
                      <FormField
                        control={form.control}
                        name="heroButtonText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Button Text</FormLabel>
                            <FormControl>
                              <Input placeholder="View Inventory" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="heroButtonLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Button Link</FormLabel>
                            <FormControl>
                              <Input placeholder="/inventory" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Secondary Button (Learn More)</h3>
                      <FormField
                        control={form.control}
                        name="heroLearnMoreText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Button Text</FormLabel>
                            <FormControl>
                              <Input placeholder="Learn More" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="heroLearnMoreLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Button Link</FormLabel>
                            <FormControl>
                              <Input placeholder="#features" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>



              {/* Featured Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Featured Vehicles Section</CardTitle>
                  <CardDescription>
                    Customize the section header for your featured cars
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="featuredTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Featured Vehicles" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="featuredSubtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section Subtitle</FormLabel>
                        <FormControl>
                          <Input placeholder="Discover our latest imports and auction finds" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* How It Works Section */}
              <Card>
                <CardHeader>
                  <CardTitle>How It Works Section</CardTitle>
                  <CardDescription>
                    Customize the steps shown in the "How It Works" section
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="howItWorksTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Section Title</FormLabel>
                          <FormControl>
                            <Input placeholder="How It Works" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="howItWorksSubtitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Section Subtitle</FormLabel>
                          <FormControl>
                            <Input placeholder="Importing your dream car is simple and transparent" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4 border rounded-md p-4">
                    <h3 className="font-medium">Step 1</h3>
                    <FormField
                      control={form.control}
                      name="howItWorksStep1Title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Source & Bid" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="howItWorksStep1Description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input placeholder="We find your dream car at international auctions..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4 border rounded-md p-4">
                    <h3 className="font-medium">Step 2</h3>
                    <FormField
                      control={form.control}
                      name="howItWorksStep2Title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Inspect & Ship" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="howItWorksStep2Description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input placeholder="We verify condition and handle all shipping logistics..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4 border rounded-md p-4">
                    <h3 className="font-medium">Step 3</h3>
                    <FormField
                      control={form.control}
                      name="howItWorksStep3Title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Drive Away" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="howItWorksStep3Description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input placeholder="Receive your fully complied vehicle ready for the road..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Stats Section */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle>Statistics Section</CardTitle>
                    <CardDescription>
                      Customize the statistics shown on the home page
                    </CardDescription>
                  </div>
                  <FormField
                    control={form.control}
                    name="showStatsSection"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-medium">Show Section</FormLabel>
                      </FormItem>
                    )}
                  />
                </CardHeader>
                <CardContent className={`space-y-6 transition-opacity duration-200 ${!form.watch("showStatsSection") ? "opacity-40 pointer-events-none" : ""}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-md p-4 space-y-4">
                      <h3 className="font-medium">Stat 1</h3>
                      <FormField
                        control={form.control}
                        name="stats1Value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Value</FormLabel>
                            <FormControl>
                              <Input placeholder="1000+" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="stats1Label"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Label</FormLabel>
                            <FormControl>
                              <Input placeholder="Vehicles Sourced" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="border rounded-md p-4 space-y-4">
                      <h3 className="font-medium">Stat 2</h3>
                      <FormField
                        control={form.control}
                        name="stats2Value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Value</FormLabel>
                            <FormControl>
                              <Input placeholder="50+" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="stats2Label"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Label</FormLabel>
                            <FormControl>
                              <Input placeholder="Compliance Rate" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="border rounded-md p-4 space-y-4">
                      <h3 className="font-medium">Stat 3</h3>
                      <FormField
                        control={form.control}
                        name="stats3Value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Value</FormLabel>
                            <FormControl>
                              <Input placeholder="5" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="stats3Label"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Label</FormLabel>
                            <FormControl>
                              <Input placeholder="Auction Access" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="border rounded-md p-4 space-y-4">
                      <h3 className="font-medium">Stat 4</h3>
                      <FormField
                        control={form.control}
                        name="stats4Value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Value</FormLabel>
                            <FormControl>
                              <Input placeholder="24/7" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="stats4Label"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Label</FormLabel>
                            <FormControl>
                              <Input placeholder="Support" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonials Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Testimonials Section</CardTitle>
                  <CardDescription>
                    Customize the customer reviews section
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="testimonialsTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Section Title</FormLabel>
                          <FormControl>
                            <Input placeholder="What Our Customers Say" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="testimonialsSubtitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Section Subtitle</FormLabel>
                          <FormControl>
                            <Input placeholder="Hear from enthusiasts who have imported their dream cars" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4 border rounded-md p-4">
                    <h3 className="font-medium">Testimonial 1</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="testimonial1Name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="James Davidson" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="testimonial1Role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role/Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Car Enthusiast" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="testimonial1Content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Review Content</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Outstanding service! My GTR was in perfect condition upon arrival..." rows={3} {...field} />
                        </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4 border rounded-md p-4">
                    <h3 className="font-medium">Testimonial 2</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="testimonial2Name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Sarah Martinez" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="testimonial2Role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role/Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Supra Owner" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="testimonial2Content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Review Content</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Sourced my dream Supra through them..." rows={3} {...field} />
                        </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Call to Action Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Call to Action Section</CardTitle>
                  <CardDescription>
                    Customize the bottom CTA section
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="ctaTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Ready to Start Your Journey?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ctaSubtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtitle</FormLabel>
                          <FormControl>
                            <Input placeholder="Start sourcing your dream car today..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="ctaButtonText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Button Text</FormLabel>
                            <FormControl>
                              <Input placeholder="Start Sourcing" {...field} />
                            </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ctaButtonLink"
                      render={({ field }) => (
                        <FormItem>
                            <FormLabel>Button Link</FormLabel>
                            <FormControl>
                              <Input placeholder="/inventory" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SEO Settings</CardTitle>
                  <CardDescription>
                    Configure meta tags for search engines (optional)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="metaDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description</FormLabel>
                          <FormControl>
                            <Textarea
                            placeholder="Specialist vehicle importer offering direct auction access..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Brief description shown in search engine results (150-160 characters recommended)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metaKeywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Keywords</FormLabel>
                        <FormControl>
                          <Input placeholder="jdm import, japanese cars, car auction, gtr, supra" {...field} />
                        </FormControl>
                        <FormDescription>
                          Comma-separated keywords for SEO
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pages Content</CardTitle>
                  <CardDescription>
                    Edit the content for specific pages
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="termsAndConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Terms and Conditions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter terms and conditions content using Markdown..."
                            className="min-h-[300px] font-mono text-sm"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Use Markdown for formatting (## for headers, * for lists)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end sticky bottom-6 bg-background/80 backdrop-blur-sm p-4 border-t z-10 w-full rounded-b-lg">
            <Button
              type="submit"
              size="lg"
              disabled={saveMutation.isPending || isUploadingLogo || isUploadingFavicon || isUploadingHeroImage}
            >
              <Save className="mr-2 h-4 w-4" />
              {saveMutation.isPending || isUploadingLogo || isUploadingFavicon || isUploadingHeroImage
                ? "Saving..."
                : "Save Settings"}
            </Button>
          </div>
        </form >
      </Form >
    </div >
  );
}
