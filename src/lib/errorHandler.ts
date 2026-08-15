interface AxiosErrorLike {
  response?: {
    status?: number;
    data?: unknown;
  };
  message?: string;
}

export function getErrorMessage(error: unknown): string {
  const err = error as AxiosErrorLike;

  if (err?.response?.data) {
    const data = err.response.data as Record<string, unknown>;

    if (data.error_msg && typeof data.error_msg === "string") return data.error_msg;
    if (data.resp_msg && typeof data.resp_msg === "string") return data.resp_msg;
    if (data.message && typeof data.message === "string") return data.message;
    if (typeof data.error === "string") return data.error;
    if (data.error && typeof data.error === "object") {
      const errorObj = data.error as Record<string, unknown>;
      if (errorObj.message && typeof errorObj.message === "string") return errorObj.message;
    }
    if (data.data && typeof data.data === "object") {
      const dataObj = data.data as Record<string, unknown>;
      if (dataObj.error && typeof dataObj.error === "string") return dataObj.error;
      if (dataObj.message && typeof dataObj.message === "string") return dataObj.message;
    }

    if (typeof data === "string") return data;
  }

  if (error instanceof Error && error.message) {
    const msg = error.message;
    if (!msg.includes("Request failed with status code")) {
      return msg;
    }
  }

  if (err?.message && !err.message.includes("Request failed")) {
    return err.message;
  }

  const status = err?.response?.status;
  if (status) {
    if (status === 400) return "Invalid request. Please check your input.";
    if (status === 401) return "Unauthorized. Please log in again.";
    if (status === 403) return "Forbidden. You don't have permission.";
    if (status === 404) return "Resource not found.";
    if (status === 409) return "Conflict. This resource already exists.";
    if (status === 500) return "Server error. Please try again later.";
    return `HTTP Error ${status}`;
  }

  return "An unexpected error occurred";
}
