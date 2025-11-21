import ProjectCard from "./ProjectCard";
import TaskItem from "./TaskItem";
import { Project, Task } from "../types";

interface DashboardProps {
  projects: Project[];
  tasks: Task[];
  onSelectProject: (id: string) => void;
  onToggleTask: (id: string) => void;
}

export default function Dashboard({ projects, tasks, onSelectProject, onToggleTask }: DashboardProps) {
  const activeProjects = projects.filter((p) => p.status === "active");
  const todayTasks = tasks.filter((t) => (t.status === "planned_today" || t.status === "active") && t.status !== "done");
  const areas = Array.from(new Set(projects.map((p) => p.area)));
  const nextActions = tasks.filter((t) => t.status === "next");

  return (
    <div class="layout-columns">
      <section class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Активные проекты</div>
            <div class="card-subtitle">{activeProjects.length} проекта в фокусе</div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span class="small-label">Сферы:</span>
            {areas.length ? (
              areas.map((a) => <span class="area-pill">{a}</span>)
            ) : (
              <span class="muted-label">нет данных</span>
            )}
          </div>
        </div>
        <div class="projects-grid">
          {activeProjects.map((project) => (
            <ProjectCard key={project.id} project={project} onSelect={onSelectProject} />
          ))}
        </div>
      </section>
      <section class="card">
        <div class="section-title-row">
          <div>
            <div class="section-title">Задачи на сегодня</div>
            <div class="card-subtitle">
              {todayTasks.length ? "Фокус на ближайшие шаги" : "Нет задач на сегодня"}
            </div>
          </div>
          <span class="pill">{todayTasks.length} шт.</span>
        </div>
        <ul class="tasks-list">
          {todayTasks.length ? (
            todayTasks.map((task) => {
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
            <div class="empty-state">
              Можно помечать задачи как «сегодня» через теги/структуру — парсер допилим.
            </div>
          )}
        </ul>
      </section>
      <section class="card">
        <div class="section-title-row">
          <div>
            <div class="section-title">Next Actions</div>
            <div class="card-subtitle">Очередь готовых шагов</div>
          </div>
          <span class="pill-soft">{nextActions.length}</span>
        </div>
        <ul class="tasks-list compact">
          {nextActions.length ? (
            nextActions.map((task) => {
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
            <div class="empty-state">Разберите inbox, чтобы пополнить список.</div>
          )}
        </ul>
      </section>
    </div>
  );
}
