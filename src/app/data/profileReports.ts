// Example report templates and filed reports for the player-profile Reports tab (D-19).
// The questions are EXAMPLES — the real templates come from the platform's form builder.

export type ReportList = 'Long' | 'Short' | 'Target';
export type GradeScale = 'grade' | 'nxt';

export interface TemplateQuestion {
  id: string;
  label: string;
  /** grade questions become columns; text questions only show in the report itself */
  kind: GradeScale | 'text';
  /** short column code; generated when the template doesn't give one */
  code?: string;
  /** true when NXUS generated the code */
  autoCode?: boolean;
}

export interface ReportTemplate {
  id: string;
  name: string;
  /** the list a NEW report of this type is filed against by default */
  list: ReportList;
  archived?: boolean;
  questions: TemplateQuestion[];
}

export interface FiledReport {
  id: string;
  templateId: string;
  /** the list the player was on when the report was filed — what All/Long/Short/Target filter by (D-23) */
  list: ReportList;
  scout: string;
  source: string;       // what was watched: "Highlight 2", "vs AS Pikine", …
  dateLabel: string;    // when it was watched
  submitted: string;    // when the report was filed
  archived?: boolean;
  answers: Record<string, string>;
}

export const GRADE_OPTIONS = ['A+', 'A', 'B', 'C'] as const;
export const NXT_OPTIONS = [
  { value: 'T', label: 'Target' },
  { value: 'M', label: 'Monitor' },
  { value: 'D', label: 'Drop' },
] as const;

const g = (id: string, label: string, code?: string): TemplateQuestion => ({ id, label, kind: 'grade', code });
const nxt = (id: string): TemplateQuestion => ({ id, label: 'Next step', kind: 'nxt', code: 'NXT' });
const t = (id: string, label: string): TemplateQuestion => ({ id, label, kind: 'text' });

export const REPORT_TEMPLATES: ReportTemplate[] = [
  { id: 'scout', name: 'Scout report', list: 'Long', questions: [
    g('men', 'Mentality – current', 'MEN'), g('phy', 'Physical – current', 'PHY'), g('tec', 'Technical – current', 'TEC'),
    g('cur', 'Current grade', 'CUR'), nxt('nxt'), t('sum', 'Summary'),
  ] },
  { id: 'short', name: 'Short report', list: 'Short', questions: [
    g('menc', 'Mentality – current', 'MENC'), g('phic', 'Physical 1 – current', 'PH1C'),
    g('plg', 'Player current grade', 'PLG'), g('pog', 'Potential grade', 'POG'), nxt('nxt'),
    t('sum', 'Summary'),
  ] },
  { id: 'long', name: 'Long report', list: 'Long', questions: [
    g('tec', 'Technical – current'), g('tac', 'Tactical – current'), g('men', 'Mentality – current'),
    g('phy', 'Physical – current'), g('cur', 'Current grade', 'CUR'), g('pot', 'Potential grade', 'POT'),
    nxt('nxt'), t('str', 'Strengths'), t('wea', 'Areas to improve'),
  ] },
  { id: 'target', name: 'Target report', list: 'Target', questions: [
    g('fit', 'First-team readiness'), g('val', 'Value for money'), g('cur', 'Current grade', 'CUR'),
    g('pot', 'Potential grade', 'POT'), nxt('nxt'), t('rec', 'Recommendation'),
  ] },
  { id: 'weekly', name: 'Scout weekly report', list: 'Long', questions: [
    g('ovr', 'Overall grade', 'GRD'), t('wk', 'Notes on the week'),
  ] },
  { id: 'match', name: 'Match report', list: 'Long', questions: [
    g('inf', 'Influence on the game', 'INF'), g('dec', 'Decision-making', 'DEC'), g('wor', 'Work rate', 'WRK'),
    g('cur', 'Current grade', 'CUR'), t('key', 'Key moments'),
  ] },
  { id: 'video', name: 'Video analysis report', list: 'Short', questions: [
    g('fst', 'First touch', 'FTC'), g('mov', 'Movement off the ball', 'MOV'), g('fin', 'Finishing', 'FIN'),
    g('pot', 'Potential grade', 'POT'), t('clips', 'Clips reviewed'),
  ] },
  { id: 'trial', name: 'Trial report', list: 'Target', questions: [
    g('adp', 'Adaptation to the group', 'ADP'), g('lvl', 'Level vs first team', 'LVL'), g('att', 'Attitude', 'ATT'),
    g('cur', 'Current grade', 'CUR'), g('pot', 'Potential grade', 'POT'), nxt('nxt'), t('ver', 'Verdict'),
  ] },
  { id: 'short2', name: 'Short report 2', list: 'Short', archived: true, questions: [
    g('men', 'Ment – current', 'MEN'), g('pha', 'Phy 1 – current', 'PHA'), g('phb', 'Phy 2 – current', 'PHB'),
    g('po1', 'Pos 1 – current'), g('po2', 'Pos 2 – current'), g('plg', 'Player current grade', 'PLG'),
    g('pog', 'Potential grade', 'POG'),
  ] },
];

const STOP = new Set(['the', 'and', 'of', 'for', 'to', 'a', 'current', 'grade']);
/**
 * A short code for a grade that has none, so every grade can be a column (no "+9 more
 * without an acronym"). Initials of the meaningful words, else the first three letters;
 * "– current" adds a C. Unique within the template.
 */
