import { useCallback } from "react";
import {
  handleApiResponse,
  handleApiError,
  type ApiResponse,
  type HandleResponseOptions,
} from "@/lib/apiResponseHandler";

/**
 * Hook for consistent API response handling across components
 * Usage:
 * const { executeCall } = useApiHandler();
 *
 * Example:
 * const result = await executeCall(
 *   async () => await enrollAccountInProduct(accountId, productData),
 *   { successMessage: "Product enrolled successfully" }
 * );
 */
export const useApiHandler = () => {
  const executeCall = useCallback(
    async <T>(
      apiCall: () => Promise<ApiResponse<T>>,
      options?: HandleResponseOptions,
    ) => {
      try {
        const response = await apiCall();
        return handleApiResponse(response, options);
      } catch (error) {
        return handleApiError(error, options);
      }
    },
    [],
  );

  const handleResponse = useCallback(
    (response: ApiResponse, options?: HandleResponseOptions) => {
      return handleApiResponse(response, options);
    },
    [],
  );

  const handleError = useCallback(
    (error: unknown, options?: HandleResponseOptions) => {
      return handleApiError(error, options);
    },
    [],
  );

  return {
    executeCall,
    handleResponse,
    handleError,
  };
};
