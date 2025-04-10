
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

// Import all pages
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

// Navigation logger component to track route changes
const NavigationLogger = () => {
  const location = useLocation();
  
  useEffect(() => {
    console.log(`Navigation: Route changed to: ${location.pathname}`, {
      search: location.search,
      state: location.state
    });
  }, [location]);
  
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <NavigationLogger />
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
