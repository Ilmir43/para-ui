import { Project } from "../types";

const priorityLabel = { low: "Низкий", medium: "Средний", high: "Высокий" } as const;
const statusLabel = {
  inbox: "Inbox",
  active: "Активен",
  waiting: "Ожидание",
  paused: "Пауза",
  someday: "Когда-нибудь",
  done: "Готово",
} as const;

interface ProjectCardProps {
  project: Project;
  onSelect?: (id: string) => void;
}

export default function ProjectCard({ project, onSelect }: ProjectCardProps) {
  return (
    <article class="project-card" data-project-id={project.id} onClick={() => onSelect?.(project.id)}>
      <div class="project-title">{project.title}</div>
      <div class="project-desc">{project.description}</div>
      <div class="project-meta-row">
        <span class="pill-status" data-status={project.status}>
          {statusLabel[project.status] || project.status}
        </span>
        <span class="pill-ghost" data-priority={project.priority}>
          {priorityLabel[project.priority] || project.priority}
        </span>
      </div>
      <div class="project-meta-row">
        <span class="muted-label">{project.area}</span>
        <span class="muted-label">{project.deadline ? `до ${project.deadline}` : "без дедлайна"}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-bar-inner" style={{ width: `${project.progress}%` }}></div>
      </div>
    </article>
  );
}
