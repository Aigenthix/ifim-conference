const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
};

class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = "ApiError";
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (token) {
    (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  if (body) {
    config.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, config);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      errorData?.error?.code || "UNKNOWN",
      errorData?.error?.message || res.statusText
    );
  }

  return res.json();
}

// ── Auth ──────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; phone: string; event_slug: string }) =>
    request<{ user_id: string; event_id: string; access_token: string }>("/api/v1/auth/register", {
      method: "POST",
      body: data,
    }),
};

// ── Events ────────────────────────────────────────────────
export const eventsApi = {
  getLobby: (slug: string, token: string) =>
    request<EventLobby>(`/api/v1/events/${slug}/lobby`, { token }),
};

// ── Polls ─────────────────────────────────────────────────
export const pollsApi = {
  getEventPolls: (eventId: string, token: string) =>
    request<Poll[]>(`/api/v1/polls/event/${eventId}`, { token }),

  getPoll: (pollId: string, token: string) =>
    request<Poll>(`/api/v1/polls/${pollId}`, { token }),

  vote: (pollId: string, optionId: string, token: string) =>
    request<{ poll_id: string; option_id: string; status: string }>(`/api/v1/polls/${pollId}/vote`, {
      method: "POST",
      body: { option_id: optionId },
      token,
    }),

  generate: (eventId: string, token: string) =>
    request<{ status: string }>(`/api/v1/polls/generate/${eventId}`, {
      method: "POST",
      token,
    }),
};

// ── Feedback ──────────────────────────────────────────────
export const feedbackApi = {
  submit: (data: { event_id: string; rating: number; comments?: string }, token: string) =>
    request<FeedbackResponse>("/api/v1/feedback", { method: "POST", body: data, token }),
  check: (eventId: string, token: string) =>
    request<{ submitted: boolean; rating?: number; comments?: string }>(`/api/v1/feedback/check/${eventId}`, { token }),
};

// ── Certificates ──────────────────────────────────────────
export const certificatesApi = {
  getMine: (token: string) =>
    request<Certificate>("/api/v1/certificates/me", { token }),
};

// ── Gallery ───────────────────────────────────────────────
export const galleryApi = {
  listPhotos: (eventId: string, token: string) =>
    request<GalleryPhoto[]>(`/api/v1/gallery/${eventId}`, { token }),
};

// ── Chatbot ───────────────────────────────────────────────
export const chatbotApi = {
  query: (data: { event_id: string; query: string }, token: string) =>
    request<ChatResponse>("/api/v1/chatbot/query", { method: "POST", body: data, token }),
};

// ── Admin ─────────────────────────────────────────────────
export const adminApi = {
  getDashboard: (eventId: string, token: string) =>
    request<Dashboard>(`/api/v1/admin/dashboard/${eventId}`, { token }),
};

// ── Types ─────────────────────────────────────────────────
export type EventLobby = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  overview: Record<string, unknown> | null;
  speakers: Record<string, unknown>[] | null;
  team: Record<string, unknown>[] | null;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
};

export type PollOption = {
  id: string;
  option_text: string;
  display_order: number;
  vote_count: number;
};

export type Poll = {
  id: string;
  question: string;
  is_active: boolean;
  options: PollOption[];
};

export type FeedbackResponse = {
  id: string;
  event_id: string;
  user_id: string;
  rating: number;
  comments: string | null;
  certificate_status: string;
};

export type Certificate = {
  id: string;
  user_id: string;
  event_id: string;
  pdf_url: string | null;
  status: string;
};

export type GalleryPhoto = {
  filename: string;
  size: number;
  download_url: string;
};

export type ChatResponse = {
  query: string;
  response: string;
  sources: string[];
};

export type Dashboard = {
  total_registrations: number;
  live_concurrent_users: number;
  total_polls: number;
  total_votes: number;
  total_feedback: number;
  average_rating: number;
  total_queries: number;
  top_queries: string[];
};

export { ApiError };
