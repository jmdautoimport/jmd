import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Car, Inquiry } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Car as CarIcon, Plus, MessageSquare, CheckCircle, Package } from "lucide-react";
import { getThumbnailUrl } from "@/lib/imageUtils";
import { getAllCarsFirebase } from "@/lib/carsFirebase";
import { getAllInquiriesFirebase } from "@/lib/inquiriesFirebase";

export default function AdminDashboard() {
  const { data: cars, isLoading: isCarsLoading } = useQuery<Car[]>({
    queryKey: ["cars"],
    queryFn: getAllCarsFirebase,
  });

  const { data: inquiries, isLoading: isInquiriesLoading } = useQuery<Inquiry[]>({
    queryKey: ["inquiries"],
    queryFn: getAllInquiriesFirebase,
  });

  const isLoading = isCarsLoading || isInquiriesLoading;

  const stats = {
    total: cars?.length || 0,
    published: cars?.filter((car) => car.published !== false).length || 0,
    inquiries: inquiries?.length || 0,
    concierge: inquiries?.filter((inq) => !inq.carId).length || 0,
  };

  const recentCars = cars?.slice(0, 5) || [];

  return (
    <div className="text-left">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your inventory and customer sourcing requests</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-primary shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Total Inventory</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CarIcon className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-2 font-medium">Vehicles in stock/sourced</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-emerald-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Published</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-emerald-600">{stats.published}</div>
              <p className="text-xs text-muted-foreground mt-2 font-medium">Vehicles visible on website</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Total Inquiries</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-blue-600">{stats.inquiries}</div>
              <p className="text-xs text-muted-foreground mt-2 font-medium">Customer leads received</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-purple-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Concierge</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-purple-600">{stats.concierge}</div>
              <p className="text-xs text-muted-foreground mt-2 font-medium">Custom sourcing requests</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-2 border-b">
          <CardTitle className="font-bold">Recently Added Vehicles</CardTitle>
          <div className="flex gap-2">
            <Link href="/admin/cars">
              <Button variant="outline" size="sm" className="font-bold">
                View All
              </Button>
            </Link>
            <Link href="/admin/cars/new">
              <Button size="sm" className="font-bold">
                <Plus className="mr-2 h-4 w-4" />
                Add New Car
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-16 w-24 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentCars.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <CarIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Inventory is empty</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Ready to source your first car? Let's add it to the platform.
              </p>
              <Link href="/admin/cars/new">
                <Button className="font-bold">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Car
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {recentCars.map((car) => (
                <Link key={car.id} href={`/admin/cars/${car.id}/edit`}>
                  <div className="flex items-center gap-5 p-3 rounded-xl hover:bg-muted/50 transition-all cursor-pointer group border border-transparent hover:border-primary/10">
                    <div className="w-28 h-20 rounded-lg overflow-hidden border-2 border-muted flex-shrink-0 group-hover:border-primary/30 transition-colors">
                      <img
                        src={getThumbnailUrl(car.image, 320)}
                        alt={car.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg leading-none mb-2">{car.name}</h4>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-tight px-2">
                          {car.category}
                        </Badge>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          {car.year}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {car.transmission}
                        </span>
                      </div>
                    </div>
                    <Badge variant={car.published !== false ? "default" : "secondary"} className="font-bold">
                      {car.published !== false ? "Published" : "Draft"}
                    </Badge>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="h-4 w-4 rotate-45" />
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
