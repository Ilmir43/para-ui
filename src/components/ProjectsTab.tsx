import ProjectCard from "./ProjectCard";
import TaskItem from "./TaskItem";
import ProjectForm from "./ProjectForm";
import { Project, ProjectFormValue, Task } from "../types";

const priorityLabel = { low: "Низкий", medium: "Средний", high: "Высокий" } as const;
const statusLabel = {
  inbox: "Inbox",
  active: "Активен",
  waiting: "Ожидание",
  paused: "Пауза",
  someday: "Когда-нибудь",
  done: "Готово",
} as const;

interface ProjectsTabProps {
  projects: Project[];
  tasks: Task[];
  statusFilter: string;
  priorityFilter: string;
  areaFilter: string;
  selectedProjectId: string | null;
  formMode: "idle" | "create" | "edit";
  onFilterChange: (type: "status" | "priority" | "area", value: string) => void;
  onSelectProject: (id: string) => void;
  onToggleTask: (id: string) => void;
  onStartCreate: () => void;
  onStartEdit: (id: string) => void;
  onCancelForm: () => void;
  onSubmitForm: (value: ProjectFormValue) => void;
}

export default function ProjectsTab({
  projects,
  tasks,
  statusFilter,
  priorityFilter,
  areaFilter,
  selectedProjectId,
  formMode,
  onFilterChange,
  onSelectProject,
  onToggleTask,
  onStartCreate,
  onStartEdit,
  onCancelForm,
  onSubmitForm,
}: ProjectsTabProps) {
  const filtered = projects.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (priorityFilter !== "all" && p.priority !== priorityFilter) return false;
    if (areaFilter !== "all" && p.area !== areaFilter) return false;
    return true;
  });

  const current = projects.find((p) => p.id === selectedProjectId) || filtered[0] || null;
  const projectTasks = current ? tasks.filter((t) => t.projectId === current.id) : [];
  const areas = Array.from(new Set(projects.map((p) => p.area)));

  return (
    <div class="layout-columns">
      <section class="card">
        <div class="section-title-row">
          <div>
            <div class="section-title">Все проекты</div>
            <div class="card-subtitle">{filtered.length} из {projects.length}</div>
          </div>
          <div class="filters-row">
            <select id="statusFilter" value={statusFilter} onInput={(e) => onFilterChange("status", e.currentTarget.value)}>
              <option value="all">Статус: все</option>
              <option value="inbox">Inbox</option>
              <option value="active">Активен</option>
              <option value="waiting">Ожидание</option>
              <option value="paused">Пауза</option>
              <option value="someday">Когда-нибудь</option>
              <option value="done">Готово</option>
            </select>
            <select
              id="priorityFilter"
              value={priorityFilter}
              onInput={(e) => onFilterChange("priority", e.currentTarget.value)}
            >
              <option value="all">Приоритет: все</option>
              <option value="high">Высокий</option>
              <option value="medium">Средний</option>
              <option value="low">Низкий</option>
            </select>
            <select id="areaFilter" value={areaFilter} onInput={(e) => onFilterChange("area", e.currentTarget.value)}>
              <option value="all">Сфера: все</option>
              {areas.map((a) => (
                <option value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
        <div class="projects-grid">
          {filtered.length ? (
            filtered.map((project) => <ProjectCard key={project.id} project={project} onSelect={onSelectProject} />)
          ) : (
            <div class="empty-state">Нет проектов под такие фильтры.</div>
          )}
        </div>
      </section>
      <section class="card">
        {formMode === "create" && (
          <div class="stack">
            <div class="card-title">Новый проект</div>
            <ProjectForm mode="create" onCancel={onCancelForm} onSubmit={onSubmitForm} />
          </div>
        )}

        {formMode === "edit" && current && (
          <div class="stack">
            <div class="card-title">Редактировать проект</div>
            <ProjectForm mode="edit" initial={current} onCancel={onCancelForm} onSubmit={onSubmitForm} />
          </div>
        )}

        {formMode === "idle" && (
          <div class="footer-actions">
            <button class="btn-solid" type="button" onClick={onStartCreate}>
              Добавить проект
            </button>
            {current && (
              <button class="btn-outline" type="button" onClick={() => onStartEdit(current.id)}>
                Редактировать выбранный
              </button>
            )}
          </div>
        )}

        {formMode === "idle" && !current && <div class="empty-state">Выбери проект слева, чтобы увидеть детали.</div>}

        {formMode === "idle" && current && (
          <div class="project-detail">
            <div class="card-header">
              <div>
                <div class="project-detail-title">{current.title}</div>
                <div class="project-detail-meta" style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                  <span class="pill-status" data-status={current.status}>{statusLabel[current.status]}</span>
                  <span class="pill-ghost" data-priority={current.priority}>Приоритет: {priorityLabel[current.priority]}</span>
                  <span class="pill-soft">Сфера: {current.area}</span>
                  {current.deadline && <span class="pill-soft">Дедлайн: {current.deadline}</span>}
                </div>
              </div>
            </div>
            <div class="progress-bar">
              <div class="progress-bar-inner" style={{ width: `${current.progress}%` }} />
            </div>
            <div class="mt-4 stack">
              <div>
                <div class="small-label">Описание</div>
                <div class="project-desc">{current.description}</div>
              </div>
              <div>
                <div class="small-label">Задачи</div>
                <ul class="tasks-list">
                  {projectTasks.length ? (
                    projectTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        projectName={current.title}
                        onToggle={onToggleTask}
                      />
                    ))
                  ) : (
                    <div class="empty-state">Нет задач в этом проекте.</div>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
