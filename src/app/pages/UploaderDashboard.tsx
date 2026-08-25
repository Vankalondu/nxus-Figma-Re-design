import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Video, ClipboardCheck, CheckCircle, ListChecks, LogOut, Calendar, Clapperboard, ArrowRight, Play, Grid3x3 } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { TopNav } from '../components/TopNav';
import { ResponsiveTabs, TabItem } from '../components/ResponsiveTabs';
import { MatchesView, findMatchIdByTeams } from './MatchesView';
import { AdminView } from './AdminView';
import { KpiCard } from '../components/dashboard/KpiCard';
import { TasksTab } from '../components/dashboard/TasksTab';
import { MOCK_TASKS, TaskInput } from '../components/dashboard/shared';
import { UploadVideoModal } from '../components/UploadVideoModal';
import { VideoTrackerGrid } from '../components/VideoTrackerGrid';
import { ALL_GENERATED_PLAYERS } from '../components/SeniorLeadPlayersPage';
import { useTierMap, PipelineTier } from '../state/playerStore';
import { useVideoState, uploaderItems, highlightsBy, coverageStatus, VideoType } from '../state/videoStore';

type UploaderTab = 'overview' | 'middle' | 'tasks';
type ActivePage = 'dashboard' | 'players' | 'matches' | 'admin';

const CARD = 'bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] overflow-hidden';
const UPCOMING = [
  { home: 'Gor Mahia', away: 'Enyimba FC', date: 'Sat, 16 Aug' },
  { home: 'Tusker FC', away: 'Rivers United', date: 'Sun, 14 Sep' },
  { home: 'ASEC Mimosas', away: 'Gor Mahia', date: 'Sat, 13 Sep' },
];

