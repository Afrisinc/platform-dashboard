export interface Role {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  rolePermissions: Array<{
    id: string;
    role_id: string;
    permission_id: string;
    createdAt: string;
  }>;
  roleSidebarItems: Array<{
    id: string;
    role_id: string;
    sidebar_item_id: string;
    createdAt: string;
  }>;
}

export interface MemberProduct {
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

export interface MemberProductAccess {
  product_code: string;
  role_id?: string;
}
