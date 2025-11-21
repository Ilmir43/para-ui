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

export default function ProjectCard(props: ProjectCardProps) {
  return (
    <article class="project-card" data-project-id={props.project.id} onClick={() => props.onSelect?.(props.project.id)}>
      <div class="project-title">{props.project.title}</div>
      <div class="project-desc">{props.project.description}</div>
      <div class="project-meta-row">
        <span class="pill-status" data-status={props.project.status}>
          {statusLabel[props.project.status] || props.project.status}
        </span>
        <span class="pill-ghost" data-priority={props.project.priority}>
          {priorityLabel[props.project.priority] || props.project.priority}
        </span>
      </div>
      <div class="project-meta-row">
        <span class="muted-label">{props.project.area}</span>
        <span class="muted-label">{props.project.deadline ? `до ${props.project.deadline}` : "без дедлайна"}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-bar-inner" style={{ width: `${props.project.progress}%` }}></div>
      </div>
    </article>
  );
}
