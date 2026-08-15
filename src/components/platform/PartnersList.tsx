import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/errorHandler";
import { ConfirmActionDialog } from "@/components/dialogs/ConfirmActionDialog";
import { PartnerFormDialog } from "./PartnerFormDialog";
import { usePartners, useDeletePartner } from "@/hooks/usePartner";
import type { Partner } from "@/types/product";

interface PartnersListProps {
  organizationId: string;
}

export function PartnersList({ organizationId }: PartnersListProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | undefined>();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);

  const { data: partnersData, isLoading } = usePartners(organizationId, page, 10, search);
  const deleteMutation = useDeletePartner();

  const handleCreateNew = () => {
    setSelectedPartner(undefined);
    setFormOpen(true);
  };

  const handleEdit = (partner: Partner) => {
    setSelectedPartner(partner);
    setFormOpen(true);
  };

  const handleDeleteClick = (partner: Partner) => {
    setPartnerToDelete(partner);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!partnerToDelete) return;

    try {
      await deleteMutation.mutateAsync({
        organizationId,
        partnerId: partnerToDelete.id,
      });
      toast.success("Partner deleted successfully");
      setDeleteOpen(false);
      setPartnerToDelete(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading partners...</div>;
  }

  const partners = partnersData?.partners || [];
  const pagination = partnersData?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <input
          type="text"
          placeholder="Search partners..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 px-3 py-2 border rounded-md text-sm"
        />
        <Button onClick={handleCreateNew} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Partner
        </Button>
      </div>

      {partners.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No partners found. Create one to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {partners.map((partner) => (
            <Card key={partner.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{partner.name}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                        {partner.status}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {partner.email && <div>Email: {partner.email}</div>}
                      {partner.phone && <div>Phone: {partner.phone}</div>}
                      {partner.location && <div>Location: {partner.location}</div>}
                      {partner.description && <div>Description: {partner.description}</div>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(partner)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(partner)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!pagination.hasPrev}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!pagination.hasNext}
          >
            Next
          </Button>
        </div>
      )}

      <PartnerFormDialog
        organizationId={organizationId}
        partner={selectedPartner}
        isOpen={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={() => setFormOpen(false)}
      />

      <ConfirmActionDialog
        title="Delete Partner"
        description={`Are you sure you want to delete ${partnerToDelete?.name}? This action cannot be undone.`}
        isOpen={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        actionText="Delete"
        type="danger"
      />
    </div>
  );
}
