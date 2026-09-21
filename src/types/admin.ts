export type Role = 'ADMIN' | 'MANAGER' | 'SELLER';
export interface AdminUser { id: string; name: string; role: Role }
export interface MarketingPopup { id: string; imageUrl: string; active: boolean; updatedAt: string }
export const ROLE_LABELS: Record<Role, string> = { ADMIN: 'Admin', MANAGER: 'Gerência', SELLER: 'Vendedor' };
