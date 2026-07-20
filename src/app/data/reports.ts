// ─── Shared reports data — single source of truth ─────────────────────────────
// Used by BOTH the Reports tab (ReportsHub) and the Player Video Workspace
// report panel, so a report filed beside the video is the same kind of
// submission that appears in Reports → Submissions.

export interface Submission {
  id: string;
  formName: string;
  formType: string;
  scoutName: string;
  scoutInitials: string;
  status: 'Draft' | 'Submitted' | 'Completed';
  timestamp: string;
  progress: number;
  playerName: string;
}

export const MOCK_SUBMISSIONS: Submission[] = [
  { id: 's1', formName: 'PLR Macro Profiler', formType: 'PLR/NXT', scoutName: 'Mbugua', scoutInitials: 'MB', status: 'Completed', timestamp: '2026-06-22 14:32', progress: 100, playerName: 'Kofi Mensah' },
  { id: 's2', formName: 'POG Live Match Report', formType: 'POG', scoutName: 'Tom Okeke', scoutInitials: 'TO', status: 'Submitted', timestamp: '2026-06-21 09:15', progress: 100, playerName: 'David Conteh' },
  { id: 's3', formName: 'PLR Macro Profiler', formType: 'PLR/NXT', scoutName: 'Nene Balde', scoutInitials: 'NB', status: 'Draft', timestamp: '2026-06-20 16:48', progress: 60, playerName: 'Amadou Sarr' },
  { id: 's4', formName: 'Athletic Screening', formType: 'Physical', scoutName: 'Dr. Kwame', scoutInitials: 'KA', status: 'Completed', timestamp: '2026-06-19 11:20', progress: 100, playerName: 'Francis Gomez' },
  { id: 's5', formName: 'POG Live Match Report', formType: 'POG', scoutName: 'Mbugua', scoutInitials: 'MB', status: 'Draft', timestamp: '2026-06-18 08:00', progress: 35, playerName: 'Abdul Moro' },
  { id: 's6', formName: 'Position Diagnostic', formType: 'Technical', scoutName: 'Tom Okeke', scoutInitials: 'TO', status: 'Completed', timestamp: '2026-06-17 13:45', progress: 100, playerName: 'Kazungu Nesta' },
  { id: 's7', formName: 'PLR Macro Profiler', formType: 'PLR/NXT', scoutName: 'Nene Balde', scoutInitials: 'NB', status: 'Submitted', timestamp: '2026-06-16 10:12', progress: 100, playerName: 'Solomon Adeleke' },
  { id: 's8', formName: 'Athletic Screening', formType: 'Physical', scoutName: 'Dr. Kwame', scoutInitials: 'KA', status: 'Draft', timestamp: '2026-06-15 15:30', progress: 45, playerName: 'Nyanga Tombu' },
];

// ─── Short Report template (graded criteria) ──────────────────────────────────
export const GRADE_SCALE = ['A+', 'A', 'B', 'C'] as const;
export type Grade = (typeof GRADE_SCALE)[number];

export interface ReportCriterion {
  id: string;
  label: string;
  required: boolean;
}

export interface ReportSection {
  title: string;
  criteria: ReportCriterion[];
}

export interface ReportTemplate {
  id: string;
  name: string;
  formType: string;
  sections: ReportSection[];
}

export const SHORT_REPORT_TEMPLATE: ReportTemplate = {
  id: 'tpl-short-report',
  name: 'Short Report',
  formType: 'Scouting Report',
  sections: [
    { title: 'POS 1 – PROFILE', criteria: [
      { id: 'sr-01', label: 'Position Fit', required: true },
      { id: 'sr-02', label: 'Physical Frame', required: false },
      { id: 'sr-03', label: 'Athleticism', required: true },
    ]},
    { title: 'POS 2 – POTENTIAL', criteria: [
      { id: 'sr-04', label: 'Ceiling Projection', required: true },
      { id: 'sr-05', label: 'Technical Upside', required: false },
      { id: 'sr-06', label: 'Tactical Growth', required: false },
      { id: 'sr-07', label: 'Learning Speed', required: false },
    ]},
    { title: 'POS 3 – CURRENT', criteria: [
      { id: 'sr-08', label: 'Current Level', required: true },
      { id: 'sr-09', label: 'First Touch', required: false },
      { id: 'sr-10', label: 'Passing Range', required: false },
      { id: 'sr-11', label: 'Defensive Contribution', required: false },
    ]},
    { title: 'POS 4 – MENTALITY', criteria: [
      { id: 'sr-12', label: 'Composure', required: true },
      { id: 'sr-13', label: 'Work Rate', required: false },
      { id: 'sr-14', label: 'Leadership', required: false },
      { id: 'sr-15', label: 'Coachability', required: false },
    ]},
  ],
};

export const REPORT_CRITERIA_TOTAL = SHORT_REPORT_TEMPLATE.sections.reduce((n, s) => n + s.criteria.length, 0);

// Mock current user + fixed literal timestamp (no Date.now in mock data).
export const MOCK_CURRENT_SCOUT = { name: 'Vanessa Lighthouse', initials: 'VL' };
export const MOCK_REPORT_TIMESTAMP = '2026-07-10 09:41';
