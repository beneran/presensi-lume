import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutGrid, 
  Users, 
  CheckCircle2, 
  Search, 
  Camera, 
  ChevronRight, 
  ArrowLeft,
  Bell,
  Menu,
  Clock,
  MoreHorizontal,
  X,
  User as UserIcon,
  Copy,
  Zap,
  Calendar,
  BarChart3
} from 'lucide-react';
import { Participant, Session, Assessment, Role } from './types';

// --- Mock Data Generators ---
const generateParticipants = (count: number): Participant[] => {
  const names = [
    "Alex Chen", "Sarah Miller", "James O'Connor", "Priya Patel", "David Kim",
    "Elena Rodriguez", "Michael Chang", "Emma Wilson", "Lucas Silva", "Olivia Jones",
    "Noah Brown", "Sophia Davis", "Liam Garcia", "Isabella Martinez", "Mason Robinson",
    "Ava Clark", "Ethan Lewis", "Mia Lee", "Logan Walker", "Charlotte Hall"
  ];
  
  return Array.from({ length: count }).map((_, i) => ({
    id: `user-${i}`,
    name: names[i % names.length] + (i > 19 ? ` ${i}` : ''),
    nrk: `NRK-${1000 + i}`,
    role: 'participant',
    avatarUrl: `https://picsum.photos/seed/${i}/200/200`,
    status: Math.random() > 0.7 ? 'present' : 'absent', // Initial random state
    checkInTime: Math.random() > 0.7 ? new Date(Date.now() - Math.random() * 3600000) : undefined
  }));
};

const MOCK_SESSIONS: Session[] = [
  {
    id: 'sess-1',
    title: 'Material: Strategic Planning',
    timeRange: '09:00 - 11:00',
    status: 'live',
    totalParticipants: 90
  },
  {
    id: 'sess-2',
    title: 'Workshop: Design Thinking',
    timeRange: '11:30 - 13:00',
    status: 'upcoming',
    totalParticipants: 90
  },
  {
    id: 'sess-3',
    title: 'Presentation: Q3 Financials',
    timeRange: '14:00 - 15:30',
    status: 'upcoming',
    totalParticipants: 90
  },
  {
    id: 'sess-4',
    title: 'Closing Ceremony & Awards',
    timeRange: '16:00 - 17:00',
    status: 'upcoming',
    totalParticipants: 90
  }
];

// --- Reusable UI Components ---

