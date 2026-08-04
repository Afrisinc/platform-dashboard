import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyableText } from "@/components/ui/copyable-text";
import { UpdateOrganizationDialog } from "@/components/platform/UpdateOrganizationDialog";
import {
  usePlatformOrganizationMembers,
  useRemovePlatformOrganizationMember,
} from "@/hooks/usePlatform";
import { usePlatformOrganizationProducts } from "@/hooks/usePlatformProducts";
import { useRoles } from "@/hooks/useMemberProducts";
import { MemberProductCard } from "./MemberProductCard";
import type { PlatformOrganization } from "@/types/platform";
import { Building2, Users, Trash2, Plus, Edit, Package } from "lucide-react";
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
import { toast } from "sonner";
import {
  fetchPublicProducts,
  enrollAccountInProduct,
  removeProductFromAccount,
  fetchPlatformAccounts,
} from "@/services/platformService";
import { useApiHandler } from "@/hooks/useApiHandler";

interface OrganizationDetailsSheetProps {
  organization: PlatformOrganization | null;
  isOpen: boolean;
  onClose: () => void;
  onAddMember?: () => void;
}

const statusVariant = (s?: string) =>
  s === "ACTIVE" ? "default" : s === "SUSPENDED" ? "destructive" : "secondary";

interface Product {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: string;
}

