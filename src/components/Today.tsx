import TaskItem from "./TaskItem";
import { Project, Task } from "../types";

interface TodayProps {
  projects: Project[];
  tasks: Task[];
  onToggleTask: (id: string) => void;
}

export default function Today({ projects, tasks, onToggleTask }: TodayProps) {
  const todayList = tasks.filter((t) => t.today);

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

  const byProject: Record<string, Task[]> = {};
  todayList.forEach((task) => {
    if (!byProject[task.projectId]) byProject[task.projectId] = [];
    byProject[task.projectId].push(task);
  });

  return (
    <section class="card">
      <div class="section-title-row">
        <div>
          <div class="section-title">Сегодня</div>
          <div class="card-subtitle">{todayList.length} задач в фокусе</div>
        </div>
      </div>
      <div class="stack">
        {Object.keys(byProject).map((projectId) => {
          const project = projects.find((p) => p.id === projectId);
          if (!project) return null;
          return (
            <div>
              <div class="project-title" style={{ marginBottom: "4px" }}>
                {project.title}
                <span class="tag-pill">Проект</span>
              </div>
              <ul class="tasks-list">
                {byProject[projectId].map((task) => (
                  <TaskItem key={task.id} task={task} projectName={project.title} onToggle={onToggleTask} />
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
