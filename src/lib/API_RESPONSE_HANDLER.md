# API Response Handler Documentation

Centralized utility for handling backend API responses with automatic toast notifications and error logging.

## Overview

The API Response Handler provides:

- **Consistent error/success handling** across all components
- **Automatic toast notifications** from backend messages
- **Detailed error logging** for debugging
- **Type-safe response handling**

## Files

- `src/lib/apiResponseHandler.ts` - Core utility functions
- `src/hooks/useApiHandler.ts` - React hook wrapper

## Usage

### Basic Usage with Hook

```typescript
import { useApiHandler } from "@/hooks/useApiHandler";

function MyComponent() {
  const { executeCall, handleResponse, handleError } = useApiHandler();

  const handleClick = async () => {
    try {
      const result = await someApiCall();
      handleResponse(result, {
        successMessage: "Operation successful",
      });
    } catch (error) {
      handleError(error, {
        errorMessage: "Custom error message",
      });
    }
  };
}
```

### Using executeCall Wrapper

```typescript
const { executeCall } = useApiHandler();

const result = await executeCall(() => fetchPublicProducts(), {
  successMessage: "Products loaded successfully",
  showSuccess: false, // Don't show toast for this operation
});

if (result.success) {
  console.log(result.data);
} else {
  console.log("Error:", result.message);
}
```

### Direct Error Handling

```typescript
import { handleApiError, handleApiResponse } from "@/lib/apiResponseHandler";

try {
  const response = await enrollAccountInProduct(accountId, productData);
  const result = handleApiResponse(response, {
    successMessage: "Product enrolled successfully",
    logDetails: true,
  });
} catch (error) {
  const result = handleApiError(error, {
    errorMessage: "Failed to enroll product",
    showError: true,
    logDetails: true,
  });
}
```

## API Response Format

Expected backend response format:

```typescript
{
  success: boolean;
  resp_msg?: string;        // Backend message shown to user
  message?: string;         // Alternative message field
  resp_code?: number;       // Backend response code
  data?: T;                 // Response payload
  error?: string | object;  // Error details
}
```

### Example Responses

**Success:**

```json
{
  "success": true,
  "resp_msg": "Product enrolled successfully",
  "resp_code": 1000,
  "data": {
    "enrollment_id": "uuid",
    "product_code": "notify",
    "plan": "ENTERPRISE"
  }
}
```

**Error:**

```json
{
  "success": false,
  "resp_msg": "Invalid product code",
  "resp_code": 400,
  "error": "Product not found"
}
```

## Options

```typescript
interface HandleResponseOptions {
  showSuccess?: boolean; // Show success toast (default: true)
  showError?: boolean; // Show error toast (default: true)
  successMessage?: string; // Override success message
  errorMessage?: string; // Override error message
  logDetails?: boolean; // Log to console (default: true)
}
```

## Helper Functions

### `handleApiResponse<T>(response, options)`

Process successful API responses

```typescript
const result = handleApiResponse(response, {
  successMessage: "Saved successfully",
  showSuccess: true,
});

if (result.success) {
  console.log(result.data);
}
```

### `handleApiError(error, options)`

Process API errors with details

```typescript
const result = handleApiError(error, {
  errorMessage: "Custom error",
  logDetails: true,
});

console.log(result.message); // Full error message with status code
```

### `getErrorMessage(error)`

Extract readable error message from any error type

```typescript
const message = getErrorMessage(error);
toast.error(message);
```

### `getSuccessMessage(response, defaultMessage)`

Extract message from response with fallback

```typescript
const message = getSuccessMessage(response, "Operation complete");
```

### `formatErrorDetails(error)`

Format error with status code for display

```typescript
const formatted = formatErrorDetails(error); // "[400] Invalid input"
```

### `isApiSuccess(response)`

Check if response indicates success

```typescript
if (isApiSuccess(response)) {
  // Handle success
}
```

## Examples

### Product Enrollment

```typescript
async function handleEnrollProduct() {
  try {
    const result = await enrollAccountInProduct(accountId, {
      product_code: "notify",
      plan: "ENTERPRISE",
    });

    const handled = handleApiResponse(result, {
      successMessage: "Notification Service enrolled successfully",
    });

    if (handled.success) {
      setOrgProducts([...orgProducts, selectedProduct]);
      setEnrollDialogOpen(false);
    }
  } catch (error) {
    handleApiError(error, {
      errorMessage: "Failed to enroll product",
    });
  }
}
```

### Data Fetch with Automatic Notifications

```typescript
const { executeCall } = useApiHandler();

const loadProducts = async () => {
  const result = await executeCall(() => fetchPublicProducts(), {
    showSuccess: false, // Don't show toast for data loads
    errorMessage: "Failed to load products",
  });

  if (result.success) {
    setProducts(result.data);
  }
};
```

### Silent Error Logging

```typescript
try {
  await someApiCall();
} catch (error) {
  handleApiError(error, {
    showError: false, // Don't show toast
    logDetails: true, // But log to console for debugging
  });
}
```

## Console Output

When `logDetails: true`, messages are logged to the browser console:

**Success:**

```
[API Response] {
  resp_code: 1000,
  resp_msg: "Products retrieved successfully",
  data: [...]
}
```

**Error:**

```
[API Error Details] AxiosError: {
  message: "Request failed with status code 400",
  response: { data, status, ... }
}
```

## Integration Pattern

1. Service layer (`platformService.ts`) - Make API calls, throw errors
2. Component/Hook - Use `useApiHandler()` to handle responses
3. User sees - Toast notification with backend message + console logging for debugging

This ensures consistent UX and makes debugging easier with detailed backend response information.
