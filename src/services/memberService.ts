import apiClient from "./apiClient";
import type { Role, MemberProduct } from "@/types/members";

export async function fetchRoles(): Promise<Role[]> {
  try {
    const { data } = await apiClient().get("/auth/api/admin/roles");

    if (!data.success || !data.data?.roles) {
      throw new Error("Invalid API response format");
    }

    return data.data.roles || [];
  } catch (error) {
    throw error;
  }
}

export async function grantMemberProductAccess(
  organizationId: string,
  userId: string,
  productCode: string,
  roleId?: string,
): Promise<MemberProduct> {
  try {
    const { data } = await apiClient().post(
      `/auth/organizations/${organizationId}/members/${userId}/products`,
      {
        product_code: productCode,
        role_id: roleId,
      },
    );

    if (!data.success || !data.data) {
      throw new Error("Failed to grant product access");
    }

    return data.data;
  } catch (error) {
    throw error;
  }
}

export async function revokeMemberProductAccess(
  organizationId: string,
  userId: string,
  productCode: string,
): Promise<void> {
  try {
    const { data } = await apiClient().delete(
      `/auth/organizations/${organizationId}/members/${userId}/products/${productCode}`,
    );

    if (!data.success) {
      throw new Error("Failed to revoke product access");
    }
  } catch (error) {
    throw error;
  }
}

export async function fetchMemberProducts(
  organizationId: string,
  userId: string,
): Promise<MemberProduct[]> {
  try {
    const { data } = await apiClient().get(
      `/auth/organizations/${organizationId}/members/${userId}/products`,
    );

    if (!data.success || !data.data?.products) {
      throw new Error("Invalid API response format");
    }

    return data.data.products || [];
  } catch (error) {
    throw error;
  }
}
