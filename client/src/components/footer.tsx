import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Car,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Facebook,
  Instagram,
  Linkedin,
  Clock
} from "lucide-react";
import { useState, useEffect } from "react";
import { useWebsiteSettings } from "@/hooks/use-website-settings";

const XIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={className}
    fill="currentColor"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zl-1.161 8.761-0.375-0.536L3.483 3.41H5.98l7.533 10.771 0.374 0.536 7.151 10.218h-2.497z" />
  </svg>
);

export function Footer() {
  const { isLoading, ...settings } = useWebsiteSettings();
  const [logoError, setLogoError] = useState(false);

  const logoUrl = settings?.logo;

  // Reset logo error when logo URL changes
  useEffect(() => {
    setLogoError(false);
  }, [logoUrl]);

  const websiteName = settings?.websiteName || "JDM Auto Import";
  const companyName = settings?.companyName || "JDM Auto Import";
  const description = settings?.description || "We source, ship, and comply high-quality vehicles directly for you.";
  const email = settings?.email || "info@jdmautoimports.com.au";
  const phone = settings?.phone || "+61 469 440 944";
  const address = settings?.address || "6/1353 The Horsley Drive, Wetherill Park, NSW 2164, Australia";
  const licenseNumber = (settings as any)?.licenseNumber || "NSW Motor Dealer Licence # MD094267";
  const facebookUrl = settings?.facebookUrl;
  const xUrl = settings?.xUrl;
  const instagramUrl = settings?.instagramUrl;
  const linkedinUrl = settings?.linkedinUrl;

  return (
    <footer className="bg-card border-t text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              {logoUrl && !logoError ? (
                <img
                  src={logoUrl}
                  alt={websiteName}
                  className="h-10 w-auto object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <>
                  <Car className="h-5 sm:h-6 w-5 sm:w-6 text-primary" />
                  <span className="text-lg sm:text-xl font-bold">{websiteName}</span>
                </>
              )}
            </div>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {description}
            </p>
            <div className="flex gap-3 sm:gap-4">
              {facebookUrl && (
                <Button variant="outline" size="icon" asChild className="rounded-full shadow-sm">
                  <a href={facebookUrl} target="_blank" rel="noopener noreferrer">
                    <Facebook className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {xUrl && (
                <Button variant="outline" size="icon" asChild className="rounded-full shadow-sm">
                  <a href={xUrl} target="_blank" rel="noopener noreferrer">
                    <XIcon className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {instagramUrl && (
                <Button variant="outline" size="icon" asChild className="rounded-full shadow-sm">
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {linkedinUrl && (
                <Button variant="outline" size="icon" asChild className="rounded-full shadow-sm">
                  <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-bold uppercase tracking-wider text-foreground">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/inventory" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                  Inventory
                </Link>
              </li>
              <li>
                <Link href="/find-me-a-car" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                  Find Me a Car
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-bold uppercase tracking-wider text-foreground">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm sm:text-base text-muted-foreground font-medium">
                  {address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <a href={`tel:${phone}`} className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors font-medium">
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <a href={`mailto:${email}`} className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors font-medium">
                  {email}
                </a>
              </li>
 
            </ul>
          </div>

          {/* Business Hours */}
          <div className="space-y-3 sm:space-y-4 sm:col-span-2 lg:col-span-1">
            <h3 className="text-base sm:text-lg font-bold uppercase tracking-wider text-foreground">Business Hours</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm sm:text-base text-muted-foreground">
                  <span className="font-medium block">Mon - Fri:</span>
                  9:00 AM - 6:00 PM
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm sm:text-base text-muted-foreground">
                  <span className="font-medium block">Saturday:</span>
                  10:00 AM - 4:00 PM
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm sm:text-base text-muted-foreground">
                  <span className="font-medium block">Sunday:</span>
                  10:00 AM - 4:00 PM
                </div>
              </li>
              <li className="flex items-start gap-3 pl-8">
                <div className="text-xs sm:text-sm text-muted-foreground italic">
                  Open with Appointments too
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              © {new Date().getFullYear()} {companyName}.
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground/80 font-bold uppercase tracking-tight">
              {licenseNumber}
            </p>
          </div>
          <div className="flex gap-6 text-xs sm:text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-primary transition-colors font-medium">Terms</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors font-medium">Privacy</Link>
            <a href="https://vancegraphix.com.au/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors font-medium">Developed by VGP</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
