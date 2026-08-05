interface RuntimeConfig {
  apiUrl: string;
  authUiUrl: string;
}

let config: RuntimeConfig | null = null;
let configLoaded = false;

const getEnv = (key: string) => {
  const runtime = (window as unknown as Record<string, Record<string, string>>).__ENV__?.[key];
  if (runtime && !runtime.startsWith("__")) return runtime;
  return import.meta.env[key as keyof ImportMetaEnv] as string;
};

export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  if (configLoaded) return config!;

  try {
    const response = await fetch("/config.json", {
      cache: "no-store",
    });
    const fileConfig = response.ok ? await response.json() : {};

    config = {
      apiUrl: getEnv("VITE_API_URL") || fileConfig.apiUrl || "",
      authUiUrl: getEnv("VITE_AUTH_UI_URL") || fileConfig.authUiUrl || "",
    };
  } catch {
    config = {
      apiUrl: getEnv("VITE_API_URL") || "",
      authUiUrl: getEnv("VITE_AUTH_UI_URL") || "",
    };
  }

  configLoaded = true;
  return config;
}

export function getRuntimeConfig(): RuntimeConfig {
  if (!configLoaded || !config) {
    throw new Error("Call loadRuntimeConfig() first");
  }
  return config;
}

export function getConfigValue(key: keyof RuntimeConfig): string {
  return getRuntimeConfig()[key] || "";
}

export function isRuntimeConfigLoaded(): boolean {
  return configLoaded;
}
