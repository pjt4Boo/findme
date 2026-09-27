import { supabase } from '@/lib/supabase';
import type { CaseMatch, Notification, Conversation, Message, Report, AuditLog, Profile, AdminStats } from '@/types';

// ============ MATCHES ============

export async function getPotentialMatches(caseId: string): Promise<CaseMatch[]> {
  const { data, error } = await supabase
    .from('case_matches')
    .select('*')
    .or(`found_case_id.eq.${caseId},missing_case_id.eq.${caseId}`)
    .order('overall_score', { ascending: false });
  if (error || !data) return [];
  return data as CaseMatch[];
}

export async function confirmMatch(matchId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('case_matches')
    .update({ status: 'CONFIRMED' })
    .eq('id', matchId);
  return { error: error?.message ?? null };
}

export async function rejectMatch(matchId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('case_matches')
    .update({ status: 'REJECTED' })
    .eq('id', matchId);
  return { error: error?.message ?? null };
}

// ============ NOTIFICATIONS ============

export async function getNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as Notification[];
}

export async function markNotificationRead(id: string): Promise<void> {
  await supabase.from('notifications').update({ is_read: true }).eq('id', id);
}

export async function markAllNotificationsRead(): Promise<void> {
  await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
}

export async function getUnreadCount(): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);
  if (error) return 0;
  return count ?? 0;
}

// ============ CONVERSATIONS & MESSAGES ============

export async function getConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error || !data) return [];
  return data as Conversation[];
}

export async function startConversation(
  caseId: string,
  otherUserId: string,
): Promise<{ conversation: Conversation | null; error: string | null }> {
  // Check if conversation already exists for this case between these users
  const { data: existing } = await supabase
    .from('conversations')
    .select('*, conversation_participants!inner(user_id)')
    .eq('case_id', caseId)
    .in('conversation_participants.user_id', [otherUserId]);

  if (existing && existing.length > 0) {
    return { conversation: existing[0] as Conversation, error: null };
  }

  const { data: convData, error: convError } = await supabase
    .from('conversations')
    .insert({ case_id: caseId })
    .select()
    .single();

  if (convError || !convData) return { conversation: null, error: convError?.message ?? 'Failed to create conversation.' };

  const conv = convData as Conversation;

  // Add both participants
  const { data: me } = await supabase.auth.getUser();
  if (me.user) {
    await supabase.from('conversation_participants').insert([
      { conversation_id: conv.id, user_id: me.user.id },
      { conversation_id: conv.id, user_id: otherUserId },
    ]);
  }

  return { conversation: conv, error: null };
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return data as Message[];
}

export async function sendMessage(conversationId: string, body: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('messages').insert({ conversation_id: conversationId, body });
  if (error) return { error: error.message };
  // Update conversation timestamp
  await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);
  return { error: null };
}

export function subscribeToMessages(conversationId: string, callback: (msg: Message) => void): () => void {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      (payload) => callback(payload.new as Message),
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export function subscribeToNotifications(callback: (notif: Notification) => void): () => void {
  const channel = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications' },
      (payload) => callback(payload.new as Notification),
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

// ============ REPORTS ============

export async function createReport(
  caseId: string,
  reason: Report['reason'],
  description?: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('reports').insert({
    case_id: caseId,
    reason,
    description: description ?? null,
  });
  return { error: error?.message ?? null };
}

export async function getReports(): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as Report[];
}

export async function resolveReport(
  id: string,
  status: Report['status'],
): Promise<{ error: string | null }> {
  const { data: me } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('reports')
    .update({ status, resolved_by: me.user?.id ?? null, resolved_at: new Date().toISOString() })
    .eq('id', id);
  return { error: error?.message ?? null };
}

// ============ AUDIT LOGS ============

export async function getAuditLogs(): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error || !data) return [];
  return data as AuditLog[];
}

export async function logAudit(
  action: string,
  entityType?: string,
  entityId?: string,
  details?: Record<string, unknown>,
): Promise<void> {
  await supabase.from('audit_logs').insert({
    action,
    entity_type: entityType ?? null,
    entity_id: entityId ?? null,
    details: details ?? null,
  });
}

// ============ ADMIN ============

export async function getAdminStats(): Promise<AdminStats | null> {
  const { data, error } = await supabase.rpc('get_admin_stats');
  if (error || !data || data.length === 0) return null;
  return data[0] as AdminStats;
}

export async function getAllUsers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as Profile[];
}

export async function suspendUser(userId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('profiles').update({ status: 'SUSPENDED' }).eq('id', userId);
  return { error: error?.message ?? null };
}

export async function restoreUser(userId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('profiles').update({ status: 'ACTIVE' }).eq('id', userId);
  return { error: error?.message ?? null };
}

export async function getAllCasesAdmin(): Promise<Case[]> {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as Case[];
}

export async function getPendingCases(): Promise<Case[]> {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('status', 'PENDING_REVIEW')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as Case[];
}

// Re-export Case type for convenience
import type { Case } from '@/types';
