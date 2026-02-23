import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/seo";
import { useWebsiteSettings } from "@/hooks/use-website-settings";

export default function Privacy() {
  const { settings } = useWebsiteSettings();
  const companyName = settings?.companyName || "Auto Import Specialists";
  const email = settings?.email || "info@jdmautoimports.com.au";

  return (
    <>
      <SEO
        title={`Privacy Policy - ${companyName}`}
        description="Our privacy policy outlines how we collect, use, and protect your personal information."
      />
      <div className="min-h-screen bg-background pt-24 pb-12 text-left">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Button variant="ghost" asChild className="mb-8">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          <h1 className="text-4xl font-bold mb-8 uppercase">Privacy Policy</h1>

          <Card>
            <CardHeader>
              <CardTitle>Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-muted-foreground">
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p>Last updated: {new Date().toLocaleDateString()}</p>

                <h3>1. Introduction</h3>
                <p>
                  Welcome to {companyName} ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our website and in using our services. This Privacy Policy applies to our website and describes how we handle personal information and respect your privacy rights.
                </p>

                <h3>2. Information We Collect</h3>
                <p>
                  We may collect the following types of information:
                </p>
                <ul>
                  <li><strong>Personal Information:</strong> Name, email address, phone number, and postal address when you fill out forms or contact us.</li>
                  <li><strong>Vehicle Preferences:</strong> Information about the vehicles you are interested in importing or purchasing.</li>
                  <li><strong>Usage Data:</strong> Information about how you interact with our website, such as IP address, browser type, and pages visited.</li>
                </ul>

                <h3>3. How We Use Your Information</h3>
                <p>
                  We use the information we collect to:
                </p>
                <ul>
                  <li>Provide and improve our vehicle import and compliance services.</li>
                  <li>Respond to your inquiries and communicate with you.</li>
                  <li>Process transactions and manage your orders.</li>
                  <li>Send administrative information, such as updates to our terms and policies.</li>
                </ul>

                <h3>4. Sharing Your Information</h3>
                <p>
                  We do not sell, trade, or otherwise transfer your personal information to outside parties except as described below:
                </p>
                <ul>
                  <li><strong>Service Providers:</strong> We may share information with trusted third parties who assist us in operating our website, conducting our business, or serving you (e.g., shipping companies, compliance workshops), so long as those parties agree to keep this information confidential.</li>
                  <li><strong>Legal Requirements:</strong> We may disclose your information when we believe it is appropriate to comply with the law, enforce our site policies, or protect ours or others' rights, property, or safety.</li>
                </ul>

                <h3>5. Data Security</h3>
                <p>
                  We implement a variety of security measures to maintain the safety of your personal information. However, please be aware that no method of transmission over the internet or method of electronic storage is 100% secure.
                </p>

                <h3>6. Your Rights</h3>
                <p>
                  Depending on your location, you may have certain rights regarding your personal information, such as the right to access, correct, or delete your data. To exercise these rights, please contact us at {email}.
                </p>

                <h3>7. Changes to This Privacy Policy</h3>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
                </p>

                <h3>8. Contact Us</h3>
                <p>
                  If you have any questions about this Privacy Policy, please contact us via email at {email}.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
