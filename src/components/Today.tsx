import { createMemo } from "solid-js";
import TaskItem from "./TaskItem";
import { Project, Task } from "../types";

interface TodayProps {
  projects: Project[];
  tasks: Task[];
  onToggleTask: (id: string) => void;
}

export default function Today({ projects, tasks, onToggleTask }: TodayProps) {
  const todayList = tasks.filter((t) => t.status === "planned_today" || t.status === "active");
  const dailyPriority = todayList.find((t) => t.dailyPriority);
  const frogs = todayList.filter((t) => t.flags.frog);
  const quick = todayList.filter((t) => t.timeBucket === "micro" && t.flags.quick);
  const waiting = tasks.filter((t) => t.status === "waiting");

  const grouped = createMemo(() => {
    const bucket: Record<string, Task[]> = {};
    todayList.forEach((task) => {
      if (!bucket[task.projectId]) bucket[task.projectId] = [];
      bucket[task.projectId].push(task);
    });
    return bucket;
  });

  if (!todayList.length) {
    return (
      <section class="card">
        <div class="section-title-row">
          <div>
            <div class="section-title">Сегодня</div>
            <div class="card-subtitle">Нет задач, отмеченных как «сегодня».</div>
          </div>
        </div>
        <div class="empty-state">Позже можно будет помечать задачи тегом или полем и парсить это.</div>
      </section>
    );
  }

  return (
    <section class="card">
      <div class="section-title-row">
        <div>
          <div class="section-title">Сегодня</div>
          <div class="card-subtitle">{todayList.length} задач в фокусе</div>
        </div>
      </div>
      <div class="stack">
        {dailyPriority && (
          <div class="card accent">
            <div class="card-title">Daily Priority</div>
            <TaskItem
              task={dailyPriority}
              projectName={projects.find((p) => p.id === dailyPriority.projectId)?.title || "Без проекта"}
              onToggle={onToggleTask}
            />
          </div>
        )}

        {frogs.length > 0 && (
          <div>
            <div class="small-label">Лягушки</div>
            <ul class="tasks-list">
              {frogs.map((task) => (
                <TaskItem
                  task={task}
                  projectName={projects.find((p) => p.id === task.projectId)?.title || "Без проекта"}
                  onToggle={onToggleTask}
                />
              ))}
            </ul>
          </div>
        )}

        <div>
          <div class="small-label">Фокус-задачи</div>
          {Object.keys(grouped()).map((projectId) => {
            const project = projects.find((p) => p.id === projectId);
            if (!project) return null;
            return (
              <div>
                <div class="project-title" style={{ "margin-bottom": "4px" }}>
                  {project.title}
                  <span class="tag-pill">Проект</span>
                </div>
                <ul class="tasks-list">
                  {grouped()[projectId]
                    .filter((task) => !task.flags.frog)
                    .map((task) => (
                      <TaskItem task={task} projectName={project.title} onToggle={onToggleTask} />
                    ))}
                </ul>
              </div>
            );
          })}
        </div>

        {quick.length > 0 && (
          <div>
            <div class="small-label">Сделать быстро</div>
            <ul class="tasks-list compact">
              {quick.map((task) => (
                <TaskItem
                  task={task}
                  projectName={projects.find((p) => p.id === task.projectId)?.title || "Без проекта"}
                  onToggle={onToggleTask}
                />
              ))}
            </ul>
          </div>
        )}

        {waiting.length > 0 && (
          <div>
            <div class="small-label">Жду ответа</div>
            <ul class="tasks-list compact">
              {waiting.map((task) => (
                <TaskItem
                  task={task}
                  projectName={projects.find((p) => p.id === task.projectId)?.title || "Без проекта"}
                  onToggle={onToggleTask}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
