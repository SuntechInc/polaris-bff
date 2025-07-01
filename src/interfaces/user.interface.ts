export interface UserPayload {
  sub: string; // user ID
  email: string;
  companyId?: string;
  actionCompanyId?: string;
  userType: 'GLOBAL_ADMIN' | 'COMPANY_ADMIN' | 'EMPLOYEE';
  iat?: number; // issued at
  exp?: number; // expiration
}

export interface RequestWithUser {
  user: UserPayload;
} 