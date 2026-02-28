import { useMemo, useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Car } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Fuel, Settings, Users as SeatsIcon, Search, ArrowLeft } from "lucide-react";
import { getAllCarsFirebase } from "@/lib/carsFirebase";
import { getThumbnailUrl } from "@/lib/imageUtils";
import { SEO } from "@/components/seo";
import { useWebsiteSettings } from "@/hooks/use-website-settings";
import { formatPrice } from "@/lib/utils";

export default function SoldInventory() {
    const settings = useWebsiteSettings();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    const { data: cars, isLoading } = useQuery<Car[]>({
        queryKey: ["cars"],
        queryFn: getAllCarsFirebase,
    });

    const soldCars = useMemo(() => {
        return cars?.filter(car => car.isSold === true && car.published !== false) || [];
    }, [cars]);

    const filteredCars = useMemo(() => {
        return soldCars.filter((car) => {
            const matchesSearch = car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                car.description.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });
    }, [soldCars, searchTerm]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCars = filteredCars.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCars.length / itemsPerPage);

    return (
        <>
            <SEO
                title={`Sold Inventory - ${settings?.websiteName || "Auto Import Specialists"}`}
                description={`View vehicles that have been successfully sourced and delivered to their new owners in Australia.`}
            />
            <div className="min-h-screen bg-background text-left">
                <div className="bg-card border-b">
                    <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
                        <Button variant="ghost" asChild className="mb-6 -ml-2">
                            <Link href="/inventory">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Inventory
                            </Link>
                        </Button>
                        <h1 className="text-5xl font-bold mb-4 uppercase">Sold Inventory</h1>
                        <p className="text-lg text-muted-foreground">
                            Vehicles successfully sourced and delivered to our clients
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                type="search"
                                placeholder="Search sold cars..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
                            />
                        </div>
                        <div className="text-sm text-muted-foreground whitespace-nowrap">
                            Showing {filteredCars.length} {filteredCars.length === 1 ? "vehicle" : "vehicles"}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
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
                        <div className="text-center py-20 border-2 border-dashed rounded-xl">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                                <Search className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No vehicles found</h3>
                            <p className="text-muted-foreground mb-6">
                                We haven't listed any sold vehicles yet.
                            </p>
                            <Button asChild variant="outline">
                                <Link href="/inventory">View Current Inventory</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                            {currentCars.map((car) => (
                                <Link key={car.id} href={`/inventory/${car.slug}`}>
                                    <Card className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer h-full border-2 hover:border-red-500 transition-colors relative group">
                                        <div className="absolute top-4 right-4 z-10">
                                            <Badge className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1 shadow-lg">
                                                SOLD
                                            </Badge>
                                        </div>
                                        <div className="aspect-[4/3] overflow-hidden grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500">
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
                                                    <div className="flex gap-2 mb-2">
                                                        <Badge variant="default" className="text-[10px] uppercase font-bold tracking-tight bg-primary text-primary-foreground">
                                                            {car.category}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tight border-blue-500 text-blue-500">
                                                            {car.year}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-lg font-bold text-foreground">
                                                        {formatPrice(car.price, 'SOLD')}
                                                    </div>
                                                    <div className="text-xs font-semibold text-muted-foreground">
                                                        {car.kms ? `Mileage: ${car.kms}` : ''}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                                                {car.description}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mb-6">
                                                <div className="flex items-center gap-1.5">
                                                    <SeatsIcon className="h-3.5 w-3.5" />
                                                    <span>{car.seats} Seats</span>
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
                                            <Button variant="outline" className="w-full font-bold group border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                                                View Details
                                            </Button>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
