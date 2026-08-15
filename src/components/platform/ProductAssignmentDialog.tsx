import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/errorHandler";
import { FormDialog } from "@/components/dialogs/FormDialog";
import { useGrantMemberProductAccess } from "@/hooks/useProductAssignment";
import type { OrganizationProduct, Role } from "@/types/product";

interface ProductAssignmentDialogProps {
  organizationId: string;
  userId: string;
  userEmail: string;
  availableProducts: OrganizationProduct[];
  roles: Role[];
  onSuccess?: () => void;
}

export function ProductAssignmentDialog({
  organizationId,
  userId,
  userEmail,
  availableProducts,
  roles,
  onSuccess,
}: ProductAssignmentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");

  const assignMutation = useGrantMemberProductAccess();

  const handleAssign = async () => {
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }

    try {
      await assignMutation.mutateAsync({
        organizationId,
        userId,
        productCode: selectedProduct,
        roleId: selectedRole || undefined,
      });
      toast.success("Product assigned successfully");
      setIsOpen(false);
      setSelectedProduct("");
      setSelectedRole("");
      onSuccess?.();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} size="sm">
        Assign Product
      </Button>

      <FormDialog
        title="Assign Product"
        description={`Assign a product to ${userEmail}`}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSubmit={handleAssign}
        isLoading={assignMutation.isPending}
        submitText="Assign"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="product-select" className="text-sm font-medium">
              Product
            </label>
            <select
              id="product-select"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="">Select a product...</option>
              {availableProducts.map((product) => (
                <option key={product.id} value={product.code}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="role-select" className="text-sm font-medium">
              Role (Optional)
            </label>
            <select
              id="role-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="">No specific role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FormDialog>
    </>
  );
}
