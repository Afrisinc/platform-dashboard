export interface MemberProductAccess {
  id: string;
  organization_id: string;
  user_id: string;
  product_id: string;
  role_id?: string;
  product: {
    id: string;
    name: string;
    code: string;
  };
  role?: {
    id: string;
    name: string;
  };
}

export interface OrganizationProduct {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: "ACTIVE" | "INACTIVE";
  baseUrl?: string;
  partner_id?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface Partner {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  description?: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
}

export interface PartnerWithProducts extends Partner {
  products?: OrganizationProduct[];
}

export interface PartnerListResponse {
  partners: Partner[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
