import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ScrollToTop } from "@/components/ScrollToTop";
import { getCurrentTheme } from "@/lib/theme";
import { useThemeSync } from "@/hooks/useThemeSync";

// Public Pages removed - dashboard only

// Layout
import DashboardLayout from "./components/dashboard/DashboardLayout";

// Platform Admin Pages
import PlatformOverview from "./pages/platform/Overview";
import PlatformUsers from "./pages/platform/Users";
import PlatformAccounts from "./pages/platform/Accounts";
import PlatformOrganizations from "./pages/platform/Organizations";
import PlatformProducts from "./pages/platform/Products";
import ProductDetail from "./pages/platform/ProductDetail";
import PlatformGrowth from "./pages/platform/Growth";
import PlatformSecurity from "./pages/platform/Security";

import NotFound from "./pages/NotFound";
import TestComponent from "./pages/TestComponent";
import SSOCallback from "./pages/SSOCallback";

const queryClient = new QueryClient();

function AppContent() {
  useThemeSync();

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
          {/* SSO Callback Route */}
          <Route path="/sso/callback" element={<SSOCallback />} />

          {/* Platform Routes */}
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<PlatformOverview />} />
            <Route path="platform" element={<PlatformOverview />} />
            <Route path="platform/users" element={<PlatformUsers />} />
            <Route path="platform/accounts" element={<PlatformAccounts />} />
            <Route
              path="platform/organizations"
              element={<PlatformOrganizations />}
            />
            <Route path="platform/products" element={<PlatformProducts />} />
            <Route
              path="platform/products/:productId"
              element={<ProductDetail />}
            />
            <Route path="platform/growth" element={<PlatformGrowth />} />
            <Route path="platform/security" element={<PlatformSecurity />} />
          </Route>

          {/* Test Component Route */}
          <Route path="/testcomponent" element={<TestComponent />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

const App = () => {
  // Sync theme from shared cookie on mount
  useEffect(() => {
    const sharedTheme = getCurrentTheme();
    // Update next-themes storage to match shared cookie
    if (sharedTheme) {
      localStorage.setItem("theme", sharedTheme);
      document.documentElement.classList.toggle("dark", sharedTheme === "dark");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme={getCurrentTheme()}
          enableSystem
          storageKey="theme"
        >
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppContent />
          </TooltipProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;
