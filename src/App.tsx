
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Index from "./pages/Index";
import AboutPage from "./pages/AboutPage";
import ExamplesPage from "./pages/ExamplesPage";
import SoftwarePage from "./pages/SoftwarePage";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";
import BlogPage from "./pages/BlogPage";
import WebinarsPage from "./pages/WebinarsPage";
import DocumentationPage from "./pages/DocumentationPage";
import PricingPage from "./pages/PricingPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import CareerPage from "./pages/CareerPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfUsePage from "./pages/TermsOfUsePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerificationPage from "./pages/VerificationPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import DashboardHome from "./pages/DashboardHome";
import WorkspaceSettingsPage from "./pages/WorkspaceSettingsPage";
import CandidatesPage from "./pages/CandidatesPage";
import CandidateDetailsPage from "./pages/CandidateDetailsPage";
import VectorSearchPage from "./components/candidates/VectorSearchPage";
import CampaignsPage from "./pages/CampaignsPage";
import CampaignDetailsPage from "./pages/CampaignDetailsPage";

const queryClient = new QueryClient();

// Create an auth context listener wrapper
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      // Show toast for successful sign in and sign out events
      if (event === 'SIGNED_IN') {
        toast({
          title: "Zalogowano pomyślnie",
          description: "Zostałeś pomyślnie zalogowany."
        });
      } else if (event === 'SIGNED_OUT') {
        toast({
          title: "Wylogowano pomyślnie",
          description: "Zostałeś pomyślnie wylogowany."
        });
      }
    });
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/o-nas" element={<AboutPage />} />
            <Route path="/przyklady" element={<ExamplesPage />} />
            <Route path="/oprogramowanie" element={<SoftwarePage />} />
            <Route path="/kontakt" element={<ContactPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/webinary" element={<WebinarsPage />} />
            <Route path="/dokumentacja" element={<DocumentationPage />} />
            <Route path="/cennik" element={<PricingPage />} />
            <Route path="/integracje" element={<IntegrationsPage />} />
            <Route path="/kariera" element={<CareerPage />} />
            <Route path="/polityka-prywatnosci" element={<PrivacyPolicyPage />} />
            <Route path="/warunki-uzytkowania" element={<TermsOfUsePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verification" element={<VerificationPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardPage />}>
              <Route index element={<DashboardHome />} />
              <Route path="settings" element={<WorkspaceSettingsPage />} />
              <Route path="candidates" element={<CandidatesPage />} />
              <Route path="candidates/search" element={<VectorSearchPage />} />
              <Route path="candidates/:id" element={<CandidateDetailsPage />} />
              <Route path="campaigns" element={<CampaignsPage />} />
              <Route path="campaigns/:id" element={<CampaignDetailsPage />} />
              {/* Add more dashboard routes as needed */}
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
