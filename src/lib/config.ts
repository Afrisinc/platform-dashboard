export interface RuntimeConfig {
  serverUrl: string;
  apiUrl: string;
  authUiUrl: string;
}

let config: RuntimeConfig | null = null;
let configLoaded = false;

export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  if (configLoaded) {
    return config!;
  }

  const getEnvValue = (key: string) => {
    const windowEnv =
      typeof window !== "undefined" && (window as any).__ENV__
        ? (window as any).__ENV__[key]
        : null;
    if (windowEnv && !windowEnv.startsWith("__")) {
      return windowEnv;
    }
    return (import.meta.env as any)[key];
  };

  try {
    const response = await fetch("/config.json", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    let runtimeConfig: Partial<RuntimeConfig> = {};
    if (response.ok) {
      runtimeConfig = await response.json();
    }

    const apiUrl = getEnvValue("VITE_API_URL") || runtimeConfig.apiUrl || "";
    config = {
      serverUrl: apiUrl,
      apiUrl: apiUrl,
      authUiUrl:
        getEnvValue("VITE_AUTH_UI_URL") || runtimeConfig.authUiUrl || "",
    };

    configLoaded = true;
    return config;
  } catch {
    const apiUrl = getEnvValue("VITE_API_URL") || "";
    config = {
      serverUrl: apiUrl,
      apiUrl: apiUrl,
      authUiUrl: getEnvValue("VITE_AUTH_UI_URL") || "",
    };
    configLoaded = true;
    return config;
  }
}

export function getRuntimeConfig(): RuntimeConfig {
  if (!configLoaded || !config) {
    throw new Error(
      "Configuration not loaded. Call loadRuntimeConfig() first.",
    );
  }
  return config;
}

export function getConfigValue(key: keyof RuntimeConfig): string {
  const cfg = getRuntimeConfig();
  return cfg[key] || "";
}

export function isRuntimeConfigLoaded(): boolean {
  return configLoaded;
}
