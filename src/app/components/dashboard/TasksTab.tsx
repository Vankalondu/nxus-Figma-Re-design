import { TasksBoard } from '../tasks/TasksBoard';

/**
 * The dashboard Tasks tab: the Tasks board (P-CO26, D-26). One Kanban board, no list view and
 * no distribution chart; every dashboard shows the same structure, the tasks differ by account.
 */
export function TasksTab() {
  return <TasksBoard />;
}
