const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface User {
  id: string;
  email: string;
  role: string;
  dialysis_frequency?: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Session {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface Message {
  id: string;
  session_id: string;
  role: string;
  content: string;
  created_at: string;
  citations?: any[]; 
}

const getHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("nephroaid_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
};

const fetchAPI = async (endpoint: string, options?: RequestInit) => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to fetch ${endpoint}`);
  }
  if (res.status === 204) return null;
  return res.json();
};

export const api = {
  // Auth
  async register(data: any): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to register");
    }
    return res.json();
  },

  async login(data: any): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to login");
    }
    return res.json();
  },

  // Sessions
  async createSession(userId: string, name: string): Promise<Session> {
    return fetchAPI("/api/sessions", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, name }),
    });
  },

  async listSessions(userId: string): Promise<Session[]> {
    return fetchAPI(`/api/users/${userId}/sessions`);
  },

  async deleteSession(sessionId: string): Promise<void> {
    return fetchAPI(`/api/sessions/${sessionId}`, {
      method: "DELETE",
    });
  },

  // -------------------------
  // Profiles
  // -------------------------
  updateProfile: async (userId: string, data: { email: string; role: string; dialysis_frequency: string; target_dry_weight: number }) => {
    return fetchAPI(`/api/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // -------------------------
  // Weights
  // -------------------------
  getWeights: async (userId: string) => {
    return fetchAPI(`/api/users/${userId}/weights`);
  },
  
  addWeight: async (userId: string, data: { date: string; preWeight: number; postWeight: number }) => {
    return fetchAPI(`/api/users/${userId}/weights`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  
  deleteWeight: async (weightId: string) => {
    return fetchAPI(`/api/weights/${weightId}`, {
      method: "DELETE",
    });
  },

  // -------------------------
  // Labs
  // -------------------------
  getLabs: async (userId: string) => {
    return fetchAPI(`/api/users/${userId}/labs`);
  },
  
  addLab: async (userId: string, data: { date: string; kreatinin: number; ureum: number; kalium: number; hb: number }) => {
    return fetchAPI(`/api/users/${userId}/labs`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  
  deleteLab: async (labId: string) => {
    return fetchAPI(`/api/labs/${labId}`, {
      method: "DELETE",
    });
  },

  // Messages
  async addMessage(sessionId: string, role: string, content: string): Promise<Message> {
    const res = await fetch(`${API_URL}/api/sessions/${sessionId}/messages`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ role, content }),
    });
    if (!res.ok) throw new Error("Failed to add message");
    return res.json();
  },

  async listMessages(sessionId: string): Promise<Message[]> {
    const res = await fetch(`${API_URL}/api/sessions/${sessionId}/messages`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to list messages");
    return res.json();
  },
};
