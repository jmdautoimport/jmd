import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Car, insertCarSchema, InsertCar } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Plus, X, ArrowUp, ArrowDown, Star, ImagePlus } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import {
  createCarFirebase,
  getCarByIdFirebase,
  updateCarFirebase,
} from "@/lib/carsFirebase";
import {
  uploadImage,
  isImageFile,
  isValidFileSize,
  createImagePreview,
  revokeImagePreview,
} from "@/lib/imageUpload";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const categories = ["Sedan", "SUV", "Sports", "Luxury", "Electric", "Compact"];
const transmissions = ["Automatic", "Manual"];
const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid"];

type GalleryItem = {
  id: string;
  url: string;
  file?: File;
  previewUrl?: string;
  isCover: boolean;
};

export default function CarForm() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isEdit = !!id;

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const ensureCoverExists = (items: GalleryItem[]): GalleryItem[] => {
    if (items.length === 0) {
      return [];
    }
    if (items.some((item) => item.isCover)) {
      return items;
    }
    return items.map((item, index) => ({
      ...item,
      isCover: index === 0,
    }));
  };

  const handleGalleryFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      if (!isImageFile(file)) {
        toast({
          title: "Invalid File",
          description: "All files must be image files",
          variant: "destructive",
        });
        return;
      }
      if (!isValidFileSize(file)) {
        toast({
          title: "File Too Large",
          description: "All images must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
    }

    const hasCover = galleryItems.some((item) => item.isCover);
    const newItems: GalleryItem[] = files.map((file, index) => {
      const previewUrl = createImagePreview(file);
      return {
        id: crypto.randomUUID(),
        url: previewUrl,
        file,
        previewUrl,
        isCover: !hasCover && index === 0,
      };
    });

    setGalleryItems((prev) => [...prev, ...newItems]);
    // Reset file input so the same file can be selected again
    event.target.value = "";
  };

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid image URL",
        variant: "destructive",
      });
      return;
    }

    const hasCover = galleryItems.some((item) => item.isCover);
    const newItem: GalleryItem = {
      id: crypto.randomUUID(),
      url: trimmed,
      isCover: !hasCover,
    };

    setGalleryItems((prev) => [...prev, newItem]);
    setImageUrlInput("");
  };

  const removeGalleryItem = (id: string) => {
    setGalleryItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) {
        revokeImagePreview(target.previewUrl);
      }
      const updated = prev.filter((item) => item.id !== id);
      return ensureCoverExists(updated);
    });
  };

  const setCoverImage = (id: string) => {
    setGalleryItems((prev) =>
      prev.map((item) => ({
        ...item,
        isCover: item.id === id,
      })),
    );
  };

  const moveGalleryItem = (id: string, direction: "up" | "down") => {
    setGalleryItems((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      if (index === -1) return prev;
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const updated = [...prev];
      const [removed] = updated.splice(index, 1);
      updated.splice(newIndex, 0, removed);
      return updated;
    });
  };

  const prepareGalleryForSubmit = async () => {
    if (galleryItems.length === 0) {
      throw new Error("Please add at least one image");
    }

    const uploadedItems: GalleryItem[] = [];
    for (const item of galleryItems) {
      if (item.file) {
        const uploadedUrl = await uploadImage(item.file);
        if (item.previewUrl) {
          revokeImagePreview(item.previewUrl);
        }
        uploadedItems.push({
          ...item,
          url: uploadedUrl,
          file: undefined,
          previewUrl: undefined,
        });
      } else {
        uploadedItems.push(item);
      }
    }

    const normalized = ensureCoverExists(uploadedItems);
    setGalleryItems(normalized);

    const cover = normalized.find((item) => item.isCover) || normalized[0];
    const others = normalized
      .filter((item) => item.id !== cover.id)
      .map((item) => item.url);

    return { coverUrl: cover.url, galleryUrls: others };
  };

  const { data: car, isLoading, error } = useQuery<Car | undefined>({
    queryKey: ["carById", id],
    enabled: isEdit && !!id,
    queryFn: () => {
      if (!id) {
        throw new Error("Car ID is required");
      }
      return getCarByIdFirebase(id);
    },
  });

  const form = useForm<InsertCar>({
    resolver: zodResolver(insertCarSchema),
    defaultValues: {
      name: "",
      category: "Sedan",
      description: "",
      image: "",
      images: [],
      seats: 5,
      transmission: "Automatic",
      fuelType: "Petrol",
      luggage: 2,
      doors: 4,
      year: new Date().getFullYear(),
      hasGPS: false,
      hasBluetooth: false,
      hasAC: true,
      hasUSB: false,
      isComingSoon: false,
      price: "",
      kms: "",
      consumption: "",
      engine: "",
      power: "",
      drivetrain: "RWD",
      exteriorColor: "",
      interiorColor: "",
      isSold: false,
      published: true,
    },
  });

  useEffect(() => {
    form.register("image");
    form.register("images");
  }, [form]);

  // Only reset the form when car data is loaded and the form hasn't been modified
  useEffect(() => {
    if (isEdit && car && !form.formState.isDirty) {
      const carData = car as Car;
      form.reset({
        name: carData.name as string,
        category: carData.category as string,
        description: carData.description as string,
        image: carData.image as string,
        images: carData.images || [],
        seats: carData.seats as number,
        transmission: carData.transmission as string,
        fuelType: carData.fuelType as string,
        luggage: carData.luggage as number,
        doors: carData.doors as number,
        year: carData.year as number,
        hasGPS: carData.hasGPS as boolean,
        hasBluetooth: carData.hasBluetooth as boolean,
        hasAC: carData.hasAC as boolean,
        hasUSB: carData.hasUSB as boolean,
        isComingSoon: (carData.isComingSoon as boolean) || false,
        price: (carData.price as string) || "",
        kms: (carData.kms as string) || "",
        consumption: (carData.consumption as string) || "",
        engine: (carData.engine as string) || "",
        power: (carData.power as string) || "",
        drivetrain: (carData.drivetrain as string) || "RWD",
        exteriorColor: (carData.exteriorColor as string) || "",
        interiorColor: (carData.interiorColor as string) || "",
        isSold: (carData.isSold as boolean) || false,
        published: carData.published !== undefined ? (carData.published as boolean) : true,
      });
    }
  }, [car, isEdit, form, form.formState.isDirty]);

  useEffect(() => {
    if (isEdit && car && galleryItems.length === 0) {
      const existing: GalleryItem[] = [];
      if (car.image) {
        existing.push({
          id: crypto.randomUUID(),
          url: car.image as string,
          isCover: true,
        });
      }
      ((car.images as string[]) || []).forEach((url: string) => {
        if (!url) return;
        existing.push({
          id: crypto.randomUUID(),
          url,
          isCover: false,
        });
      });
      setGalleryItems(existing);
    }
  }, [car, isEdit, galleryItems.length]);

  useEffect(() => {
    if (galleryItems.length === 0) {
      form.setValue("image", "", { shouldDirty: false });
      form.setValue("images", [], { shouldDirty: false });
      return;
    }
    const cover = galleryItems.find((item) => item.isCover) || galleryItems[0];
    const others = galleryItems
      .filter((item) => item.id !== cover.id)
      .map((item) => item.url);
    form.setValue("image", cover.url, { shouldDirty: false });
    form.setValue("images", others, { shouldDirty: false });
  }, [galleryItems, form]);

  useEffect(() => {
    return () => {
      galleryItems.forEach((item) => {
        if (item.previewUrl) {
          revokeImagePreview(item.previewUrl);
        }
      });
    };
  }, [galleryItems]);

  const createMutation = useMutation({
    mutationFn: (data: InsertCar) => createCarFirebase(data),
    onSuccess: () => {
      setIsUploading(false);
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      toast({
        title: "Success",
        description: "Car created successfully",
      });
    },
    onError: (error: unknown) => {
      setIsUploading(false);
      console.error("Create car error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create car";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: InsertCar) => updateCarFirebase(id!, data),
    onSuccess: () => {
      setIsUploading(false);
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      queryClient.invalidateQueries({ queryKey: ["carById", id] });
      toast({
        title: "Success",
        description: "Car updated successfully",
      });
      // Remain on page after save
    },
    onError: () => {
      setIsUploading(false);
      toast({
        title: "Error",
        description: "Failed to update car",
        variant: "destructive",
      });
    },
  });

  // Helper to check if a URL is a blob URL (preview URL)
  const onSubmit = async (data: InsertCar) => {
    setIsUploading(true);
    try {
      const { coverUrl, galleryUrls } = await prepareGalleryForSubmit();

      const submitData: InsertCar = {
        ...data,
        image: coverUrl,
        images: galleryUrls,
      };

      if (isEdit) {
        updateMutation.mutate(submitData);
      } else {
        createMutation.mutate(submitData);
      }
    } catch (error) {
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Failed to upload images",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };


  if (isEdit && isLoading) {
    return (
      <div className="max-w-4xl">
        <Skeleton className="h-10 w-48 mb-8" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isEdit && error) {
    console.error("Error loading car:", error);
    return (
      <div className="max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => setLocation("/admin/cars")}
          className="mb-8"
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cars
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Car Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The car you're looking for doesn't exist or may have been deleted.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Car ID: {id}
              </p>
              <Button onClick={() => setLocation("/admin/cars")}>
                Back to Cars List
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Form {...form}>
      <div className="max-w-4xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Button
              variant="ghost"
              onClick={() => setLocation("/admin/cars")}
              data-testid="button-back"
              size="sm"
              className="px-2 sm:px-4"
            >
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Back to Inventory</span>
            </Button>
            <h1 className="text-xl sm:text-3xl font-bold truncate flex-1 sm:flex-none">
              {isEdit ? "Edit Vehicle" : "Add New Vehicle"}
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border rounded-xl px-4 py-2 mr-2">
                  <FormLabel className="text-sm font-bold m-0 cursor-pointer">Published</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-published-header"
                      className="scale-90"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/admin/cars")}
              data-testid="button-close"
              size="sm"
              className="px-2 sm:px-4"
            >
              <X className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Close</span>
            </Button>
            <Button
              type="submit"
              form="car-form"
              disabled={isUploading}
              className="sm:min-w-[120px]"
              size="sm"
              data-testid="button-save"
            >
              <Save className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{isUploading ? "Saving..." : "Save Changes"}</span>
              <span className="sm:hidden">{isUploading ? "Saving..." : "Save"}</span>
            </Button>
          </div>
        </div>

        <form id="car-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Car Model / Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Nissan Skyline R34 GT-R" {...field} data-testid="input-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. $89,990 Drive Away or POA" {...field} value={field.value || ""} data-testid="input-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="kms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kilometers (KMs)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 45,000 km or Delivery Miles" {...field} value={field.value || ""} data-testid="input-kms" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <div className="bg-white">
                        <ReactQuill
                          theme="snow"
                          value={field.value}
                          onChange={field.onChange}
                          className="h-64 mb-12"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                      <FormLabel>Gallery</FormLabel>
                      <FormDescription>
                        Upload images or paste URLs, then reorder and choose a cover photo.
                      </FormDescription>
                    </div>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryFilesChange}
                        className="cursor-pointer"
                        data-testid="input-gallery-files"
                      />
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://example.com/car.jpg"
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          data-testid="input-gallery-url"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddImageUrl}
                          className="flex items-center gap-2"
                        >
                          <ImagePlus className="h-4 w-4" />
                          Add URL
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {galleryItems.length === 0 ? (
                  <div className="border rounded-lg p-6 text-center text-muted-foreground">
                    No images yet. Upload files or add URLs above.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {galleryItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex flex-col md:flex-row gap-4 border rounded-lg p-3"
                      >
                        <div className="relative w-full md:w-48 h-32 rounded-md overflow-hidden border bg-muted">
                          <img
                            src={item.url}
                            alt={`Gallery item ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {item.isCover && (
                            <Badge className="absolute top-2 left-2 flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              Cover
                            </Badge>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="flex flex-wrap gap-2">
                            {!item.isCover && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setCoverImage(item.id)}
                              >
                                Set as cover
                              </Button>
                            )}
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              disabled={index === 0}
                              onClick={() => moveGalleryItem(item.id, "up")}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              disabled={index === galleryItems.length - 1}
                              onClick={() => moveGalleryItem(item.id, "down")}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              onClick={() => removeGalleryItem(item.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          {item.file && (
                            <p className="text-xs text-muted-foreground">
                              Pending upload • {item.file.name}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Production Year</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                          data-testid="input-year"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="transmission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transmission</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-transmission">
                            <SelectValue placeholder="Select transmission" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {transmissions.map((trans) => (
                            <SelectItem key={trans} value={trans}>
                              {trans}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fuelType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuel Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-fuel-type">
                            <SelectValue placeholder="Select fuel type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fuelTypes.map((fuel) => (
                            <SelectItem key={fuel} value={fuel}>
                              {fuel}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="seats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seats</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                          data-testid="input-seats"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="doors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doors</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                          data-testid="input-doors"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="luggage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Luggage</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                          data-testid="input-luggage"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="engine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Engine</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 2.0L petrol engine" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="power"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Power</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 134 hp" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="consumption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consumption</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 10.0L/100Km" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="drivetrain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Drivetrain</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select drivetrain" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="RWD">RWD</SelectItem>
                          <SelectItem value="FWD">FWD</SelectItem>
                          <SelectItem value="AWD">AWD</SelectItem>
                          <SelectItem value="4WD">4WD</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="exteriorColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exterior Color</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Arctic White" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="interiorColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interior Color</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Black Leather" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features & Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="hasGPS"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">GPS Navigation</FormLabel>
                        <FormDescription>Built-in GPS system</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-gps"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hasBluetooth"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Bluetooth</FormLabel>
                        <FormDescription>Wireless connectivity</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-bluetooth"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hasAC"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Air Conditioning</FormLabel>
                        <FormDescription>Climate control</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-ac"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hasUSB"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">USB Ports</FormLabel>
                        <FormDescription>Device charging</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-usb"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="isComingSoon"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Coming Soon / On the Way</FormLabel>
                        <FormDescription>
                          Mark as already sourced and on way to Australia
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-coming-soon"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isSold"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Mark as Sold</FormLabel>
                        <FormDescription>
                          Move this car to the "Sold" inventory page
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-is-sold"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />


              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verified Asset Dossier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="dossierTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dossier Title</FormLabel>
                      <FormDescription>
                        Short heading for this verification summary, shown on the vehicle page.
                      </FormDescription>
                      <FormControl>
                        <Input placeholder="Vehicle Integrity" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="auctionGrade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Auction Grade</FormLabel>
                      <FormDescription>
                        Enter the auction house grade, e.g. 4.5, 4, 3.5, R or RA.
                      </FormDescription>
                      <FormControl>
                        <Input placeholder="e.g. 4.5B" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="verifiedMileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verified Mileage</FormLabel>
                      <FormDescription>
                        Describe how the mileage has been confirmed, e.g. Verified, Genuine, Unknown.
                      </FormDescription>
                      <FormControl>
                        <Input placeholder="e.g. Verified" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accidentHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accident History</FormLabel>
                      <FormDescription>
                        Summarise any known accident or repair history, e.g. None, Minor repair.
                      </FormDescription>
                      <FormControl>
                        <Input placeholder="e.g. None" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="dossierText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Auction Sheet Decode Text</FormLabel>
                    <FormDescription>
                      Plain English explanation of the auction sheet notes, damage marks and inspector comments.
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="Description of the auction sheet verification..."
                        className="min-h-[100px]"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="submit"
              size="lg"
              disabled={createMutation.isPending || updateMutation.isPending || isUploading}
              data-testid="button-submit"
            >
              <Save className="mr-2 h-4 w-4" />
              {isUploading
                ? "Uploading Images..."
                : createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : isEdit
                    ? "Update Car"
                    : "Create Car"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setLocation("/admin/cars")}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Form>
  );
}
