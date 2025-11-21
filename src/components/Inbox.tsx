import { createEffect, createMemo, createSignal, Show } from "solid-js";
import { Project, Task } from "../types";

interface InboxProps {
  projects: Project[];
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onOpenTaskModal: (mode: "create" | "edit", payload?: { taskId?: string }) => void;
  onStartProcessing: () => void;
}

const contextOptions = [
  { value: "all", label: "Все контексты" },
  { value: "desktop", label: "ПК" },
  { value: "phone", label: "Телефон" },
  { value: "outdoor", label: "На улице" },
];

export default function Inbox(props: InboxProps) {
  const inboxTasks = createMemo(() => props.tasks.filter((t) => t.status === "inbox"));
  const [contextFilter, setContextFilter] = createSignal<string>("all");
  const [selectedTaskId, setSelectedTaskId] = createSignal<string | null>(null);

  const filteredTasks = createMemo(() => {
    const items = inboxTasks();
    if (contextFilter() === "all") return items;
    return items.filter((task) => task.context === contextFilter());
  });

  const selectedTask = createMemo(() => filteredTasks().find((t) => t.id === selectedTaskId()) || null);

  createEffect(() => {
    if (!selectedTask() && filteredTasks().length) {
      setSelectedTaskId(filteredTasks()[0].id);
    }
  });

  return (
    <section class="card">
      <div class="section-title-row">
        <div>
          <div class="section-title">Inbox</div>
          <div class="card-subtitle">{inboxTasks().length ? `${inboxTasks().length} новых задач` : "Пока пусто"}</div>
        </div>
        <div class="filters-row">
          <select value={contextFilter()} onInput={(e) => setContextFilter(e.currentTarget.value)}>
            {contextOptions.map((option) => (
              <option value={option.value}>{option.label}</option>
            ))}
          </select>
          <button class="btn-solid" type="button" onClick={props.onStartProcessing} disabled={!inboxTasks().length}>
            Начать процессинг
          </button>
        </div>
      </div>

      <div class="inbox-layout">
        <div class="stack" style={{ gap: "10px" }}>
          <div class="muted-label">{filteredTasks().length ? "Кликни по задаче, чтобы открыть контекстное окно." : "Нет задач под этот фильтр."}</div>
          <ul class="tasks-list compact">
            {filteredTasks().length ? (
              filteredTasks().map((task) => {
                const project = props.projects.find((p) => p.id === task.projectId);
                const isActive = selectedTaskId() === task.id;
                return (
                  <li
                    class={`inbox-task ${isActive ? "active" : ""}`}
                    onClick={() => setSelectedTaskId(task.id)}
                  >
                    <div class="task-main">
                      <div class="task-title">{task.title}</div>
                      <div class="task-meta">
                        {project?.title || "Без проекта"} · {task.area} · {task.context}
                      </div>
                    </div>
                    <div class="inbox-actions">
                      <button
                        class="btn-text"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          props.onToggleTask(task.id);
                        }}
                      >
                        {task.status === "done" ? "Сделано" : "Готово"}
                      </button>
                      <button
                        class="btn-ghost"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedTaskId(task.id);
                          props.onOpenTaskModal("edit", { taskId: task.id });
                        }}
                      >
                        Редактировать
                      </button>
                    </div>
                  </li>
                );
              })
            ) : (
              <div class="empty-state">Добавь задачи в inbox и вернись к обработке.</div>
            )}
          </ul>
        </div>

        <div class="context-window">
          <Show when={selectedTask()} fallback={<div class="empty-state">Выбери задачу слева.</div>}>
            {(task) => (
              <div class="stack" style={{ gap: "12px" }}>
                <div class="context-window__header">
                  <div class="small-label">Контекстное окно</div>
                  <span class="pill-soft">{task().context}</span>
                </div>

                <div class="stack" style={{ gap: "8px" }}>
                  <div class="card-title">{task().title}</div>
                  <div class="muted-label">{task().description || "Без описания"}</div>
                  <div class="context-meta">
                    <span class="pill-soft">Проект: {props.projects.find((p) => p.id === task().projectId)?.title || "Без проекта"}</span>
                    <span class="pill-soft">Сфера: {task().area}</span>
                    <span class="pill-soft">Дедлайн: {task().dueDate || "нет"}</span>
                  </div>
                  <div class="footer-actions">
                    <button class="btn-outline" type="button" onClick={() => props.onToggleTask(task().id)}>
                      Отметить выполненной
                    </button>
                    <button
                      class="btn-solid"
                      type="button"
                      onClick={() => props.onOpenTaskModal("edit", { taskId: task().id })}
                    >
                      Редактировать
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Show>
        </div>
      </div>
    </section>
  );
}
