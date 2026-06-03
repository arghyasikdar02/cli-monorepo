export type RoleKey = 'super_admin' | 'admin' | 'instructor' | 'lab_creator' | 'student' | 'marketing_manager' | 'sales_agent' | 'support_agent' | 'finance_admin_ops' | 'cli_admin';
export type ApiErrorCode = 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'RATE_LIMITED' | 'COURSE_ACCESS_DENIED' | 'LIVE_JOIN_WINDOW_CLOSED' | 'DOCUMENT_TOKEN_EXPIRED' | 'AI_USAGE_LIMIT_EXCEEDED' | 'PAYMENT_NOT_VERIFIED';
export type ApiError = { error: { code: ApiErrorCode; message: string; details?: unknown } };
export type CourseSummary = { id: string; slug: string; title: string; status: string; level?: string | null; priceCents: number };
export type DashboardMetric = { label: string; value: number | string; help?: string };
export type LeadInput = { name: string; email: string; phone?: string; city?: string; educationProfession?: string; interestedCourseId?: string; sourcePage: string; leadSource: string; message?: string; consentCheckbox: boolean };
