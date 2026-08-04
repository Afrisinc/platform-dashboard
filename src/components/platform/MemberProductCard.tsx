import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, X } from "lucide-react";
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
import type { OrganizationMember } from "@/types/platform";
import type { OrganizationProduct } from "@/types/products";
import type { Role } from "@/types/members";
import {
  useGrantMemberProductAccess,
  useRevokeMemberProductAccess,
  useMemberProductsList,
} from "@/hooks/useMemberProducts";
import { usePlatformOrganizationProducts } from "@/hooks/usePlatformProducts";

interface MemberProductCardProps {
  readonly member: OrganizationMember;
  readonly organizationId: string;
  readonly allRoles: Role[];
}

export function MemberProductCard({
  member,
  organizationId,
  allRoles,
}: MemberProductCardProps) {
  const { data: organizationProducts = [] } =
    usePlatformOrganizationProducts(organizationId);
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
  const [selectedProductToAdd, setSelectedProductToAdd] =
    useState<OrganizationProduct | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [removeProductConfirm, setRemoveProductConfirm] = useState<
    string | null
  >(null);
  const [removeMemberConfirm, setRemoveMemberConfirm] = useState(false);

  const grantMutation = useGrantMemberProductAccess();
  const revokeMutation = useRevokeMemberProductAccess();
  const { data: memberProductsList = [] } = useMemberProductsList(
    organizationId,
    member.user_id,
  );

  const memberProducts = organizationProducts.filter((p) =>
    memberProductsList.some((mp) => mp.product.code === p.code),
  );

  const handleAddProduct = async () => {
    if (!selectedProductToAdd) {
      toast.error("Please select a product");
      return;
    }

    try {
      await grantMutation.mutateAsync({
        organizationId,
        userId: member.user_id,
        productCode: selectedProductToAdd.code,
        roleId: selectedRole || undefined,
      });
      toast.success(`${selectedProductToAdd.name} assigned to ${member.email}`);
      setAddProductDialogOpen(false);
      setSelectedProductToAdd(null);
      setSelectedRole("");
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to assign product";
      toast.error(errorMsg);
    }
  };

  const handleRemoveProduct = async () => {
    if (!removeProductConfirm) return;

    try {
      await revokeMutation.mutateAsync({
        organizationId,
        userId: member.user_id,
        productCode: removeProductConfirm,
      });
      toast.success("Product access removed");
      setRemoveProductConfirm(null);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to remove product";
      toast.error(errorMsg);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Member Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {[member.firstName, member.lastName]
                    .filter(Boolean)
                    .join(" ") || "Unknown"}
                </p>
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRemoveMemberConfirm(true)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            {/* Role & Status */}
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary">{member.role}</Badge>
              <Badge
                variant={member.status === "ACTIVE" ? "default" : "destructive"}
              >
                {member.status || "ACTIVE"}
              </Badge>
            </div>

            {/* Products Section */}
            <div className="border-t pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground">
                  PRODUCTS ({memberProducts.length})
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAddProductDialogOpen(true)}
                  disabled={grantMutation.isPending}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>

              {memberProducts.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No products assigned
                </p>
              ) : (
                <div className="space-y-2">
                  {memberProducts.map((product) => (
                    <div
                      key={product.code}
                      className="flex items-center justify-between bg-muted/40 rounded p-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Plan: {product.enrollment?.plan}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 flex-shrink-0"
                        onClick={() => setRemoveProductConfirm(product.code)}
                        disabled={revokeMutation.isPending}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Info */}
            {member.phone && (
              <div className="text-xs text-muted-foreground border-t pt-2">
                <p>📞 {member.phone}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <AlertDialog
        open={addProductDialogOpen}
        onOpenChange={setAddProductDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Assign Product to Member</AlertDialogTitle>
            <AlertDialogDescription>
              Select a product to assign to {member.email}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="product-select" className="text-sm font-medium">
                Product
              </label>
              <select
                id="product-select"
                value={selectedProductToAdd?.id || ""}
                onChange={(e) => {
                  const product = organizationProducts.find(
                    (p) => p.id === e.target.value,
                  );
                  setSelectedProductToAdd(product || null);
                }}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="">Select a product...</option>
                {organizationProducts
                  .filter(
                    (p) => !memberProducts.some((mp) => mp.code === p.code),
                  )
                  .map((product) => (
                    <option key={product.id} value={product.id}>
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
                {allRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name} - {role.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAddProduct}
              disabled={!selectedProductToAdd || grantMutation.isPending}
            >
              {grantMutation.isPending ? "Assigning..." : "Assign Product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Product Confirmation */}
      <AlertDialog
        open={!!removeProductConfirm}
        onOpenChange={() => setRemoveProductConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Product Access</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this product from {member.email}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveProduct}
              className="bg-destructive"
              disabled={revokeMutation.isPending}
            >
              {revokeMutation.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Member Confirmation */}
      <AlertDialog
        open={removeMemberConfirm}
        onOpenChange={setRemoveMemberConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {member.email} from this
              organization?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive"
              onClick={() => {
                setRemoveMemberConfirm(false);
                // Call parent handler
              }}
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
