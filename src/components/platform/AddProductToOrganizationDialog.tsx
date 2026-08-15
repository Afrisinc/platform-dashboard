import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Search, X } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/errorHandler";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProductForOrganization } from "@/services/productService";
import { usePartners } from "@/hooks/usePartner";
import type { Partner } from "@/types/product";

type ProductType = "organization" | "partner";

interface AddProductToOrganizationDialogProps {
  organizationId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddProductToOrganizationDialog({
  organizationId,
  isOpen,
  onOpenChange,
  onSuccess,
}: AddProductToOrganizationDialogProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"type" | "details" | "partner">("type");
  const [productType, setProductType] = useState<ProductType>("organization");
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [partnerSearch, setPartnerSearch] = useState("");
  const [showPartnerDropdown, setShowPartnerDropdown] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    baseUrl: "",
    allowedCallbacks: [] as string[],
    callbackInput: "",
  });

  const { data: partnersData } = usePartners(organizationId, 1, 50, partnerSearch);
  const partners = partnersData?.partners || [];

  const filteredPartners = useMemo(() => {
    if (!partnerSearch) return partners;
    return partners.filter(
      (p) =>
        p.name.toLowerCase().includes(partnerSearch.toLowerCase()) ||
        p.email?.toLowerCase().includes(partnerSearch.toLowerCase())
    );
  }, [partners, partnerSearch]);

  const createMutation = useMutation({
    mutationFn: (payload: {
      name: string;
      code: string;
      description?: string;
      partner_id?: string;
      baseUrl?: string;
      allowedCallbacks?: string[];
    }) => createProductForOrganization(organizationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organizationProducts", organizationId],
      });
      toast.success("Product added to organization successfully");
      handleReset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const handleReset = () => {
    setStep("type");
    setProductType("organization");
    setSelectedPartner(null);
    setPartnerSearch("");
    setShowPartnerDropdown(false);
    setFormData({
      name: "",
      code: "",
      description: "",
      baseUrl: "",
      allowedCallbacks: [],
      callbackInput: "",
    });
  };

  const handleTypeSelect = (type: ProductType) => {
    setProductType(type);
    if (type === "partner") {
      setStep("partner");
    } else {
      setStep("details");
    }
  };

  const handlePartnerSelect = (partner: Partner) => {
    setSelectedPartner(partner);
    setShowPartnerDropdown(false);
    setPartnerSearch("");
    setStep("details");
  };

  const handleAddCallback = () => {
    const url = formData.callbackInput.trim();
    if (!url) {
      toast.error("Please enter a callback URL");
      return;
    }
    if (!url.startsWith("http")) {
      toast.error("Callback URL must start with http:// or https://");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      allowedCallbacks: [...prev.allowedCallbacks, url],
      callbackInput: "",
    }));
  };

  const handleRemoveCallback = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      allowedCallbacks: prev.allowedCallbacks.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error("Please fill in name and code");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: formData.name.trim(),
        code: formData.code.trim().toLowerCase(),
        description: formData.description.trim() || undefined,
        partner_id: selectedPartner?.id || undefined,
        baseUrl: formData.baseUrl.trim() || undefined,
        allowedCallbacks:
          formData.allowedCallbacks.length > 0
            ? formData.allowedCallbacks
            : undefined,
      });
    } catch {
      // Error is handled by mutation onError
    }
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="sm:max-w-md max-h-96 overflow-y-auto">
        {step === "type" && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Add Product to Organization</AlertDialogTitle>
              <AlertDialogDescription>
                Choose the type of product to create
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-3 py-4">
              <button
                onClick={() => handleTypeSelect("organization")}
                className="w-full text-left p-4 border rounded-lg hover:bg-muted transition-colors"
              >
                <p className="font-medium">Organization Product</p>
                <p className="text-sm text-muted-foreground">
                  Create a product owned by this organization
                </p>
              </button>

              <button
                onClick={() => handleTypeSelect("partner")}
                className="w-full text-left p-4 border rounded-lg hover:bg-muted transition-colors"
              >
                <p className="font-medium">Partner Product</p>
                <p className="text-sm text-muted-foreground">
                  Create a product managed by a partner
                </p>
              </button>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleClose}>Cancel</AlertDialogCancel>
            </AlertDialogFooter>
          </>
        )}

        {step === "partner" && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Select Partner</AlertDialogTitle>
              <AlertDialogDescription>
                Choose which partner manages this product
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="py-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search partners..."
                  value={partnerSearch}
                  onChange={(e) => {
                    setPartnerSearch(e.target.value);
                    setShowPartnerDropdown(true);
                  }}
                  onFocus={() => setShowPartnerDropdown(true)}
                  className="pl-10"
                />
              </div>

              {showPartnerDropdown && (
                <div className="border rounded-lg max-h-48 overflow-y-auto">
                  {filteredPartners.length > 0 ? (
                    filteredPartners.map((partner) => (
                      <button
                        key={partner.id}
                        onClick={() => handlePartnerSelect(partner)}
                        className="w-full text-left p-3 hover:bg-muted border-b last:border-b-0 transition-colors"
                      >
                        <p className="font-medium text-sm">{partner.name}</p>
                        {partner.email && (
                          <p className="text-xs text-muted-foreground">
                            {partner.email}
                          </p>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-center text-sm text-muted-foreground">
                      No partners found
                    </div>
                  )}
                </div>
              )}

              {selectedPartner && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">{selectedPartner.name}</p>
                  {selectedPartner.email && (
                    <p className="text-xs text-muted-foreground">
                      {selectedPartner.email}
                    </p>
                  )}
                </div>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setStep("type")}>
                Back
              </AlertDialogCancel>
              <Button
                onClick={() => setStep("details")}
                disabled={!selectedPartner}
              >
                Continue
              </Button>
            </AlertDialogFooter>
          </>
        )}

        {step === "details" && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Product Details</AlertDialogTitle>
              <AlertDialogDescription>
                Enter the product information
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Product Name *
                </label>
                <Input
                  id="name"
                  placeholder="e.g., Custom Analytics"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium">
                  Product Code *
                </label>
                <Input
                  id="code"
                  placeholder="e.g., custom-analytics"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      code: e.target.value.toLowerCase(),
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Unique identifier (lowercase, hyphens only)
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  placeholder="Product description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
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
                  placeholder="https://analytics.yourorg.com"
                  value={formData.baseUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, baseUrl: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Allowed Callbacks
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://yourorg.com/auth/callback"
                    value={formData.callbackInput}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        callbackInput: e.target.value,
                      }))
                    }
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddCallback();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddCallback}
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                {formData.allowedCallbacks.length > 0 && (
                  <div className="space-y-2">
                    {formData.allowedCallbacks.map((callback, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded"
                      >
                        <span className="text-sm truncate">{callback}</span>
                        <button
                          onClick={() => handleRemoveCallback(index)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedPartner && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground">
                    PARTNER
                  </p>
                  <p className="text-sm font-medium">{selectedPartner.name}</p>
                </div>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() =>
                  setStep(productType === "partner" ? "partner" : "type")
                }
              >
                Back
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSubmit}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Product"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