// ─── Main shell — shared by Package Uploader + Full Match Uploader ────────────
// Both roles render this one component; everything is derived from sessionStorage
// (role/name), never from props, so the router can point both role's routes here.
export default function UploaderDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const role = sessionStorage.getItem('loginRole') || sessionStorage.getItem('userRole') || '';
  const videoType: VideoType = role === 'Full Match Uploader' ? 'full-match' : 'package';
  const middleLabel = videoType === 'full-match' ? 'Full Matches' : 'Packages';
  const myName = sessionStorage.getItem('userName') || 'Uploader';
  const base = role === 'Full Match Uploader' ? '/full-match-uploader' : '/package-uploader';
  const openMatch = (home: string, away: string) => { const id = findMatchIdByTeams(home, away); navigate(id ? `${base}/matches?match=${id}` : `${base}/matches`); };

  let activePage: ActivePage = 'dashboard';
  if (location.pathname.endsWith('/players')) activePage = 'players';
  if (location.pathname.endsWith('/matches')) activePage = 'matches';
  if (location.pathname.endsWith('/admin')) activePage = 'admin';

  const [activeTab, setActiveTab] = useState<UploaderTab>('overview');
  const [showProfile, setShowProfile] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const vstate = useVideoState();
  const tierMap = useTierMap();
  const { pending, approved } = uploaderItems(vstate, myName, videoType);
  const isPackage = videoType === 'package';
  const myHighlights = highlightsBy(vstate, myName);
  // Players in Target + Short still missing this uploader's video type — the tracker's job.
  const needVideos = (['target-list', 'short-list'] as PipelineTier[]).reduce((acc, t) =>
    acc + ALL_GENERATED_PLAYERS.filter(p => tierMap.get(p.id) === t).filter(p => {
      const s = coverageStatus(vstate, p.id, videoType);
      return s !== 'has-video' && s !== 'not-available';
    }).length, 0);

  const [tasks, setTasks] = useState<any[]>(MOCK_TASKS);
  const toggleTask = (id: any) => setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const setTaskStatus = (id: any, status: any) => setTasks(prev => prev.map(t => t.id === id ? { ...t, status, completed: status === 'done' } : t));
  const addTask = (input: any) => {
    const b = typeof input === 'string' ? { text: input } : input;
    setTasks(prev => [{
      id: `ut${Date.now()}`,
      text: b.text, description: b.description,
      priority: b.priority || 'Medium',
      dueDate: b.dueDate || 'This week', deadline: b.deadline,
      assignedDate: new Date().toISOString().slice(0, 10), status: 'pending',
      assignedTo: b.assignedTo || 'Me',
      allocated: 'Today', completed: false,
    }, ...prev]);
  };
  const activeTasks = tasks.filter(t => !t.completed);

  const tabs: TabItem[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'middle', label: middleLabel, count: pending.length, countTone: 'red' },
    { id: 'tasks', label: 'Tasks', count: activeTasks.length },
  ];

  const avatar = 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit=crop&crop=faces&q=80';

  return (
    <div className="flex min-h-screen bg-background font-body text-foreground">
      <Sidebar actions={[]} />
      <main className="flex-1 flex flex-col min-w-0">
        <TopNav
          responsive
          rolePill={(
            <div className="flex items-center gap-2 px-3 md:px-5 h-[44px] bg-accent rounded-[32px]">
              <span className="w-2 h-2 rounded-full shrink-0 bg-primary" />
              <span className="hidden md:inline font-body text-[14px] font-bold text-foreground whitespace-nowrap">{role || 'Uploader'} Dashboard</span>
            </div>
          )}
          avatarImg={avatar}
          onUploadVideo={() => setShowUpload(true)}
          profileOpen={showProfile}
          onProfileToggle={() => setShowProfile(p => !p)}
          profileMenu={(
            <div className="absolute right-0 mt-3 w-64 bg-card rounded-[24px] shadow-xl border border-border z-50 overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-3">
                <img src={avatar} alt="Profile" className="w-10 h-10 rounded-full object-cover shrink-0" />
                <div><div className="font-body font-bold text-[14px] text-foreground">{myName}</div><div className="font-body text-[12px] text-muted-foreground font-medium">{role}</div></div>
              </div>
              <div className="p-2"><button onClick={() => setShowProfile(false)} className="w-full flex items-center px-4 py-3 font-body text-[14px] font-bold text-[#E05C4B] hover:bg-[#E05C4B]/5 rounded-[16px] transition-colors"><LogOut size={16} className="mr-3" />Log out</button></div>
            </div>
          )}
        />

        <div className="flex-1 px-[var(--pad-page)] pb-20 md:pb-12">
          {activePage === 'players' && (
            <div className="pt-6">
              <h1 className="font-heading font-semibold text-h3 tracking-tight text-foreground mb-1">Video tracker</h1>
              <p className="font-body font-medium text-[14px] text-muted-foreground mb-5">Spot missing videos and attach assets to player rows.</p>
              <VideoTrackerGrid mode="uploader" canPkg={videoType === 'package'} canFm={videoType === 'full-match'} onUpload={() => setShowUpload(true)} />
            </div>
          )}
          {activePage === 'matches' && <MatchesView />}
          {activePage === 'admin' && <AdminView />}

          {activePage === 'dashboard' && (
            <>
              <div className="pt-6 mb-3">
                <h1 className="font-heading font-semibold text-h3 tracking-tight text-foreground flex items-center gap-4 leading-none">
                  Welcome
                  <span className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm shrink-0"><Video size={26} className="text-chalk" /></span>
                  {myName}
                </h1>
                <p className="font-body font-medium text-[15px] text-muted-foreground mt-2 short:hidden">Upload it, and it's live once approved 🎬</p>
              </div>

              <ResponsiveTabs className="mt-4 mb-6" tabs={tabs} activeId={activeTab} onSelect={(id) => setActiveTab(id as UploaderTab)} />

              {activeTab === 'overview' && (
                <div className="flex flex-col gap-6 pb-8">
                  <div className={`grid grid-cols-2 ${isPackage ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-6`}>
                    <KpiCard icon={ClipboardCheck} heading="Pending" value={pending.length}
                      descriptor={pending.length > 0 ? <span className="text-scout-amber font-black">awaiting approval</span> : 'all clear'}
                      action={`Open ${middleLabel}`} onClick={() => setActiveTab('middle')} />
                    <KpiCard icon={CheckCircle} heading="Approved" value={approved.length}
                      descriptor="live for scouts" action={`Open ${middleLabel}`} onClick={() => setActiveTab('middle')} />
                    {isPackage && (
                      <KpiCard icon={Clapperboard} heading="Highlights" value={myHighlights.length}
                        descriptor="external clips" action="Open Packages" onClick={() => setActiveTab('middle')} />
                    )}
                    <KpiCard icon={ListChecks} heading="Tasks due" value={activeTasks.length}
                      descriptor="open tasks" action="Open Tasks" onClick={() => setActiveTab('tasks')} />
                    <KpiCard icon={Grid3x3} heading="Video Tracker" value={needVideos}
                      descriptor="need your video" action="Open tracker" onClick={() => navigate(`${base}/players`)} />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-stretch">
                    {/* Upcoming matches */}
                    <div className={`${CARD} flex flex-col`}>
                      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><Calendar size={16} className="text-foreground" /></div>
                        <div className="min-w-0"><h3 className="font-heading font-bold text-[16px] text-foreground">Upcoming matches</h3><p className="font-body text-[12px] text-muted-foreground font-medium">Capture opportunities</p></div>
                      </div>
                      <div className="divide-y divide-border">
                        {UPCOMING.map((m, i) => (
                          <button key={i} onClick={() => openMatch(m.home, m.away)} className="w-full text-left px-5 py-3 flex items-center gap-3 hover:bg-accent transition-colors">
                            <div className="min-w-0 flex-1"><div className="font-body font-bold text-[14px] text-foreground truncate">{m.home} <span className="text-muted-foreground font-medium">vs</span> {m.away}</div><p className="font-body text-[12px] text-muted-foreground mt-0.5">{m.date}</p></div>
                            <ArrowRight size={14} className="text-muted-foreground shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* My tasks */}
                    <div className={`${CARD} flex flex-col`}>
                      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><ListChecks size={16} className="text-foreground" /></div>
                        <div className="min-w-0 flex-1"><h3 className="font-heading font-bold text-[16px] text-foreground">My tasks</h3><p className="font-body text-[12px] text-muted-foreground font-medium">{activeTasks.length} open</p></div>
                        <button onClick={() => setActiveTab('tasks')} className="font-body font-bold text-[12px] text-primary hover:underline shrink-0">View all</button>
                      </div>
                      <div className="divide-y divide-border">
                        {activeTasks.slice(0, 4).map(t => (
                          <div key={t.id} className="px-5 py-3 flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${t.priority === 'High' ? 'bg-scout-red' : t.priority === 'Medium' ? 'bg-scout-amber' : 'bg-muted-foreground'}`} />
                            <span className="font-body font-bold text-[13px] text-foreground truncate flex-1">{t.text}</span>
                            <span className="font-body text-[11px] text-muted-foreground shrink-0">{t.dueDate}</span>
                          </div>
                        ))}
                        {activeTasks.length === 0 && <div className="px-5 py-8 text-center font-body text-[13px] text-muted-foreground">No open tasks.</div>}
                      </div>
                    </div>

                    {/* Recent uploads */}
                    <div className={`${CARD} flex flex-col`}>
                      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><Video size={16} className="text-foreground" /></div>
                        <div className="min-w-0"><h3 className="font-heading font-bold text-[16px] text-foreground">Recent uploads</h3><p className="font-body text-[12px] text-muted-foreground font-medium">Newest first</p></div>
                      </div>
                      <div className="divide-y divide-border">
                        {[...pending, ...approved].slice(0, 4).map(item => (
                          <div key={item.id} className="px-5 py-3 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Play size={13} className="text-primary" /></span>
                            <span className="font-body font-bold text-[13px] text-foreground truncate flex-1">{item.videoName}</span>
                          </div>
                        ))}
                        {pending.length === 0 && approved.length === 0 && <div className="px-5 py-8 text-center font-body text-[13px] text-muted-foreground">Nothing uploaded yet.</div>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'middle' && (
                <div className="flex flex-col gap-6 pb-8">
                  <div className={CARD}>
                    <div className="px-5 py-4 border-b border-border flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><Video size={16} className="text-foreground" /></div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-heading font-bold text-[16px] text-foreground">{middleLabel}</h3>
                        <p className="font-body text-[12px] text-muted-foreground font-medium">Your uploads · newest first</p>
                      </div>
                    </div>
                    <div className="divide-y divide-border">
                      {pending.length === 0 && approved.length === 0 && (
                        <div className="px-5 py-12 text-center font-body text-[14px] text-muted-foreground">Nothing uploaded yet — hit Upload Video to get started.</div>
                      )}
                      {pending.map(item => (
                        <div key={item.id} className="px-5 py-3 flex items-center gap-3">
                          <div className="min-w-0 flex-1">
                            <span className="font-body font-bold text-[14px] text-foreground truncate">{item.videoName}</span>
                            <p className="font-body text-[12px] text-muted-foreground mt-0.5">{item.dateLabel}{item.playerName ? ` · ${item.playerName}` : ''}</p>
                          </div>
                          <span className="font-body text-[11px] font-black px-2.5 py-1 rounded-full bg-scout-amber/15 text-scout-amber shrink-0">Pending</span>
                        </div>
                      ))}
                      {approved.map(item => (
                        <div key={item.id} className="px-5 py-3 flex items-center gap-3">
                          <div className="min-w-0 flex-1">
                            <span className="font-body font-bold text-[14px] text-foreground truncate">{item.videoName}</span>
                            <p className="font-body text-[12px] text-muted-foreground mt-0.5">{item.dateLabel}{item.playerName ? ` · ${item.playerName}` : ''}</p>
                          </div>
                          <span className="font-body text-[11px] font-black px-2.5 py-1 rounded-full bg-scout-green/15 text-scout-green shrink-0">Approved</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {isPackage && (
                    <div className={CARD}>
                      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><Clapperboard size={16} className="text-foreground" /></div>
                        <div className="min-w-0"><h3 className="font-heading font-bold text-[16px] text-foreground">Highlights uploaded</h3><p className="font-body text-[12px] text-muted-foreground font-medium">External clips · no approval needed</p></div>
                      </div>
                      <div className="divide-y divide-border">
                        {myHighlights.length === 0 && <div className="px-5 py-8 text-center font-body text-[13px] text-muted-foreground">No highlights uploaded yet.</div>}
                        {myHighlights.map(h => (
                          <div key={h.id} className="px-5 py-3 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Play size={13} className="text-primary" /></span>
                            <div className="min-w-0 flex-1"><span className="font-body font-bold text-[14px] text-foreground truncate">{h.title}</span><p className="font-body text-[12px] text-muted-foreground mt-0.5">{h.dateLabel}</p></div>
                            <span className="font-body text-[11px] font-black px-2.5 py-1 rounded-full bg-primary/15 text-foreground shrink-0">External</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'tasks' && <TasksTab tasks={tasks} onToggle={toggleTask} onSetStatus={setTaskStatus} onAdd={addTask} showDistribution={false} />}
            </>
          )}
        </div>
      </main>

      {showUpload && <UploadVideoModal allowedTypes={videoType === 'full-match' ? ['full-match'] : ['highlight', 'package']} uploaderName={myName} onClose={() => setShowUpload(false)} />}
    </div>
  );
}
