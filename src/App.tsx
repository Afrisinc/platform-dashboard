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
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { CookieBanner } from "@/components/CookieBanner";

// Public Pages removed - dashboard only

// Dashboard Pages
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardOverview from "./pages/dashboard/Overview";
import DashboardProducts from "./pages/dashboard/Products";
import VPNManagement from "./pages/dashboard/VPNManagement";
import DashboardUsers from "./pages/dashboard/Users";
import DashboardMedia from "./pages/dashboard/Media";
import DashboardNotifications from "./pages/dashboard/Notifications";
import DashboardSettings from "./pages/dashboard/Settings";
import AIContent from "./pages/dashboard/AIContent";

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

// Inject GA4 script
function injectGAScript() {
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  const debug = import.meta.env.VITE_GA_DEBUG === "true";
  const isProd = import.meta.env.MODE === "production";

  // Only load GA4 in production or when debug is enabled
  if (!gaId || (!isProd && !debug)) {
    return;
  }

  // Inject dataLayer and gtag function
  const win = window as Window & {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  };
  win.dataLayer = win.dataLayer || [];
  function gtag(...args: unknown[]) {
    win.dataLayer?.push(...args);
  }
  win.gtag = gtag;

  gtag("js", new Date());
  gtag("consent", "default", {
    ad_storage: "denied",
    analytics_storage: "denied",
    wait_for_update: 500,
  });
  gtag("config", gaId, {
    page_path: window.location.pathname,
    debug_mode: debug,
    send_page_view: false,
  });

  // Load GA4 script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);
}

const App = () => {
  // Inject GA4 script on component mount
  useEffect(() => {
    injectGAScript();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AnalyticsProvider>
                <ScrollToTop />
                <AuthProvider>
                  <Routes>
                    {/* SSO Callback Route */}
                    <Route path="/sso/callback" element={<SSOCallback />} />
                    {/* Dashboard Routes - at root level */}
                    <Route path="/" element={<DashboardLayout />}>
                      <Route index element={<DashboardOverview />} />
                      <Route path="ai-content" element={<AIContent />} />
                      <Route path="products" element={<DashboardProducts />} />
                      <Route path="products/vpn" element={<VPNManagement />} />
                      <Route path="users" element={<DashboardUsers />} />
                      <Route path="media" element={<DashboardMedia />} />
                      <Route
                        path="notifications"
                        element={<DashboardNotifications />}
                      />
                      <Route
                        path="notifications/overview"
                        element={<DashboardNotifications />}
                      />
                      <Route
                        path="notifications/users"
                        element={<DashboardNotifications />}
                      />
                      <Route
                        path="notifications/accounts"
                        element={<DashboardNotifications />}
                      />
                      <Route
                        path="notifications/security"
                        element={<DashboardNotifications />}
                      />
                      <Route path="settings" element={<DashboardSettings />} />

                      {/* Platform Admin Routes */}
                      <Route path="platform" element={<PlatformOverview />} />
                      <Route
                        path="platform/users"
                        element={<PlatformUsers />}
                      />
                      <Route
                        path="platform/accounts"
                        element={<PlatformAccounts />}
                      />
                      <Route
                        path="platform/organizations"
                        element={<PlatformOrganizations />}
                      />
                      <Route
                        path="platform/products"
                        element={<PlatformProducts />}
                      />
                      <Route
                        path="platform/products/:productId"
                        element={<ProductDetail />}
                      />
                      <Route
                        path="platform/growth"
                        element={<PlatformGrowth />}
                      />
                      <Route
                        path="platform/security"
                        element={<PlatformSecurity />}
                      />
                    </Route>

                    {/* Test Component Route */}
                    <Route path="/testcomponent" element={<TestComponent />} />

                    {/* Catch-all */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <CookieBanner />
                </AuthProvider>
              </AnalyticsProvider>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;
