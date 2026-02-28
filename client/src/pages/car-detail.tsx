import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Fuel,
  Settings,
  Users as SeatsIcon,
  Check,
  Send,
  Info,
  Droplets,
  Zap,
  Activity,
  Palette,
  Calendar,
  ShieldCheck,
  Globe,
  Gauge,
  Compass,
  Ship,
  FileText,
  ShieldAlert,
  MapPin,
  Clock,
  History,
  CheckCircle2,
  ChevronRight,
  Calculator,
  Bluetooth,
  Wind,
  Usb,
  DoorOpen as Door,
  Briefcase,
} from "lucide-react";
import { getCarBySlugFirebase, getAllCarsFirebase } from "@/lib/carsFirebase";
import { InquiryForm } from "@/components/inquiry-form";
import { getOptimizedImageUrl, getThumbnailUrl } from "@/lib/imageUtils";
import { SEO } from "@/components/seo";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDays, format } from "date-fns";
import { formatPrice } from "@/lib/utils";

export default function CarDetail() {
  const { slug } = useParams();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [selectedState, setSelectedState] = useState<string>("NSW");
  const [showStickyBar, setShowStickyBar] = useState(false);

  const { data: car, isLoading } = useQuery({
    queryKey: ["carBySlug", slug],
    enabled: !!slug,
    queryFn: async () => {
      const result = await getCarBySlugFirebase(slug!);
      if (!result || result.published === false) throw new Error("Car not found");
      return result;
    },
  });

  const { data: allCars } = useQuery({
    queryKey: ["allCars"],
    queryFn: getAllCarsFirebase,
  });

  const similarCars = allCars
    ?.filter((c) => c.category === car?.category && c.id !== car?.id && c.published !== false)
    .slice(0, 3) || [];

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const allImages = car
    ? [
      car.image,
      ...(car.images || []).filter((img) => img && img.trim() !== ""),
    ].filter((img) => img && img.trim() !== "")
    : [];

  const uniqueImages = allImages.filter(
    (image, index) => allImages.indexOf(image) === index,
  );

  useEffect(() => {
    if (uniqueImages.length > 0) {
      setSelectedImageIndex(0);
    }
  }, [car?.id, uniqueImages.length]);

  const seoTitle = car ? `${car.name} - Auto Import Specialists` : "Car Details - Auto Import Specialists";
  const seoDescription = car
    ? `Import: ${car.name}. ${car.description} High-quality vehicle sourcing and compliance services for Australia.`
    : "Browse premium car import options for Australia";

  if (isLoading) {
    return (
      <>
        <SEO title="Loading Car Details" description="Auto Import Specialists - Premium Imports" />
        <div className="min-h-screen bg-background text-left">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <Skeleton className="h-8 w-32 mb-8" />
            <Skeleton className="h-[400px] w-full rounded-3xl mb-12" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-left">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Car not found</h2>
          <Link href="/inventory">
            <Button variant="outline" className="rounded-xl">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Inventory
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title={seoTitle} description={seoDescription} />
      <div className="bg-background text-left pb-24">
        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[500px] w-full text-white overflow-hidden">
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${getOptimizedImageUrl(car.image, { width: 2400 })})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-between pt-24 pb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link href="/inventory">
                <Button
                  variant="outline"
                  className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 rounded-xl"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Inventory
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="pb-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="default" className="bg-primary text-primary-foreground px-3 py-1">
                  PREMIUM SELECTION
                </Badge>
                <Badge variant="outline" className="text-white border-white/40 backdrop-blur-sm px-3 py-1">
                  {car.year} PRODUCTION YEAR
                </Badge>
                {car.isSold && (
                  <Badge className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 text-sm font-black shadow-2xl animate-pulse">
                    SOLD / DELIVERED
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 uppercase tracking-tighter leading-none text-white">
                {car.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-sm font-semibold">
                  <Globe className="w-4 h-4 text-blue-400" />
                  PREMIUM IMPORT
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-sm font-semibold">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  READY FOR AUSTRALIA
                </div>
              </div>

              <div className="flex items-center gap-4 mt-8">
                <div className="bg-blue-600 px-6 py-3 rounded-2xl shadow-xl shadow-blue-500/20">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 mb-1">Vehicle Price</div>
                  <div className="text-3xl font-bold tracking-tight text-white">{formatPrice(car.price, 'POA')}</div>
                </div>
                {car.kms && (
                  <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mb-1">Mileage</div>
                    <div className="text-2xl font-bold tracking-tight text-white whitespace-nowrap">{car.kms}</div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Action Bar (Mobile Sticky) */}
        <div className="lg:hidden sticky top-16 z-30 bg-background/80 backdrop-blur-xl border-b border-border p-4 flex gap-3">
          <Button
            className={`flex-1 rounded-xl font-bold h-12 ${car.isSold ? 'bg-slate-400 hover:bg-slate-500' : 'bg-blue-600 hover:bg-blue-700'}`}
            onClick={() => setIsInquiryOpen(true)}
          >
            {car.isSold ? "Enquire Similar" : "Enquire Now"}
          </Button>
          <Link href={`/booking?car=${encodeURIComponent(car.name)}&id=${car.id}`} className="flex-1">
            <Button variant="outline" className="w-full rounded-xl font-bold h-12">
              Book Inspection
            </Button>
          </Link>
        </div>

        {/* Content Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16">

            {/* Left Column: Details & Gallery */}
            <div className="lg:col-span-8 space-y-16">

              {/* Gallery System */}
              <div className="space-y-6">
                <div className="aspect-[16/10] rounded-[32px] overflow-hidden bg-muted shadow-2xl border border-border/50 relative group">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={selectedImageIndex}
                      src={getOptimizedImageUrl(uniqueImages[selectedImageIndex] || uniqueImages[0], { width: 1600 })}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5 }}
                      className="w-full h-full object-cover"
                      alt={car.name}
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                {uniqueImages.length > 1 && (
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                    {uniqueImages.map((image, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`aspect-video rounded-2xl overflow-hidden cursor-pointer transition-all border-2 shadow-sm ${selectedImageIndex === index
                          ? "border-blue-600 ring-4 ring-blue-500/10"
                          : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <img src={getThumbnailUrl(image, 480)} alt="thumbnail" className="w-full h-full object-cover" />
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>



              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-6 pt-8"
              >
                <div className="inline-flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest text-xs">
                  <Info className="w-4 h-4" />
                  Vehicle Intelligence
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Technical Overview</h2>
                <div
                  className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-lg lg:text-xl"
                  dangerouslySetInnerHTML={{ __html: car.description }}
                />
              </motion.div>

              {/* Enhanced Specs Grid */}
              <div className="space-y-8 pt-8">
                <div className="flex items-center justify-between border-b border-border pb-6">
                  <h3 className="text-2xl font-bold">Vehicle Specifications</h3>
                  <Badge variant="outline" className="bg-muted/50 rounded-lg px-3 py-1 text-xs font-mono">
                    VERIFIED ASSET
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <SpecCard icon={<Calendar className="h-6 w-6" />} label="Production Year" value={car.year?.toString() || null} />
                  <SpecCard icon={<Settings className="h-6 w-6" />} label="Transmission" value={car.transmission} />
                  <SpecCard icon={<Fuel className="h-6 w-6" />} label="Fuel Type" value={car.fuelType} />
                  <SpecCard icon={<SeatsIcon className="h-6 w-6" />} label="Seats" value={car.seats?.toString() || null} />
                  <SpecCard icon={<Door className="h-6 w-6" />} label="Doors" value={car.doors?.toString() || null} />
                  <SpecCard icon={<Briefcase className="h-6 w-6" />} label="Luggage" value={car.luggage?.toString() || null} />
                  <SpecCard icon={<Gauge className="h-6 w-6" />} label="Engine" value={car.engine} />
                  <SpecCard icon={<Zap className="h-6 w-6" />} label="Power" value={car.power} />
                  <SpecCard icon={<Compass className="h-6 w-6" />} label="Consumption" value={car.consumption} />
                  <SpecCard icon={<Activity className="h-6 w-6" />} label="Drivetrain" value={car.drivetrain} />
                  <SpecCard icon={<Palette className="h-6 w-6" />} label="Exterior Color" value={car.exteriorColor} />
                  <SpecCard icon={<Palette className="h-6 w-6" />} label="Interior Color" value={car.interiorColor} />
                </div>



                {/* Main Features & Availability Grid */}
                <div className="pt-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-border pb-6">
                    <h3 className="text-2xl font-bold">Features & Availability</h3>
                    <Badge variant="outline" className="bg-muted/50 rounded-lg px-3 py-1 text-xs font-mono">
                      INCLUDED
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {car.hasGPS && (
                      <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-bold">Navigation / GPS</span>
                      </div>
                    )}
                    {car.hasBluetooth && (
                      <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3">
                        <Bluetooth className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-bold">Bluetooth Audio</span>
                      </div>
                    )}
                    {car.hasAC && (
                      <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3">
                        <Wind className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-bold">Air Conditioning</span>
                      </div>
                    )}
                    {car.hasUSB && (
                      <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3">
                        <Usb className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-bold">USB Interface</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Verified Asset Dossier */}
                {(car.auctionGrade || car.verifiedMileage || car.accidentHistory || car.dossierText) && (
                  <div className="pt-12 space-y-8">
                    <div className="flex items-center justify-between border-b border-border pb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-2xl bg-blue-600 text-white">
                          <FileText className="h-4 w-4" />
                        </div>
                        <h3 className="text-xl font-bold">{car.dossierTitle || "Verified Asset Dossier"}</h3>
                      </div>
                      <Badge variant="outline" className="bg-emerald-50/50 text-emerald-700 border-emerald-200 rounded-lg px-3 py-1 text-xs font-mono">
                        AUTHENTICITY GUARANTEED
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {car.auctionGrade && (
                        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-border/50">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Auction Grade</p>
                          <p className="text-lg font-bold text-blue-600">{car.auctionGrade}</p>
                        </div>
                      )}
                      {car.verifiedMileage && (
                        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-border/50">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Verified Mileage</p>
                          <p className="text-lg font-bold text-blue-600">{car.verifiedMileage}</p>
                        </div>
                      )}
                      {car.accidentHistory && (
                        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-border/50">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Accident History</p>
                          <p className="text-lg font-bold text-blue-600">{car.accidentHistory}</p>
                        </div>
                      )}
                    </div>

                    {car.dossierText && (
                      <div className="p-6 rounded-[32px] bg-blue-50/30 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/30">
                        <div className="flex items-start gap-4">
                          <ShieldCheck className="h-4 w-4 text-blue-600 mt-1" />
                          <div className="space-y-4">
                            <h4 className="font-bold text-sm uppercase tracking-widest">Auction Sheet Decode Text</h4>
                            <p className="text-muted-foreground leading-relaxed">
                              {car.dossierText}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Inquiry Action */}
            <div className="lg:col-span-4 space-y-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="sticky top-24"
              >
                <Card className="p-10 border-2 shadow-2xl rounded-[40px] overflow-hidden relative group">
                  <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700" />

                  <h3 className="text-2xl font-bold mb-4">Direct Buy Option</h3>
                  <p className="text-muted-foreground mb-8 text-sm leading-relaxed font-medium">
                    This {car.name} is ready for procurement. Our team handles the entire process from auction to your doorstep.
                  </p>

                  <div className="space-y-5 mb-10">
                    {(car.features && car.features.length > 0
                      ? car.features
                      : ["Export condition report included", "Door-to-door Australia delivery", "Full compliance management"]
                    ).map((f, i) => (
                      <FeatureItem key={i} text={f} />
                    ))}
                  </div>

                  <div className="space-y-4">
                    <Button
                      className={`w-full h-16 text-xl font-bold rounded-[20px] shadow-xl transition-all hover:scale-[1.02] active:scale-95 group ${car.isSold ? 'bg-slate-400 hover:bg-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'}`}
                      onClick={() => !car.isSold && setIsInquiryOpen(true)}
                    >
                      <Send className="mr-2 h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      {car.isSold ? "Enquire about similar models" : "Request Details"}
                    </Button>

                    <Link href={`/booking?car=${encodeURIComponent(car.name)}&id=${car.id}`} className="block">
                      <Button variant="outline" className="w-full h-16 text-lg font-bold rounded-[20px] border-border hover:bg-muted/50 transition-all">
                        <Calendar className="mr-2 h-5 w-5" />
                        Schedule Inspection
                      </Button>
                    </Link>
                  </div>

                  <p className="text-center text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-8 flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    Expert available now
                  </p>
                </Card>

                {/* Logistics Estimator */}
                {car.isComingSoon && (
                  <div className="mt-8 p-10 bg-slate-50 dark:bg-slate-900/40 backdrop-blur-md rounded-[40px] border border-border/50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 rounded-2xl bg-blue-600 text-white">
                        <Calculator className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold">Logistics Estimator</h4>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Australian Landing</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Select Delivery State</label>
                        <Select value={selectedState} onValueChange={setSelectedState}>
                          <SelectTrigger className="h-14 rounded-2xl border-border bg-background font-bold px-5">
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NSW">New South Wales</SelectItem>
                            <SelectItem value="VIC">Victoria</SelectItem>
                            <SelectItem value="QLD">Queensland</SelectItem>
                            <SelectItem value="WA">Western Australia</SelectItem>
                            <SelectItem value="SA">South Australia</SelectItem>
                            <SelectItem value="TAS">Tasmania</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-4 p-5 rounded-3xl bg-white dark:bg-black/20 border border-border/50">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground font-medium">Est. Arrival</span>
                          <span className="font-bold text-blue-600">{format(addDays(new Date(), 60), "MMMM yyyy")}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground font-medium">Compliance</span>
                          <span className="font-bold">Included</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-t border-border pt-4">
                          <span className="text-muted-foreground font-medium">State {selectedState} Plating</span>
                          <span className="font-bold">Managed</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-muted-foreground leading-relaxed italic text-center px-4">
                        *Estimates based on current RoRo shipping schedules from Nagoya Port. Final landing costs subject to currency fluctuation.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Similar Imports */}
        {similarCars.length > 0 && (
          <section className="py-24 border-t border-border bg-slate-50/50 dark:bg-transparent">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-end justify-between mb-12">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest text-xs">
                    <ChevronRight className="w-4 h-4" />
                    Market Availability
                  </div>
                  <h2 className="text-4xl font-bold tracking-tight">Similar Imports</h2>
                </div>
                <Link href="/inventory">
                  <Button variant="ghost" className="font-bold group">
                    View All Inventory
                    <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {similarCars.map((c) => (
                  <Link key={c.id} href={`/inventory/${c.slug}`}>
                    <Card className="overflow-hidden group cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl">
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <img
                          src={getThumbnailUrl(c.image, 720)}
                          alt={c.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-white/90 backdrop-blur-md text-black border-0 font-bold font-mono">{c.year}</Badge>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors uppercase">{c.name}</h3>
                        <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          <div className="flex items-center gap-1.5">
                            <Gauge className="h-3.5 w-3.5" />
                            <span>{c.transmission}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Fuel className="h-3.5 w-3.5" />
                            <span>{c.fuelType}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Floating Context Bar */}
        <AnimatePresence>
          {showStickyBar && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/90 backdrop-blur-2xl border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
            >
              <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 w-full">
                {/* Left Side: Car Info */}
                <div className="min-w-0 flex-1 flex flex-col md:flex-row md:items-center gap-1 md:gap-6">
                  <div className="hidden md:block">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground truncate">{car.name}</p>
                    <p className="font-bold text-sm">{car.year} Model</p>
                  </div>

                  {/* Mobile simplified info */}
                  <div className="md:hidden">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground truncate">{car.name}</p>
                    <p className="font-bold text-base text-foreground leading-none">{formatPrice(car.price, 'POA')}</p>
                  </div>

                  <div className="hidden md:flex items-center gap-6 md:border-l md:border-border pl-0 md:pl-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-0.5">Price</p>
                      <p className="font-bold text-lg text-foreground leading-none">{formatPrice(car.price, 'POA')}</p>
                    </div>
                    {car.kms && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-0.5">Mileage</p>
                        <p className="font-bold text-lg text-foreground leading-none">{car.kms}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Action Button */}
                <div className="flex items-center gap-3 shrink-0">
                  <Button
                    className={`font-bold px-6 sm:px-8 h-12 shadow-xl ${car.isSold ? 'bg-slate-500 hover:bg-slate-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                    onClick={() => setIsInquiryOpen(true)}
                  >
                    {car.isSold ? "Enquire Similar" : "Enquire Now"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inquiry Form Dialog */}
        <InquiryForm
          carId={car.id!}
          carName={car.name}
          open={isInquiryOpen}
          onOpenChange={setIsInquiryOpen}
        />
      </div>
    </>
  );
}


function SpecCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | null | undefined }) {
  if (!value || value.trim() === "") return null;
  return (
    <div className="flex items-center p-7 rounded-[28px] bg-card border border-border group hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500">
      <div className="p-4 rounded-2xl bg-muted/60 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500 text-muted-foreground">
        {icon}
      </div>
      <div className="ml-5">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-lg font-bold text-foreground leading-tight tracking-tight">{value}</p>
      </div>
    </div>
  );
}



function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-4 text-[15px] font-semibold text-foreground/80">
      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-800">
        <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
      </div>
      <span>{text}</span>
    </div>
  );
}
