import { createMemo } from "solid-js";
import { Project, ProjectFormValue } from "../types";
import { slugify } from "../lib/slugify";

interface ProjectFormProps {
  mode: "create" | "edit";
  initial?: Project;
  onCancel: () => void;
  onSubmit: (value: ProjectFormValue) => void;
}

const defaultValue: ProjectFormValue = {
  id: "",
  title: "",
  status: "active",
  priority: "medium",
  area: "general",
  deadline: "",
  progress: 0,
  description: "",
  projectNumber: "",
  targetPath: "",
  vaultName: "",
  templaterTemplate: "",
};

export default function ProjectForm(props: ProjectFormProps) {
  const currentValue = createMemo<ProjectFormValue>(() => {
    if (props.initial) {
      return {
        id: props.initial.id,
        title: props.initial.title,
        status: props.initial.status,
        priority: props.initial.priority,
        area: props.initial.area,
        deadline: props.initial.deadline || "",
        progress: props.initial.progress,
        description: props.initial.description,
        projectNumber: "",
        targetPath: "",
        vaultName: "",
        templaterTemplate: "",
      };
    }
    return { ...defaultValue };
  });

  const handleSubmit = (event: Event) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const title = ((formData.get("title") as string) || "").trim();
    const id = props.mode === "create" ? slugify(title || "project") : (formData.get("id") as string);
    const value: ProjectFormValue = {
      id,
      title,
      status: (formData.get("status") as ProjectFormValue["status"]) || "active",
      priority: (formData.get("priority") as ProjectFormValue["priority"]) || "medium",
      area: (formData.get("area") as string) || "general",
      deadline: (formData.get("deadline") as string) || "",
      progress: Number(formData.get("progress")) || 0,
      description: (formData.get("description") as string) || "",
      projectNumber: (formData.get("projectNumber") as string) || "",
      targetPath: (formData.get("targetPath") as string) || "",
      vaultName: (formData.get("vaultName") as string) || "",
      templaterTemplate: (formData.get("templaterTemplate") as string) || "",
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
          <label for="area">Сфера</label>
          <input id="area" name="area" type="text" value={currentValue().area} />
        </div>
        <div class="form-group">
          <label for="status">Статус</label>
          <select id="status" name="status" value={currentValue().status}>
            <option value="inbox">Inbox</option>
            <option value="active">Активен</option>
            <option value="waiting">Ожидание</option>
            <option value="paused">Пауза</option>
            <option value="someday">Когда-нибудь</option>
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
          <label for="deadline">Дедлайн</label>
          <input id="deadline" name="deadline" type="date" value={currentValue().deadline || ""} />
        </div>
        <div class="form-group">
          <label for="progress">Прогресс (%)</label>
          <input
            id="progress"
            name="progress"
            type="number"
            min="0"
            max="100"
            value={currentValue().progress}
          />
        </div>
      </div>

      {props.mode === "create" && (
        <div class="form-grid">
          <div class="form-group">
            <label for="projectNumber">Номер проекта</label>
            <input
              id="projectNumber"
              name="projectNumber"
              type="text"
              value={currentValue().projectNumber}
              placeholder="Например: P-2024-015"
            />
          </div>
          <div class="form-group">
            <label for="targetPath">Путь в Obsidian</label>
            <input
              id="targetPath"
              name="targetPath"
              type="text"
              value={currentValue().targetPath}
              placeholder="Projects/Активные"
            />
            <div class="form-hint">Куда поместить файл (папка или полный путь внутри вальта).</div>
          </div>
          <div class="form-group">
            <label for="vaultName">Vault</label>
            <input
              id="vaultName"
              name="vaultName"
              type="text"
              value={currentValue().vaultName}
              placeholder="MySecondBrain"
            />
            <div class="form-hint">Название вальта для схемы obsidian://advanced-uri.</div>
          </div>
          <div class="form-group">
            <label for="templaterTemplate">Шаблон Templater</label>
            <input
              id="templaterTemplate"
              name="templaterTemplate"
              type="text"
              value={currentValue().templaterTemplate}
              placeholder="Templates/Project.md"
            />
            <div class="form-hint">Путь к шаблону, который должен обработать Templater.</div>
          </div>
        </div>
      )}

      {props.mode === "edit" && <input type="hidden" name="id" value={currentValue().id} aria-hidden />}

      <div class="form-group">
        <label for="description">Описание</label>
        <textarea
          id="description"
          name="description"
          value={currentValue().description}
          placeholder="Краткое описание или ближайший шаг"
        />
      </div>

      <div class="form-actions">
        <button class="btn-solid" type="submit">
          {props.mode === "create" ? "Создать проект" : "Сохранить изменения"}
        </button>
        <button class="btn-outline" type="button" onClick={props.onCancel}>
          Отмена
        </button>
      </div>
    </form>
  );
}
