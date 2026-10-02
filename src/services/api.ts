import { mongo, getSessionUserId } from '@/lib/supabase';
import type { Doc as DocType } from '@/lib/db';
import type { CaseMatch, Notification, Conversation, Message, Report, AuditLog, Profile, AdminStats, Case } from '@/types';

type MatchDoc = DocType & CaseMatch;
type NotifDoc = DocType & Notification;
type ConvDoc = DocType & Conversation;
type MsgDoc = DocType & Message;
type ReportDoc = DocType & Report;
type AuditDoc = DocType & AuditLog;
type ProfileDoc = DocType & Profile;
type CaseDoc = DocType & Case;

function strip<T extends DocType>(doc: T): Omit<T, '_id'> {
  const { _id, ...rest } = doc;
  return rest as Omit<T, '_id'>;
}

function cast<T>(doc: DocType): T {
  return strip(doc) as unknown as T;
}

// ============ MATCHES ============

export async function getPotentialMatches(caseId: string): Promise<CaseMatch[]> {
  const all = await mongo.findAll<MatchDoc>('case_matches');
  return all
    .filter((m) => m.found_case_id === caseId || m.missing_case_id === caseId)
    .sort((a, b) => b.overall_score - a.overall_score)
    .map((m) => cast<CaseMatch>(m));
}

export async function confirmMatch(matchId: string): Promise<{ error: string | null }> {
  const userId = getSessionUserId();
  await mongo.updateById<MatchDoc>('case_matches', matchId, { status: 'CONFIRMED', confirmed_by: userId } as Partial<MatchDoc>);
  return { error: null };
}

export async function rejectMatch(matchId: string): Promise<{ error: string | null }> {
  const userId = getSessionUserId();
  await mongo.updateById<MatchDoc>('case_matches', matchId, { status: 'REJECTED', rejected_by: userId } as Partial<MatchDoc>);
  return { error: null };
}

// ============ NOTIFICATIONS ============

export async function getNotifications(): Promise<Notification[]> {
  const userId = getSessionUserId();
  if (!userId) return [];
  const docs = await mongo.findMany<NotifDoc>('notifications', { user_id: userId });
  return docs
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((d) => cast<Notification>(d));
}

export async function markNotificationRead(id: string): Promise<void> {
  await mongo.updateById<NotifDoc>('notifications', id, { is_read: true });
}

export async function markAllNotificationsRead(): Promise<void> {
  const userId = getSessionUserId();
  if (!userId) return;
  const docs = await mongo.findMany<NotifDoc>('notifications', { user_id: userId, is_read: false });
  for (const d of docs) {
    await mongo.updateById<NotifDoc>('notifications', d._id as string, { is_read: true });
  }
}

export async function getUnreadCount(): Promise<number> {
  const userId = getSessionUserId();
  if (!userId) return 0;
  const docs = await mongo.findMany<NotifDoc>('notifications', { user_id: userId, is_read: false });
  return docs.length;
}

// ============ CONVERSATIONS & MESSAGES ============

export async function getConversations(): Promise<Conversation[]> {
  const userId = getSessionUserId();
  if (!userId) return [];
  const participants = await mongo.findMany<DocType & { conversation_id: string; user_id: string }>('conversation_participants', { user_id: userId });
  const convIds = participants.map((p) => p.conversation_id);
  const allConvs = await mongo.findAll<ConvDoc>('conversations');
  return allConvs
    .filter((c) => convIds.includes(c.id))
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .map((c) => cast<Conversation>(c));
}

