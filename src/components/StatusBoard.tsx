import { For } from "solid-js";
import { Project, Task, TaskStatus } from "../types";
import TaskItem from "./TaskItem";

interface StatusBoardProps {
  projects: Project[];
  tasks: Task[];
  onToggleTask: (id: string) => void;
}

const statusOrder: TaskStatus[] = [
  "next",
  "planned_today",
  "active",
  "waiting",
  "someday",
  "done",
];

const statusLabel: Record<TaskStatus, string> = {
  inbox: "Inbox",
  clarified: "Clarified",
  next: "Next actions",
  planned_today: "Сегодня",
  active: "Фокус",
  waiting: "Жду ответа",
  done: "Сделано",
  someday: "Когда-нибудь",
  cancelled: "Отменено",
};

export default function StatusBoard({ projects, tasks, onToggleTask }: StatusBoardProps) {
  return (
    <div class="status-board">
      <For each={statusOrder}>
        {(status) => {
          const items = tasks.filter((t) => t.status === status);
          return (
            <div class="status-column" data-status={status}>
              <div class="status-column__header">
                <div class="small-label">{statusLabel[status]}</div>
                <span class="pill-soft">{items.length}</span>
              </div>
              <ul class="tasks-list compact">
                {items.length ? (
                  items.map((task) => {
                    const project = projects.find((p) => p.id === task.projectId);
                    return (
                      <TaskItem
                        key={task.id}
                        task={task}
                        projectName={project?.title || "Без проекта"}
                        onToggle={onToggleTask}
                      />
                    );
                  })
                ) : (
                  <div class="empty-state">Нет задач</div>
                )}
              </ul>
            </div>
          );
        }}
      </For>
    </div>
  );
}
