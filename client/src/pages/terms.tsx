import { useQuery } from "@tanstack/react-query";
import { getWebsiteSettings } from "@/lib/websiteSettingsFirebase";
import ReactMarkdown from "react-markdown";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/seo";

export default function Terms() {
    const { data: settings, isLoading } = useQuery({
        queryKey: ["websiteSettings"],
        queryFn: getWebsiteSettings,
    });

    return (
        <>
            <SEO
                title="Terms and Conditions - Auto Import Specialists"
                description="Read our terms and conditions for importing high-quality vehicles to Australia. Professional sourcing, shipping, and compliance services."
            />
            <div className="min-h-screen bg-background pt-24 pb-12 text-left">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <Button variant="ghost" asChild className="mb-8">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                    </Button>

                    <h1 className="text-4xl font-bold mb-8 uppercase">Terms and Conditions</h1>

                    <Card>
                        <CardHeader>
                            <CardTitle>Agreement to Terms</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 text-muted-foreground">
                            {isLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-[90%]" />
                                    <Skeleton className="h-4 w-[95%]" />
                                    <Skeleton className="h-32 w-full" />
                                </div>
                            ) : (
                                <div className="prose prose-neutral dark:prose-invert max-w-none">
                                    <ReactMarkdown>
                                        {settings?.termsAndConditions || "Terms and conditions have not been set."}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
