import { useQuery, useMutation, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { fetchOrganizationProducts, updateOrganizationProduct } from "@/services/platformService";
import type { OrganizationProduct } from "@/types/products";

export const usePlatformOrganizationProducts = (
  organizationId: string | null,
): UseQueryResult<OrganizationProduct[], Error> => {
  return useQuery({
    queryKey: ["organizationProducts", organizationId],
    queryFn: () =>
      organizationId
        ? fetchOrganizationProducts(organizationId)
        : Promise.resolve([]),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateOrganizationProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      organizationId,
      productId,
      updateData,
    }: {
      organizationId: string;
      productId: string;
      updateData: {
        name?: string;
        description?: string;
        baseUrl?: string;
        status?: "PROVISIONING" | "ACTIVE" | "SUSPENDED" | "DEPRECATED" | "COMING_SOON";
        enrollmentStatus?: "PROVISIONING" | "ACTIVE" | "SUSPENDED" | "DEPRECATED" | "COMING_SOON";
        plan?: "FREE" | "PRO" | "ENTERPRISE";
      };
    }) => updateOrganizationProduct(organizationId, productId, updateData),
    onSuccess: (_, { organizationId }) => {
      qc.invalidateQueries({ queryKey: ["organizationProducts", organizationId] });
    },
  });
};
