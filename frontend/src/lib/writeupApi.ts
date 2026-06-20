import { apiFetch } from './apiClient';

export type WriteupStatus = 'draft' | 'pending_review' | 'needs_revision' | 'approved' | 'scheduled' | 'published' | 'rejected' | 'archived';
export type Locale = 'en' | 'fa';
export type Translation = { locale: Locale; title: string; slug: string; short_summary: string; key_findings?: string[]; technical_overview?: string; attack_explanation?: string; root_cause?: string; impact?: string; mitigation?: string; developer_lessons?: string; conclusion?: string; translation_status?: string };
export type Writeup = { id: number; translation_fallback?: boolean; original_title: string; canonical_url?: string | null; original_author?: string | null; original_language: string; original_published_at?: string | null; difficulty?: string | null; writeup_type?: string | null; reading_time_minutes?: number | null; featured_image_url?: string | null; status: WriteupStatus; ingestion_method: string; is_featured?: boolean; ai_generated?: boolean; ai_provider?: string | null; ai_model?: string | null; ai_confidence?: string | null; internal_notes?: string | null; source?: { name: string; slug: string; base_url?: string } | null; source_id?: number | null; translations: Translation[]; tags: string[]; vulnerabilities: string[]; labs: string[]; created_at?: string; scheduled_for?: string | null; published_at?: string | null };
export type Paginated<T> = { data: T[]; meta?: { current_page: number; last_page: number; total: number } };
export type WriteupPayload = Omit<Partial<Writeup>, 'id' | 'status' | 'translations' | 'tags' | 'vulnerabilities' | 'labs'> & { original_title: string; translations: Translation[]; tags?: string[]; vulnerability_ids?: string[]; lab_keys?: string[] };

export const adminWriteups = (query = '') => apiFetch<Paginated<Writeup>>(`admin/writeups${query}`);
export const adminWriteup = (id: string | number) => apiFetch<{ data: Writeup }>(`admin/writeups/${id}`);
export const createWriteup = (data: WriteupPayload) => apiFetch<{ data: Writeup }>('admin/writeups', { method: 'POST', body: JSON.stringify(data) });
export const updateWriteup = (id: number, data: WriteupPayload) => apiFetch<{ data: Writeup }>(`admin/writeups/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const transitionWriteup = (id: number, operation: string, body?: Record<string, string>) => apiFetch<{ data: Writeup }>(`admin/writeups/${id}/${operation}`, { method: 'POST', body: JSON.stringify(body ?? {}) });
export const deleteWriteup = (id: number) => apiFetch<{ data: null }>(`admin/writeups/${id}`, { method: 'DELETE' });
export const writeupSources = () => apiFetch<{ data: { data: Source[] } }>('admin/writeup-sources');
export const automationRuns = () => apiFetch<{ data: { data: AutomationRun[] } }>('admin/writeup-automation-runs');
export type Source = { id: number; name: string; slug: string; base_url: string; source_type: string; original_language: string; is_enabled: boolean; feed_url?: string | null; api_url?: string | null; fetch_interval_minutes?: number | null; last_checked_at?: string | null; last_success_at?: string | null; last_error_at?: string | null; last_error_message?: string | null };
export type AutomationRun = { id: number; run_uuid: string; provider: string; status: string; started_at: string; completed_at?: string | null; sources_checked: number; items_discovered: number; items_imported: number; duplicates_skipped: number; items_rejected: number; translation_failures: number; error_summary?: string | null };
