import { Task } from "../types";

interface TaskItemProps {
  task: Task;
  projectName: string;
  onToggle: (id: string) => void;
}

export default function TaskItem({ task, projectName, onToggle }: TaskItemProps) {
  return (
    <li class={`task-item ${task.status === "done" ? "done" : ""}`} data-task-id={task.id}>
      <button class={`checkbox ${task.status === "done" ? "checked" : ""}`} onClick={() => onToggle(task.id)}>
        {task.status === "done" ? "✓" : ""}
      </button>
      <div>
        <div class="task-title">{task.title}</div>
        <div class="task-meta">
          {projectName} · {task.area} · {task.context}
        </div>
        <div class="task-flags">
          <span class={`pill-soft pill-${task.timeBucket}`}>{formatBucket(task.timeBucket)}</span>
          {task.flags.quick && <span class="pill-soft">Quick</span>}
          {task.flags.frog && <span class="pill-soft">Frog</span>}
          {task.flags.fear && <span class="pill-soft">Avoiding</span>}
          {task.status === "waiting" && <span class="pill-soft">Waiting</span>}
          {task.dailyPriority && <span class="pill-ghost">Daily priority</span>}
        </div>
      </div>
    </li>
  );
}

function formatBucket(bucket: string) {
  switch (bucket) {
    case "micro":
      return "до 10 мин";
    case "short":
      return "11–30 мин";
    case "medium":
      return "31–60 мин";
    case "long":
      return "60+ мин";
    default:
      return bucket;
  }
}
