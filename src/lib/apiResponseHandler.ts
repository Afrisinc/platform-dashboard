import { toast } from "sonner";
import type { AxiosError } from "axios";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  resp_msg?: string;
  resp_code?: number;
  error?: string | { name?: string; message?: string };
}

export interface HandleResponseOptions {
  showSuccess?: boolean;
  showError?: boolean;
  successMessage?: string;
  errorMessage?: string;
  logDetails?: boolean;
}

const DEFAULT_OPTIONS: HandleResponseOptions = {
  showSuccess: true,
  showError: true,
  logDetails: true,
};

/**
 * Extract error message from various error formats
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiResponse;
    if (data?.resp_msg) return data.resp_msg;
    if (data?.error) {
      if (typeof data.error === "string") return data.error;
      if (typeof data.error === "object" && data.error?.message) {
        return data.error.message;
      }
    }
    if (data?.message) return data.message;
    return error.message || "An error occurred";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error) || "An unknown error occurred";
};

/**
 * Extract success message from response
 */
export const getSuccessMessage = (
  response: ApiResponse,
  defaultMessage: string = "Operation successful",
): string => {
  return response.resp_msg || response.message || defaultMessage;
};

/**
 * Handle API response with automatic toast notifications
 */
export const handleApiResponse = <T>(
  response: ApiResponse<T>,
  options: HandleResponseOptions = {},
): { success: boolean; data?: T; message: string } => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const message =
    response.resp_msg || response.message || "Operation completed";

  if (response.success) {
    if (opts.showSuccess) {
      toast.success(opts.successMessage || message);
    }
    if (opts.logDetails) {
      console.log("[API Response]", {
        resp_code: response.resp_code,
        resp_msg: response.resp_msg,
        data: response.data,
      });
    }
    return {
      success: true,
      data: response.data,
      message,
    };
  } else {
    const errorMsg = opts.errorMessage || message;
    if (opts.showError) {
      toast.error(errorMsg);
    }
    if (opts.logDetails) {
      console.error("[API Error]", {
        resp_code: response.resp_code,
        resp_msg: response.resp_msg,
        error: response.error,
      });
    }
    return {
      success: false,
      message: errorMsg,
    };
  }
};

/**
 * Handle API errors with automatic toast notifications
 */
export const handleApiError = (
  error: unknown,
  options: HandleResponseOptions = {},
): { success: false; message: string } => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const message = getErrorMessage(error);
  const displayMessage = opts.errorMessage || message;

  if (opts.showError) {
    toast.error(displayMessage);
  }

  if (opts.logDetails) {
    console.error("[API Error Details]", error);
  }

  return {
    success: false,
    message: displayMessage,
  };
};

/**
 * Wrapper for API calls with unified error/success handling
 */
export const executeApiCall = async <T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: HandleResponseOptions = {},
): Promise<{ success: boolean; data?: T; message: string }> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    const response = await apiCall();
    return handleApiResponse(response, opts);
  } catch (error) {
    return handleApiError(error, opts);
  }
};

/**
 * Format error details for display
 */
export const formatErrorDetails = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const message = getErrorMessage(error);
    return `[${status}] ${message}`;
  }
  return getErrorMessage(error);
};

/**
 * Check if response indicates success
 */
export const isApiSuccess = (response: unknown): boolean => {
  return response?.success === true;
};