export async function startConversation(
  caseId: string,
  otherUserId: string,
): Promise<{ conversation: Conversation | null; error: string | null }> {
  const userId = getSessionUserId();
  if (!userId) return { conversation: null, error: 'You must be signed in.' };

  const participants = await mongo.findAll<DocType & { conversation_id: string; user_id: string }>('conversation_participants');
  const existing = participants.find(
    (p) => p.user_id === otherUserId && participants.some((p2) => p2.user_id === userId && p2.conversation_id === p.conversation_id),
  );
  if (existing) {
    const conv = await mongo.findOne<ConvDoc>('conversations', { _id: existing.conversation_id });
    if (conv) return { conversation: cast<Conversation>(conv), error: null };
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const convDoc: ConvDoc = { _id: id, id, case_id: caseId, created_by: userId, created_at: now, updated_at: now };
  await mongo.insertOne('conversations', convDoc);
  await mongo.insertOne('conversation_participants', { _id: crypto.randomUUID(), conversation_id: id, user_id: userId, joined_at: now });
  await mongo.insertOne('conversation_participants', { _id: crypto.randomUUID(), conversation_id: id, user_id: otherUserId, joined_at: now });

  return { conversation: cast<Conversation>(convDoc), error: null };
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const docs = await mongo.findMany<MsgDoc>('messages', { conversation_id: conversationId });
  return docs
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((d) => cast<Message>(d));
}

export async function sendMessage(conversationId: string, body: string): Promise<{ error: string | null }> {
  const userId = getSessionUserId();
  if (!userId) return { error: 'You must be signed in.' };
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await mongo.insertOne<MsgDoc>('messages', { _id: id, id, conversation_id: conversationId, sender_id: userId, body, created_at: now });
  await mongo.updateById<ConvDoc>('conversations', conversationId, { updated_at: now });
  return { error: null };
}

// Real-time subscriptions are replaced with polling-based no-ops since there's no server
export function subscribeToMessages(_conversationId: string, _callback: (msg: Message) => void): () => void {
  return () => {};
}

export function subscribeToNotifications(_callback: (notif: Notification) => void): () => void {
  return () => {};
}

// ============ REPORTS ============

export async function createReport(
  caseId: string,
  reason: Report['reason'],
  description?: string,
): Promise<{ error: string | null }> {
  const userId = getSessionUserId();
  if (!userId) return { error: 'You must be signed in.' };
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await mongo.insertOne<ReportDoc>('reports', {
    _id: id, id, case_id: caseId, reported_by: userId, reason,
    description: description ?? null, status: 'PENDING',
    resolved_by: null, resolved_at: null, created_at: now, updated_at: now,
  });
  return { error: null };
}

export async function getReports(): Promise<Report[]> {
  const docs = await mongo.findAll<ReportDoc>('reports');
  return docs
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((d) => cast<Report>(d));
}

export async function resolveReport(
  id: string,
  status: Report['status'],
): Promise<{ error: string | null }> {
  const userId = getSessionUserId();
  await mongo.updateById<ReportDoc>('reports', id, { status, resolved_by: userId, resolved_at: new Date().toISOString() });
  return { error: null };
}

// ============ AUDIT LOGS ============

export async function getAuditLogs(): Promise<AuditLog[]> {
  const docs = await mongo.findAll<AuditDoc>('audit_logs');
  return docs
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 200)
    .map((d) => cast<AuditLog>(d));
}

export async function logAudit(
  action: string,
  entityType?: string,
  entityId?: string,
  details?: Record<string, unknown>,
): Promise<void> {
  const userId = getSessionUserId();
  await mongo.insertOne<AuditDoc>('audit_logs', {
    _id: crypto.randomUUID(), id: '', actor_id: userId, action,
    entity_type: entityType ?? null, entity_id: entityId ?? null,
    details: details ?? null, ip_address: null, created_at: new Date().toISOString(),
  });
}

// ============ ADMIN ============

export async function getAdminStats(): Promise<AdminStats | null> {
  const cases = await mongo.findAll<CaseDoc>('cases');
  const users = await mongo.findAll<ProfileDoc>('profiles');
  const reports = await mongo.findAll<ReportDoc>('reports');
  return {
    active_cases: cases.filter((c) => c.status === 'ACTIVE').length,
    pending_review: cases.filter((c) => c.status === 'PENDING_REVIEW').length,
    reported_cases: reports.filter((r) => r.status === 'PENDING').length,
    reunited_cases: cases.filter((c) => c.status === 'REUNITED').length,
    active_users: users.filter((u) => u.status === 'ACTIVE').length,
    suspended_users: users.filter((u) => u.status === 'SUSPENDED').length,
  };
}

export async function getAllUsers(): Promise<Profile[]> {
  const docs = await mongo.findAll<ProfileDoc>('profiles');
  return docs
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((d) => { const { _id, password_hash, ...p } = d as DocType & Profile & { password_hash: string }; return p as Profile; });
}

export async function suspendUser(userId: string): Promise<{ error: string | null }> {
  await mongo.updateById<ProfileDoc>('profiles', userId, { status: 'SUSPENDED' });
  return { error: null };
}

export async function restoreUser(userId: string): Promise<{ error: string | null }> {
  await mongo.updateById<ProfileDoc>('profiles', userId, { status: 'ACTIVE' });
  return { error: null };
}

export async function getAllCasesAdmin(): Promise<Case[]> {
  const docs = await mongo.findAll<CaseDoc>('cases');
  return docs
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((d) => cast<Case>(d));
}

export async function getPendingCases(): Promise<Case[]> {
  const docs = await mongo.findMany<CaseDoc>('cases', { status: 'PENDING_REVIEW' });
  return docs
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((d) => cast<Case>(d));
}