export function OrganizationDetailsSheet({
  organization,
  isOpen,
  onClose,
  onAddMember,
}: OrganizationDetailsSheetProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<{
    memberId: string;
    memberEmail: string;
  } | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [orgProducts, setOrgProducts] = useState<Product[]>([]);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [selectedProductToRemove, setSelectedProductToRemove] =
    useState<Product | null>(null);
  const [selectedProductToEnroll, setSelectedProductToEnroll] =
    useState<Product | null>(null);
  const [enrollPlan, setEnrollPlan] = useState<"FREE" | "PRO" | "ENTERPRISE">(
    "FREE",
  );

  const { data: membersData, isLoading: membersLoading } =
    usePlatformOrganizationMembers(organization?.id || null);
  const removeMemMutation = useRemovePlatformOrganizationMember();
  const { data: enrolledProductsData, isLoading: productsLoading } =
    usePlatformOrganizationProducts(
      activeTab === "products" ? organization?.id || null : null,
    );
  const { data: rolesData, isLoading: rolesLoading } = useRoles();
  const { executeCall } = useApiHandler();

  const handleRemoveMember = async () => {
    if (!confirmRemove || !organization) return;
    try {
      await removeMemMutation.mutateAsync({
        organizationId: organization.id,
        userId: confirmRemove.memberId,
      });
      toast.success(`Member removed from ${organization.name}`);
    } catch {
      toast.error("Failed to remove member");
    }
    setConfirmRemove(null);
  };

  useEffect(() => {
    if (activeTab !== "products" || !isOpen) return;

    const loadPublicProducts = async () => {
      try {
        const publicProducts = await fetchPublicProducts();
        setAllProducts(publicProducts || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("[Load Public Products Error]", {
          error: err,
          message: errorMessage,
          timestamp: new Date().toISOString(),
        });
        toast.error(`Failed to load products: ${errorMessage}`);
        setAllProducts([]);
      }
    };

    loadPublicProducts();
  }, [activeTab, isOpen]);

  useEffect(() => {
    if (enrolledProductsData) {
      const enrolledProducts = (enrolledProductsData || []).map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        description: p.description,
        status: p.status,
      }));
      setOrgProducts(enrolledProducts);
    }
  }, [enrolledProductsData]);

  const handleEnrollProduct = async () => {
    if (!selectedProductToEnroll || !organization) return;

    try {
      const allAccounts = await fetchPlatformAccounts({
        limit: 100,
        offset: 0,
      });
      const orgAccount = allAccounts?.data?.find(
        (acc) => acc.organization_id === organization.id,
      );

      if (!orgAccount?.id) {
        toast.error("No account found for this organization");
        return;
      }

      await enrollAccountInProduct(orgAccount.id, {
        product_code: selectedProductToEnroll.code,
        plan: enrollPlan,
      });

      setOrgProducts([...orgProducts, selectedProductToEnroll]);
      setEnrollDialogOpen(false);
      setSelectedProductToEnroll(null);
      toast.success(`${selectedProductToEnroll.name} enrolled successfully`);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to enroll product";
      toast.error(errorMsg);
      console.error("[Enroll Product Error]", error);
    }
  };

  const handleRemoveProduct = async () => {
    if (!selectedProductToRemove || !organization) return;

    try {
      const allAccounts = await fetchPlatformAccounts({
        limit: 100,
        offset: 0,
      });
      const orgAccount = allAccounts?.data?.find(
        (acc) => acc.organization_id === organization.id,
      );

      if (!orgAccount?.id) {
        toast.error("No account found for this organization");
        return;
      }

      await removeProductFromAccount(
        orgAccount.id,
        selectedProductToRemove.code,
      );

      setOrgProducts(
        orgProducts.filter((p) => p.code !== selectedProductToRemove.code),
      );
      setSelectedProductToRemove(null);
      toast.success(`${selectedProductToRemove.name} removed successfully`);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to remove product";
      toast.error(errorMsg);
      console.error("[Remove Product Error]", error);
    }
  };

  if (!organization) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <SheetHeader className="flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle>{organization.name}</SheetTitle>
              <SheetDescription className="truncate">
                {organization.legal_name || "N/A"}
              </SheetDescription>
            </div>
            <Badge
              variant={statusVariant(organization.status)}
              className="flex-shrink-0"
            >
              {organization.status || "ACTIVE"}
            </Badge>
          </div>
        </SheetHeader>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden mt-4"
        >
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
            <TabsTrigger value="details" className="gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Details</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Products</span>
              {orgProducts.length > 0 && (
                <span className="ml-1 text-xs">({orgProducts.length})</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Members</span>
              {membersData && (
                <span className="ml-1 text-xs">
                  ({membersData.members.length})
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 overflow-hidden">
            <div className="pr-4">
              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">
                      Organization Information
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setUpdateDialogOpen(true)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-start">
                        <span className="text-muted-foreground">
                          Organization ID
                        </span>
                        <CopyableText text={organization.id} truncateAt={12} />
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Name</span>
                        <span className="text-right break-words">
                          {organization.name}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          Legal Name
                        </span>
                        <span className="text-right">
                          {organization.legal_name || "—"}
                        </span>
                      </div>

                      {organization.country && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Country</span>
                          <span className="text-right">
                            {organization.country}
                          </span>
                        </div>
                      )}

                      {organization.tax_id && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Tax ID</span>
                          <span className="text-right font-mono text-xs">
                            {organization.tax_id}
                          </span>
                        </div>
                      )}

                      {organization.org_email && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Email</span>
                          <span className="text-right break-words">
                            {organization.org_email}
                          </span>
                        </div>
                      )}

                      {organization.org_phone && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Phone</span>
                          <span className="text-right">
                            {organization.org_phone}
                          </span>
                        </div>
                      )}

                      {organization.location && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">
                            Location
                          </span>
                          <span className="text-right">
                            {organization.location}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={statusVariant(organization.status)}>
                          {organization.status || "ACTIVE"}
                        </Badge>
                      </div>

                      {organization.createdAt && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Created</span>
                          <span className="text-right text-xs">
                            {new Date(
                              organization.createdAt,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {organization.updatedAt && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Updated</span>
                          <span className="text-right text-xs">
                            {new Date(
                              organization.updatedAt,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {membersData?.members.length || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Total Members
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {membersData?.members.filter((m) => m.role === "OWNER")
                          .length || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">Owners</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Members Tab */}
              <TabsContent value="members" className="space-y-4 mt-4">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={onAddMember}
                    disabled={!onAddMember}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>

                {membersLoading || rolesLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : !membersData?.members.length ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No members in this organization
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {membersData.members.map((member) => (
                      <MemberProductCard
                        key={member.id}
                        member={member}
                        organizationId={organization.id}
                        allRoles={rolesData || []}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products" className="space-y-4 mt-4">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => setEnrollDialogOpen(true)}
                    disabled={
                      productsLoading ||
                      allProducts.length === 0 ||
                      allProducts.every((p) =>
                        orgProducts.find((op) => op.code === p.code),
                      )
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>

                {productsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : !orgProducts.length ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No products enrolled yet
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {orgProducts.map((product) => (
                      <Card key={product.id}>
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">
                                  {product.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {product.description || product.code}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setSelectedProductToRemove(product)
                                }
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>

                            <div className="flex gap-2 flex-wrap">
                              <Badge variant="secondary" className="uppercase">
                                {product.code}
                              </Badge>
                              <Badge
                                variant={
                                  product.status === "ACTIVE"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {product.status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </SheetContent>

      {/* Update Organization Dialog */}
      <UpdateOrganizationDialog
        organization={organization}
        isOpen={updateDialogOpen}
        onClose={() => setUpdateDialogOpen(false)}
      />

      {/* Confirm Remove Member Dialog */}
      <AlertDialog
        open={!!confirmRemove}
        onOpenChange={() => setConfirmRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>{confirmRemove?.memberEmail}</strong> from this
              organization?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-destructive"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Enroll Product Dialog */}
      <AlertDialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add Product to Organization</AlertDialogTitle>
            <AlertDialogDescription>
              Select a product to enroll this organization in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Product</label>
              <select
                value={selectedProductToEnroll?.id || ""}
                onChange={(e) => {
                  const product = allProducts.find(
                    (p) => p.id === e.target.value,
                  );
                  setSelectedProductToEnroll(product || null);
                }}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="">Select a product...</option>
                {allProducts
                  .filter((p) => !orgProducts.find((op) => op.code === p.code))
                  .map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Plan</label>
              <select
                value={enrollPlan}
                onChange={(e) =>
                  setEnrollPlan(e.target.value as "FREE" | "PRO" | "ENTERPRISE")
                }
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="FREE">Free</option>
                <option value="PRO">Pro</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEnrollProduct}
              disabled={!selectedProductToEnroll}
            >
              Enroll Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Product Dialog */}
      <AlertDialog
        open={!!selectedProductToRemove}
        onOpenChange={() => setSelectedProductToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>{selectedProductToRemove?.name}</strong> from this
              organization?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveProduct}
              className="bg-destructive"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
