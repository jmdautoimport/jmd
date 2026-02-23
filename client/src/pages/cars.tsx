import { useMemo, useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Car } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Fuel, Settings, Users as SeatsIcon, Search, SlidersHorizontal, ArrowUpAZ } from "lucide-react";
import { getAllCarsFirebase } from "@/lib/carsFirebase";
import { getThumbnailUrl } from "@/lib/imageUtils";
import { SEO } from "@/components/seo";
import { useWebsiteSettings } from "@/hooks/use-website-settings";

export default function Cars() {
  const settings = useWebsiteSettings();
  // Initialize filters from URL parameters
  const getInitialFilters = () => {
    if (typeof window === "undefined") {
      return { category: "all", transmission: "all" };
    }
    const params = new URLSearchParams(window.location.search);
    return {
      category: params.get("category") || "all",
      transmission: params.get("transmission") || "all",
    };
  };

  const initialFilters = getInitialFilters();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>(initialFilters.category);
  const [transmissionFilter, setTransmissionFilter] = useState<string>(initialFilters.transmission);
  const [seatsFilter, setSeatsFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, transmissionFilter, seatsFilter, sortOption]);

  const { data: cars, isLoading } = useQuery<Car[]>({
    queryKey: ["cars"],
    queryFn: getAllCarsFirebase,
  });

  // Update filters when URL parameters change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    const transmission = params.get("transmission");
    if (category) setCategoryFilter(category);
    if (transmission) setTransmissionFilter(transmission);
  }, []);

  const seatOptions = useMemo(() => {
    if (!cars) return [];
    const unique = new Set<number>();
    cars.forEach((car) => unique.add(car.seats));
    return Array.from(unique).sort((a, b) => a - b);
  }, [cars]);

  const filteredCars = cars?.filter((car) => {
    // Exclude unpublished cars
    if (car.published === false) return false;

    // Exclude Coming Soon and Sold cars from main inventory
    if (car.isComingSoon || car.isSold) return false;

    const matchesSearch = car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || car.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesTransmission = transmissionFilter === "all" || car.transmission.toLowerCase() === transmissionFilter.toLowerCase();
    const matchesSeats = seatsFilter === "all" || car.seats === Number(seatsFilter);
    return matchesSearch && matchesCategory && matchesTransmission && matchesSeats;
  }) || [];

  const sortedCars = useMemo(() => {
    const list = [...filteredCars];
    list.sort((a, b) => {
      switch (sortOption) {
        case "seats-desc":
          return b.seats - a.seats;
        case "newest":
          return b.year - a.year;
        default:
          return a.name.localeCompare(b.name);
      }
    });
    return list;
  }, [filteredCars, sortOption]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCars = sortedCars.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedCars.length / itemsPerPage);

  const categories = Array.from(new Set(cars?.map((car) => car.category) || []));
  const transmissions = Array.from(new Set(cars?.map((car) => car.transmission) || []));

  // Normalize category filter to match database format (case-insensitive matching)
  useEffect(() => {
    if (cars && categories.length > 0 && categoryFilter !== "all") {
      // Check if current categoryFilter value exists in categories (case-insensitive)
      const categoryExists = categories.some(
        (cat) => cat.toLowerCase() === categoryFilter.toLowerCase()
      );
      // If it doesn't match exactly, find the normalized version
      if (!categoryExists || !categories.includes(categoryFilter)) {
        const normalizedCategory = categories.find(
          (cat) => cat.toLowerCase() === categoryFilter.toLowerCase()
        );
        if (normalizedCategory) {
          setCategoryFilter(normalizedCategory);
        }
      }
    }
  }, [cars, categories]);

  // Normalize transmission filter to match database format (case-insensitive matching)
  useEffect(() => {
    if (cars && transmissions.length > 0 && transmissionFilter !== "all") {
      // Check if current transmissionFilter value exists in transmissions (case-insensitive)
      const transmissionExists = transmissions.some(
        (trans) => trans.toLowerCase() === transmissionFilter.toLowerCase()
      );
      // If it doesn't match exactly, find the normalized version
      if (!transmissionExists || !transmissions.includes(transmissionFilter)) {
        const normalizedTransmission = transmissions.find(
          (trans) => trans.toLowerCase() === transmissionFilter.toLowerCase()
        );
        if (normalizedTransmission) {
          setTransmissionFilter(normalizedTransmission);
        }
      }
    }
  }, [cars, transmissions]);

  return (
    <>
      <SEO
        title={`Inventory - ${settings?.websiteName || "Auto Import Specialists"}`}
        description={`Browse our high-quality vehicles ready for import to Australia. ${settings?.websiteName || "Auto Import Specialists"} specializes in sourcing, shipping, and compliance for performance cars.`}
      />
      <div className="min-h-screen bg-background text-left">
        <div className="bg-card border-b">
          <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
            <h1 className="text-5xl font-bold mb-4 uppercase">Inventory</h1>
            <p className="text-lg text-muted-foreground">
              Browse vehicles sourced internationally for the Australian market
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-8 space-y-6">
            <div className="flex flex-col xl:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full text-left">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search cars by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-4 w-full xl:w-auto text-left">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
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

                <Select value={transmissionFilter} onValueChange={setTransmissionFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <Settings className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Transmission" />
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

                <Select value={seatsFilter} onValueChange={setSeatsFilter}>
                  <SelectTrigger className="w-full md:w-[160px]">
                    <SeatsIcon className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Seats" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Seats</SelectItem>
                    {seatOptions.map((seat) => (
                      <SelectItem key={seat} value={String(seat)}>
                        {seat}+ seats
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <ArrowUpAZ className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="seats-desc">Seats: Most to Least</SelectItem>
                    <SelectItem value="newest">Model Year: Newest</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("all");
                    setTransmissionFilter("all");
                    setSeatsFilter("all");
                    setSortOption("recommended");
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-64 w-full" />
                  <div className="p-6 space-y-4 text-left">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : currentCars.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No vehicles found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or search terms
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("all");
                  setTransmissionFilter("all");
                  setSeatsFilter("all");
                  setSortOption("recommended");
                }}
                variant="outline"
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 text-left">
                <div className="text-sm text-muted-foreground">
                  Showing {Math.min(indexOfLastItem, sortedCars.length)} of {sortedCars.length} {sortedCars.length === 1 ? "vehicle" : "vehicles"}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">Items per page:</div>
                  <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1); // Reset to first page when changing items per page
                  }}>
                    <SelectTrigger className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9">9</SelectItem>
                      <SelectItem value="12">12</SelectItem>
                      <SelectItem value="18">18</SelectItem>
                      <SelectItem value="24">24</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                {currentCars.map((car) => (
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
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                          {car.description}
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
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) {
                              setCurrentPage(currentPage - 1);
                            }
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) {
                              setCurrentPage(currentPage + 1);
                            }
                          }}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
