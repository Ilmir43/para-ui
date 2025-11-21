import { createMemo } from "solid-js";
import { Project, Task, TaskFormValue, TaskStatus, TimeBucket } from "../types";
import { slugify } from "../lib/slugify";

interface TaskFormProps {
  mode: "create" | "edit";
  projects: Project[];
  initial?: Task;
  defaultProjectId?: string | null;
  onCancel: () => void;
  onSubmit: (value: TaskFormValue) => void;
}

const defaultValue: TaskFormValue = {
  title: "",
  description: "",
  projectId: "",
  area: "general",
  context: "desktop",
  timeBucket: "short",
  status: "inbox",
  priority: "medium",
  dueDate: "",
  plannedDate: "",
};

export default function TaskForm(props: TaskFormProps) {
  const currentValue = createMemo<TaskFormValue>(() => {
    if (props.initial) {
      return {
        id: props.initial.id,
        title: props.initial.title,
        description: props.initial.description,
        projectId: props.initial.projectId,
        area: props.initial.area,
        context: props.initial.context,
        timeBucket: props.initial.timeBucket,
        status: props.initial.status,
        priority: props.initial.priority,
        dueDate: props.initial.dueDate || "",
        plannedDate: props.initial.plannedDate || "",
      };
    }

    return {
      ...defaultValue,
      projectId: props.defaultProjectId || defaultValue.projectId,
      area:
        props.projects.find((p) => p.id === props.defaultProjectId)?.area || defaultValue.area,
    };
  });

  const handleSubmit = (event: Event) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const title = ((formData.get("title") as string) || "").trim();
    const id = props.mode === "create" ? slugify(title || "task") : (formData.get("id") as string);
    const value: TaskFormValue = {
      id,
      title,
      description: (formData.get("description") as string) || "",
      projectId: (formData.get("projectId") as string) || props.defaultProjectId || "",
      area: (formData.get("area") as string) || "general",
      context: (formData.get("context") as string) || "desktop",
      timeBucket: (formData.get("timeBucket") as TimeBucket) || "short",
      status: (formData.get("status") as TaskStatus) || "inbox",
      priority: (formData.get("priority") as TaskFormValue["priority"]) || "medium",
      dueDate: (formData.get("dueDate") as string) || "",
      plannedDate: (formData.get("plannedDate") as string) || "",
    };

    props.onSubmit(value);
  };

  return (
    <form class="stack" onSubmit={handleSubmit}>
      <div class="form-grid">
        <div class="form-group">
          <label for="title">Название</label>
          <input id="title" name="title" type="text" required value={currentValue().title} />
        </div>
        <div class="form-group">
          <label for="projectId">Проект</label>
          <select id="projectId" name="projectId" value={currentValue().projectId} required>
            <option value="">Без проекта</option>
            {props.projects.map((project) => (
              <option value={project.id}>{project.title}</option>
            ))}
          </select>
        </div>
        <div class="form-group">
          <label for="status">Статус</label>
          <select id="status" name="status" value={currentValue().status}>
            <option value="inbox">Inbox</option>
            <option value="clarified">Clarified</option>
            <option value="next">Next</option>
            <option value="planned_today">Today</option>
            <option value="waiting">Waiting</option>
            <option value="someday">Someday</option>
            <option value="done">Готово</option>
          </select>
        </div>
        <div class="form-group">
          <label for="priority">Приоритет</label>
          <select id="priority" name="priority" value={currentValue().priority}>
            <option value="high">Высокий</option>
            <option value="medium">Средний</option>
            <option value="low">Низкий</option>
          </select>
        </div>
        <div class="form-group">
          <label for="area">Сфера</label>
          <input id="area" name="area" type="text" value={currentValue().area} />
        </div>
        <div class="form-group">
          <label for="context">Контекст</label>
          <input id="context" name="context" type="text" value={currentValue().context} />
        </div>
        <div class="form-group">
          <label for="timeBucket">Длительность</label>
          <select id="timeBucket" name="timeBucket" value={currentValue().timeBucket}>
            <option value="micro">До 10 минут</option>
            <option value="short">11–30 минут</option>
            <option value="medium">31–60 минут</option>
            <option value="long">60+ минут</option>
          </select>
        </div>
        <div class="form-group">
          <label for="dueDate">Дедлайн</label>
          <input id="dueDate" name="dueDate" type="date" value={currentValue().dueDate || ""} />
        </div>
        <div class="form-group">
          <label for="plannedDate">Дата планирования</label>
          <input id="plannedDate" name="plannedDate" type="date" value={currentValue().plannedDate || ""} />
        </div>
      </div>

      <div class="form-group">
        <label for="description">Описание</label>
        <textarea
          id="description"
          name="description"
          value={currentValue().description || ""}
          placeholder="Опционально: заметки или критерий готовности"
        />
      </div>

      {props.mode === "edit" && props.initial && (
        <input type="hidden" name="id" value={props.initial.id} aria-hidden />
      )}

      <div class="form-actions">
        <button class="btn-solid" type="submit">
          {props.mode === "create" ? "Сохранить в inbox" : "Обновить задачу"}
        </button>
        <button class="btn-outline" type="button" onClick={props.onCancel}>
          Отмена
        </button>
      </div>
    </form>
  );
}
