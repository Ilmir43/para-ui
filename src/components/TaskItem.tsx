import { Task } from "../types";

interface TaskItemProps {
  task: Task;
  projectName: string;
  onToggle: (id: string) => void;
}

export default function TaskItem({ task, projectName, onToggle }: TaskItemProps) {
  return (
    <li
      class={`task-item ${task.done ? "done" : ""}`}
      data-task-id={task.id}
      onClick={() => onToggle(task.id)}
    >
      <div class={`checkbox ${task.done ? "checked" : ""}`}>{task.done ? "✓" : ""}</div>
      <div>
        <div class="task-title">{task.title}</div>
        <div class="task-meta">{projectName}</div>
      </div>
    </li>
  );
}
