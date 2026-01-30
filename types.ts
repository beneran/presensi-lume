export type Role = 'admin' | 'assessor' | 'participant';

export interface User {
  id: string;
  name: string;
  nip: string; // Nomor Induk Pegawai
  nrk: string; // Nomor Registrasi Kepegawaian
  gol: string; // Golongan
  jabatan: string; // Jabatan/Position
  unitKerja: string; // Unit Kerja
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