export function withCodes(tpl: ReportTemplate): ReportTemplate {
  const used = new Set(tpl.questions.map(q => q.code).filter(Boolean) as string[]);
  return {
    ...tpl,
    questions: tpl.questions.map(q => {
      if (q.kind === 'text' || q.code) return q;
      const words = q.label.replace(/[^A-Za-z0-9 ]/g, ' ').split(/\s+/).filter(w => w && !STOP.has(w.toLowerCase()));
      let base = (words.length > 1 ? words.map(w => /^\d+$/.test(w) ? w : w[0]).join('') : (words[0] ?? q.label).slice(0, 3)).toUpperCase().slice(0, 3);
      if (/current/i.test(q.label) && base.length < 4) base += 'C';
      let code = base, n = 2;
      while (used.has(code)) code = base + n++;
      used.add(code);
      return { ...q, code, autoCode: true };
    }),
  };
}

export const TEMPLATES = REPORT_TEMPLATES.map(withCodes);
export const templateById = (id: string) => TEMPLATES.find(x => x.id === id)!;
export const gradeQuestions = (tpl: ReportTemplate) => tpl.questions.filter(q => q.kind !== 'text');

const SCOUTS = ['David Mbugua', 'Tom Legg', 'Sanoussy Sinare', 'Kwame Asante'];
const pick = <T,>(arr: readonly T[], i: number) => arr[i % arr.length];

/**
 * Example filed reports for a player — deterministic per player id. Even ids (db-0) get the
 * full set across eight report types so the Kanban wraps; odd ids (db-1) get a handful.
 */
export function seedReports(playerId: string): FiledReport[] {
  const digits = playerId.replace(/\D/g, '');
  const n = digits ? parseInt(digits, 10) : playerId.length;
  const make = (k: number, templateId: string, list: ReportList, source: string, dateLabel: string, submitted: string, archived = false, scout?: string): FiledReport => {
    const tpl = templateById(templateId);
    const answers: Record<string, string> = {};
    tpl.questions.forEach((q, qi) => {
      if (q.kind === 'grade') answers[q.id] = pick(['B', 'A', 'B', 'A+', 'C', 'B'], n + k + qi);
      else if (q.kind === 'nxt') answers[q.id] = pick(['M', 'T', 'M', 'D'], n + k);
      else answers[q.id] = pick([
        'Quick over the first five yards and brave in the box. Needs to scan earlier before receiving.',
        'Comfortable on both feet, presses with intent. Decision-making in the final third is still raw.',
        'Composed in possession and a good communicator. Watch his recovery pace against direct runners.',
      ], n + k + qi);
    });
    return { id: `${playerId}-r${k}`, templateId, list, scout: scout ?? pick(SCOUTS, n + k), source, dateLabel, submitted, archived, answers };
  };
  const base = [
    make(0, 'short', 'Short', 'Highlight 2', 'Jul 6, 2025', 'Sep 30, 2026'),
    make(1, 'short', 'Short', 'vs AS Pikine', 'Oct 12, 2026', 'Oct 14, 2026'),
    make(2, 'long', 'Long', 'vs Diambars FC', 'Sep 28, 2026', 'Oct 2, 2026'),
    make(3, 'target', 'Target', 'vs Teungueth', 'Sep 14, 2026', 'Sep 20, 2026'),
    make(4, 'weekly', 'Long', 'Week 41', 'Oct 10, 2026', 'Oct 11, 2026'),
    make(5, 'short2', 'Short', 'Highlight 1', 'Mar 3, 2025', 'Mar 9, 2025', true),
  ];
  if (n % 2 !== 0) return base;
  // The full set: several scouts per type, and reports filed while the player sat on different lists.
  return [
    ...base,
    make(6, 'scout', 'Long', 'vs Jaraaf', 'Aug 30, 2026', 'Sep 2, 2026', false, 'Tom Legg'),
    make(7, 'scout', 'Short', 'vs Casa Sports', 'Oct 18, 2026', 'Oct 19, 2026', false, 'Tom Legg'),
    make(8, 'scout', 'Long', 'Highlight 4', 'Jun 2, 2026', 'Jun 4, 2026', false, 'Kwame Asante'),
    make(9, 'short', 'Short', 'Highlight 5', 'Oct 20, 2026', 'Oct 21, 2026', false, 'Tom Legg'),
    make(10, 'long', 'Short', 'vs Génération Foot B', 'Oct 5, 2026', 'Oct 7, 2026', false, 'David Mbugua'),
    make(11, 'weekly', 'Long', 'Week 42', 'Oct 17, 2026', 'Oct 18, 2026', false, 'Sanoussy Sinare'),
    make(12, 'weekly', 'Short', 'Week 43', 'Oct 24, 2026', 'Oct 25, 2026', false, 'Sanoussy Sinare'),
    make(13, 'match', 'Long', 'vs Stade de Mbour', 'Sep 21, 2026', 'Sep 22, 2026', false, 'Kwame Asante'),
    make(14, 'match', 'Target', 'vs Dakar Sacré-Cœur', 'Oct 26, 2026', 'Oct 27, 2026', false, 'David Mbugua'),
    make(15, 'video', 'Short', 'Package F3', 'Oct 1, 2026', 'Oct 3, 2026', false, 'Sanoussy Sinare'),
    make(16, 'video', 'Short', 'Package H2', 'Oct 15, 2026', 'Oct 16, 2026', false, 'Tom Legg'),
    make(17, 'trial', 'Target', 'Trial week 1', 'Oct 28, 2026', 'Oct 30, 2026', false, 'Kwame Asante'),
  ];
}
