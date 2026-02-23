import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Car } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Eye, Copy } from "lucide-react";
import { useState } from "react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { deleteCarFirebase, getAllCarsFirebase, duplicateCarFirebase } from "@/lib/carsFirebase";
import { getThumbnailUrl } from "@/lib/imageUtils";

export default function CarsList() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: cars, isLoading } = useQuery<Car[]>({
    queryKey: ["cars"],
    queryFn: getAllCarsFirebase,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCarFirebase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      queryClient.invalidateQueries({ queryKey: ["carById"] });
      toast({
        title: "Success",
        description: "Car deleted successfully",
      });
      setDeleteId(null);
    },
    onError: (error: unknown) => {
      console.error("Delete mutation error:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : "Failed to delete car";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setDeleteId(null);
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => duplicateCarFirebase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      toast({
        title: "Success",
        description: "Car duplicated successfully",
      });
    },
    onError: (error: unknown) => {
      console.error("Duplicate mutation error:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : "Failed to duplicate car";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Manage Inventory</h1>
          <p className="text-muted-foreground">View and manage all vehicles in your current inventory</p>
        </div>
        <Link href="/admin/cars/new">
          <Button size="lg" data-testid="button-add-car" className="font-bold">
            <Plus className="mr-2 h-4 w-4" />
            Add New Car
          </Button>
        </Link>
      </div>

      <Card className="shadow-sm">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-16 w-24 rounded-md" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : !cars || cars.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No vehicles yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Get started by adding your first vehicle to the inventory
            </p>
            <Link href="/admin/cars/new">
              <Button className="font-bold">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Car
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest pl-6">Image</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest">Name</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest">Category</TableHead>

                  <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cars.map((car) => {
                  if (!car.id) {
                    console.warn("Car missing ID:", car);
                  }
                  return (
                    <TableRow
                      key={car.id || car.slug}
                      data-testid={`row-car-${car.id || car.slug}`}
                      className="cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={(e) => {
                        // Don't navigate if clicking on action buttons
                        const target = e.target as HTMLElement;
                        if (target.closest('button') || target.closest('a')) {
                          return;
                        }
                        if (!car.id) {
                          console.error("Cannot edit car without ID:", car);
                          toast({
                            title: "Error",
                            description: "Car ID is missing. Please refresh the page.",
                            variant: "destructive",
                          });
                          return;
                        }
                        setLocation(`/admin/cars/${car.id}/edit`);
                      }}
                    >
                      <TableCell className="pl-6 py-4">
                        <div className="w-24 h-16 rounded-lg overflow-hidden border bg-muted shadow-sm">
                          <img
                            src={getThumbnailUrl(car.image, 320)}
                            alt={car.name}
                            className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-300"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-sm tracking-tight">{car.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px] font-bold uppercase py-0">{car.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {car.isComingSoon && (
                            <Badge className="text-[10px] font-bold uppercase py-0 w-fit bg-blue-600 hover:bg-blue-600">
                              Coming Soon
                            </Badge>
                          )}
                          {car.isSold && (
                            <Badge className="text-[10px] font-bold uppercase py-0 w-fit bg-red-600 hover:bg-red-600">
                              Sold
                            </Badge>
                          )}
                          {!car.published && (
                            <Badge variant="destructive" className="text-[10px] font-bold uppercase py-0 w-fit">
                              Unpublished
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/inventory/${car.slug}`} target="_blank">
                            <Button size="icon" variant="ghost" data-testid={`button-view-${car.id}`} className="hover:bg-blue-50 hover:text-blue-600 rounded-lg">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="hover:bg-emerald-50 hover:text-emerald-600 rounded-lg"
                            title="Duplicate"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (car.id) {
                                duplicateMutation.mutate(car.id);
                              }
                            }}
                            disabled={duplicateMutation.isPending}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Link href={car.id ? `/admin/cars/${car.id}/edit` : '#'}>
                            <Button
                              size="icon"
                              variant="ghost"
                              data-testid={`button-edit-${car.id || car.slug}`}
                              disabled={!car.id}
                              className="hover:bg-orange-50 hover:text-orange-600 rounded-lg"
                              onClick={(e) => {
                                if (!car.id) {
                                  e.preventDefault();
                                  toast({
                                    title: "Error",
                                    description: "Car ID is missing. Please refresh the page.",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="hover:bg-red-50 hover:text-red-600 rounded-lg"
                            onClick={() => {
                              if (!car.id) {
                                toast({
                                  title: "Error",
                                  description: "Car ID is missing. Cannot delete.",
                                  variant: "destructive",
                                });
                                return;
                              }
                              setDeleteId(car.id);
                            }}
                            disabled={!car.id}
                            data-testid={`button-delete-${car.id || car.slug}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="font-medium">
              This action cannot be undone. This will permanently delete the vehicle
              from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel data-testid="button-cancel-delete" className="rounded-xl font-bold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleteId) {
                  toast({
                    title: "Error",
                    description: "Car ID is missing. Cannot delete.",
                    variant: "destructive",
                  });
                  return;
                }
                console.log("Deleting car with ID:", deleteId);
                deleteMutation.mutate(deleteId);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-bold"
              data-testid="button-confirm-delete"
            >
              Delete Vehicle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}