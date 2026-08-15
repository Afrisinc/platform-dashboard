import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { FormDialog } from "@/components/dialogs/FormDialog";
import { getErrorMessage } from "@/lib/errorHandler";
import { useCreatePartner, useUpdatePartner } from "@/hooks/usePartner";
import type { Partner } from "@/types/product";

interface PartnerFormDialogProps {
  organizationId: string;
  partner?: Partner;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PartnerFormDialog({
  organizationId,
  partner,
  isOpen,
  onOpenChange,
  onSuccess,
}: PartnerFormDialogProps) {
  const [name, setName] = useState(partner?.name || "");
  const [email, setEmail] = useState(partner?.email || "");
  const [phone, setPhone] = useState(partner?.phone || "");
  const [location, setLocation] = useState(partner?.location || "");
  const [description, setDescription] = useState(partner?.description || "");

  const createMutation = useCreatePartner();
  const updateMutation = useUpdatePartner();
  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Partner name is required");
      return;
    }

    try {
      if (partner) {
        await updateMutation.mutateAsync({
          organizationId,
          partnerId: partner.id,
          payload: {
            name: name.trim(),
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
            location: location.trim() || undefined,
            description: description.trim() || undefined,
          },
        });
        toast.success("Partner updated successfully");
      } else {
        await createMutation.mutateAsync({
          organizationId,
          payload: {
            name: name.trim(),
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
            location: location.trim() || undefined,
            description: description.trim() || undefined,
          },
        });
        toast.success("Partner created successfully");
      }
      onOpenChange(false);
      setName("");
      setEmail("");
      setPhone("");
      setLocation("");
      setDescription("");
      onSuccess?.();
    } catch (error) {
      // console.log("Error in PartnerFormDialog:", error);
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <FormDialog
      title={partner ? "Edit Partner" : "Create Partner"}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitText={partner ? "Update" : "Create"}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name <span className="text-red-600">*</span>
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Partner name"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@partner.com"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Phone
          </label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1234567890"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-medium">
            Location
          </label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, Country"
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
            placeholder="Partner details"
            className="w-full px-3 py-2 border rounded-md text-sm"
            rows={3}
          />
        </div>
      </div>
    </FormDialog>
  );
}
