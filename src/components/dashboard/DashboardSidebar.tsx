import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  Globe,
  LogOut,
  Shield,
  TrendingUp,
  Building2,
  Layers,
  CreditCard,
  BarChart3,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const productIcons: Record<string, React.ReactNode> = {
  vpn: <Lock className="w-4 h-4" />,
  notify: <Bell className="w-4 h-4" />,
  articles: <Newspaper className="w-4 h-4" />,
  platform: <BarChart3 className="w-4 h-4" />,
};

const products = [{ id: "platform", name: "Platform" }];

const mainItems = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Products", url: "/dashboard/products", icon: Package },
  { title: "Users", url: "/dashboard/users", icon: Users },
];

const platformItems = [
  { title: "Overview", url: "/dashboard/platform", icon: BarChart3 },
  { title: "Users", url: "/dashboard/platform/users", icon: Users },
  { title: "Accounts", url: "/dashboard/platform/accounts", icon: CreditCard },
  {
    title: "Organizations",
    url: "/dashboard/platform/organizations",
    icon: Building2,
  },
  { title: "Products", url: "/dashboard/platform/products", icon: Layers },
  { title: "Growth", url: "/dashboard/platform/growth", icon: TrendingUp },
  { title: "Security", url: "/dashboard/platform/security", icon: ShieldAlert },
];

const bottomItems = [
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<string>(() => {
    return localStorage.getItem("selectedProduct") || "platform";
  });

  useEffect(() => {
    localStorage.setItem("selectedProduct", selectedProduct);
  }, [selectedProduct]);

  const isActive = (url: string) => location.pathname === url;

  const handleSignOut = async () => {
    await signOut();
    // Redirect to landing page
    window.location.href = "/";
  };

  const getProductRoute = (productId: string) => {
    switch (productId) {
      case "vpn":
        return "/dashboard/products/vpn";
      case "notify":
        return "/dashboard/notifications";
      case "articles":
        return "/dashboard/media";
      case "platform":
      default:
        return "/dashboard/platform";
    }
  };

  const getProductPlatformRoutes = (productId: string) => {
    if (productId === "notify") {
      return [
        {
          title: "Overview",
          url: "/dashboard/notifications/overview",
          icon: BarChart3,
        },
        { title: "Users", url: "/dashboard/notifications/users", icon: Users },
        {
          title: "Accounts",
          url: "/dashboard/notifications/accounts",
          icon: CreditCard,
        },
        {
          title: "Security",
          url: "/dashboard/notifications/security",
          icon: ShieldAlert,
        },
      ];
    }

    return [
      { title: "Overview", url: "/dashboard/platform", icon: BarChart3 },
      { title: "Users", url: "/dashboard/platform/users", icon: Users },
      {
        title: "Accounts",
        url: "/dashboard/platform/accounts",
        icon: CreditCard,
      },
      { title: "Growth", url: "/dashboard/platform/growth", icon: TrendingUp },
      {
        title: "Security",
        url: "/dashboard/platform/security",
        icon: ShieldAlert,
      },
    ];
  };

  const handleProductChange = (productId: string) => {
    setSelectedProduct(productId);
    navigate(getProductRoute(productId));
  };

  return (
    <Sidebar className="border-r border-border bg-background">
      <div className="px-4 py-6 border-b border-border/50">
        <Link
          to="/"
          className="group flex items-center gap-3 hover:opacity-80 transition-opacity duration-200"
        >
          <img
            src="/afrisic-logo.png"
            alt="Afrisinc"
            className="w-10 h-10 object-contain"
          />
          <div className="flex flex-col">
            <span className="font-bold text-foreground text-sm leading-tight">
              Afrisinc
            </span>
            <span className="text-xs text-muted-foreground">Dashboard</span>
          </div>
        </Link>
      </div>
      <SidebarContent>
        {/* Product Selector */}
        <SidebarGroup className="px-0 py-3">
          <div className="px-4">
            <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/60 mb-3">
              Product
            </p>
            <Select value={selectedProduct} onValueChange={handleProductChange}>
              <SelectTrigger className="w-full h-9 border-border/50 bg-background hover:border-border/80 transition-colors text-sm font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="w-[--radix-select-trigger-width]">
                {products.map((product) => (
                  <SelectItem
                    key={product.id}
                    value={product.id}
                    className="text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {productIcons[product.id]}
                      {product.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </SidebarGroup>

        {/* Dashboard */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/60">
            Overview
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`transition-all duration-200 ${
                      isActive(item.url)
                        ? "bg-primary/15 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Product-Specific Platform Routes */}
        {(selectedProduct === "platform" || selectedProduct === "notify") && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/60 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" />
              {selectedProduct === "platform" ? "Platform" : "Notify"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {selectedProduct === "platform"
                  ? platformItems.map((item) => (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                          asChild
                          className={`transition-all duration-200 ${
                            isActive(item.url)
                              ? "bg-primary/15 text-primary font-semibold"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                          }`}
                        >
                          <Link
                            to={item.url}
                            className="flex items-center gap-3"
                          >
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  : getProductPlatformRoutes(selectedProduct).map((item) => (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                          asChild
                          className={`transition-all duration-200 ${
                            isActive(item.url)
                              ? "bg-primary/15 text-primary font-semibold"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                          }`}
                        >
                          <Link
                            to={item.url}
                            className="flex items-center gap-3"
                          >
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {bottomItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`transition-all duration-200 ${
                      isActive(item.url)
                        ? "bg-primary/15 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="mt-auto px-4 py-5 border-t border-border/50 space-y-3">
        <Link
          to="/"
          className="group flex items-center gap-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 px-2 py-2"
        >
          <Globe className="w-4 h-4 flex-shrink-0" />
          Website
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 px-2 py-2 h-auto"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
          Sign Out
        </Button>
      </div>
    </Sidebar>
  );
};
