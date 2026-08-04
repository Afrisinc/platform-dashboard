import { useEffect } from "react";
import { useTheme } from "next-themes";
import { setThemeCookie } from "@/lib/theme";

/**
 * Hook to sync theme changes to shared Afrisinc cookie
 * Ensures theme preference is synchronized across all subdomains
 */
export function useThemeSync() {
  const { theme } = useTheme();

  useEffect(() => {
    if (
      theme &&
      (theme === "light" || theme === "dark" || theme === "system")
    ) {
      setThemeCookie(theme as "light" | "dark" | "system");
    }
  }, [theme]);
}
