export interface Partner {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
}

export interface ProductEnrollment {
  enrollmentId: string;
  status: string;
  plan: string;
  enrolledAt: string;
}

export interface OrganizationProduct {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: string;
  baseUrl?: string;
  partner?: Partner;
  enrollment?: ProductEnrollment;
}
