import { createMemo, createSignal, onMount, Show } from "solid-js";
import Header from "./components/Header";
import Tabs from "./components/Tabs";
import Dashboard from "./components/Dashboard";
import ProjectsTab from "./components/ProjectsTab";
import Inbox from "./components/Inbox";
import Today from "./components/Today";
import Daily from "./components/Daily";
import Processing from "./components/Processing";
import StatusBoard from "./components/StatusBoard";
import Modal from "./components/Modal";
import TaskForm from "./components/TaskForm";
import { parseDailyFile, parseProjectFile } from "./lib/parsers";
import { slugify } from "./lib/slugify";
import { demoDaily, demoProjects, demoTasks } from "./lib/demoData";
import { envHttpPaths, envPaths, hasEnvPath } from "./lib/env";
import { AppState, DailyNote, Project, ProjectFormValue, Task, TaskFormValue } from "./types";

const initialState: AppState = {
  activeTab: "dashboard",
  statusFilter: "all",
  priorityFilter: "all",
  areaFilter: "all",
  selectedProjectId: null,
  formMode: "idle",
};

type TaskModalState = {
  mode: "create" | "edit";
  taskId?: string | null;
  defaultProjectId?: string | null;
};

export default function App() {
  const [projects, setProjects] = createSignal<Project[]>(demoProjects);
  const [tasks, setTasks] = createSignal<Task[]>(demoTasks);
  const [dailyNotes, setDailyNotes] = createSignal<DailyNote[]>(demoDaily);
  const [state, setState] = createSignal<AppState>(initialState);
  const [taskModal, setTaskModal] = createSignal<TaskModalState | null>(null);

  const openTaskModal = (mode: TaskModalState["mode"], options?: Partial<TaskModalState>) => {
    setTaskModal({ mode, ...options });
  };

  const closeTaskModal = () => setTaskModal(null);

  const downloadProjectFile = (project: Project) => {
    const frontmatterLines = [
      `id: ${project.id}`,
      `title: ${project.title}`,
      `status: ${project.status}`,
      `priority: ${project.priority}`,
      `area: ${project.area}`,
      project.deadline ? `deadline: ${project.deadline}` : "",
      `progress: ${project.progress}`,
      project.description ? `description: ${project.description}` : "",
    ].filter(Boolean);

    const markdown = `---\n${frontmatterLines.join("\n")}\n---\n\n# ${project.title}\n\n- [ ] Опишите ближайший шаг\n`;

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = project.fileName;
    anchor.click();

    URL.revokeObjectURL(url);
  };

  const envPathHints = (
    [
      envPaths.projectsDir && { label: "Проекты", value: envPaths.projectsDir },
      envPaths.areasDir && { label: "Сферы", value: envPaths.areasDir },
      envPaths.dailyDir && { label: "Ежедневник", value: envPaths.dailyDir },
    ].filter(Boolean) as { label: string; value: string }[]
  ).sort((a, b) => a.label.localeCompare(b.label));

  const fetchMarkdownFromHttpDir = async (baseDir: string) => {
    const normalized = baseDir.replace(/\/$/, "");
    const indexUrl = `${normalized}/index.json`;
    const response = await fetch(indexUrl);
    if (!response.ok) throw new Error(`Не удалось загрузить индекс из ${indexUrl}`);
    const payload = (await response.json()) as { files?: string[] };
    if (!payload.files?.length) throw new Error("index.json не содержит списка файлов.");

    const files: { name: string; content: string }[] = [];
    for (const fileName of payload.files) {
      if (!fileName.toLowerCase().endsWith(".md")) continue;
      const url = `${normalized}/${encodeURIComponent(fileName)}`;
      const fileResponse = await fetch(url);
      if (!fileResponse.ok) throw new Error(`Не удалось загрузить ${url}`);
      const content = await fileResponse.text();
      files.push({ name: fileName, content });
    }

    return files;
  };

  const loadProjectsFromEnvDir = async () => {
    if (!hasEnvPath(envPaths.projectsDir) || !envHttpPaths.projectsDir) return false;
    try {
      const files = await fetchMarkdownFromHttpDir(envHttpPaths.projectsDir);
      const collectedProjects: Project[] = [];
      const collectedTasks: Task[] = [];

      files.forEach(({ name, content }) => {
        const parsed = parseProjectFile(name, content);
        collectedProjects.push(...parsed.projects);
        collectedTasks.push(...parsed.tasks);
      });

      setProjects(collectedProjects);
      setTasks(collectedTasks);
      if (collectedProjects.length) {
        updateState({ selectedProjectId: collectedProjects[0].id });
      }
      return true;
    } catch (error) {
      console.warn("Автоподгрузка проектов из переменных окружения не удалась:", error);
      return false;
    }
  };

  const loadDailyFromEnvDir = async () => {
    if (!hasEnvPath(envPaths.dailyDir) || !envHttpPaths.dailyDir) return false;
    try {
      const files = await fetchMarkdownFromHttpDir(envHttpPaths.dailyDir);
      const notes: DailyNote[] = [];

      files.forEach(({ name, content }) => {
        notes.push(parseDailyFile(name, content));
      });

      notes.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      setDailyNotes(notes);
      return true;
    } catch (error) {
      console.warn("Автоподгрузка ежедневников из переменных окружения не удалась:", error);
      return false;
    }
  };

  const updateState = (partial: Partial<AppState>) => setState((prev) => ({ ...prev, ...partial }));

  const handlePickProjects = async () => {
    try {
      if (!("showDirectoryPicker" in window)) {
        alert("Нужен браузер с поддержкой showDirectoryPicker (Chrome/Edge).");
        return;
      }
      const dirHandle = await (window as any).showDirectoryPicker();
      const collectedProjects: Project[] = [];
      const collectedTasks: Task[] = [];

      for await (const [name, handle] of dirHandle.entries()) {
        if (handle.kind === "file" && name.toLowerCase().endsWith(".md")) {
          const file = await handle.getFile();
          const text = await file.text();
          const parsed = parseProjectFile(name, text);
          collectedProjects.push(...parsed.projects);
          collectedTasks.push(...parsed.tasks);
        }
      }

      setProjects(collectedProjects);
      setTasks(collectedTasks);
      if (collectedProjects.length) {
        updateState({ selectedProjectId: collectedProjects[0].id });
      }
    } catch (error) {
      console.error(error);
      alert("Не удалось прочитать папку проектов.");
    }
  };

  const handlePickDaily = async () => {
    try {
      if (!("showDirectoryPicker" in window)) {
        alert("Нужен браузер с поддержкой showDirectoryPicker (Chrome/Edge).");
        return;
      }
      const dirHandle = await (window as any).showDirectoryPicker();
      const notes: DailyNote[] = [];
      for await (const [name, handle] of dirHandle.entries()) {
        if (handle.kind === "file" && name.toLowerCase().endsWith(".md")) {
          const file = await handle.getFile();
          const text = await file.text();
          notes.push(parseDailyFile(name, text));
        }
      }
      notes.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      setDailyNotes(notes);
    } catch (error) {
      console.error(error);
      alert("Не удалось прочитать папку ежедневников.");
    }
  };

  onMount(() => {
    loadProjectsFromEnvDir();
    loadDailyFromEnvDir();
  });

  const handleToggleTask = (id: string) => {
    const now = new Date().toISOString();
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              status: task.status === "done" ? "next" : "done",
              completedAt: task.status === "done" ? null : now,
            }
          : task
      )
    );
  };

  const handleUpdateTask = (id: string, payload: Partial<Task>) => {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, ...payload } : task)));
  };

  const handleUpsertTask = (mode: "create" | "edit", value: TaskFormValue) => {
    if (mode === "edit" && value.id) {
      setTasks((current) =>
        current.map((task) =>
          task.id === value.id
            ? {
                ...task,
                ...value,
                dueDate: value.dueDate || null,
                plannedDate: value.plannedDate || null,
              }
            : task
        )
      );
      return;
    }

    const now = new Date().toISOString();
    const projectId = value.projectId || state().selectedProjectId || projects()[0]?.id || "inbox";

    const newTask: Task = {
      id: value.id || slugify(value.title),
      title: value.title,
      description: value.description,
      projectId,
      area: value.area,
      context: value.context,
      estimatedMinutes: 20,
      timeBucket: value.timeBucket,
      status: value.status || "inbox",
      flags: {},
      createdAt: now,
      dueDate: value.dueDate || null,
      plannedDate: value.plannedDate || null,
      completedAt: null,
      dailyPriority: false,
      priority: value.priority,
    };

    setTasks((current) => [newTask, ...current]);
  };

  const reorderById = <T extends { id: string }>(list: T[], sourceId: string, targetId: string) => {
    if (sourceId === targetId) return list;
    const next = [...list];
    const fromIndex = next.findIndex((item) => item.id === sourceId);
    const toIndex = next.findIndex((item) => item.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return list;
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
  };

  const handleReorderProjects = (sourceId: string, targetId: string) => {
    setProjects((current) => reorderById(current, sourceId, targetId));
  };

  const handleReorderTasks = (projectId: string, sourceId: string, targetId: string) => {
    setTasks((current) => {
      const projectTasks = current.filter((task) => task.projectId === projectId);
      const reordered = reorderById(projectTasks, sourceId, targetId);
      const otherTasks = current.filter((task) => task.projectId !== projectId);
      return [...reordered, ...otherTasks];
    });
  };

  const handleToggleHabit = (id: string) => {
    setDailyNotes((current) =>
      current.map((note) => ({
        ...note,
        habits: note.habits.map((habit) => (habit.id === id ? { ...habit, done: !habit.done } : habit)),
      }))
    );
  };

  const handlePlanToday = (dailyPriorityId: string | null, supportIds: string[]) => {
    const today = new Date().toISOString().slice(0, 10);
    const plannedIds = new Set([dailyPriorityId, ...supportIds].filter(Boolean) as string[]);

    setTasks((current) =>
      current.map((task) => {
        if (plannedIds.has(task.id)) {
          return {
            ...task,
            status: "planned_today",
            plannedDate: today,
            dailyPriority: task.id === dailyPriorityId,
          };
        }

        if (task.status === "planned_today" && !plannedIds.has(task.id)) {
          return {
            ...task,
            status: "next",
            dailyPriority: false,
          };
        }

        if (task.dailyPriority && task.id !== dailyPriorityId) {
          return { ...task, dailyPriority: false };
        }

        return task;
      })
    );
  };

  const handleFilterChange = (type: "status" | "priority" | "area", value: string) => {
    updateState({ [`${type}Filter`]: value } as Partial<AppState>);
  };

  const handleSelectProject = (id: string) => {
    updateState({ selectedProjectId: id, formMode: "idle" });
  };

  const modalTask = createMemo(() => tasks().find((task) => task.id === taskModal()?.taskId) || null);

  const handleSubmitTaskModal = (value: TaskFormValue) => {
    handleUpsertTask(taskModal()?.mode === "edit" ? "edit" : "create", value);
    closeTaskModal();
  };

  const handleStartCreate = () => updateState({ formMode: "create" });
  const handleStartEdit = (id: string) => updateState({ formMode: "edit", selectedProjectId: id });
  const handleCancelForm = () => updateState({ formMode: "idle" });
  const handleStartProcessing = () => updateState({ activeTab: "processing" });

  const handleSubmitForm = (value: ProjectFormValue) => {
    if (state().formMode === "create") {
      const newProject: Project = {
        id: value.id || slugify(value.title),
        fileName: `${value.id || slugify(value.title)}.md`,
        title: value.title,
        status: value.status,
        priority: value.priority,
        area: value.area || "general",
        deadline: value.deadline || null,
        progress: value.progress,
        description: value.description,
      };
      setProjects((current) => [...current, newProject]);
      downloadProjectFile(newProject);
      updateState({ formMode: "idle", selectedProjectId: newProject.id, activeTab: "projects" });
      return;
    }

    if (state().formMode === "edit") {
      setProjects((current) =>
        current.map((project) =>
          project.id === value.id
            ? {
                ...project,
                title: value.title,
                status: value.status,
                priority: value.priority,
                area: value.area,
                deadline: value.deadline || null,
                progress: value.progress,
                description: value.description,
              }
            : project
        )
      );
      updateState({ formMode: "idle", selectedProjectId: value.id });
    }
  };

  const noData = createMemo(() => !projects().length && !dailyNotes().length);

  return (
    <div class="app">
      <Header subtitle="Проекты · Сферы (PARA) · Ежедневник">
        <Tabs active={state().activeTab} onChange={(tab) => updateState({ activeTab: tab })} />
      </Header>
      <main>
        <div class="connect-row">
          <span>1) Папка проектов (Projects)</span>
          <button id="pick-projects-btn" class="btn-outline" onClick={handlePickProjects}>
            Выбрать папку проектов
          </button>
          <span>2) Папка ежедневников (Daily / Journal)</span>
          <button id="pick-daily-btn" class="btn-outline" onClick={handlePickDaily}>
            Выбрать папку ежедневников
          </button>
        </div>
        <Show when={envPathHints.length}>
          <div class="env-hints">
            <div class="env-hints-title">Предустановленные пути (.env):</div>
            <div class="env-hints-list">
              {envPathHints.map((item) => (
                <div class="env-hint" role="status">
                  <span class="env-hint-label">{item.label}</span>
                  <span class="env-hint-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Show>
        <div style={{ "margin-top": "12px" }}>
          <Show when={!noData()} fallback={
            <section class="card">
              <div class="card-header">
                <div>
                  <div class="card-title">Нет данных</div>
                  <div class="card-subtitle">Выбери папку с проектами и/или ежедневниками.</div>
                </div>
              </div>
            </section>
          }>
            <Show when={state().activeTab === "dashboard"}>
              <Dashboard
                projects={projects()}
                tasks={tasks()}
                onSelectProject={(id) => updateState({ activeTab: "projects", selectedProjectId: id })}
                onToggleTask={handleToggleTask}
              />
            </Show>

            <Show when={state().activeTab === "projects"}>
              <ProjectsTab
                projects={projects()}
                tasks={tasks()}
                statusFilter={state().statusFilter}
                priorityFilter={state().priorityFilter}
                areaFilter={state().areaFilter}
                selectedProjectId={state().selectedProjectId}
                formMode={state().formMode}
                onFilterChange={handleFilterChange}
                onSelectProject={handleSelectProject}
                onToggleTask={handleToggleTask}
                onReorderProjects={handleReorderProjects}
                onReorderTasks={handleReorderTasks}
                onOpenTaskModal={openTaskModal}
                onStartCreate={handleStartCreate}
                onStartEdit={handleStartEdit}
                onCancelForm={handleCancelForm}
                onSubmitForm={handleSubmitForm}
              />
            </Show>

            <Show when={state().activeTab === "inbox"}>
              <Inbox
                projects={projects()}
                tasks={tasks()}
                onToggleTask={handleToggleTask}
                onOpenTaskModal={openTaskModal}
                onStartProcessing={handleStartProcessing}
              />
            </Show>

            <Show when={state().activeTab === "processing"}>
              <div class="layout-columns">
                <Processing
                  projects={projects()}
                  tasks={tasks()}
                  onUpdateTask={handleUpdateTask}
                  onCreateInboxTask={(value) => handleUpsertTask("create", value)}
                />
                <StatusBoard projects={projects()} tasks={tasks()} onToggleTask={handleToggleTask} />
              </div>
            </Show>

            <Show when={state().activeTab === "today"}>
              <Today projects={projects()} tasks={tasks()} onToggleTask={handleToggleTask} onPlanToday={handlePlanToday} />
            </Show>

            <Show when={state().activeTab === "daily"}>
              <Daily notes={dailyNotes()} onToggleHabit={handleToggleHabit} />
            </Show>
          </Show>
        </div>
      </main>

      <Show when={taskModal()}>
        <Modal
          title={taskModal()!.mode === "edit" ? "Редактировать задачу" : "Новая задача"}
          onClose={closeTaskModal}
        >
          <TaskForm
            mode={taskModal()!.mode}
            projects={projects()}
            defaultProjectId={taskModal()!.defaultProjectId || state().selectedProjectId}
            initial={modalTask() || undefined}
            onCancel={closeTaskModal}
            onSubmit={handleSubmitTaskModal}
          />
        </Modal>
      </Show>
    </div>
  );
}
