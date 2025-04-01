
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
