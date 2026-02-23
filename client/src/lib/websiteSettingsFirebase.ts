import { db, isFirebaseInitialized } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

const WEBSITE_SETTINGS_DOC = "website_settings";
const WEBSITE_SETTINGS_ID = "default";

export interface WebsiteSettings {
  websiteName: string;
  logo: string; // URL or path to logo
  favicon: string; // URL or path to favicon
  companyName: string;
  email: string;
  phone: string;
  address: string;
  licenseNumber?: string;
  description: string;
  facebookUrl?: string;
  xUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  metaDescription?: string;
  metaKeywords?: string;

  // Hero Section
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  heroButtonText?: string;
  heroButtonLink?: string;
  heroLearnMoreText?: string;
  heroLearnMoreLink?: string;

  // Featured Section
  featuredTitle?: string;
  featuredSubtitle?: string;

  // How It Works Section
  howItWorksTitle?: string;
  howItWorksSubtitle?: string;
  howItWorksStep1Title?: string;
  howItWorksStep1Description?: string;
  howItWorksStep2Title?: string;
  howItWorksStep2Description?: string;
  howItWorksStep3Title?: string;
  howItWorksStep3Description?: string;

  // Stats Section
  showStatsSection?: boolean;
  stats1Value?: string;
  stats1Label?: string;
  stats2Value?: string;
  stats2Label?: string;
  stats3Value?: string;
  stats3Label?: string;
  stats4Value?: string;
  stats4Label?: string;

  // Testimonials Section
  testimonialsTitle?: string;
  testimonialsSubtitle?: string;
  testimonial1Name?: string;
  testimonial1Role?: string;
  testimonial1Content?: string;
  testimonial2Name?: string;
  testimonial2Role?: string;
  testimonial2Content?: string;

  // CTA Section
  ctaTitle?: string;
  ctaSubtitle?: string;
  ctaButtonText?: string;
  ctaButtonLink?: string;

  // Pages
  termsAndConditions?: string;
  maintenanceMode?: boolean;
}

export const defaultWebsiteSettings: WebsiteSettings = {
  websiteName: "JDM Auto Import",
  logo: "",
  favicon: "/favicon.png",
  companyName: "JDM Auto Import",
  email: "info@jdmautoimports.com.au",
  phone: "+61 469 440 944",
  address: "6/1353 The Horsley Drive, Wetherill Park, NSW 2164, Australia",
  licenseNumber: "NSW Motor Dealer Licence # MD094267",
  description: "JDM Auto Imports is a leading Australian importer and dealership dedicated to genuine Japanese Domestic Market vehicles. From rare performance icons to premium daily drivers, we connect Australia with Japan’s finest cars through expert sourcing, compliance, and unmatched attention to detail.",
  facebookUrl: "",
  xUrl: "",
  instagramUrl: "",
  linkedinUrl: "",
  metaDescription: "Premium vehicle imports. Specialist sourcing for sports cars, luxury vehicles, and SUVs. Full compliance handling and Australia-wide delivery.",
  metaKeywords: "car imports Australia, vehicle imports, luxury car import, performance car import, import concierge service",

  // Hero Defaults
  heroTitle: "Premium Global Imports",
  heroSubtitle: "Your trusted gateway to global vehicle markets.",
  heroImage: "", // Will fall back to default if empty
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
  howItWorksStep1Description: "We help you find the perfect car at auctions and handle the bidding process",
  howItWorksStep2Title: "Shipping & Transit",
  howItWorksStep2Description: "We manage international logistics, insurance, and arrival at Australian ports",
  howItWorksStep3Title: "Compliance & Delivery",
  howItWorksStep3Description: "Full compliance and registration before delivering to your door",

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
  testimonial1Content: "Outstanding service! My vehicle was in perfect condition upon arrival, and the compliance process was seamless. The team made the whole process incredibly easy.",
  testimonial2Name: "Sarah Martinez",
  testimonial2Role: "Happy Customer",
  testimonial2Content: "Sourced my dream car through them. Transparent pricing and great communication throughout the shipping process. Highly recommend!",

  // CTA Defaults
  ctaTitle: "Ready to Start Your Journey?",
  ctaSubtitle: "Find your dream vehicle today and experience the road like never before",
  ctaButtonText: "Start Sourcing",
  ctaButtonLink: "/find-me-a-car",

  // Pages Defaults
  termsAndConditions: `## Agreement to Terms
By accessing our website and using our vehicle import services, you agree to be bound by these Terms and Conditions and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.

## 1. Use License
Permission is granted to temporarily view the materials (information or software) on our website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
* Modify or copy the materials;
* Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);
* Attempt to decompile or reverse engineer any software contained on our website;
* Remove any copyright or other proprietary notations from the materials; or
* Transfer the materials to another person or "mirror" the materials on any other server.

## 2. Disclaimer
The materials on our website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

## 3. Limitations
In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website, even if we or an authorized representative has been notified orally or in writing of the possibility of such damage.

## 4. Accuracy of Materials
The materials appearing on our website could include technical, typographical, or photographic errors. We do not warrant that any of the materials on our website are accurate, complete or current. We may make changes to the materials contained on our website at any time without notice.

## 5. Governing Law
These terms and conditions are governed by and construed in accordance with the laws of the location of our headquarters and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.`,
  maintenanceMode: false,
};

/**
 * Get website settings from Firebase
 */
export async function getWebsiteSettings(): Promise<WebsiteSettings> {
  try {
    if (!isFirebaseInitialized) return defaultWebsiteSettings;

    const docRef = doc(db, WEBSITE_SETTINGS_DOC, WEBSITE_SETTINGS_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as WebsiteSettings;
      console.log("Website settings found in Firestore.");
      // Merge with defaults to ensure all fields exist
      return { ...defaultWebsiteSettings, ...data };
    }

    console.warn("No website settings found in Firestore, using defaults.");
    // Return defaults if no settings exist
    return defaultWebsiteSettings;
  } catch (error: any) {
    // Silently handle offline/unavailable errors to avoid console noise
    const isOffline = error?.code === 'unavailable' ||
      error?.message?.toLowerCase().includes('offline') ||
      !navigator.onLine;

    if (!isOffline) {
      console.error("Error fetching website settings:", error);
    }
    return defaultWebsiteSettings;
  }
}

/**
 * Save website settings to Firebase
 */
export async function saveWebsiteSettings(
  settings: WebsiteSettings
): Promise<void> {
  try {
    if (!isFirebaseInitialized) {
      throw new Error("Firebase is not initialized. Please check your environment variables (.env).");
    }

    console.log("Attempting to save website settings:", settings);
    const docRef = doc(db, WEBSITE_SETTINGS_DOC, WEBSITE_SETTINGS_ID);

    // Clean up the data - remove undefined values
    const dataToSave: Record<string, any> = {};

    // Spread all settings and then override/clean specific ones
    Object.entries(settings).forEach(([key, value]) => {
      if (value !== undefined) {
        dataToSave[key] = value;
      }
    });

    // Ensure core fields have defaults if empty
    dataToSave.websiteName = dataToSave.websiteName || "Auto Import Specialists";
    dataToSave.companyName = dataToSave.companyName || "Auto Import Specialists";
    dataToSave.favicon = dataToSave.favicon || "/favicon.png";
    dataToSave.maintenanceMode = !!dataToSave.maintenanceMode;

    console.log("Data to save to Firestore:", dataToSave);
    await setDoc(docRef, dataToSave, { merge: true });
    console.log("Successfully saved website settings to Firestore");
  } catch (error) {
    console.error("Error saving website settings:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(String(error));
  }
}

