import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useUpdateOrganizationProduct } from "@/hooks/usePlatformProducts";
import type { OrganizationProduct } from "@/types/products";
import { getErrorMessage } from "@/lib/errorHandler";

interface EditProductDialogProps {
  readonly product: OrganizationProduct;
  readonly organizationId: string;
  readonly isOpen: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess?: () => void;
}

export function EditProductDialog({
  product,
  organizationId,
  isOpen,
  onOpenChange,
  onSuccess,
}: EditProductDialogProps) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description || "");
  const [baseUrl, setBaseUrl] = useState(product.baseUrl || "");
  const [status, setStatus] = useState<
    "PROVISIONING" | "ACTIVE" | "SUSPENDED" | "DEPRECATED" | "COMING_SOON"
  >(product.status as any);
  const [enrollmentStatus, setEnrollmentStatus] = useState<
    "PROVISIONING" | "ACTIVE" | "SUSPENDED" | "DEPRECATED" | "COMING_SOON"
  >(product.enrollment?.status || "ACTIVE");
  const [plan, setPlan] = useState<"FREE" | "PRO" | "ENTERPRISE">(
    product.enrollment?.plan || "FREE"
  );

  const updateMutation = useUpdateOrganizationProduct();

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        organizationId,
        productId: product.id,
        updateData: {
          name: name.trim(),
          description: description.trim() || undefined,
          baseUrl: baseUrl.trim() || undefined,
          status,
          enrollmentStatus,
          plan,
        },
      });
      toast.success("Product updated successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md max-h-96 overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Product</AlertDialogTitle>
          <AlertDialogDescription>
            Update product and enrollment details for <strong>{product.name}</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Product Name *
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description"
              className="w-full px-3 py-2 border rounded-md text-sm"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="baseUrl" className="text-sm font-medium">
              Base URL
            </label>
            <Input
              id="baseUrl"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">
              Product Status
            </label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PROVISIONING">Provisioning</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="DEPRECATED">Deprecated</SelectItem>
                <SelectItem value="COMING_SOON">Coming Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="enrollmentStatus" className="text-sm font-medium">
              Enrollment Status
            </label>
            <Select
              value={enrollmentStatus}
              onValueChange={(value: any) => setEnrollmentStatus(value)}
            >
              <SelectTrigger id="enrollmentStatus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PROVISIONING">Provisioning</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="DEPRECATED">Deprecated</SelectItem>
                <SelectItem value="COMING_SOON">Coming Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="plan" className="text-sm font-medium">
              Plan
            </label>
            <Select value={plan} onValueChange={(value: any) => setPlan(value)}>
              <SelectTrigger id="plan">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FREE">Free</SelectItem>
                <SelectItem value="PRO">Pro</SelectItem>
                <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted rounded p-3 text-sm">
            <p className="text-muted-foreground">
              <strong>Code:</strong> {product.code}
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Updating..." : "Update"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
