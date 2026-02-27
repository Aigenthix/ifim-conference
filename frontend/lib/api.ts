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

  if (res.status === 204) {
    return null as T;
  }

  return res.json();
}

// ── Auth ──────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email?: string; phone?: string; event_slug: string }) =>
    request<{
      user_id: string; event_id: string; access_token: string;
      user_name: string; user_email: string; user_phone: string;
      user_company: string | null; user_food_preference: string | null; user_tshirt_size: string | null; user_growth_focus: string | null;
    }>("/api/v1/auth/register", {
      method: "POST",
      body: data,
    }),
};

// ── Events ────────────────────────────────────────────────
export const eventsApi = {
  getLobby: (slug: string, token: string) =>
    request<EventLobby>(`/api/v1/events/${slug}/lobby`, { token }),
  getDashboard: (slug: string, token: string) =>
    request<Dashboard>(`/api/v1/events/${slug}/dashboard`, { token }),
  getStrategyCompassTopics: (slug: string, token: string, count = 8) =>
    request<StrategyCompassTopicsResponse>(`/api/v1/events/${slug}/strategy-compass-topics?count=${count}`, { token }),
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
    request<FeedbackResponse>("/api/v1/feedback/", { method: "POST", body: data, token }),
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
  query: (data: { event_id: string; query: string; history?: {role: string, content: string}[] }, token: string) =>
    request<ChatResponse>("/api/v1/chatbot/query", { method: "POST", body: data, token }),
};

// ── Admin ─────────────────────────────────────────────────
export const adminApi = {
  getDashboard: (eventId: string, token: string) =>
    request<Dashboard>(`/api/v1/admin/dashboard/${eventId}`, { token }),
  login: (email: string, password: string) =>
    request<AdminLoginResponse>("/api/v1/admin/login", {
      method: "POST",
      body: { email, password },
    }),
  addUser: (eventId: string, data: { name: string; email: string; phone: string; company?: string; food_preference?: string; tshirt_size?: string; growth_focus?: string }, token: string) =>
    request<{ user_id: string; message: string }>(`/api/v1/admin/users/${eventId}`, { method: "POST", body: data, token }),
  getAttendance: (eventId: string, token: string) =>
    request<AttendanceResponse>(`/api/v1/admin/attendance/${eventId}`, { token }),
  scanAttendanceQr: (eventId: string, data: { qr_payload: string }, token: string) =>
    request<ScanAttendanceResponse>(`/api/v1/admin/attendance/${eventId}/scan`, {
      method: "POST",
      body: data,
      token,
    }),
  toggleGoodies: (eventId: string, data: { user_id: string; goodies_given: boolean }, token: string) =>
    request<{ success: boolean; goodies_given: boolean }>(`/api/v1/admin/goodies/${eventId}`, { method: "POST", body: data, token }),
  getFeedback: (eventId: string, token: string) =>
    request<FeedbackListResponse>(`/api/v1/admin/feedback/${eventId}`, { token }),
  // Food Attendance
  getFoodAttendance: (eventId: string, token: string) =>
    request<FoodAttendanceResponse>(`/api/v1/admin/food-attendance/${eventId}`, { token }),
  scanFoodQr: (eventId: string, data: { qr_payload: string; slot?: string }, token: string) =>
    request<FoodScanResponse>(`/api/v1/admin/food-attendance/${eventId}/scan`, { method: "POST", body: data, token }),
  toggleFoodSlot: (eventId: string, data: { user_id: string; slot: string; value: boolean }, token: string) =>
    request<{ success: boolean; attendee: FoodAttendanceItem }>(`/api/v1/admin/food-attendance/${eventId}/toggle`, { method: "POST", body: data, token }),
};

// ── Sessions ──────────────────────────────────────────────
export const sessionsApi = {
  getEventSessions: (eventId: string, token: string) =>
    request<{ sessions: SessionItem[] }>(`/api/v1/sessions/event/${eventId}`, { token }),
  create: (data: { event_id: string; title: string; speaker_name?: string; speaker_title?: string; description?: string; day: number; display_order?: number; audio_url?: string; video_url?: string }, token: string) =>
    request<SessionItem>("/api/v1/sessions/", { method: "POST", body: data, token }),
  delete: (sessionId: string, token: string) =>
    request<void>(`/api/v1/sessions/${sessionId}`, { method: "DELETE", token }),
};

// ── Alerts ────────────────────────────────────────────────
export const alertsApi = {
  getEventAlerts: (eventId: string, token: string) =>
    request<{ alerts: AlertItem[] }>(`/api/v1/alerts/event/${eventId}`, { token }),
  create: (data: { event_id: string; title: string; message: string; is_pinned?: boolean }, token: string) =>
    request<AlertItem>("/api/v1/alerts/", { method: "POST", body: data, token }),
  getAutoAlertStatus: (eventId: string, token: string) =>
    request<{ enabled: boolean }>(`/api/v1/alerts/auto/${eventId}`, { token }),
  toggleAutoAlerts: (eventId: string, enabled: boolean, token: string) =>
    request<{ enabled: boolean }>(`/api/v1/alerts/auto/${eventId}`, { method: "POST", body: { enabled }, token }),
};

