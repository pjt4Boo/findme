import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState, EmptyState } from '@/components/States';
import { getMessages, sendMessage, subscribeToMessages } from '@/services/api';
import { messageSchema } from '@/lib/validation';
import type { Message } from '@/types';

export function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    getMessages(id).then((data) => {
      setMessages(data);
      setLoading(false);
    });

    const unsub = subscribeToMessages(id, (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => unsub();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = messageSchema.safeParse({ body: input });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid message.');
      return;
    }
    setError(null);
    const { error: sendError } = await sendMessage(id!, input);
    if (sendError) {
      setError(sendError);
      return;
    }
    setInput('');
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 flex flex-col" style={{ height: 'calc(100vh - 3.5rem)' }}>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> {t('common.back')}
        </button>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Shield className="h-3.5 w-3.5" />
          {t('chat.secureChat')}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 space-y-3">
        {loading ? (
          <LoadingState />
        ) : messages.length === 0 ? (
          <EmptyState title={t('chat.noMessages')} />
        ) : (
          <>
            {messages.map((msg) => {
              const isMe = msg.sender_id === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                    <p className={`mt-1 text-xs ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('chat.sendMessage')}
          className="flex-1 rounded-full border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      <p className="mt-2 text-center text-xs text-gray-400">
        Your phone number and email are never shared. Communication stays in-app.
      </p>
    </div>
  );
}
