
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccessibilityMenu from "@/components/AccessibilityMenu";
import "./globals.css";

// Create client component to wrap providers
import dynamic from "next/dynamic";

const Providers = dynamic(() => import("@/components/Providers"), { ssr: false });

export const metadata = {
  title: "Samarthanam Trust - Empowering Lives Through Inclusive Technology",
  description: "Join Samarthanam Trust in our mission to support visually impaired, disabled, and underprivileged individuals through accessibility, education, and community.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <AccessibilityMenu />
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
