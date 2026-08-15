import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchOrganizationProducts,
  fetchRoles,
  grantMemberProductAccess,
  revokeMemberProductAccess,
  fetchMemberProducts,
  getOrganizationProductAccess,
} from "@/services/productService";

export const usePlatformOrganizationProducts = (organizationId: string) => {
  return useQuery({
    queryKey: ["organizationProducts", organizationId],
    queryFn: () => fetchOrganizationProducts(organizationId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
    staleTime: 10 * 60 * 1000,
  });
};

export const useMemberProducts = (organizationId: string, userId: string) => {
  return useQuery({
    queryKey: ["memberProducts", organizationId, userId],
    queryFn: () => fetchMemberProducts(organizationId, userId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useOrganizationProductAccess = (organizationId: string) => {
  return useQuery({
    queryKey: ["organizationProductAccess", organizationId],
    queryFn: () => getOrganizationProductAccess(organizationId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGrantMemberProductAccess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      userId,
      productCode,
      roleId,
    }: {
      organizationId: string;
      userId: string;
      productCode: string;
      roleId?: string;
    }) => grantMemberProductAccess(organizationId, userId, productCode, roleId),
    onSuccess: (_, { organizationId, userId }) => {
      queryClient.invalidateQueries({
        queryKey: ["memberProducts", organizationId, userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["organizationProductAccess", organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["organizationMembers", organizationId],
      });
    },
  });
};

export const useRevokeMemberProductAccess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      userId,
      productCode,
    }: {
      organizationId: string;
      userId: string;
      productCode: string;
    }) => revokeMemberProductAccess(organizationId, userId, productCode),
    onSuccess: (_, { organizationId, userId }) => {
      queryClient.invalidateQueries({
        queryKey: ["memberProducts", organizationId, userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["organizationProductAccess", organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["organizationMembers", organizationId],
      });
    },
  });
};
