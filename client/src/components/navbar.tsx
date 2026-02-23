import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Car, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useWebsiteSettings } from "@/hooks/use-website-settings";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const [location] = useLocation();
  const { websiteName: settingsWebsiteName, logo: logoUrl, isLoading } = useWebsiteSettings();
  const [logoError, setLogoError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const websiteName = settingsWebsiteName || "Auto Import Specialists";

  // Reset logo error when logo URL changes
  useEffect(() => {
    setLogoError(false);
  }, [logoUrl]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { href: "/", label: "Home", testId: "link-home" },
    { href: "/inventory", label: "Inventory", testId: "link-cars" },
    { href: "/inventory/coming-soon", label: "Coming Soon", testId: "link-coming-soon" },
    { href: "/inventory/sold", label: "Sold", testId: "link-sold" },
    { href: "/find-me-a-car", label: "Find Me a Car", testId: "link-find-car" },
    { href: "/about", label: "About Us", testId: "link-about" },
    { href: "/contact", label: "Contact", testId: "link-contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    if (href === "/inventory") return location === "/inventory";
    if (href === "/inventory/coming-soon") return location === "/inventory/coming-soon";
    return location === href;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer hover-elevate px-3 py-2 rounded-md active-elevate-2">
              {logoUrl && !logoError ? (
                <img
                  src={logoUrl}
                  alt={websiteName}
                  className="h-8 sm:h-10 w-auto object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <>
                  <Car className="h-5 sm:h-6 w-5 sm:w-6" />
                  <span className="text-lg sm:text-xl font-bold truncate max-w-[120px] sm:max-w-none">{websiteName}</span>
                </>
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive(link.href) ? "default" : "ghost"}
                  size="sm"
                  data-testid={link.testId}
                >
                  {link.label}
                </Button>
              </Link>
            ))}

          </div>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                data-testid="button-mobile-menu"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-4 mt-8">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                  {logoUrl && !logoError ? (
                    <img
                      src={logoUrl}
                      alt={websiteName}
                      className="h-10 w-auto object-contain"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <>
                      <Car className="h-6 w-6" />
                      <span className="text-xl font-bold">{websiteName}</span>
                    </>
                  )}
                </div>
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <Button
                      variant={isActive(link.href) ? "default" : "ghost"}
                      className="w-full justify-start"
                      size="lg"
                      data-testid={`mobile-${link.testId}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}

              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
