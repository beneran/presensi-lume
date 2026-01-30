export type Role = 'admin' | 'assessor' | 'participant';

export interface User {
  id: string;
  name: string;
  nrk: string; // Employee ID
  role: Role;
  avatarUrl: string;
}

export interface Participant extends User {
  status: 'present' | 'absent';
  checkInTime?: Date;
  selfieUrl?: string;
}

export interface Session {
  id: string;
  title: string;
  timeRange: string;
  status: 'upcoming' | 'live' | 'completed';
  totalParticipants: number;
}

export interface Assessment {
  participantId: string;
  sessionId: string;
  scores: {
    comprehension: number;
    participation: number;
    creativity: number;
  };
  notes: string;
  completed: boolean;
}