// ── Q&A ──────────────────────────────────────────────────
export const qaApi = {
  getSessions: (eventId: string, token: string) =>
    request<{ sessions: QASessionItem[] }>(`/api/v1/qa/${eventId}/sessions`, { token }),
  getQuestions: (
    eventId: string,
    token: string,
    options?: { after?: string; limit?: number }
  ) => {
    const params = new URLSearchParams();
    if (options?.after) params.set("after", options.after);
    if (typeof options?.limit === "number") params.set("limit", String(options.limit));
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return request<{ questions: QAQuestionItem[] }>(`/api/v1/qa/${eventId}${suffix}`, { token });
  },
  ask: (data: { event_id: string; session_id: string; question: string }, token: string) =>
    request<QAQuestionItem>("/api/v1/qa/ask", { method: "POST", body: data, token }),
};

// ── Community Chat ───────────────────────────────────────
export const communityApi = {
  getMessages: (
    eventId: string,
    token: string,
    options?: { after?: string; limit?: number }
  ) => {
    const params = new URLSearchParams();
    if (options?.after) params.set("after", options.after);
    if (typeof options?.limit === "number") params.set("limit", String(options.limit));
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return request<{ messages: CommunityMessageItem[] }>(`/api/v1/community/${eventId}${suffix}`, { token });
  },
  send: (
    data: { 
      event_id: string; 
      message: string;
      reply_to_id?: string;
      reply_to_user_name?: string;
      reply_to_message?: string;
    }, 
    token: string
  ) =>
    request<CommunityMessageItem>("/api/v1/community/send", { method: "POST", body: data, token }),
};
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

export type StrategyCompassTopic = {
  title: string;
  explanation: string;
  how_it_works?: string;
  business_impact?: string;
  implementation_steps?: string[];
  kpis?: string[];
};

export type StrategyCompassTopicsResponse = {
  topics: StrategyCompassTopic[];
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

export type AdminLoginResponse = {
  token: string;
  admin_id: string;
  email: string;
  role: string;
};

export type SessionItem = {
  id: string;
  event_id: string;
  title: string;
  speaker_name: string | null;
  speaker_title: string | null;
  day: number;
  display_order: number;
  audio_url: string | null;
  video_url: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export type AlertItem = {
  id: string;
  event_id: string;
  title: string;
  message: string;
  is_pinned: boolean;
  created_at: string;
};

export type AttendeeItem = {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  food_preference: string | null;
  tshirt_size: string | null;
  growth_focus: string | null;
  goodies_given: boolean;
  registered_at: string;
};

export type AttendanceResponse = {
  total: number;
  attendees: AttendeeItem[];
};

export type ScanAttendanceResponse = {
  success: boolean;
  message: string;
  attendee: AttendeeItem;
  goodies_given: boolean;
};

export type FoodAttendanceItem = {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  food_preference: string | null;
  growth_focus: string | null;
  dinner1: boolean;
  breakfast: boolean;
  tea1: boolean;
  tea2: boolean;
  lunch: boolean;
  tea3: boolean;
  dinner2: boolean;
  tea4: boolean;
  total_meals: number;
};

export type FoodAttendanceResponse = {
  total: number;
  total_meals_served: number;
  attendees: FoodAttendanceItem[];
};

export type FoodScanResponse = {
  success: boolean;
  message: string;
  attendee: FoodAttendanceItem;
  slot_filled: string;
};

export type FeedbackItemDetail = {
  user_name: string;
  user_email: string;
  rating: number;
  comments: string | null;
  submitted_at: string;
};

export type FeedbackListResponse = {
  total: number;
  average_rating: number;
  feedback: FeedbackItemDetail[];
};

export type QAQuestionItem = {
  id: string;
  session_id: string;
  user_name: string;
  question: string;
  answer: string | null;
  created_at: string;
};

export type QASessionItem = {
  id: string;
  title: string;
  speaker_name: string | null;
  day: string;
  day_number: number;
  time_range: string;
  display_order: number;
};

export type CommunityMessageItem = {
  id: string;
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
  reply_to_id?: string | null;
  reply_to_user_name?: string | null;
  reply_to_message?: string | null;
};

export type TicketItem = {
  id: string;
  ticket_id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  designation: string | null;
  email_status: string;
  scanned: boolean;
  scanned_at: string | null;
  created_at: string;
};

export const bulkEmailApi = {
  upload: async (formData: FormData, token: string) => {
    const res = await fetch(`${API_BASE}/api/v1/bulk-email/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Upload failed" }));
      throw new Error(err.detail || "Upload failed");
    }
    return res.json() as Promise<{ total: number; created: number; skipped: number; message: string }>;
  },
  getTickets: (eventId: string, token: string) =>
    request<TicketItem[]>(`/api/v1/bulk-email/${eventId}/tickets`, { token }),
  scan: (ticketId: string, token: string) =>
    request<{ status: string; name?: string; ticket_id?: string; scanned_at?: string }>(
      "/api/v1/bulk-email/scan",
      { method: "POST", body: { ticket_id: ticketId }, token }
    ),
  retry: (body: { event_id: string; smtp_host: string; smtp_port: number; sender_email: string; sender_password: string; provider: string }, token: string) =>
    request<{ pending_count: number; message: string }>(
      "/api/v1/bulk-email/retry",
      { method: "POST", body, token }
    ),
};

export { ApiError };
