import apiClient from "@/services/apiClient";
import { getErrorMessage } from "@/lib/errorHandler";
import type {
  OrganizationProduct,
  Role,
  Partner,
  PartnerWithProducts,
  PartnerListResponse,
  MemberProductAccess,
} from "@/types/product";

export async function fetchOrganizationProducts(organizationId: string): Promise<OrganizationProduct[]> {
  try {
    const response = await apiClient().get(`/auth/organizations/${organizationId}/products`);
    if (!response.data.success) throw new Error(response.data.resp_msg);
    return response.data.data?.products || [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function fetchRoles(): Promise<Role[]> {
  try {
    const response = await apiClient().get("/auth/api/admin/roles");
    if (!response.data.success) throw new Error(response.data.resp_msg);
    return response.data.data?.roles || [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function fetchUserProducts() {
  try {
    const response = await apiClient().get("/auth/products/me");
    if (!response.data.success) throw new Error(response.data.resp_msg);
    return response.data.data || [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function fetchMemberProducts(
  organizationId: string,
  userId: string
): Promise<MemberProductAccess[]> {
  try {
    const response = await apiClient().get(
      `/auth/organizations/${organizationId}/members/${userId}/products`
    );
    if (!response.data.success) throw new Error(response.data.resp_msg);
    return response.data.data?.products || [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function grantMemberProductAccess(
  organizationId: string,
  userId: string,
  productCode: string,
  roleId?: string
): Promise<MemberProductAccess> {
  try {
    const response = await apiClient().post(
      `/auth/organizations/${organizationId}/members/${userId}/products/${productCode}`,
      { role_id: roleId }
    );
    if (!response.data.success) throw new Error(response.data.resp_msg);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function revokeMemberProductAccess(
  organizationId: string,
  userId: string,
  productCode: string
): Promise<void> {
  try {
    const response = await apiClient().delete(
      `/auth/organizations/${organizationId}/members/${userId}/products/${productCode}`
    );
    if (!response.data.success) throw new Error(response.data.resp_msg);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getOrganizationProductAccess(organizationId: string): Promise<MemberProductAccess[]> {
  try {
    const response = await apiClient().get(`/auth/organizations/${organizationId}/product-access`);
    if (!response.data.success) throw new Error(response.data.resp_msg);
    return response.data.data?.access || [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createPartner(
  organizationId: string,
  payload: {
    name: string;
    email?: string;
    phone?: string;
    location?: string;
    description?: string;
  }
): Promise<Partner> {
  try {
    const response = await apiClient().post(`/auth/organizations/${organizationId}/partners`, payload);
    if (!response.data.success) throw new Error(response.data.resp_msg);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function fetchPartners(
  organizationId: string,
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<PartnerListResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append("search", search);

    const response = await apiClient().get(`/auth/organizations/${organizationId}/partners?${params.toString()}`);
    if (!response.data.success) throw new Error(response.data.resp_msg);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function fetchPartner(organizationId: string, partnerId: string): Promise<PartnerWithProducts> {
  try {
    const response = await apiClient().get(`/auth/organizations/${organizationId}/partners/${partnerId}`);
    if (!response.data.success) throw new Error(response.data.resp_msg);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updatePartner(
  organizationId: string,
  partnerId: string,
  payload: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    description?: string;
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  }
): Promise<Partner> {
  try {
    const response = await apiClient().put(`/auth/organizations/${organizationId}/partners/${partnerId}`, payload);
    if (!response.data.success) throw new Error(response.data.resp_msg);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deletePartner(organizationId: string, partnerId: string): Promise<void> {
  try {
    const response = await apiClient().delete(`/auth/organizations/${organizationId}/partners/${partnerId}`);
    if (!response.data.success) throw new Error(response.data.resp_msg);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function fetchPartnerProducts(
  organizationId: string,
  partnerId: string
): Promise<OrganizationProduct[]> {
  try {
    const response = await apiClient().get(`/auth/organizations/${organizationId}/partners/${partnerId}/products`);
    if (!response.data.success) throw new Error(response.data.resp_msg);
    return response.data.data || [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createProductForOrganization(
  organizationId: string,
  payload: {
    name: string;
    code: string;
    description?: string;
    partner_id?: string;
    baseUrl?: string;
    allowedCallbacks?: string[];
  }
): Promise<OrganizationProduct> {
  try {
    const response = await apiClient().post(
      `/auth/organizations/${organizationId}/products`,
      payload
    );
    if (!response.data.success) throw new Error(response.data.resp_msg);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
