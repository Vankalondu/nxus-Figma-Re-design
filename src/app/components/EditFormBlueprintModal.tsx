  import React, { useState } from 'react';
  import {
    X, Plus, ChevronDown, ChevronRight, Check,
    ArrowUp, ArrowDown, Copy, Trash2, Eye
  } from 'lucide-react';

  interface Question {
    id: number;
    text: string;
    type: string;
    positions: string[];
    helpText: string;
    required: boolean;
    linkStart: boolean;
    linkPrev: boolean;
    varMain: string;
    varSub: string;
    varCode: string;
    reviewColumn: boolean;
    placeholder: string;
    minLen: string;
    maxLen: string;
  }

  type BehaviorKey = 'anon' | 'signature' | 'autosave' | 'progress' | 'video';

  const POSITION_CODES = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];
  const INPUT_TYPES = ['Text', 'Text Area', 'Number', 'Date', 'User Select', 'Rating'];

  const blankQuestion = (id: number): Question => ({
    id, text: '', type: 'Text', positions: [], helpText: '', required: false,
    linkStart: false, linkPrev: false, varMain: '', varSub: '', varCode: '',
    reviewColumn: false, placeholder: '', minLen: '', maxLen: '',
  });

  // Seed data (module scope = stable reference, short lines = wrap-safe).
  const SEED_QUESTIONS: Question[] = [
    { ...blankQuestion(1), text: 'Player Match Rating', type: 'Number' },
    { ...blankQuestion(2), text: 'Technical Ability Assessment', type: 'Text Area' },
    { ...blankQuestion(3), text: 'Physical Attributes Summary', type: 'User Select' },
    { ...blankQuestion(4), text: 'Goalkeeper Handling', type: 'Rating', positions: ['GK'] },
    { ...blankQuestion(5), text: 'Set Piece Delivery', type: 'Rating' },
    {
      ...blankQuestion(6),
      text: 'Final Third Decision Making',
      type: 'Text Area',
      positions: ['CAM', 'RW', 'LW', 'ST'],
    },
  ];

  const BEHAVIOR_ROWS: { key: BehaviorKey; label: string; desc: string }[] = [
    {
      key: 'anon',
      label: 'Allow Anonymous Submissions',
      desc: 'Scouts can submit without identifying themselves.',
    },
    {
      key: 'signature',
      label: 'Require Digital Signature',
      desc: 'Adds a mandatory signature field to the end.',
    },
    {
      key: 'autosave',
      label: 'Auto-save Progress',
      desc: 'Drafts are saved locally every 30 seconds.',
    },
    {
      key: 'progress',
      label: 'Show Progress Bar',
      desc: 'Displays a completion percentage at the top.',
    },
    {
      key: 'video',
      label: 'Show in Video Workspace',
      desc: 'Makes this form available in the video player side-panel.',
    },
  ];

  // ── Reusable atoms (module scope, token-styled) ──
  const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <label className={`font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground
  block`}>{children}</label>
  );

  const SlideToggle = ({ on, onChange }: { on: boolean; onChange: () => void }) => (
    <button type="button" onClick={onChange}
      className={`w-12 h-7 rounded-full relative transition-colors shrink-0 ${on ? `bg-primary` :
  `bg-muted-foreground/30`}`}>
      <div className={`w-5 h-5 bg-card rounded-full absolute top-1 transition-all ${on ? `left-6` : `left-1`}`} />
    </button>
  );

  const CheckRow = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => (
    <label className={`flex items-center gap-2 cursor-pointer`}>
      <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all ${checked ? `bg-primary
  border-primary` : `border-border`}`}>
        {checked && <Check size={10} className={`text-primary-foreground`} />}
      </div>
      <input type="checkbox" checked={checked} onChange={onChange} className={`hidden`} />
      <span className={`font-body text-[14px] font-bold text-foreground`}>{label}</span>
    </label>
  );

  export const EditFormBlueprintModal = ({ editTemplate, onClose }: { editTemplate: any, onClose: () => void }) => {
    const [activeTab, setActiveTab] = useState('Questions');

    // Template Info state
    const [title, setTitle] = useState<string>(editTemplate?.title ?? '');
    const [description, setDescription] = useState<string>(editTemplate?.description ?? '');
    const [formType, setFormType] = useState<string>(editTemplate?.formType ?? 'Scouting Report');
    const [estTime, setEstTime] = useState<string>(editTemplate?.estTime ?? '');
    const [categories, setCategories] = useState<string[]>(editTemplate?.categories ?? ['All']);
    const [gradeAbbr, setGradeAbbr] = useState('');

    // Questions state
    const [questions, setQuestions] = useState<Question[]>(SEED_QUESTIONS);
    const [activeQuestionId, setActiveQuestionId] = useState(1);
    const [positionsExpanded, setPositionsExpanded] = useState(false);

    // Settings state
    const [behavior, setBehavior] = useState<Record<BehaviorKey, boolean>>({
      anon: false, signature: false, autosave: true, progress: true, video: false,
    });
    const [advancedExpanded, setAdvancedExpanded] = useState(false);

    const activeQuestion = questions.find(q => q.id === activeQuestionId) || questions[0];
    const activeIndex = questions.findIndex(q => q.id === activeQuestion.id);

    // ── Question handlers ──
    const updateActive = (field: keyof Question, value: any) =>
      setQuestions(prev => prev.map(q => q.id === activeQuestion.id ? { ...q, [field]: value } : q));

    const togglePosition = (pos: string) =>
      setQuestions(prev => prev.map(q => {
        if (q.id !== activeQuestion.id) return q;
        const has = q.positions.includes(pos);
        return { ...q, positions: has ? q.positions.filter(p => p !== pos) : [...q.positions, pos] };
      }));

    const addQuestion = () => {
      const nextId = Math.max(0, ...questions.map(q => q.id)) + 1;
      const nq = { ...blankQuestion(nextId), text: `New Question ${nextId}` };
      setQuestions(prev => [...prev, nq]);
      setActiveQuestionId(nextId);
    };

    const duplicateQuestion = () => {
      const nextId = Math.max(0, ...questions.map(q => q.id)) + 1;
      const copy = { ...activeQuestion, id: nextId, text: `${activeQuestion.text} (copy)` };
      setQuestions(prev => {
        const i = prev.findIndex(q => q.id === activeQuestion.id);
        const next = [...prev];
        next.splice(i + 1, 0, copy);
        return next;
      });
      setActiveQuestionId(nextId);
    };

    const deleteQuestion = () => {
      if (questions.length <= 1) return;
      const i = questions.findIndex(q => q.id === activeQuestion.id);
      const next = questions.filter(q => q.id !== activeQuestion.id);
      setQuestions(next);
      setActiveQuestionId(next[Math.max(0, i - 1)].id);
    };

    const move = (dir: -1 | 1) => {
      const i = questions.findIndex(q => q.id === activeQuestion.id);
      const j = i + dir;
      if (j < 0 || j >= questions.length) return;
      const next = [...questions];
      [next[i], next[j]] = [next[j], next[i]];
      setQuestions(next);
    };

    const fillFromTitle = () => {
      const words = title.trim().split(/\s+/).filter(Boolean);
      let abbr = words.length >= 2 ? words.map(w => w[0]).join('') : title.replace(/\s/g, '');
      setGradeAbbr(abbr.toUpperCase().slice(0, 3));
    };

    const toggleCategory = (c: string) =>
      setCategories(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

    const handleDelete = () => {
      if (window.confirm('Delete this template?')) onClose();
    };

    const showConstraints = activeQuestion.type === 'Text' || activeQuestion.type === 'Text Area';

    return (
      <div className={`fixed inset-0 bg-[#061B2E]/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4`}
  onClick={onClose}>
        <div className={`bg-card rounded-[32px] shadow-[var(--shadow-2xl)] w-full max-w-5xl h-[85vh] border border-border
  flex flex-col overflow-hidden`} onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className={`px-8 py-6 bg-primary flex items-center justify-between shrink-0`}>
            <div className={`flex flex-col gap-1`}>
              <span className={`font-heading font-semibold text-[20px] text-chalk`}>Edit Form Blueprint</span>
              <span className={`font-body font-medium text-[12px] text-chalk/60`}>Configure questions, scope and
  behavior.</span>
            </div>
            <button onClick={onClose} className={`w-8 h-8 rounded-full bg-card/10 flex items-center justify-center
  text-chalk/60 hover:text-chalk transition-colors`}><X size={16} /></button>
          </div>

          {/* Tab strip + metadata counter */}
          <div className={`px-8 pt-4 pb-4 flex items-center justify-between gap-4 border-b border-border shrink-0 bg-card`}>
            <div className={`flex items-center gap-2`}>
              {['Template Info', 'Questions', 'Settings'].map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`rounded-full px-6 py-2 font-body font-bold text-[14px] transition-colors border ${isActive ?
  `bg-primary text-primary-foreground border-primary shadow-sm` : `bg-card text-muted-foreground border-border
  hover:border-primary hover:text-foreground`}`}>
                    {tab}
                  </button>
                );
              })}
            </div>
            <div className={`flex items-center gap-2 shrink-0`}>
              <span className={`inline-flex items-center gap-1 font-body font-bold text-[12px] px-2 py-1 rounded-full
  bg-[#22C55E]/10 text-[#22C55E]`}>
                <Check size={11} /> Template ready
              </span>
              <span className={`font-body font-bold text-[12px] px-2 py-1 rounded-full bg-primary/10 text-primary`}>
                {questions.length} questions
              </span>
            </div>
          </div>

          {/* Canvas */}
          <div className={`flex-1 overflow-hidden relative bg-background`}>

            {/* ── Tab 1: Template Info ── */}
            {activeTab === 'Template Info' && (
              <div className={`p-8 flex flex-col gap-6 overflow-y-auto h-full max-w-3xl mx-auto`}>
                <div className={`flex flex-col gap-2`}>
                  <FieldLabel>Form Title</FieldLabel>
                  <input value={title} onChange={e => setTitle(e.target.value)}
                    className={`w-full bg-card border border-border rounded-xl px-4 py-2 text-[14px] font-bold
  text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all
  placeholder:text-muted-foreground`} />
                </div>

                <div className={`flex flex-col gap-2`}>
                  <div className={`flex items-center justify-between`}>
                    <FieldLabel>Description</FieldLabel>
                    <span className={`font-body font-medium text-[12px]
  text-muted-foreground`}>{description.length}/500</span>
                  </div>
                  <textarea value={description} maxLength={500} rows={3} onChange={e => setDescription(e.target.value)}
                    className={`w-full bg-card border border-border rounded-xl px-4 py-3 text-[14px] font-bold
  text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all
  placeholder:text-muted-foreground resize-none`} />
                </div>

                <div className={`grid grid-cols-2 gap-6`}>
                  <div className={`flex flex-col gap-2`}>
                    <FieldLabel>Template Type</FieldLabel>
                    <div className={`relative bg-card border border-border rounded-xl px-4 py-2 focus-within:ring-2
  focus-within:ring-ring/20 focus-within:border-ring transition-all`}>
                      <select value={formType} onChange={e => setFormType(e.target.value)}
                        className={`w-full bg-transparent text-[14px] font-bold text-foreground focus:outline-none
  appearance-none cursor-pointer`}>
                        {['Scouting Report', 'Player Evaluation', 'Match Report', 'Training Session'].map(t => <option
  key={t} className={`bg-card`}>{t}</option>)}
                      </select>
                      <ChevronDown size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground
  pointer-events-none`} />
                    </div>
                  </div>
                  <div className={`flex flex-col gap-2`}>
                    <FieldLabel>Est. Time</FieldLabel>
                    <input value={estTime} onChange={e => setEstTime(e.target.value)} placeholder="e.g. 8m"
                      className={`w-full bg-card border border-border rounded-xl px-4 py-2 text-[14px] font-bold
  text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all
  placeholder:text-muted-foreground`} />
                  </div>
                </div>

                <div className={`flex flex-col gap-2`}>
                  <FieldLabel>Scope Categories</FieldLabel>
                  <div className={`flex gap-2 flex-wrap`}>
                    {['All', 'Long', 'Short', 'Target'].map(c => {
                      const active = categories.includes(c);
                      return (
                        <button key={c} type="button" onClick={() => toggleCategory(c)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full font-body font-bold text-[12px]
  transition-all cursor-pointer border ${active ? `bg-primary/10 text-primary border-primary/20 shadow-sm` : `bg-card
  text-muted-foreground border-border hover:border-primary/50 hover:text-foreground`}`}>
                          <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-all
  ${active ? `bg-primary border-primary` : `border-border`}`}>
                            {active && <Check size={10} className={`text-primary-foreground`} />}
                          </div>
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={`flex flex-col gap-2`}>
                  <FieldLabel>Role Permission Visibility</FieldLabel>
                  <div className={`flex gap-2 flex-wrap`}>
                    <span className={`font-body font-black text-[10px] px-3 py-2 rounded-full bg-primary/10
  text-primary`}>SUPERVISOR</span>
                    <span className={`font-body font-black text-[10px] px-3 py-2 rounded-full bg-[#E8A838]/10
  text-[#E8A838]`}>DIRECTOR</span>
                  </div>
                </div>

                <div className={`flex flex-col gap-2 bg-card border border-border rounded-[20px] p-6`}>
                  <FieldLabel>Grade Abbreviation</FieldLabel>
                  <div className={`flex items-center gap-3`}>
                    <input value={gradeAbbr} maxLength={3} onChange={e => setGradeAbbr(e.target.value.toUpperCase().slice(0,
  3))}
                      placeholder="Optional"
                      className={`flex-1 bg-card border border-border rounded-xl px-4 py-2 text-[14px] font-bold font-mono
  text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all
  placeholder:text-muted-foreground`} />
                    <button type="button" onClick={fillFromTitle}
                      className={`bg-primary border-2 border-primary text-primary-foreground hover:bg-primary/80
  rounded-full px-6 py-2 font-body font-bold text-[14px] transition-colors shadow-sm shrink-0`}>
                      Fill from title
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab 2: Questions (30/70 master-detail) ── */}
            {activeTab === 'Questions' && (
              <div className={`flex h-full w-full`}>
                {/* Left rail */}
                <div className={`w-[30%] border-r border-border flex flex-col bg-card shrink-0
  shadow-[var(--shadow-sidebar)] z-10`}>
                  <div className={`p-4 border-b border-border bg-card`}>
                    <button onClick={addQuestion}
                      className={`w-full py-3 bg-primary border-2 border-primary text-primary-foreground font-body font-bold
  text-[14px] rounded-full shadow-md hover:bg-primary/80 transition-colors flex items-center justify-center gap-2`}>
                      <Plus size={16} /> Add Question
                    </button>
                  </div>
                  <div className={`flex-1 overflow-y-auto p-3 flex flex-col gap-2`}>
                    {questions.map((q, idx) => {
                      const isActive = activeQuestion.id === q.id;
                      return (
                        <button key={q.id} onClick={() => setActiveQuestionId(q.id)}
                          className={`w-full flex flex-col gap-2 p-3 rounded-xl transition-colors text-left border
  ${isActive ? `bg-primary/5 border-primary/30 shadow-sm` : `bg-transparent border-transparent hover:bg-accent/50`}`}>
                          <div className={`flex items-center gap-2 w-full`}>
                            <span className={`font-mono text-[12px] font-black shrink-0 ${isActive ? `text-primary` :
  `text-muted-foreground`}`}>{String(idx + 1).padStart(2, '0')}</span>
                            <span className={`font-body font-bold text-[14px] truncate flex-1 ${isActive ? `text-primary` :
  `text-foreground`}`}>{q.text || 'Untitled question'}</span>
                            {q.linkStart && <span className={`shrink-0 font-body font-black text-[10px] px-2 py-0.5
  rounded-full bg-[#22C55E]/10 text-[#22C55E]`}>Linked 1a</span>}
                          </div>
                          <div className={`flex items-center gap-2 ml-[22px]`}>
                            <span className={`shrink-0 bg-accent border border-border px-2 py-0.5 rounded-full font-body
  font-bold text-[10px] text-muted-foreground whitespace-nowrap`}>{q.type}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right workspace */}
                <div className={`w-[70%] overflow-y-auto`}>
                  <div className={`p-8 flex flex-col gap-8 pb-32`}>

                    {/* Floating utility strip */}
                    <div className={`sticky top-0 z-10 flex justify-end -mt-2 -mr-2`}>
                      <div className={`flex items-center gap-1 bg-card border border-border rounded-full p-1
  shadow-[var(--shadow-md)]`}>
                        <button onClick={() => move(-1)} disabled={activeIndex <= 0} title="Move up"
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-foreground
  hover:bg-primary/80 hover:text-primary-foreground transition-colors disabled:opacity-40`}><ArrowUp size={13} /></button>
                        <button onClick={() => move(1)} disabled={activeIndex >= questions.length - 1} title="Move down"
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-foreground
  hover:bg-primary/80 hover:text-primary-foreground transition-colors disabled:opacity-40`}><ArrowDown size={13} /></button>
                        <button onClick={duplicateQuestion} title="Duplicate"
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-foreground
  hover:bg-primary/80 hover:text-primary-foreground transition-colors`}><Copy size={13} /></button>
                        <button onClick={deleteQuestion} disabled={questions.length <= 1} title="Delete"
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-destructive
  hover:bg-destructive/10 transition-colors disabled:opacity-40`}><Trash2 size={13} /></button>
                        <button title="Preview"
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-foreground
  hover:bg-primary/80 hover:text-primary-foreground transition-colors`}><Eye size={13} /></button>
                      </div>
                    </div>

                    {/* Question text */}
                    <div className={`flex flex-col gap-2`}>
                      <label className={`font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground
  flex items-center gap-1`}>Question Text <span className={`text-destructive`}>*</span></label>
                      <input key={`text-${activeQuestion.id}`} value={activeQuestion.text} onChange={e =>
  updateActive('text', e.target.value)}
                        className={`w-full bg-card border border-border shadow-sm rounded-[16px] px-4 py-3 text-[16px]
  font-black text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all
  placeholder:text-muted-foreground`} />
                    </div>

                    {/* Help text + required */}
                    <div className={`flex flex-col gap-3`}>
                      <FieldLabel>Help Text (Optional)</FieldLabel>
                      <textarea key={`help-${activeQuestion.id}`} value={activeQuestion.helpText} rows={2} onChange={e =>
  updateActive('helpText', e.target.value)}
                        placeholder="Instruction text"
                        className={`w-full bg-card border border-border shadow-sm rounded-[16px] px-4 py-3 text-[14px]
  font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all
  placeholder:text-muted-foreground resize-none`} />
                      <CheckRow checked={activeQuestion.required} onChange={() => updateActive('required',
  !activeQuestion.required)} label="Required Question" />
                    </div>

                    {/* Question Linking Matrix */}
                    <div className={`flex flex-col gap-5 bg-accent/40 border border-border rounded-[20px] p-6`}>
                      <span className={`font-heading font-black text-[14px] text-foreground`}>Question Linking Matrix</span>

                      <div className={`grid grid-cols-2 gap-4`}>
                        <div className={`flex items-center justify-between bg-card border border-border rounded-xl px-4
  py-3`}>
                          <span className={`font-body font-bold text-[14px] text-foreground`}>Start Linked Set (1a)</span>
                          <SlideToggle on={activeQuestion.linkStart} onChange={() => updateActive('linkStart',
  !activeQuestion.linkStart)} />
                        </div>
                        <div className={`flex items-center justify-between bg-card border border-border rounded-xl px-4
  py-3`}>
                          <span className={`font-body font-bold text-[14px] text-foreground`}>Link to Previous</span>
                          <SlideToggle on={activeQuestion.linkPrev} onChange={() => updateActive('linkPrev',
  !activeQuestion.linkPrev)} />
                        </div>
                      </div>

                      <div className={`grid grid-cols-3 gap-3`}>
                        <div className={`flex flex-col gap-2`}>
                          <FieldLabel>Main Number</FieldLabel>
                          <input value={activeQuestion.varMain} onChange={e => updateActive('varMain', e.target.value)}
  placeholder="1"
                            className={`w-full bg-card border border-border rounded-xl px-3 py-2 text-[14px] font-bold
  font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all
  placeholder:text-muted-foreground`} />
                        </div>
                        <div className={`flex flex-col gap-2`}>
                          <FieldLabel>Sub Label</FieldLabel>
                          <input value={activeQuestion.varSub} onChange={e => updateActive('varSub', e.target.value)}
  placeholder="a"
                            className={`w-full bg-card border border-border rounded-xl px-3 py-2 text-[14px] font-bold
  text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all
  placeholder:text-muted-foreground`} />
                        </div>
                        <div className={`flex flex-col gap-2`}>
                          <FieldLabel>3-Letter Code</FieldLabel>
                          <input value={activeQuestion.varCode} maxLength={3} onChange={e => updateActive('varCode',
  e.target.value.toUpperCase().slice(0, 3))} placeholder="TEC"
                            className={`w-full bg-card border border-border rounded-xl px-3 py-2 text-[14px] font-bold
  font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all
  placeholder:text-muted-foreground`} />
                        </div>
                      </div>

                      <label className={`flex items-start gap-2 cursor-pointer`}>
                        <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all mt-0.5
  shrink-0 ${activeQuestion.reviewColumn ? `bg-primary border-primary` : `border-border`}`}>
                          {activeQuestion.reviewColumn && <Check size={10} className={`text-primary-foreground`} />}
                        </div>
                        <input type="checkbox" checked={activeQuestion.reviewColumn} onChange={() =>
  updateActive('reviewColumn', !activeQuestion.reviewColumn)} className={`hidden`} />
                        <span className={`font-body text-[14px] font-bold text-foreground`}>Control whether this grade
  appears as a column on Review Long / Short / Target lists.</span>
                      </label>
                    </div>

                    {/* Position Applicability accordion */}
                    <div className={`bg-card border border-border rounded-[20px] overflow-hidden`}>
                      <button onClick={() => setPositionsExpanded(!positionsExpanded)}
                        className={`w-full px-6 py-4 flex items-center justify-between font-heading font-bold text-[14px]
  text-foreground hover:bg-accent/40 transition-colors`}>
                        <span className={`flex items-center gap-3`}>
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-all
  ${positionsExpanded ? `bg-primary text-primary-foreground` : `bg-accent text-muted-foreground`}`}>
                            <ChevronRight size={14} className={`transition-transform duration-200 ${positionsExpanded ?
  `rotate-90` : ``}`} />
                          </span>
                          Position Applicability
                        </span>
                        <span className={`font-body font-medium text-[12px]
  text-muted-foreground`}>{activeQuestion.positions.length ? activeQuestion.positions.join(', ') : 'All positions'}</span>
                      </button>
                      {positionsExpanded && (
                        <div className={`px-6 pb-6 pt-2 border-t border-border`}>
                          <div className={`grid grid-cols-5 gap-2`}>
                            {POSITION_CODES.map(pos => {
                              const on = activeQuestion.positions.includes(pos);
                              return (
                                <button key={pos} type="button" onClick={() => togglePosition(pos)}
                                  className={`flex items-center justify-center px-3 py-2 rounded-lg font-body font-bold
  text-[12px] transition-colors border ${on ? `bg-primary text-primary-foreground border-primary` : `bg-accent/50
  border-transparent text-foreground hover:bg-accent`}`}>
                                  {pos}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Input type + dynamic constraints */}
                    <div className={`flex flex-col gap-2`}>
                      <FieldLabel>Input Type</FieldLabel>
                      <div className={`relative bg-card border border-border shadow-sm rounded-xl px-4 py-2
  focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-ring transition-all`}>
                        <select value={activeQuestion.type} onChange={e => updateActive('type', e.target.value)}
                          className={`w-full bg-transparent text-[14px] font-bold text-foreground focus:outline-none
  appearance-none cursor-pointer pr-6`}>
                          {INPUT_TYPES.map(t => <option key={t} className={`bg-card`}>{t}</option>)}
                        </select>
                        <ChevronDown size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground
  pointer-events-none`} />
                      </div>
                    </div>

                    {showConstraints && (
                      <div className={`flex flex-col gap-4`}>
                        <div className={`flex flex-col gap-2`}>
                          <FieldLabel>Placeholder Text</FieldLabel>
                          <input value={activeQuestion.placeholder} onChange={e => updateActive('placeholder',
  e.target.value)}
                            className={`w-full bg-card border border-border rounded-xl px-4 py-2 text-[14px] font-bold
  text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all
  placeholder:text-muted-foreground`} />
                        </div>
                        <div className={`grid grid-cols-2 gap-4`}>
                          <div className={`flex flex-col gap-2`}>
                            <FieldLabel>Minimum Length</FieldLabel>
                            <input type="number" value={activeQuestion.minLen} onChange={e => updateActive('minLen',
  e.target.value)} placeholder="0"
                              className={`w-full bg-card border border-border rounded-xl px-4 py-2 text-[14px] font-bold
  font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all
  placeholder:text-muted-foreground`} />
                          </div>
                          <div className={`flex flex-col gap-2`}>
                            <FieldLabel>Maximum Length</FieldLabel>
                            <input type="number" value={activeQuestion.maxLen} onChange={e => updateActive('maxLen',
  e.target.value)} placeholder="500"
                              className={`w-full bg-card border border-border rounded-xl px-4 py-2 text-[14px] font-bold
  font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all
  placeholder:text-muted-foreground`} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab 3: Settings ── */}
            {activeTab === 'Settings' && (
              <div className={`p-8 flex flex-col gap-8 overflow-y-auto h-full max-w-3xl mx-auto pb-32`}>

                {/* Form Behavior */}
                <div className={`bg-card rounded-[20px] border border-border shadow-sm overflow-hidden flex flex-col`}>
                  <div className={`px-6 py-4 bg-accent/40 border-b border-border`}>
                    <h3 className={`font-heading font-black text-[15px] text-foreground`}>Form Behavior</h3>
                  </div>
                  <div className={`flex flex-col divide-y divide-border`}>
                    {BEHAVIOR_ROWS.map(item => (
                      <div key={item.key} className={`flex items-center justify-between gap-4 p-5 hover:bg-accent/30
  transition-colors`}>
                        <div className={`flex flex-col gap-1`}>
                          <span className={`font-body font-bold text-[14px] text-foreground`}>{item.label}</span>
                          <span className={`font-body text-[12px] text-muted-foreground`}>{item.desc}</span>
                        </div>
                        <SlideToggle on={behavior[item.key]} onChange={() => setBehavior(b => ({ ...b, [item.key]:
  !b[item.key] }))} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Access & Limits */}
                <div className={`bg-card rounded-[20px] border border-border shadow-sm overflow-hidden flex flex-col`}>
                  <div className={`px-6 py-4 bg-accent/40 border-b border-border`}>
                    <h3 className={`font-heading font-black text-[15px] text-foreground`}>Access & Limits Control</h3>
                  </div>
                  <div className={`p-6 flex flex-col gap-6`}>
                    <div className={`flex flex-col gap-2`}>
                      <FieldLabel>Template Visibility</FieldLabel>
                      <div className={`relative bg-card border border-border rounded-xl px-4 py-2 focus-within:ring-2
  focus-within:ring-ring/20 focus-within:border-ring transition-all`}>
                        <select className={`w-full bg-transparent text-[14px] font-bold text-foreground focus:outline-none
  appearance-none cursor-pointer`}>
                          <option className={`bg-card`}>Public</option>
                          <option className={`bg-card`}>Restricted</option>
                          <option className={`bg-card`}>Private</option>
                        </select>
                        <ChevronDown size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground
  pointer-events-none`} />
                      </div>
                    </div>
                    <div className={`grid grid-cols-2 gap-6`}>
                      <div className={`flex flex-col gap-2`}>
                        <FieldLabel>Submission Limits</FieldLabel>
                        <input type="number" placeholder="No limit"
                          className={`w-full bg-card border border-border rounded-xl px-4 py-2 text-[14px] font-bold
  font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all
  placeholder:text-muted-foreground`} />
                      </div>
                      <div className={`flex flex-col gap-2`}>
                        <FieldLabel>Submission Deadline</FieldLabel>
                        <input type="date"
                          className={`w-full bg-card border border-border rounded-xl px-4 py-2 text-[14px] font-bold
  text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all [color-scheme:light]
  dark:[color-scheme:dark]`} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Execution & Advanced */}
                <div className={`bg-card rounded-[20px] border border-border shadow-sm overflow-hidden flex flex-col`}>
                  <div className={`px-6 py-4 bg-accent/40 border-b border-border`}>
                    <h3 className={`font-heading font-black text-[15px] text-foreground`}>Data Execution</h3>
                  </div>
                  <div className={`p-6 flex flex-col gap-6`}>
                    <div className={`grid grid-cols-2 gap-6`}>
                      <div className={`flex flex-col gap-2`}>
                        <FieldLabel>Default Export Format</FieldLabel>
                        <div className={`relative bg-card border border-border rounded-xl px-4 py-2 focus-within:ring-2
  focus-within:ring-ring/20 focus-within:border-ring transition-all`}>
                          <select className={`w-full bg-transparent text-[14px] font-bold text-foreground focus:outline-none
  appearance-none cursor-pointer`}>
                            <option className={`bg-card`}>PDF Document</option>
                            <option className={`bg-card`}>Excel Spreadsheet</option>
                            <option className={`bg-card`}>CSV Data</option>
                          </select>
                          <ChevronDown size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground
  pointer-events-none`} />
                        </div>
                      </div>
                      <div className={`flex flex-col gap-2`}>
                        <FieldLabel>Data Retention Policy</FieldLabel>
                        <div className={`relative bg-card border border-border rounded-xl px-4 py-2 focus-within:ring-2
  focus-within:ring-ring/20 focus-within:border-ring transition-all`}>
                          <select className={`w-full bg-transparent text-[14px] font-bold text-foreground focus:outline-none
  appearance-none cursor-pointer`}>
                            <option className={`bg-card`}>Indefinite</option>
                            <option className={`bg-card`}>Archive after 1 year</option>
                            <option className={`bg-card`}>Delete after 3 years</option>
                          </select>
                          <ChevronDown size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground
  pointer-events-none`} />
                        </div>
                      </div>
                    </div>

                    <div className={`border border-border rounded-[16px] overflow-hidden`}>
                      <button onClick={() => setAdvancedExpanded(!advancedExpanded)}
                        className={`w-full px-5 py-4 bg-accent/40 flex items-center gap-3 font-heading font-bold text-[14px]
  text-foreground hover:bg-accent/60 transition-colors`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-all
  ${advancedExpanded ? `bg-primary text-primary-foreground` : `bg-card text-muted-foreground`}`}>
                          <ChevronRight size={14} className={`transition-transform duration-200 ${advancedExpanded ?
  `rotate-90` : ``}`} />
                        </span>
                        Advanced Technical Options
                      </button>
                      {advancedExpanded && (
                        <div className={`p-5 flex flex-col gap-6 border-t border-border`}>
                          <div className={`flex flex-col gap-2`}>
                            <FieldLabel>Custom CSS Box</FieldLabel>
                            <div className={`bg-[#030E17] border border-[#145B99] rounded-[16px] p-4 shadow-inner`}>
                              <textarea rows={4} placeholder="/* custom CSS */"
                                className={`w-full bg-transparent text-[#AFC1D0] font-mono text-[14px] focus:outline-none
  resize-none placeholder:text-[#AFC1D0]/50`} />
                            </div>
                          </div>
                          <div className={`flex flex-col gap-2`}>
                            <FieldLabel>Thank You Message</FieldLabel>
                            <textarea rows={2} defaultValue="Thank you for submitting your evaluation."
                              className={`w-full bg-card border border-border rounded-[16px] px-4 py-3 text-[14px] font-bold
  text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all resize-none`} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`px-8 py-5 border-t border-border flex items-center justify-between gap-3 bg-card shrink-0
  shadow-[0_-4px_16px_rgba(6,27,46,0.06)] z-20`}>
            <button onClick={handleDelete}
              className={`border-2 border-destructive text-destructive hover:bg-destructive/10 rounded-full px-6 py-3
  font-body font-bold text-[14px] transition-colors`}>
              Delete Template
            </button>
            <div className={`flex items-center gap-3`}>
              <button onClick={onClose}
                className={`bg-card text-muted-foreground border border-border hover:border-primary hover:text-foreground
  rounded-full px-6 py-2 font-body font-bold text-[14px] transition-colors`}>
                Cancel
              </button>
              <button onClick={onClose}
                className={`bg-primary border-2 border-primary text-primary-foreground hover:bg-primary/80 rounded-full px-6
  py-3 font-body font-bold text-[14px] transition-colors shadow-md`}>
                Update Template
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };