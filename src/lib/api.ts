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
    const res = await fetch(`${API_URL}/api/sessions`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ user_id: userId, name }),
    });
    if (!res.ok) throw new Error("Failed to create session");
    return res.json();
  },

  async listSessions(userId: string): Promise<Session[]> {
    const res = await fetch(`${API_URL}/api/users/${userId}/sessions`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to list sessions");
    return res.json();
  },

  async deleteSession(sessionId: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/sessions/${sessionId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete session");
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
