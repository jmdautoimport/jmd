import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Car,
  Users,
  Shield,
  Award,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useWebsiteSettings } from "@/hooks/use-website-settings";
import { SEO } from "@/components/seo";

export default function About() {
  const { isLoading, ...settings } = useWebsiteSettings();
  const websiteName = settings?.websiteName || "Auto Import Specialists";
  const companyName = settings?.companyName || websiteName;
  const values = [
    {
      icon: Shield,
      title: "Full Compliance",
      description: "Every vehicle we source is fully complied to Australian standards, ensuring total peace of mind for our enthusiasts.",
    },
    {
      icon: Award,
      title: "Premium Handpicks",
      description: "We hand-select only the highest auction grade vehicles, maintaining the standard that enthusiasts expect.",
    },
    {
      icon: Users,
      title: "Direct Concierge",
      description: "Our concierge service is dedicated to finding your dream car. We handle the auction, shipping, and bureaucracy for you.",
    },
    {
      icon: Car,
      title: "Expert Sourcing",
      description: "With years of experience in the global market, we know where to find the best performance cars, luxury vehicles, and 4WDs.",
    },
  ];

  const stats = [
    { number: settings?.stats1Value || "10+", label: settings?.stats1Label || "Years Experience" },
    { number: settings?.stats2Value || "200+", label: settings?.stats2Label || "Imports" },
    { number: settings?.stats3Value || "100%", label: settings?.stats3Label || "Grade Certified" },
    { number: settings?.stats4Value || "", label: settings?.stats4Label || "" },
  ].filter(s => s.number && s.label);

  return (
    <>
      <SEO
        title={`About - ${websiteName}`}
        description={`Learn more about ${websiteName}, your trusted partner for imported vehicles. Bridging the gap between the global car scene and Australian enthusiasts.`}
      />
      <div className="min-h-screen bg-background text-left">
        {/* Hero Section */}
        <section className="bg-card border-b relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 pattern-grid opacity-20" />
          <div className="max-w-7xl mx-auto px-6 pt-24 pb-16 md:pt-32 md:pb-24 relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase">
                About <span className="text-primary">{companyName}</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                We are {companyName}, your trusted partner for imported vehicles. Our mission is to bridge the gap
                between the global car scene and Australian enthusiasts, providing a seamless,
                transparent, and professional importing experience.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 md:py-24 px-6 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-black mb-6 uppercase tracking-tight">Our Mission</h2>
                <p className="text-lg text-muted-foreground mb-4 leading-relaxed font-medium">
                  At {companyName}, our mission is to provide a transparent gateway to the global car auctions.
                  We believe that every enthusiast deserves a high-quality, authentic imported vehicle without
                  the stress of navigating international shipping and Australian compliance.
                </p>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed font-medium">
                  Whether you're looking for a track-ready monster or a pristine 4WD export, we offer a
                  curated concierge service that handles everything from the initial bid to the final delivery.
                </p>
                <div className="flex gap-4">
                  <Link href="/inventory">
                    <Button size="lg" className="px-8 font-bold shadow-lg shadow-primary/20">
                      View Inventory
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/find-me-a-car">
                    <Button size="lg" variant="outline" className="px-8 font-bold">
                      Start Sourcing
                    </Button>
                  </Link>
                </div>
              </div>
              <Card className="p-8 bg-muted/40 border-none shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full" />
                <h3 className="text-2xl font-bold mb-6 uppercase tracking-wider">The Import Advantage</h3>
                <ul className="space-y-4">
                  {[
                    "Access to all international auctions",
                    "Transparent fixed-fee sourcing",
                    "Verified auction sheets & translations",
                    "Specialized interstate delivery",
                    "Full Australian compliance handling",
                    "Post-import enthusiast support",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground font-bold text-sm tracking-tight">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 md:py-24 px-6 bg-muted/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Our Core Values</h2>
              <p className="text-lg text-muted-foreground font-medium">
                The standards we uphold for every import project
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="p-8 text-center border-none shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center transform rotate-3">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-black mb-3 uppercase tracking-tight">{value.title}</h3>
                  <p className="text-muted-foreground text-sm font-medium leading-relaxed">{value.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        {settings.showStatsSection && stats.length > 0 && (
          <section className="py-24 px-6 bg-primary text-primary-foreground relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=2070&auto=format&fit=crop')] opacity-10 grayscale" />
            <div className="max-w-7xl mx-auto relative z-10">
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${stats.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-12 text-center`}>
                {stats.map((stat, index) => (
                  <div key={index}>
                    <div className="text-6xl font-black mb-4 tracking-tighter">{stat.number}</div>
                    <div className="text-sm font-bold uppercase tracking-widest opacity-80">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contact CTA Section */}
        <section className="py-16 md:py-24 px-6 bg-background">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl font-black mb-6 uppercase tracking-tighter">Contact the Garage</h2>
            <p className="text-xl text-muted-foreground mb-12 font-medium">
              Ready to start your next import project? Our specialists are standing by to answer your technical questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-8 justify-center mb-12">
              {settings?.phone && (
                <div className="flex items-center justify-center gap-3 group">
                  <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-lg font-bold text-muted-foreground">{settings.phone}</span>
                </div>
              )}
              {settings?.email && (
                <div className="flex items-center justify-center gap-3 group">
                  <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-lg font-bold text-muted-foreground underline underline-offset-4 decoration-primary/30">{settings.email}</span>
                </div>
              )}
            </div>
            <Link href="/contact">
              <Button size="lg" className="px-12 font-black italic uppercase tracking-tighter h-14 text-lg shadow-2xl shadow-primary/30">
                Get Started
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

