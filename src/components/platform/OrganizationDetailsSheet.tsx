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
  useDeletePlatformOrganization,
} from "@/hooks/usePlatform";
import { usePlatformOrganizationProducts } from "@/hooks/usePlatformProducts";
import { useRoles } from "@/hooks/useMemberProducts";
import { MemberProductCard } from "./MemberProductCard";
import { PartnersList } from "./PartnersList";
import { AddProductToOrganizationDialog } from "./AddProductToOrganizationDialog";
import { EditProductDialog } from "./EditProductDialog";
import type { PlatformOrganization } from "@/types/platform";
import { Building2, Users, Trash2, Plus, Edit, Package, Handshake } from "lucide-react";
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
  partner?: { id: string; name: string; email?: string };
  enrollment?: { plan: string };
  baseUrl?: string;
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
  const [orgProducts, setOrgProducts] = useState<Product[]>([]);
  const [selectedProductToRemove, setSelectedProductToRemove] =
    useState<Product | null>(null);
  const [selectedProductToEdit, setSelectedProductToEdit] =
    useState<Product | null>(null);

  const { data: membersData, isLoading: membersLoading } =
    usePlatformOrganizationMembers(organization?.id || null);
  const removeMemMutation = useRemovePlatformOrganizationMember();
  const deleteOrgMutation = useDeletePlatformOrganization();
  const { data: enrolledProductsData, isLoading: productsLoading } =
    usePlatformOrganizationProducts(
      activeTab === "products" ? organization?.id || null : null,
    );
  const { data: rolesData, isLoading: rolesLoading } = useRoles();

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

  const handleDeleteOrganization = async () => {
    if (!organization) return;
    try {
      await deleteOrgMutation.mutateAsync(organization.id);
      toast.success(`${organization.name} deleted successfully`);
      setConfirmDelete(false);
      onClose();
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to delete organization";
      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    if (enrolledProductsData) {
      const enrolledProducts = (enrolledProductsData || []).map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        description: p.description,
        status: p.status,
        partner: p.partner || undefined,
        enrollment: p.enrollment,
        baseUrl: p.baseUrl || undefined,
      }));
      setOrgProducts(enrolledProducts);
    }
  }, [enrolledProductsData]);

  if (!organization) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <SheetHeader className="flex-shrink-0">
          <div className="flex items-center gap-2">
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setConfirmDelete(true)}
              className="flex-shrink-0"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </SheetHeader>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden mt-4"
        >
          <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
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
            <TabsTrigger value="partners" className="gap-2">
              <Handshake className="h-4 w-4" />
              <span className="hidden sm:inline">Partners</span>
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

              {/* Partners Tab */}
              <TabsContent value="partners" className="space-y-4 mt-4">
                {organization && <PartnersList organizationId={organization.id} />}
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
                    onClick={() => setAddProductDialogOpen(true)}
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
                              <div className="flex gap-1 flex-shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    setSelectedProductToEdit(product)
                                  }
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
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
                              <Badge variant={product.partner ? "outline" : "default"} className="text-xs">
                                {product.partner ? "Partner Product" : "Organization"}
                              </Badge>
                              {product.enrollment?.plan && (
                                <Badge variant="outline">
                                  {product.enrollment.plan}
                                </Badge>
                              )}
                            </div>

                            {product.partner && (
                              <div className="text-xs bg-muted rounded p-2">
                                <p className="text-muted-foreground">
                                  Managed by{" "}
                                  <span className="font-medium text-foreground">
                                    {product.partner.name}
                                  </span>
                                </p>
                                {product.partner.email && (
                                  <p className="text-muted-foreground">
                                    {product.partner.email}
                                  </p>
                                )}
                              </div>
                            )}

                            {product.baseUrl && (
                              <div className="text-xs text-muted-foreground break-all">
                                <a
                                  href={product.baseUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline dark:text-blue-400"
                                >
                                  {product.baseUrl}
                                </a>
                              </div>
                            )}
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

      {/* Delete Organization Dialog */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Organization</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete{" "}
              <strong>{organization.name}</strong>? This action cannot be undone
              and will delete all related data including members, products, and
              partners.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrganization}
              className="bg-destructive"
              disabled={deleteOrgMutation.isPending}
            >
              {deleteOrgMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

      <AddProductToOrganizationDialog
        organizationId={organization?.id || ""}
        isOpen={addProductDialogOpen}
        onOpenChange={setAddProductDialogOpen}
        onSuccess={() => {
          setAddProductDialogOpen(false);
        }}
      />

      {selectedProductToEdit && (
        <EditProductDialog
          product={selectedProductToEdit}
          organizationId={organization?.id || ""}
          isOpen={!!selectedProductToEdit}
          onOpenChange={(open) => {
            if (!open) setSelectedProductToEdit(null);
          }}
        />
      )}
    </Sheet>
  );
}
