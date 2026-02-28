import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Car } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import heroImage from "@assets/generated_images/Hero_banner_luxury_car_0ff28a2c.png";
import { getAllCarsFirebase } from "@/lib/carsFirebase";
import { getOptimizedImageUrl, getThumbnailUrl } from "@/lib/imageUtils";
import { SEO } from "@/components/seo";
import { useWebsiteSettings } from "@/hooks/use-website-settings";
import { formatPrice, stripHtml } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Users,
  Car as CarIcon,
  MapPin,
  Shield,
  ArrowRight,
  Fuel,
  Settings,
  Users as SeatsIcon,
  Search,
  Star,
  CheckCircle2,
  Clock,
  Briefcase,
  ChevronDown,
} from "lucide-react";

export default function Home() {
  const [heroCategory, setHeroCategory] = useState<string>("all");
  const [heroTransmission, setHeroTransmission] = useState<string>("all");
  const { data: cars, isLoading } = useQuery<Car[]>({
    queryKey: ["cars"],
    queryFn: getAllCarsFirebase,
  });
  const { isLoading: isSettingsLoading, ...settings } = useWebsiteSettings();
  const websiteName = settings?.websiteName || "Auto Import Specialists";

  const stats = [
    { number: settings?.stats1Value || "10+", label: settings?.stats1Label || "Years Experience" },
    { number: settings?.stats2Value || "200+", label: settings?.stats2Label || "Imports" },
    { number: settings?.stats3Value || "100%", label: settings?.stats3Label || "Grade Certified" },
    { number: settings?.stats4Value || "", label: settings?.stats4Label || "" },
  ].filter(s => s.number && s.label);

  const categories = Array.from(new Set(cars?.map((car) => car.category) || []));
  const transmissions = Array.from(new Set(cars?.map((car) => car.transmission) || []));

  const featuredCars = cars?.filter(c => c.slug && !c.isComingSoon && c.published !== false).slice(0, 3) || [];
  const comingSoonPreview = cars?.filter(c => c.slug && c.isComingSoon && c.published !== false).slice(0, 3) || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <>
      <SEO
        title="Premium Vehicle Imports to Australia - Auto Import Specialists"
        description="We source, ship, and comply high-quality vehicles directly for you. Professional concierge and compliance services."
      />
      <div className="text-left overflow-x-hidden">
        <section className="relative min-h-[90vh] flex flex-col items-center justify-start md:justify-center pt-24 md:pt-24 pb-12 overflow-hidden">
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${getOptimizedImageUrl(settings?.heroImage || heroImage, { width: 2400 })})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-background" />
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10 text-center px-6 max-w-5xl mx-auto flex flex-col items-center"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest mb-6">
              <Star className="h-3 w-3 fill-white text-white" />
              <span>Direct Vehicle Imports</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter uppercase leading-[0.9] drop-shadow-2xl"
            >
              {settings?.heroTitle || "Premium Global Imports"}
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-white mb-10 leading-relaxed max-w-2xl mx-auto font-medium"
            >
              {settings?.heroSubtitle || "Your direct bridge to the import market. Sourcing, shipping, and compliance handled with professional expertise."}
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center mb-16 w-full max-w-md sm:max-w-none">
              <Link href="/inventory">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-8 py-6 text-base font-bold bg-primary text-primary-foreground border-0 shadow-2xl hover:scale-105 transition-all group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Explore Inventory
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </Button>
              </Link>
              <Link href="/find-me-a-car">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto px-8 py-6 text-base font-bold text-white border-2 border-white/20 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-white/40 hover:scale-105 transition-all"
                >
                  Find Me a Car
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="w-full max-w-4xl"
            >
              <Card className="p-4 md:p-6 bg-white border shadow-xl rounded-2xl md:rounded-3xl">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
                  <div className="md:col-span-4 py-1">
                    <Select value={heroCategory} onValueChange={setHeroCategory}>
                      <SelectTrigger className="h-12 md:h-12 rounded-xl md:rounded-2xl">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-4 py-1">
                    <Select value={heroTransmission} onValueChange={setHeroTransmission}>
                      <SelectTrigger className="h-12 md:h-12 rounded-xl md:rounded-2xl">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {transmissions.map((trans) => (
                          <SelectItem key={trans} value={trans}>
                            {trans}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-4 py-1">
                    <Link href={(() => {
                      const params = new URLSearchParams();
                      if (heroCategory !== "all") params.set("category", heroCategory);
                      if (heroTransmission !== "all") params.set("transmission", heroTransmission);
                      return `/inventory${params.toString() ? `?${params.toString()}` : ""}`;
                    })()} className="h-full">
                      <Button className="w-full h-12 md:h-12 font-semibold text-base rounded-xl md:rounded-2xl shadow-sm bg-black text-white hover:bg-black/90" size="lg">
                        <Search className="mr-2 h-5 w-5" />
                        Search Vehicles
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>

              <div className="mt-8 flex flex-wrap justify-center gap-6 md:gap-12">
                <div className="flex items-center gap-2 text-zinc-800 text-xs font-bold uppercase tracking-widest">
                  <CheckCircle2 className="h-4 w-4 text-zinc-800" />
                  <span>Grade Certified</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-800 text-xs font-bold uppercase tracking-widest">
                  <Clock className="h-4 w-4 text-zinc-800" />
                  <span>24/7 Support</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-800 text-xs font-bold uppercase tracking-widest">
                  <Briefcase className="h-4 w-4 text-zinc-800" />
                  <span>Full Compliance</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20 select-none hidden md:flex"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Scroll to discover</span>
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </motion.div>
        </section>


        <section className="py-16 md:py-24 px-6 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Latest Arrivals</h2>
              <p className="text-lg text-muted-foreground">
                High-quality vehicles recently sourced or ready for import
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-64 w-full" />
                    <div className="p-6 space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredCars.map((car) => (
                  <Link key={car.id} href={`/inventory/${car.slug}`}>
                    <Card className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer h-full border-2 hover:border-red-500 transition-colors">
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={getThumbnailUrl(car.image, 720)}
                          alt={car.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold mb-1">
                              {car.name}
                            </h3>
                            <div className="flex gap-2">
                              <Badge variant="default" className="text-[10px] uppercase font-bold tracking-tight bg-primary text-primary-foreground">
                                {car.category}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tight border-blue-500 text-blue-500">
                                {car.year}
                              </Badge>
                            </div>
                            <div className="text-lg font-bold text-foreground">
                              {formatPrice(car.price)}
                            </div>
                            <div className="text-xs font-semibold text-muted-foreground">
                              {car.kms ? `Mileage: ${car.kms}` : ''}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                          {stripHtml(car.description)}
                        </p>
                        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mb-6">
                          <div className="flex items-center gap-1.5">
                            <SeatsIcon className="h-3.5 w-3.5" />
                            <span>{car.seats}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Settings className="h-3.5 w-3.5" />
                            <span>{car.transmission}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Fuel className="h-3.5 w-3.5" />
                            <span>{car.fuelType}</span>
                          </div>
                        </div>
                        <Button className="w-full font-bold group">
                          View Details
                        </Button>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <Link href="/inventory">
                <Button size="lg" variant="outline" className="px-8 font-bold">
                  View Full Inventory
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {comingSoonPreview.length > 0 && (
          <section className="py-16 md:py-24 px-6 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <Badge className="mb-4 bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1">
                  ON THE WAY
                </Badge>
                <h2 className="text-4xl font-bold mb-4">Coming Soon</h2>
                <p className="text-lg text-muted-foreground">
                  Vehicles already sourced and currently on their way to Australia
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {comingSoonPreview.map((car) => (
                  <Link key={car.id} href={`/inventory/${car.slug}`}>
                    <Card className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer h-full border-2 hover:border-blue-500 transition-colors relative group">
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 shadow-lg">
                          ON THE WAY
                        </Badge>
                      </div>
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={getThumbnailUrl(car.image, 720)}
                          alt={car.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold mb-1">
                              {car.name}
                            </h3>
                            <div className="flex gap-2">
                              <Badge variant="default" className="text-[10px] uppercase font-bold tracking-tight bg-primary text-primary-foreground">
                                {car.category}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tight border-blue-500 text-blue-500">
                                {car.year}
                              </Badge>
                            </div>
                            <div className="text-lg font-bold text-foreground">
                              {formatPrice(car.price)}
                            </div>
                            <div className="text-xs font-semibold text-muted-foreground">
                              {car.kms ? `Mileage: ${car.kms}` : ''}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                          {stripHtml(car.description)}
                        </p>
                        <Button className="w-full font-bold group bg-blue-600 hover:bg-blue-700">
                          Express Interest
                        </Button>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>

              <div className="text-center mt-12">
                <Link href="/inventory/coming-soon">
                  <Button size="lg" variant="outline" className="px-8 font-bold border-blue-500/20 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    View All Coming Soon
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        <section className="py-16 md:py-24 px-6 bg-gradient-to-b from-card to-background" id="features">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">The Direct Import Process</h2>
              <p className="text-lg text-muted-foreground">
                We handle the entire journey from source to your driveway
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center rotate-3 hover:rotate-0 transition-all duration-500 shadow-lg border border-primary/30 hover:shadow-xl hover:scale-105">
                  <Search className="h-10 w-10 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">1. Sourcing</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We scout auctions and dealers across international markets to find the highest-grade vehicles that meet Australian import standards.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center -rotate-3 hover:rotate-0 transition-all duration-500 shadow-lg border border-primary/30 hover:shadow-xl hover:scale-105">
                  <Shield className="h-10 w-10 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">2. Shipping & Export</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We manage all documentation, de-registration, and secure shipping ensuring your vehicle is fully insured during transit to Australia.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center rotate-6 hover:rotate-0 transition-all duration-500 shadow-lg border border-primary/30 hover:shadow-xl hover:scale-105">
                  <CarIcon className="h-10 w-10 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">3. Compliance & Delivery</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our network of SEVS compliance workshops handles all modifications and roadworthy items for final registration in your state.
                </p>
              </div>
            </div>
          </div>
        </section>

        {settings.showStatsSection && stats.length > 0 && (
          <section className="py-16 md:py-24 px-4 md:px-6 bg-background">
            <div className="max-w-7xl mx-auto">
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${stats.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-4 md:gap-8 text-center`}>
                {stats.map((stat, index) => (
                  <div key={index} className="p-6 rounded-2xl bg-gradient-to-b from-card/50 to-background/50 backdrop-blur-sm border border-border/30 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <div className="text-6xl font-black text-primary mb-2">{stat.number}</div>
                    <div className="text-sm uppercase font-bold tracking-widest text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-16 md:py-24 px-6 bg-card">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Australian Client Testimonials</h2>
              <p className="text-lg text-muted-foreground">
                Join the hundreds of satisfied owners across Australia
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-8 border-0 bg-gradient-to-br from-card/70 to-background/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-xl font-bold border-2 border-primary/20">
                    M
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-white">Mark Henderson</h4>
                    <p className="text-sm text-muted-foreground">Skyline R34 Owner, Brisbane</p>
                  </div>
                </div>
                <p className="text-muted-foreground italic leading-relaxed">
                  "The transparency during the sourcing process was incredible. I received photos and auction sheets for every car we looked at. My Skyline arrived in better condition than the auction grade led me to believe. Highly recommended!"
                </p>
              </Card>

              <Card className="p-8 border-0 bg-gradient-to-br from-card/70 to-background/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-xl font-bold border-2 border-primary/20">
                    A
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-white">Alicia Chen</h4>
                    <p className="text-sm text-muted-foreground">Alphard Executive Owner, Melbourne</p>
                  </div>
                </div>
                <p className="text-muted-foreground italic leading-relaxed">
                  "Importing a family van seemed daunting, but the team handled everything from the compliance to the interior detailing. It was road-ready and delivered to my door in Melbourne without any stress."
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section
          className="relative py-32 px-6 overflow-hidden"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-primary/90 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-transparent" />
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter">
              {settings?.ctaTitle || "Can't find your dream car?"}
            </h2>
            <p className="text-2xl text-white/90 mb-12 font-medium">
              {settings?.ctaSubtitle || "Our concierge service can source any vehicle internationally to your exact specifications."}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href={settings?.ctaButtonLink || "/find-me-a-car"}>
                <Button
                  size="lg"
                  className="px-10 py-8 text-xl font-black bg-white text-black hover:bg-slate-100 border-0 shadow-2xl hover:scale-105 transition-transform"
                >
                  {settings?.ctaButtonText || "Start Sourcing Request"}
                </Button>
              </Link>
              <Link href="/inventory">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-10 py-8 text-xl font-bold text-white border-2 border-white/50 bg-white/5 hover:bg-white/10 hover:scale-105 transition-transform"
                >
                  View Inventory
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
