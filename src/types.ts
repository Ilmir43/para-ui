export type ProjectStatus = "inbox" | "active" | "waiting" | "paused" | "someday" | "done";
export type ProjectPriority = "low" | "medium" | "high";

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
  projectId: string;
  done: boolean;
  today: boolean;
  priority: ProjectPriority;
  due: string | null;
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
  activeTab: "dashboard" | "projects" | "today" | "daily";
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
