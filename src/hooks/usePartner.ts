import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createPartner,
  fetchPartners,
  fetchPartner,
  updatePartner,
  deletePartner,
  fetchPartnerProducts,
} from "@/services/productService";

export const usePartners = (organizationId: string, page: number = 1, limit: number = 10, search?: string) => {
  return useQuery({
    queryKey: ["partners", organizationId, page, limit, search],
    queryFn: () => fetchPartners(organizationId, page, limit, search),
    staleTime: 5 * 60 * 1000,
  });
};

export const usePartner = (organizationId: string, partnerId: string) => {
  return useQuery({
    queryKey: ["partner", organizationId, partnerId],
    queryFn: () => fetchPartner(organizationId, partnerId),
    staleTime: 5 * 60 * 1000,
  });
};

export const usePartnerProducts = (organizationId: string, partnerId: string) => {
  return useQuery({
    queryKey: ["partnerProducts", organizationId, partnerId],
    queryFn: () => fetchPartnerProducts(organizationId, partnerId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreatePartner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      payload,
    }: {
      organizationId: string;
      payload: {
        name: string;
        email?: string;
        phone?: string;
        location?: string;
        description?: string;
      };
    }) => createPartner(organizationId, payload),
    onSuccess: (_, { organizationId }) => {
      queryClient.invalidateQueries({
        queryKey: ["partners", organizationId],
      });
    },
  });
};

export const useUpdatePartner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      partnerId,
      payload,
    }: {
      organizationId: string;
      partnerId: string;
      payload: {
        name?: string;
        email?: string;
        phone?: string;
        location?: string;
        description?: string;
        status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
      };
    }) => updatePartner(organizationId, partnerId, payload),
    onSuccess: (_, { organizationId, partnerId }) => {
      queryClient.setQueryData(["partner", organizationId, partnerId], (prev: unknown) => ({
        ...prev,
      }));
      queryClient.invalidateQueries({
        queryKey: ["partners", organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["partner", organizationId, partnerId],
      });
    },
  });
};

export const useDeletePartner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, partnerId }: { organizationId: string; partnerId: string }) =>
      deletePartner(organizationId, partnerId),
    onSuccess: (_, { organizationId, partnerId }) => {
      queryClient.removeQueries({
        queryKey: ["partner", organizationId, partnerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["partners", organizationId],
      });
    },
  });
};