const GlassPanel: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] rounded-2xl ${className}`}
  >
    {children}
  </div>
);

const Button: React.FC<{ 
  children: React.ReactNode; 
  variant?: 'primary' | 'glass' | 'ghost'; 
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}> = ({ children, variant = 'primary', className = '', onClick, disabled }) => {
  const base = "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-white text-black hover:bg-gray-100 shadow-[0_0_20px_rgba(255,255,255,0.1)]",
    glass: "bg-white/5 border border-white/10 hover:bg-white/10 text-white",
    ghost: "text-white/60 hover:text-white hover:bg-white/5"
  };
  
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const RangeSlider: React.FC<{ label: string; value: number; onChange: (val: number) => void; max?: number }> = ({ label, value, onChange, max = 10 }) => (
  <div className="mb-6 group">
    <div className="flex justify-between mb-3">
      <span className="text-sm text-white/60 font-medium tracking-tight group-hover:text-white/90 transition-colors">{label}</span>
      <span className="text-sm text-white font-mono">{value}/{max}</span>
    </div>
    <input 
      type="range" 
      min="0" 
      max={max} 
      value={value} 
      onChange={(e) => onChange(Number(e.target.value))}
      className="slider-thumb w-full h-[1px] bg-white/20 rounded-lg appearance-none cursor-pointer focus:outline-none focus:bg-white/40 transition-all"
    />
  </div>
);

// --- Sub-Apps (Views) ---

// 1. Participant Kiosk View
const ParticipantKiosk: React.FC<{ 
  participants: Participant[]; 
  onCheckIn: (id: string) => void; 
  onExit: () => void 
}> = ({ participants, onCheckIn, onExit }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<Participant | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const filtered = useMemo(() => {
    if (search.length < 2) return [];
    return participants.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.nrk.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 4);
  }, [search, participants]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (step === 2) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
          stream = s;
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch(err => console.error("Camera error", err));
    }
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [step]);

  const handleCapture = () => {
    if (selectedUser) {
      onCheckIn(selectedUser.id);
      setStep(3);
      setTimeout(() => {
        setStep(1);
        setSearch('');
        setSelectedUser(null);
      }, 3000);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <button onClick={onExit} className="absolute top-6 left-6 text-white/20 hover:text-white/50 transition-colors">
        <ArrowLeft size={24} />
      </button>

      {/* Step 1: Search */}
      {step === 1 && (
        <div className="w-full max-w-md animate-enter">
          <h1 className="text-3xl font-light text-center mb-8 tracking-tight">Welcome to <span className="font-semibold">Lume</span></h1>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white transition-colors" size={20} />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type your Name or NRK..."
              className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all backdrop-blur-sm"
              autoFocus
            />
          </div>
          
          <div className="mt-4 space-y-2">
            {filtered.map(user => (
              <GlassPanel 
                key={user.id} 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors group"
                onClick={() => { setSelectedUser(user); setStep(2); }}
              >
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium">
                      {user.name.charAt(0)}
                   </div>
                   <div>
                     <p className="text-sm font-medium">{user.name}</p>
                     <p className="text-xs text-white/40 font-mono">{user.nrk}</p>
                   </div>
                </div>
                <ChevronRight size={18} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </GlassPanel>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Camera */}
      {step === 2 && selectedUser && (
        <div className="flex flex-col items-center animate-enter w-full max-w-lg">
          <h2 className="text-xl font-light mb-8">Verify it's you, <span className="font-medium">{selectedUser.name.split(' ')[0]}</span></h2>
          <div className="relative w-64 h-64 md:w-80 md:h-80 mb-10">
            <div className="absolute inset-0 rounded-[40px] overflow-hidden border border-white/20 shadow-2xl z-10">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              {/* Fallback if no camera */}
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 -z-10">
                <Camera size={48} className="text-white/20" />
              </div>
            </div>
            {/* Ambient Glow */}
            <div className="absolute inset-0 rounded-[40px] bg-indigo-500/20 blur-3xl -z-20 animate-pulse"></div>
          </div>
          
          <button 
            onClick={handleCapture}
            className="w-20 h-20 rounded-full border border-white/80 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          >
            <div className="w-16 h-16 bg-white rounded-full"></div>
          </button>
          <button onClick={() => setStep(1)} className="mt-8 text-sm text-white/40 hover:text-white">Cancel</button>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <div className="flex flex-col items-center justify-center animate-enter text-center">
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 relative">
            <CheckCircle2 size={48} className="text-emerald-400" />
            <div className="absolute inset-0 rounded-full border border-emerald-500/40 animate-ping opacity-20"></div>
          </div>
          <h2 className="text-2xl font-light">You are checked in.</h2>
          <p className="text-white/40 mt-2">Have a great session.</p>
        </div>
      )}
    </div>
  );
};

// 2. Assessor View
const AssessorView: React.FC<{ 
  participants: Participant[]; 
  onExit: () => void 
}> = ({ participants, onExit }) => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Store assessments with a composite key: `${sessionId}_${participantId}`
  const [assessments, setAssessments] = useState<Record<string, Assessment>>({});
  
  // Filter for only present participants for grading
  const presentParticipants = useMemo(() => 
    participants.filter(p => p.status === 'present').sort((a, b) => a.name.localeCompare(b.name)), 
  [participants]);

  const selectedUser = useMemo(() => presentParticipants.find(p => p.id === selectedId), [selectedId, presentParticipants]);
  
  // Current ephemeral scores
  const [currentScores, setCurrentScores] = useState({ comprehension: 5, participation: 5, creativity: 5 });
  const [notes, setNotes] = useState('');

  // Reset form when user or session changes
  useEffect(() => {
    if (selectedId && currentSession) {
      const key = `${currentSession.id}_${selectedId}`;
      if (assessments[key]) {
        setCurrentScores(assessments[key].scores);
        setNotes(assessments[key].notes);
      } else {
        setCurrentScores({ comprehension: 5, participation: 5, creativity: 5 });
        setNotes('');
      }
    }
  }, [selectedId, assessments, currentSession]);

  const handleSave = () => {
    if (!selectedId || !currentSession) return;
    
    const newAssessment: Assessment = {
      participantId: selectedId,
      sessionId: currentSession.id,
      scores: currentScores,
      notes,
      completed: true
    };
    
    const key = `${currentSession.id}_${selectedId}`;
    setAssessments(prev => ({ ...prev, [key]: newAssessment }));
    
    // Auto-advance
    const currentIndex = presentParticipants.findIndex(p => p.id === selectedId);
    if (currentIndex < presentParticipants.length - 1) {
      setSelectedId(presentParticipants[currentIndex + 1].id);
    }
  };

  const getSessionProgress = (sessionId: string) => {
    const sessionAssessments = Object.values(assessments).filter(a => a.sessionId === sessionId);
    return Math.round((sessionAssessments.length / presentParticipants.length) * 100) || 0;
  };

  const sessionProgress = currentSession ? getSessionProgress(currentSession.id) : 0;
  const sessionCount = currentSession ? Object.values(assessments).filter(a => a.sessionId === currentSession.id).length : 0;

  // View 1: Session Selector (Agenda)
  if (!currentSession) {
    return (
      <div className="min-h-screen bg-[#0F0F11] flex flex-col p-6 md:p-12 animate-enter">
        <header className="flex items-center gap-4 mb-12">
          <button onClick={onExit} className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-light">Assessor Mode</h1>
            <p className="text-white/40 text-sm">Select a session to begin assessment</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
          {MOCK_SESSIONS.map((session, idx) => {
             const progress = getSessionProgress(session.id);
             return (
               <GlassPanel 
                  key={session.id} 
                  onClick={() => setCurrentSession(session)} 
                  className="p-6 cursor-pointer group hover:bg-white/[0.06] transition-all relative overflow-hidden"
               >
                  <div className="flex justify-between items-start mb-4">
                     <div className={`px-2 py-1 rounded text-xs font-mono 
                       ${session.status === 'live' ? 'bg-emerald-500/10 text-emerald-400' : 
                         session.status === 'completed' ? 'bg-white/5 text-white/30' : 'bg-indigo-500/10 text-indigo-400'}`}>
                        {session.status.toUpperCase()}
                     </div>
                     <ChevronRight className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" size={20} />
                  </div>
                  
                  <h3 className="text-xl font-medium mb-1 group-hover:text-white transition-colors">{session.title}</h3>
                  <p className="text-white/40 text-sm flex items-center gap-2 mb-6">
                    <Clock size={14}/> {session.timeRange}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/40 text-sm">
                      <Users size={14} /> {session.totalParticipants} Participants
                    </div>
                    {progress > 0 && (
                      <div className="text-xs font-mono text-emerald-400">
                        {progress}% Rated
                      </div>
                    )}
                  </div>
                  
                  {/* Progress Bar Background */}
                  <div className="absolute bottom-0 left-0 h-1 bg-emerald-500/50 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
               </GlassPanel>
             );
          })}
        </div>
      </div>
    );
  }

  // View 2: Assessment Interface
  return (
    <div className="h-screen w-full flex flex-col bg-[#0F0F11] animate-enter">
      {/* Top Bar */}
      <div className="h-14 border-b border-white/[0.06] flex items-center justify-between px-6 bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentSession(null)} className="text-white/40 hover:text-white flex items-center gap-2">
            <ArrowLeft size={18}/> <span className="text-sm">Back to Agenda</span>
          </button>
          <div className="h-4 w-[1px] bg-white/10"></div>
          <span className="text-sm font-medium text-white/80">{currentSession.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${sessionProgress}%` }}></div>
          </div>
          <span className="text-xs font-mono text-white/40">{sessionCount} / {presentParticipants.length} Rated</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: List */}
        <div className="w-80 border-r border-white/[0.06] flex flex-col bg-[#0F0F11]">
          <div className="p-4 border-b border-white/[0.06]">
            <input placeholder="Filter participants..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
          </div>
          <div className="flex-1 overflow-y-auto">
            {presentParticipants.map(p => {
              const isRated = !!assessments[`${currentSession.id}_${p.id}`];
              const isSelected = selectedId === p.id;
              return (
                <div 
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`px-4 py-3 border-b border-white/[0.03] cursor-pointer transition-colors flex items-center justify-between
                    ${isSelected ? 'bg-white/10 border-l-2 border-l-indigo-400' : 'hover:bg-white/[0.02] border-l-2 border-l-transparent'}
                  `}
                >
                  <div>
                    <p className={`text-sm ${isSelected ? 'text-white' : 'text-white/70'}`}>{p.name}</p>
                    <p className="text-xs text-white/30 font-mono">{p.nrk}</p>
                  </div>
                  {isRated && <CheckCircle2 size={14} className="text-emerald-500/80" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Grading Area */}
        <div className="flex-1 flex flex-col relative bg-[#131315]">
          {selectedUser ? (
            <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full animate-enter" key={selectedUser.id}>
              <div className="flex items-center gap-6 mb-12">
                <img src={selectedUser.avatarUrl} className="w-20 h-20 rounded-full border border-white/10 object-cover" alt="" />
                <div>
                  <h2 className="text-2xl font-light">{selectedUser.name}</h2>
                  <p className="text-white/40 font-mono text-sm mt-1">{selectedUser.nrk} • Check-in: 09:02 AM</p>
                </div>
              </div>

              <div className="grid gap-8">
                 <RangeSlider 
                    label="Comprehension" 
                    value={currentScores.comprehension} 
                    onChange={v => setCurrentScores({...currentScores, comprehension: v})} 
                  />
                 <RangeSlider 
                    label="Active Participation" 
                    value={currentScores.participation} 
                    onChange={v => setCurrentScores({...currentScores, participation: v})} 
                  />
                 <RangeSlider 
                    label="Creativity & Insight" 
                    value={currentScores.creativity} 
                    onChange={v => setCurrentScores({...currentScores, creativity: v})} 
                  />

                 <div className="mt-4">
                    <label className="text-sm text-white/60 font-medium tracking-tight block mb-3">Private Notes</label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:bg-white/[0.05] focus:border-white/20 transition-all min-h-[120px] resize-none"
                      placeholder="Add qualitative feedback here..."
                    />
                 </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/20">
              <p>Select a participant to begin assessment</p>
            </div>
          )}

          {/* Floating Action Bar */}
          {selectedUser && (
            <div className="absolute bottom-8 right-8">
              <Button onClick={handleSave} className="pl-6 pr-6 h-12 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                Save & Next <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 3. Admin Dashboard (Main)
const AdminDashboard: React.FC<{
  participants: Participant[];
  session: Session;
  onNavigate: (view: 'kiosk' | 'assessor') => void;
}> = ({ participants, session, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'people' | 'agenda'>('people');
  
  const stats = useMemo(() => {
    const present = participants.filter(p => p.status === 'present');
    const absent = participants.filter(p => p.status === 'absent');
    const rate = Math.round((present.length / participants.length) * 100);
    return { present, absent, rate };
  }, [participants]);

  const [viewFilter, setViewFilter] = useState<'present' | 'absent'>('absent');

  return (
    <div className="min-h-screen bg-[#0F0F11] flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/[0.06] p-6 flex flex-col justify-between bg-white/[0.01]">
        <div>
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-white to-white/50 flex items-center justify-center">
              <div className="w-3 h-3 bg-black rounded-full" />
            </div>
            <span className="font-semibold tracking-tight text-lg">LUME</span>
          </div>

          <div className="space-y-1">
            <button 
              onClick={() => setActiveTab('people')}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'people' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-3"><Users size={16}/> People</div>
            </button>
            <button 
              onClick={() => setActiveTab('agenda')}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'agenda' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-3"><LayoutGrid size={16}/> Agenda</div>
            </button>
          </div>
        </div>

        <div className="space-y-2">
           <p className="text-xs text-white/30 font-mono uppercase tracking-widest mb-2 px-2">Quick Views</p>
           <button onClick={() => onNavigate('kiosk')} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all">
             <Zap size={16} /> Open Kiosk
           </button>
           <button onClick={() => onNavigate('assessor')} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all">
             <CheckCircle2 size={16} /> Assessor Mode
           </button>
        </div>
      </nav>

      {/* Main Stage */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {activeTab === 'people' ? (
          <div className="max-w-5xl mx-auto animate-enter">
            {/* Header Stats */}
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl font-light mb-2">Attendance</h1>
                <p className="text-white/40 text-sm">Session: {session.title}</p>
              </div>
              <div className="flex items-center gap-6">
                 <div className="text-right">
                    <p className="text-3xl font-mono font-light">{stats.rate}%</p>
                    <p className="text-xs text-white/40 uppercase tracking-widest mt-1">Attendance</p>
                 </div>
                 <div className="h-10 w-[1px] bg-white/10"></div>
                 <div className="text-right">
                    <p className="text-3xl font-mono font-light text-rose-400">{stats.absent.length}</p>
                    <p className="text-xs text-white/40 uppercase tracking-widest mt-1">Missing</p>
                 </div>
              </div>
            </header>

            {/* Visual Dot Grid (The 90 dots) */}
            <GlassPanel className="p-6 mb-8 flex flex-wrap gap-2 justify-center">
               {participants.map((p) => (
                 <div 
                   key={p.id} 
                   className={`w-2.5 h-2.5 rounded-full transition-all duration-700 ${p.status === 'present' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] scale-100' : 'bg-white/5 border border-white/20 scale-90'}`}
                   title={p.name}
                 />
               ))}
            </GlassPanel>

            {/* Filter Tabs */}
            <div className="flex items-center gap-6 border-b border-white/10 mb-6">
               <button 
                 onClick={() => setViewFilter('absent')}
                 className={`pb-4 text-sm font-medium transition-all relative ${viewFilter === 'absent' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
               >
                 Absent ({stats.absent.length})
                 {viewFilter === 'absent' && <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white shadow-[0_0_10px_white]"></div>}
               </button>
               <button 
                 onClick={() => setViewFilter('present')}
                 className={`pb-4 text-sm font-medium transition-all relative ${viewFilter === 'present' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
               >
                 Present ({stats.present.length})
                 {viewFilter === 'present' && <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white shadow-[0_0_10px_white]"></div>}
               </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {(viewFilter === 'absent' ? stats.absent : stats.present).map(p => (
                 <GlassPanel key={p.id} className="p-4 flex items-center justify-between group hover:bg-white/[0.06] transition-colors">
                    <div className="flex items-center gap-3">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${p.status === 'present' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/40'}`}>
                          {p.status === 'present' ? <CheckCircle2 size={14}/> : <UserIcon size={14}/>}
                       </div>
                       <div>
                         <p className="text-sm font-medium text-white/90">{p.name}</p>
                         <p className="text-xs text-white/40 font-mono">{p.nrk}</p>
                       </div>
                    </div>
                    {p.status === 'absent' && (
                      <button className="text-white/20 hover:text-white transition-colors" title="Copy Email">
                        <Copy size={14} />
                      </button>
                    )}
                    {p.status === 'present' && (
                      <span className="text-xs text-white/20 font-mono">09:04</span>
                    )}
                 </GlassPanel>
               ))}
            </div>
            
            {viewFilter === 'absent' && stats.absent.length > 0 && (
               <div className="mt-8 flex justify-center">
                 <Button variant="glass" className="text-xs uppercase tracking-wider">
                   <Bell size={14} /> Nudge All Absent
                 </Button>
               </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto animate-enter">
            <h1 className="text-3xl font-light mb-8">Live Agenda</h1>
            <div className="relative border-l border-white/10 pl-8 space-y-12">
               {MOCK_SESSIONS.map((s, idx) => (
                 <div key={s.id} className={`relative ${s.status === 'completed' ? 'opacity-50' : ''}`}>
                    <div className={`absolute -left-[37px] top-1 w-4 h-4 rounded-full border-4 border-[#0F0F11] ${s.status === 'live' ? 'bg-emerald-500' : 'bg-white/20'}`}></div>
                    <GlassPanel className="p-6 relative overflow-hidden group">
                       {s.status === 'live' && <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>}
                       <div className="flex justify-between items-start mb-2">
                          <span className={`text-xs font-mono px-2 py-1 rounded 
                             ${s.status === 'live' ? 'text-emerald-400 bg-emerald-500/10' : 
                               s.status === 'completed' ? 'text-white/30 bg-white/5' : 'text-indigo-400 bg-indigo-500/10'}`}>
                              {s.status.toUpperCase()}
                          </span>
                          <button className="text-white/40 hover:text-white"><MoreHorizontal size={16}/></button>
                       </div>
                       <h3 className="text-xl font-medium mb-1">{s.title}</h3>
                       <p className="text-white/40 text-sm flex items-center gap-2 mb-4">
                         <Clock size={14}/> {s.timeRange}
                       </p>
                       <div className="flex -space-x-2">
                          {[1,2,3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border border-[#0F0F11] bg-white/20"></div>
                          ))}
                          <div className="w-8 h-8 rounded-full border border-[#0F0F11] bg-[#1a1a1c] flex items-center justify-center text-xs text-white/60">
                            +{s.totalParticipants - 3}
                          </div>
                       </div>
                    </GlassPanel>
                 </div>
               ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// --- Main App Controller ---

export default function App() {
  const [view, setView] = useState<'admin' | 'kiosk' | 'assessor'>('admin');
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Initialize Data
  useEffect(() => {
    setParticipants(generateParticipants(90));
  }, []);

  const handleCheckIn = (id: string) => {
    setParticipants(prev => prev.map(p => 
      p.id === id ? { ...p, status: 'present', checkInTime: new Date() } : p
    ));
  };

  switch (view) {
    case 'kiosk':
      return <ParticipantKiosk participants={participants} onCheckIn={handleCheckIn} onExit={() => setView('admin')} />;
    case 'assessor':
      return <AssessorView participants={participants} onExit={() => setView('admin')} />;
    default:
      // We pass the first active session for the dashboard summary, but MOCK_SESSIONS is global now
      return <AdminDashboard participants={participants} session={MOCK_SESSIONS[0]} onNavigate={setView} />;
  }
}