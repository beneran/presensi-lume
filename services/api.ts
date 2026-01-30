// API client for Lume backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Types for API responses
export interface ParticipantResponse {
  id: string;
  name: string;
  nip: string;
  nrk: string;
  gol: string;
  jabatan: string;
  unitKerja: string;
  role: string;
  avatarUrl: string;
  status: 'present' | 'absent';
  checkInTime?: string;
  selfieUrl?: string;
}

export interface SessionResponse {
  id: string;
  title: string;
  description?: string;
  timeRange: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'live' | 'completed';
  assessor?: {
    id: string;
    name: string;
    nrk?: string;
  };
  totalParticipants: number;
}

export interface AttendanceStatsResponse {
  total: number;
  present: number;
  absent: number;
  rate: number;
}

export interface CheckInResponse {
  success: boolean;
  message: string;
  checkInTime: string;
  participant: {
    id: string;
    name: string;
    nrk: string;
  };
}

export interface AssessmentResponse {
  id: string | null;
  assessorId: string;
  participantId: string;
  sessionId: string;
  scores: {
    comprehension: number;
    participation: number;
    creativity: number;
  };
  totalScore: number;
  notes: string;
  completed: boolean;
}

export interface AssessmentProgressResponse {
  completed: number;
  total: number;
  percentage: number;
}

// Participant APIs
export const participantsApi = {
  getAll: (sessionId?: string): Promise<ParticipantResponse[]> => {
    const query = sessionId ? `?sessionId=${sessionId}` : '';
    return fetchApi(`/participants${query}`);
  },

  search: (query: string): Promise<ParticipantResponse[]> => {
    return fetchApi(`/participants/search?q=${encodeURIComponent(query)}`);
  },

  getById: (id: string): Promise<ParticipantResponse> => {
    return fetchApi(`/participants/${id}`);
  },

  create: (data: { name: string; nrk: string; email?: string }): Promise<ParticipantResponse> => {
    return fetchApi('/participants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (id: string, data: { name?: string; nrk?: string; email?: string }): Promise<ParticipantResponse> => {
    return fetchApi(`/participants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: (id: string): Promise<{ message: string }> => {
    return fetchApi(`/participants/${id}`, {
      method: 'DELETE',
    });
  },
};

// Session APIs
export const sessionsApi = {
  getAll: (): Promise<SessionResponse[]> => {
    return fetchApi('/sessions');
  },

  getById: (id: string): Promise<SessionResponse> => {
    return fetchApi(`/sessions/${id}`);
  },

  create: (data: {
    title: string;
    description?: string;
    timeRange: string;
    startTime: string;
    endTime: string;
    assessorId?: string;
    status?: 'upcoming' | 'live' | 'completed';
  }): Promise<SessionResponse> => {
    return fetchApi('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (id: string, data: Partial<{
    title: string;
    description: string;
    timeRange: string;
    startTime: string;
    endTime: string;
    assessorId: string;
    status: 'upcoming' | 'live' | 'completed';
  }>): Promise<SessionResponse> => {
    return fetchApi(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: (id: string): Promise<{ message: string }> => {
    return fetchApi(`/sessions/${id}`, {
      method: 'DELETE',
    });
  },
};

// Attendance APIs
export const attendanceApi = {
  getBySession: (sessionId: string): Promise<{
    id: string;
    participantId: string;
    participantName: string;
    participantNrk: string;
    avatarUrl: string;
    sessionId: string;
    checkInTime: string;
    selfieUrl?: string;
  }[]> => {
    return fetchApi(`/attendance/session/${sessionId}`);
  },

  getStats: (sessionId: string): Promise<AttendanceStatsResponse> => {
    return fetchApi(`/attendance/stats/${sessionId}`);
  },

  checkIn: (data: {
    userId: string;
    sessionId: string;
    selfieData?: string;
    deviceFingerprint?: string;
    location?: { latitude: number; longitude: number };
  }): Promise<CheckInResponse> => {
    return fetchApi('/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getStatus: (userId: string, sessionId: string): Promise<{ isCheckedIn: boolean; checkInTime: string | null }> => {
    return fetchApi(`/attendance/status/${userId}/${sessionId}`);
  },

  remove: (id: string): Promise<{ message: string }> => {
    return fetchApi(`/attendance/${id}`, {
      method: 'DELETE',
    });
  },
};

// Assessment APIs
export const assessmentsApi = {
  getBySession: (sessionId: string, assessorId?: string): Promise<{
    id: string;
    assessorId: string;
    assessorName: string;
    participantId: string;
    participantName: string;
    participantNrk: string;
    participantAvatar: string;
    sessionId: string;
    scores: { comprehension: number; participation: number; creativity: number };
    totalScore: number;
    notes: string;
    completed: boolean;
  }[]> => {
    const query = assessorId ? `?assessorId=${assessorId}` : '';
    return fetchApi(`/assessments/session/${sessionId}${query}`);
  },

  getProgress: (sessionId: string, assessorId?: string): Promise<AssessmentProgressResponse> => {
    const query = assessorId ? `?assessorId=${assessorId}` : '';
    return fetchApi(`/assessments/progress/${sessionId}${query}`);
  },

  get: (sessionId: string, participantId: string, assessorId: string): Promise<AssessmentResponse> => {
    return fetchApi(`/assessments/${sessionId}/${participantId}?assessorId=${assessorId}`);
  },

  save: (data: {
    assessorId: string;
    participantId: string;
    sessionId: string;
    scores: { comprehension: number; participation: number; creativity: number };
    notes: string;
    completed: boolean;
  }): Promise<AssessmentResponse> => {
    return fetchApi('/assessments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  delete: (id: string): Promise<{ message: string }> => {
    return fetchApi(`/assessments/${id}`, {
      method: 'DELETE',
    });
  },
};

// Seed API (for initial data setup)
export const seedApi = {
  seed: (reset = false): Promise<{ message: string; counts: Record<string, number> }> => {
    return fetchApi('/seed', {
      method: 'POST',
      body: JSON.stringify({ reset }),
    });
  },

  getStatus: (): Promise<Record<string, number>> => {
    return fetchApi('/seed/status');
  },
};

// Health check
export const healthApi = {
  check: (): Promise<{ status: string; mongodb: string; timestamp: string }> => {
    return fetchApi('/health');
  },
};
