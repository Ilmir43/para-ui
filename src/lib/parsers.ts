import { DailyNote, Habit, Project, Task } from "../types";

export interface ParsedProjectResult {
  projects: Project[];
  tasks: Task[];
}

export function parseFrontmatter(text: string): { data: Record<string, string>; content: string } {
  if (!text.startsWith("---")) {
    return { data: {}, content: text };
  }

  const end = text.indexOf("\n---", 3);
  if (end === -1) {
    return { data: {}, content: text };
  }

  const fmText = text.slice(3, end).trim();
  const content = text.slice(end + 4);
  const data: Record<string, string> = {};

  fmText.split("\n").forEach((line) => {
    const idx = line.indexOf(":");
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    data[key] = value;
  });

  return { data, content };
}

export function extractDescription(content: string): string {
  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  return lines[0] || "";
}

export function parseProjectFile(fileName: string, text: string): ParsedProjectResult {
  const { data, content } = parseFrontmatter(text);
  const projectId = data.id || fileName.replace(/\.md$/i, "");

  const project: Project = {
    id: projectId,
    fileName,
    title: data.title || projectId,
    status: (data.status as Project["status"]) || "active",
    priority: (data.priority as Project["priority"]) || "medium",
    area: data.area || "general",
    deadline: data.deadline || null,
    progress: Number.isFinite(Number(data.progress)) ? Number(data.progress) : 0,
    description: data.description || extractDescription(content),
  };

  const re = /^- \[( |x)\] (.+)$/gm;
  const tasks: Task[] = [];
  let match;
  while ((match = re.exec(content)) !== null) {
    const done = match[1] === "x";
    const title = match[2];
    const taskId = `${projectId}::${match.index}`;
    tasks.push({
      id: taskId,
      title,
      projectId,
      area: data.area || "general",
      context: data.context || "desk",
      estimatedMinutes: Number(data.estimatedMinutes) || 25,
      timeBucket: "short",
      status: done ? "done" : "next",
      flags: { quick: false, frog: false, batchable: false, fear: false, waiting: false },
      createdAt: data.createdAt || new Date().toISOString(),
      dueDate: data.deadline || null,
      plannedDate: null,
      completedAt: done ? new Date().toISOString() : null,
      dailyPriority: false,
      priority: (data.priority as Project["priority"]) || "medium",
    });
  }

  return { projects: [project], tasks };
}

export function parseDailyFile(fileName: string, text: string): DailyNote {
  const { data, content } = parseFrontmatter(text);
  const date = data.date || fileName.replace(/\.md$/i, "");
  const lines = content.split("\n");

  let currentBlock = "Общие привычки";
  const habits: Habit[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const h2 = /^##\s+(.+)$/.exec(line);
    if (h2) {
      currentBlock = h2[1].trim();
      continue;
    }
    const task = /^- \[( |x)\] (.+)$/.exec(line);
    if (task) {
      const done = task[1] === "x";
      const title = task[2];
      const id = `${date}::${i}`;
      habits.push({ id, title, block: currentBlock, done });
    }
  }

  return { date, fileName, habits };
}
