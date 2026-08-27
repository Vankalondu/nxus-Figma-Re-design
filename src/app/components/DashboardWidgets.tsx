import React from 'react';
import { ArrowUpRight, Crown, Search, TrendingUp, TrendingDown, ArrowRight, Settings, MoreVertical, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';

export const StatsCards = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-[var(--gap-grid)] mb-5 w-full shrink-0 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {/* Card 1: Light Card */}
      <div
        className="min-w-0 rounded-[24px] p-3.5 md:p-[var(--pad-card)] flex flex-col justify-between shadow-[var(--shadow-lg)] min-h-[140px] md:h-[180px] bg-card cursor-pointer hover:-translate-y-1 transition-transform border border-border"
        onClick={() => navigate('/players?tab=players-in-scope&filter=Missing+Video')}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-muted-foreground">
              <Settings size={18} />
            </div>
            <h3 className="text-[10px] tracking-wider md:tracking-normal md:text-[15px] font-bold text-foreground">Missing Videos</h3>
          </div>
          <div className="w-10 h-10 hidden sm:flex items-center justify-center text-muted-foreground cursor-pointer hover:bg-accent rounded-full transition-colors">
            <MoreVertical size={20} />
          </div>
        </div>

        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:gap-3 mt-auto">
          <div className="font-heading font-extrabold text-2xl md:text-[44px] tracking-tight text-foreground leading-none">29</div>
          <div className="flex flex-col sm:pb-2">
            <div className="bg-accent text-foreground text-[12px] font-extrabold px-2 py-0.5 rounded-full inline-flex items-center w-fit mb-1">
              82% <span className="w-1.5 h-1.5 rounded-full border border-primary ml-1"></span>
            </div>
            <div className="text-muted-foreground font-bold text-[12px]">/ 35</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="sm:hidden h-1.5 rounded-full bg-primary/15 overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '83%' }} />
          </div>
          <div className="hidden sm:flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6].map((dot, i) => (
              <div key={i} className={`w-5 h-5 rounded-full ${i < 5 ? 'bg-primary' : 'border-2 border-dashed border-border'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Card 2: Light Card */}
      <div
        className="min-w-0 rounded-[24px] p-3.5 md:p-[var(--pad-card)] flex flex-col justify-between shadow-[var(--shadow-lg)] min-h-[140px] md:h-[180px] bg-card border border-border cursor-pointer hover:-translate-y-1 transition-transform"
        onClick={() => navigate('/matches?filter=Incomplete+Match+Data')}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-muted-foreground">
              <ArrowRight size={18} />
            </div>
            <h3 className="text-[10px] tracking-wider md:tracking-normal md:text-[15px] font-bold text-foreground">Missing Match Data</h3>
          </div>
          <div className="w-10 h-10 hidden sm:flex items-center justify-center text-muted-foreground cursor-pointer hover:bg-accent rounded-full transition-colors">
            <MoreVertical size={20} />
          </div>
        </div>

        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:gap-3 mt-auto">
          <div className="font-heading font-extrabold text-2xl md:text-[44px] tracking-tight text-foreground leading-none">18</div>
          <div className="flex flex-col sm:pb-2">
            <div className="bg-card/10 text-foreground text-[12px] font-extrabold px-2 py-0.5 rounded-full inline-flex items-center w-fit mb-1 border border-border">
              68% <span className="w-1.5 h-1.5 rounded-full border border-primary ml-1"></span>
            </div>
            <div className="text-muted-foreground font-bold text-[12px]">/ 26</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="sm:hidden h-1.5 rounded-full bg-primary/15 overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '50%' }} />
          </div>
          <div className="hidden sm:flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((dot, i) => (
              <div key={i} className={`w-5 h-5 rounded-full ${i < 4 ? 'bg-primary' : 'border-2 border-dashed border-border'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Card 3: Image Card */}
      <div className="min-w-0 rounded-[24px] relative overflow-hidden shadow-[0_8px_30px_rgba(6,27,46,0.14)] min-h-[140px] md:h-[180px] cursor-pointer hover:-translate-y-1 transition-transform group bg-gradient-to-br from-[#0a2d4c] to-[#061b2e]"
        onClick={() => navigate('/players?tab=combined-top-10')}
      >
        <img
          src="https://images.unsplash.com/photo-1776465960036-918a03931b03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHBsYXllciUyMGRhcmslMjBncmVlbiUyMGFic3RyYWN0fGVufDF8fHx8MTc3NzQwMTAwM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Ready Reports"
          className="hidden sm:block absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061b2e]/85 via-[#061b2e]/60 to-transparent hidden sm:block"></div>

        <div className="relative z-10 p-4 sm:p-6 h-full flex flex-col justify-between">
          <div>
            <h3 className="text-[15px] md:text-[20px] font-bold text-chalk leading-tight font-heading max-w-[200px]">
              Ready <span className="text-primary">Reports</span> for Review
            </h3>
            <div className="w-8 h-8 rounded-full flex items-center justify-center mt-3 text-primary">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3 mt-auto">
            <div className="font-heading font-extrabold text-2xl md:text-[36px] tracking-tight text-chalk leading-none">14</div>
            <button className="sm:hidden w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center self-end shrink-0 transition-colors">
              <ChevronRight size={18} />
            </button>
            <button className="hidden sm:flex bg-primary text-white hover:bg-primary/80 font-bold text-[14px] px-5 py-2 rounded-full w-fit items-center gap-2 transition-colors ml-auto">
              Review <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Card 4: Light Card */}
      <div
        className="min-w-0 rounded-[24px] p-3.5 md:p-[var(--pad-card)] flex flex-col justify-between shadow-[var(--shadow-lg)] min-h-[140px] md:h-[180px] bg-card cursor-pointer hover:-translate-y-1 transition-transform border border-border"
        onClick={() => navigate('/players?tab=target&filter=Grade+A+players')}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-muted-foreground">
              <Crown size={18} />
            </div>
            <h3 className="text-[10px] tracking-wider md:tracking-normal md:text-[15px] font-bold text-foreground">Grade A players</h3>
          </div>
          <div className="w-10 h-10 hidden sm:flex items-center justify-center text-muted-foreground cursor-pointer hover:bg-accent rounded-full transition-colors">
            <ArrowUpRight size={20} />
          </div>
        </div>

        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:gap-3 mt-auto">
          <div className="font-heading font-extrabold text-2xl md:text-[44px] tracking-tight text-foreground leading-none">46<span className="text-base md:text-[32px] text-muted-foreground">%</span></div>
          <div className="flex flex-col sm:pb-2">
            <div className="bg-[#F6FAFE] text-[#E05C4B] text-[12px] font-extrabold px-2 py-0.5 rounded-full inline-flex items-center w-fit mb-1">
              Down <span className="w-1.5 h-1.5 rounded-full border border-[#E05C4B] ml-1"></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-4">
          <div className="w-full h-2 rounded-full bg-accent overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '46%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const HeadScoutStatsCards = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-[var(--gap-grid)] mb-5 w-full shrink-0 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {/* Card 1: Light Card */}
      <div
        className="min-w-0 rounded-[24px] p-3.5 md:p-[var(--pad-card)] flex flex-col justify-between shadow-[var(--shadow-lg)] min-h-[140px] md:h-[180px] bg-card cursor-pointer hover:-translate-y-1 transition-transform border border-border"
        onClick={() => navigate('/players?tab=review')}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-muted-foreground">
              <Settings size={18} />
            </div>
            <h3 className="text-[10px] tracking-wider md:tracking-normal md:text-[15px] font-bold text-foreground leading-tight">Shortlists submitted<br />for review</h3>
          </div>
          <div className="w-10 h-10 hidden sm:flex items-center justify-center text-muted-foreground cursor-pointer hover:bg-accent rounded-full transition-colors">
            <MoreVertical size={20} />
          </div>
        </div>

        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:gap-3 mt-auto">
          <div className="font-heading font-extrabold text-2xl md:text-[44px] tracking-tight text-foreground leading-none">6</div>
          <div className="flex flex-col sm:pb-2">
            <div className="bg-accent text-foreground text-[12px] font-extrabold px-2 py-0.5 rounded-full inline-flex items-center w-fit mb-1">
              82% <span className="w-1.5 h-1.5 rounded-full border border-primary ml-1"></span>
            </div>
            <div className="text-muted-foreground font-bold text-[12px]">/ 10</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="sm:hidden h-1.5 rounded-full bg-primary/15 overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '67%' }} />
          </div>
          <div className="hidden sm:flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6].map((dot, i) => (
              <div key={i} className={`w-5 h-5 rounded-full ${i < 4 ? 'bg-primary' : 'border-2 border-dashed border-border'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Card 2: Dark Card */}
      <div
        className="min-w-0 rounded-[24px] p-3.5 md:p-[var(--pad-card)] flex flex-col justify-between shadow-[var(--shadow-lg)] min-h-[140px] md:h-[180px] bg-card border border-border cursor-pointer hover:-translate-y-1 transition-transform"
        onClick={() => navigate('/players?tab=review')}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-card/10 flex items-center justify-center text-muted-foreground">
              <ArrowRight size={18} />
            </div>
            <h3 className="text-[10px] tracking-wider md:tracking-normal md:text-[15px] font-bold text-chalk leading-tight">Reports ready<br />for review</h3>
          </div>
          <div className="w-10 h-10 hidden sm:flex items-center justify-center text-muted-foreground cursor-pointer hover:bg-card/5 rounded-full transition-colors">
            <MoreVertical size={20} />
          </div>
        </div>

        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:gap-3 mt-auto">
          <div className="font-heading font-extrabold text-2xl md:text-[44px] tracking-tight text-chalk leading-none">18</div>
          <div className="flex flex-col sm:pb-2">
            <div className="bg-card/10 text-chalk text-[12px] font-extrabold px-2 py-0.5 rounded-full inline-flex items-center w-fit mb-1 border border-white/20">
              68% <span className="w-1.5 h-1.5 rounded-full border border-white/60 ml-1"></span>
            </div>
            <div className="text-muted-foreground font-bold text-[12px]">/ 26</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="sm:hidden h-1.5 rounded-full bg-primary/15 overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '75%' }} />
          </div>
          <div className="hidden sm:flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((dot, i) => (
              <div key={i} className={`w-5 h-5 rounded-full ${i < 6 ? 'bg-primary' : 'border-2 border-dashed border-white/20'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Card 3: Image Card */}
      <div className="min-w-0 rounded-[24px] relative overflow-hidden shadow-[0_8px_30px_rgba(6,27,46,0.14)] min-h-[140px] md:h-[180px] cursor-pointer hover:-translate-y-1 transition-transform group bg-gradient-to-br from-[#0a2d4c] to-[#061b2e]"
        onClick={() => navigate('/players?tab=combined-top-10')}
      >
        <img
          src="https://images.unsplash.com/photo-1776465960036-918a03931b03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHBsYXllciUyMGRhcmslMjBncmVlbiUyMGFic3RyYWN0fGVufDF8fHx8MTc3NzQwMTAwM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Top Ten Pending Prospects List"
          className="hidden sm:block absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061b2e]/85 via-[#061b2e]/60 to-transparent hidden sm:block"></div>

        <div className="relative z-10 p-4 sm:p-6 h-full flex flex-col justify-between">
          <div>
            <h3 className="text-[15px] md:text-[20px] font-bold text-chalk leading-tight font-heading max-w-[200px]">
              Top Ten <span className="text-primary">Pending</span> Prospects List
            </h3>
            <div className="w-8 h-8 rounded-full flex items-center justify-center mt-3 text-primary">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3 mt-auto">
            <div className="font-heading font-extrabold text-2xl md:text-[36px] tracking-tight text-chalk leading-none">10</div>
            <button className="sm:hidden w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center self-end shrink-0 transition-colors">
              <ChevronRight size={18} />
            </button>
            <button className="hidden sm:flex bg-primary text-white hover:bg-primary/80 font-bold text-[14px] px-5 py-2 rounded-full w-fit items-center gap-2 transition-colors ml-auto">
              Review <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Card 4: Light Card */}
      <div
        className="min-w-0 rounded-[24px] p-3.5 md:p-[var(--pad-card)] flex flex-col justify-between shadow-[var(--shadow-lg)] min-h-[140px] md:h-[180px] bg-card cursor-pointer hover:-translate-y-1 transition-transform border border-border"
        onClick={() => navigate('/players?tab=target&filter=Grade+A+players')}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-muted-foreground">
              <Crown size={18} />
            </div>
            <h3 className="text-[10px] tracking-wider md:tracking-normal md:text-[15px] font-bold text-foreground leading-tight">% of Grade A<br />players raised</h3>
          </div>
          <div className="w-10 h-10 hidden sm:flex items-center justify-center text-muted-foreground cursor-pointer hover:bg-accent rounded-full transition-colors">
            <ArrowUpRight size={20} />
          </div>
        </div>

        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:gap-3 mt-auto">
          <div className="font-heading font-extrabold text-2xl md:text-[44px] tracking-tight text-foreground leading-none">37<span className="text-base md:text-[32px] text-muted-foreground">%</span></div>
          <div className="flex flex-col sm:pb-2">
            <div className="bg-accent text-foreground text-[12px] font-extrabold px-2 py-0.5 rounded-full inline-flex items-center w-fit mb-1">
              8% <span className="w-1.5 h-1.5 rounded-full border border-primary ml-1"></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-4">
          <div className="w-full h-2 rounded-full bg-accent overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '37%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const RegionalRankings = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 w-full max-w-[1400px]">
      {/* Left side: Countries Ranking */}
      <div className="bg-card border border-border rounded-[24px] p-6 col-span-1 shadow-[var(--shadow-lg)] relative overflow-hidden">
        <h3 className="font-heading font-bold text-[20px] text-foreground flex items-center mb-4">
          <svg className="w-5 h-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Countries Ranking
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-2xl border-2 border-primary bg-primary/5">
            <div className="flex items-center space-x-3">
              <span className="text-xl">🇳🇬</span>
              <div>
                <div className="font-bold text-foreground text-[14px]">Nigeria</div>
                <div className="text-[12px] text-muted-foreground font-semibold flex items-center"><Crown size={12} className="mr-1 text-muted-foreground" /> Chidi Okafor</div>
              </div>
            </div>
            <span className="font-extrabold text-primary bg-primary/10 px-3 py-1 rounded-full text-[14px] shadow-sm">98</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl border border-border hover:bg-accent/50 transition-colors">
            <div className="flex items-center space-x-3">
              <span className="text-xl">🇬🇭</span>
              <div>
                <div className="font-bold text-foreground text-[14px]">Ghana</div>
              </div>
            </div>
            <span className="font-extrabold text-foreground bg-accent px-3 py-1 rounded-full text-[14px]">76</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl border border-border hover:bg-accent/50 transition-colors">
            <div className="flex items-center space-x-3">
              <span className="text-xl">🇸🇳</span>
              <div>
                <div className="font-bold text-foreground text-[14px]">Senegal</div>
                <div className="text-[12px] text-muted-foreground font-semibold flex items-center"><Crown size={12} className="mr-1 text-muted-foreground" /> Amara Diallo</div>
              </div>
            </div>
            <span className="font-extrabold text-foreground bg-accent px-3 py-1 rounded-full text-[14px]">70</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl border border-border hover:bg-accent/50 transition-colors">
            <div className="flex items-center space-x-3">
              <span className="text-xl">🇨🇮</span>
              <div>
                <div className="font-bold text-foreground text-[14px]">Ivory Coast</div>
                <div className="text-[12px] text-muted-foreground font-semibold flex items-center"><Crown size={12} className="mr-1 text-muted-foreground" /> Didier Bamba</div>
              </div>
            </div>
            <span className="font-extrabold text-foreground bg-accent px-3 py-1 rounded-full text-[14px]">60</span>
          </div>
        </div>
      </div>

      {/* Right side: Ghana Rankings */}
      <div className="bg-card border border-border rounded-[24px] p-6 col-span-2 shadow-[var(--shadow-lg)] flex flex-col relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-[20px] text-foreground flex items-center">
            <span className="text-xl mr-2">🇬🇭</span> Ghana Rankings
          </h3>
          <button className="text-primary text-[14px] font-bold hover:underline flex items-center">View All <ArrowRight size={14} className="ml-1" /></button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center font-heading"><Crown size={12} className="mr-1 text-[#E8A838]" /> HEAD SCOUT</div>
            <div className="flex items-center justify-between p-4 rounded-2xl border border-border hover:border-primary/30 transition-colors bg-card">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-[#E8A838]/20 text-[#E8A838] flex items-center justify-center relative shrink-0">
                  <Crown size={20} />
                </div>
                <div className="w-10 h-10 rounded-full bg-primary text-chalk flex items-center justify-center font-bold shadow-sm shrink-0">KA</div>
                <div>
                  <div className="font-bold text-foreground text-[14px] flex items-center">Kwame Asante <span className="text-[#E8A838] ml-1 text-sm">🔥</span></div>
                  <div className="text-[12px] text-muted-foreground font-semibold flex items-center space-x-2 mt-0.5">
                    <span className="text-foreground flex items-center"><Crown size={10} className="mr-0.5" /> 38 Grade A</span>
                    <span className="text-[#b4d7f6]">•</span>
                    <span>78 total</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-[24px] text-foreground">38</div>
                <div className="text-primary text-[12px] font-bold flex items-center justify-end"><TrendingUp size={10} className="mr-0.5" /> +8</div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 font-heading">
              <span className="flex items-center"><Search size={12} className="mr-1" /> COUNTRY SCOUTS</span>
              <span className="text-[10px] normal-case font-medium">Sorted by Grade A players</span>
            </div>

            <div className="space-y-3">
              {[
                { rank: 1, init: 'FM', name: 'Fatou Mensah', gradeA: 18, total: 36, val: '18', diff: '+3', trend: 'up' },
                { rank: 2, init: 'KM', name: 'Kofi Mensah', gradeA: 12, total: 26, val: '12', diff: '+2', trend: 'up' },
                { rank: 3, init: 'AO', name: 'Ama Osei', gradeA: 8, total: 16, val: '8', diff: '+3', trend: 'up' }
              ].map(scout => (
                <div key={scout.rank} className="flex items-center justify-between p-4 rounded-2xl border border-border hover:border-primary/30 transition-colors hover:bg-accent/30">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-accent text-muted-foreground font-bold flex items-center justify-center text-[14px] shrink-0">{scout.rank}</div>
                    <div className="w-10 h-10 rounded-full bg-primary text-chalk flex items-center justify-center font-bold shadow-sm shrink-0">{scout.init}</div>
                    <div>
                      <div className="font-bold text-foreground text-[14px] flex items-center">{scout.name} {scout.rank === 1 && <TrendingUp size={12} className="text-primary ml-1" />}</div>
                      <div className="text-[12px] text-muted-foreground font-semibold flex items-center space-x-2 mt-0.5">
                        <span className="text-foreground flex items-center"><Crown size={10} className="mr-0.5" /> {scout.gradeA} Grade A</span>
                        <span className="text-[#b4d7f6]">•</span>
                        <span>{scout.total} total</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-[20px] text-foreground">{scout.val}</div>
                    <div className="text-primary text-[12px] font-bold flex items-center justify-end"><TrendingUp size={10} className="mr-0.5" /> {scout.diff}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};