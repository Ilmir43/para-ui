export type ProjectStatus = "inbox" | "active" | "waiting" | "paused" | "someday" | "done";
export type ProjectPriority = "low" | "medium" | "high";

export type TaskStatus =
  | "inbox"
  | "clarified"
  | "next"
  | "planned_today"
  | "active"
  | "waiting"
  | "done"
  | "someday"
  | "cancelled";

export type TimeBucket = "micro" | "short" | "medium" | "long";

export interface TaskFlags {
  quick?: boolean;
  frog?: boolean;
  batchable?: boolean;
  fear?: boolean;
  waiting?: boolean;
}

export interface Project {
  id: string;
  fileName: string;
  title: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  area: string;
  deadline: string | null;
  progress: number;
  description: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  goalId?: string;
  area: string;
  context: string;
  estimatedMinutes: number;
  timeBucket: TimeBucket;
  status: TaskStatus;
  flags: TaskFlags;
  createdAt: string;
  dueDate: string | null;
  plannedDate?: string | null;
  completedAt?: string | null;
  dailyPriority?: boolean;
  priority: ProjectPriority;
}

export interface Habit {
  id: string;
  title: string;
  block: string;
  done: boolean;
}

export interface DailyNote {
  date: string;
  fileName: string;
  habits: Habit[];
}

export interface AppState {
  activeTab: "dashboard" | "projects" | "processing" | "today" | "daily";
  statusFilter: ProjectStatus | "all";
  priorityFilter: ProjectPriority | "all";
  areaFilter: string | "all";
  selectedProjectId: string | null;
  formMode: "idle" | "create" | "edit";
}

export interface ProjectFormValue {
  id: string;
  title: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  area: string;
  deadline: string;
  progress: number;
  description: string;
}
