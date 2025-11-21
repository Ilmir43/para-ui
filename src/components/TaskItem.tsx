import { Task } from "../types";

interface TaskItemProps {
  task: Task;
  projectName: string;
  onToggle: (id: string) => void;
}

export default function TaskItem(props: TaskItemProps) {
  return (
    <li class={`task-item ${props.task.status === "done" ? "done" : ""}`} data-task-id={props.task.id}>
      <button class={`checkbox ${props.task.status === "done" ? "checked" : ""}`} onClick={() => props.onToggle(props.task.id)}>
        {props.task.status === "done" ? "✓" : ""}
      </button>
      <div>
        <div class="task-title">{props.task.title}</div>
        <div class="task-meta">
          {props.projectName} · {props.task.area} · {props.task.context}
        </div>
        <div class="task-flags">
          <span class={`pill-soft pill-${props.task.timeBucket}`}>{formatBucket(props.task.timeBucket)}</span>
          {props.task.flags.quick && <span class="pill-soft">Quick</span>}
          {props.task.flags.frog && <span class="pill-soft">Frog</span>}
          {props.task.flags.fear && <span class="pill-soft">Avoiding</span>}
          {props.task.status === "waiting" && <span class="pill-soft">Waiting</span>}
          {props.task.dailyPriority && <span class="pill-ghost">Daily priority</span>}
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
