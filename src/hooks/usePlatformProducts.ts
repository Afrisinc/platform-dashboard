import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchOrganizationProducts } from "@/services/platformService";
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
