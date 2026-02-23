import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Inquiry, inquiryStatusSchema } from "@shared/schema";
import { getAllInquiriesFirebase, updateInquiryStatusFirebase, deleteInquiryFirebase } from "@/lib/inquiriesFirebase";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw, Mail, MessageSquare, Car, Sparkles, Eye, Phone, Calendar, MapPin, X } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { format } from "date-fns";

const STATUS_LABELS: Record<string, string> = {
  pending: "New",
  contacted: "Contacted",
  fulfilled: "Fulfilled",
  cancelled: "Archived",
};

const STATUS_VARIANTS: Record<string, "secondary" | "default" | "outline" | "destructive"> = {
  pending: "secondary",
  contacted: "default",
  fulfilled: "outline",
  cancelled: "destructive",
};

export default function AdminInquiries() {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const { data: inquiries, isLoading } = useQuery<Inquiry[]>({
    queryKey: ["inquiries"],
    queryFn: getAllInquiriesFirebase,
  });

  const stats = {
    total: inquiries?.length || 0,
    new: inquiries?.filter((b) => b.status === "pending").length || 0,
    contacted: inquiries?.filter((b) => b.status === "contacted").length || 0,
    concierge: inquiries?.filter((b) => !b.carId).length || 0,
  };

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateInquiryStatusFirebase(id, status as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      toast({
        title: "Inquiry updated",
        description: "The inquiry status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Unable to update status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInquiryFirebase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      toast({
        title: "Inquiry deleted",
        description: "The inquiry has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Unable to delete inquiry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["inquiries"] });
    setIsRefreshing(false);
  };

  return (
    <div className="text-left">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Inquiries</h1>
          <p className="text-muted-foreground">Manage customer car inquiries and concierge sourcing requests</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} className="font-bold">
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-blue-500 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Inquiries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-blue-600">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-orange-500 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">New / Unread</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-orange-600">{stats.new}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-green-500 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contacted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-green-600">{stats.contacted}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-purple-500 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Concierge</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-purple-600">{stats.concierge}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="font-bold">Recent Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
          ) : !inquiries || inquiries.length === 0 ? (
            <div className="text-center py-20">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground font-medium">No inquiries yet. Your leads will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest pl-6">Customer</TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest">Type</TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest">Details / Requirements</TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest">Status</TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inquiries.map((inquiry) => (
                    <TableRow key={inquiry.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setSelectedInquiry(inquiry)}>
                      <TableCell className="pl-6 py-4">
                        <div className="font-bold text-sm">
                          {inquiry.firstName} {inquiry.lastName}
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 mt-1">
                          <Mail className="h-3 w-3" /> {inquiry.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {inquiry.carId ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold uppercase py-0 px-2 shrink-0">
                              <Car className="h-3 w-3 mr-1" /> Car Inquiry
                            </Badge>
                          </div>
                        ) : inquiry.carName === "Contact Form Inquiry" ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-[10px] font-bold uppercase py-0 px-2 shrink-0">
                              <MessageSquare className="h-3 w-3 mr-1" /> General
                            </Badge>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-bold uppercase py-0 px-2 shrink-0">
                              <Sparkles className="h-3 w-3 mr-1" /> Concierge
                            </Badge>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {inquiry.carId ? (
                          <div className="space-y-1">
                            <div className="font-bold text-xs">{inquiry.carName}</div>
                            {inquiry.notes && <div className="text-xs text-muted-foreground italic line-clamp-1">"{inquiry.notes}"</div>}
                          </div>
                        ) : inquiry.carName === "Contact Form Inquiry" ? (
                           <div className="space-y-1">
                            <div className="font-bold text-xs">General Contact</div>
                            {inquiry.notes && <div className="text-xs text-muted-foreground italic line-clamp-2">"{inquiry.notes}"</div>}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex gap-2 items-center flex-wrap">
                              <Badge variant="secondary" className="text-[10px] font-bold">{inquiry.modelPreference || "Any Import"}</Badge>
                              <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">Budget: {inquiry.budget || "N/A"}</span>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">{inquiry.yearRange || "Any Year"}</span>
                            </div>
                            {inquiry.notes && <div className="text-xs text-muted-foreground italic line-clamp-1">"{inquiry.notes}"</div>}
                          </div>
                        )}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Select
                          defaultValue={inquiry.status}
                          onValueChange={(value) =>
                            statusMutation.mutate({ id: inquiry.id, status: value })
                          }
                        >
                          <SelectTrigger className="w-[140px] h-8 text-xs font-bold rounded-lg focus:ring-primary border-muted-foreground/20">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS_LABELS).map(([status, label]) => (
                              <SelectItem key={status} value={status}>
                                <Badge variant={STATUS_VARIANTS[status]} className="text-[10px] font-bold uppercase py-0">{label}</Badge>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedInquiry(inquiry)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive ml-1"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (window.confirm("Delete this inquiry? This cannot be undone.")) {
                              deleteMutation.mutate(inquiry.id);
                            }
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedInquiry} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-start pr-8">
              <div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                  Inquiry Details
                </DialogTitle>
                <DialogDescription className="sr-only">
                  View details for inquiry from {selectedInquiry?.firstName} {selectedInquiry?.lastName}
                </DialogDescription>
                <div className="flex gap-2 mt-2">
                  {selectedInquiry?.carId ? (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold uppercase">
                      <Car className="h-3 w-3 mr-1" /> Car Inquiry
                    </Badge>
                  ) : selectedInquiry?.carName === "Contact Form Inquiry" ? (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-[10px] font-bold uppercase">
                      <MessageSquare className="h-3 w-3 mr-1" /> General Contact
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-bold uppercase">
                      <Sparkles className="h-3 w-3 mr-1" /> Concierge Request
                    </Badge>
                  )}
                  <Badge variant={selectedInquiry ? STATUS_VARIANTS[selectedInquiry.status] : "outline"} className="text-[10px] font-bold uppercase">
                    {selectedInquiry ? STATUS_LABELS[selectedInquiry.status] : ""}
                  </Badge>
                </div>
              </div>
            </div>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-8 py-4">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Mail className="h-3 w-3" /> Customer Information
                  </h3>
                  <div className="space-y-2">
                    <div className="text-lg font-bold">{selectedInquiry.firstName} {selectedInquiry.lastName}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" /> {selectedInquiry.email}
                    </div>
                    {selectedInquiry.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" /> {selectedInquiry.phone}
                      </div>
                    )}
                    {selectedInquiry.address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" /> {selectedInquiry.address}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-3 w-3" /> Submission Date
                  </h3>
                  <div className="text-sm font-bold">
                    {selectedInquiry.createdAt ? format(new Date(selectedInquiry.createdAt), "PPP p") : "N/A"}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Inquiry Specific Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  {selectedInquiry.carId ? <Car className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />} 
                  Request Details
                </h3>
                
                {selectedInquiry.carId ? (
                  <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                    <div className="font-bold text-blue-900">{selectedInquiry.carName}</div>
                    <div className="text-xs text-blue-700/70 mt-1 uppercase font-bold tracking-wider">Vehicle of Interest</div>
                  </div>
                ) : selectedInquiry.carName !== "Contact Form Inquiry" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                      <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wider mb-1">Model Preference</div>
                      <div className="font-bold text-sm">{selectedInquiry.modelPreference || "Any"}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                      <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wider mb-1">Budget</div>
                      <div className="font-bold text-sm">{selectedInquiry.budget || "N/A"}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                      <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wider mb-1">Year Range</div>
                      <div className="font-bold text-sm">{selectedInquiry.yearRange || "Any"}</div>
                    </div>
                  </div>
                )}

                {selectedInquiry.notes && (
                  <div className="space-y-2 mt-4">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Message / Notes</div>
                    <div className="p-4 rounded-xl bg-muted/50 border border-muted-foreground/10 text-sm whitespace-pre-wrap italic">
                      "{selectedInquiry.notes}"
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <DialogClose asChild>
                  <Button variant="outline" className="font-bold">Close Details</Button>
                </DialogClose>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

