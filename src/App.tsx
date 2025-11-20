import { createSignal, Show } from "solid-js";
import Header from "./components/Header";
import Tabs from "./components/Tabs";
import Dashboard from "./components/Dashboard";
import ProjectsTab from "./components/ProjectsTab";
import Today from "./components/Today";
import Daily from "./components/Daily";
import { parseDailyFile, parseProjectFile } from "./lib/parsers";
import { slugify } from "./lib/slugify";
import { AppState, DailyNote, Project, ProjectFormValue, Task } from "./types";

const initialState: AppState = {
  activeTab: "dashboard",
  statusFilter: "all",
  priorityFilter: "all",
  areaFilter: "all",
  selectedProjectId: null,
  formMode: "idle",
};

export default function App() {
  const [projects, setProjects] = createSignal<Project[]>([]);
  const [tasks, setTasks] = createSignal<Task[]>([]);
  const [dailyNotes, setDailyNotes] = createSignal<DailyNote[]>([]);
  const [state, setState] = createSignal<AppState>(initialState);

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

  const handleToggleTask = (id: string) => {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  };

  const handleToggleHabit = (id: string) => {
    setDailyNotes((current) =>
      current.map((note) => ({
        ...note,
        habits: note.habits.map((habit) => (habit.id === id ? { ...habit, done: !habit.done } : habit)),
      }))
    );
  };

  const handleFilterChange = (type: "status" | "priority" | "area", value: string) => {
    updateState({ [`${type}Filter`]: value } as Partial<AppState>);
  };

  const handleSelectProject = (id: string) => {
    updateState({ selectedProjectId: id, formMode: "idle" });
  };

  const handleStartCreate = () => updateState({ formMode: "create" });
  const handleStartEdit = (id: string) => updateState({ formMode: "edit", selectedProjectId: id });
  const handleCancelForm = () => updateState({ formMode: "idle" });

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

  const noData = !projects().length && !dailyNotes().length;

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
        <div style={{ marginTop: "12px" }}>
          <Show when={!noData} fallback={
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
                onStartCreate={handleStartCreate}
                onStartEdit={handleStartEdit}
                onCancelForm={handleCancelForm}
                onSubmitForm={handleSubmitForm}
              />
            </Show>

            <Show when={state().activeTab === "today"}>
              <Today projects={projects()} tasks={tasks()} onToggleTask={handleToggleTask} />
            </Show>

            <Show when={state().activeTab === "daily"}>
              <Daily notes={dailyNotes()} onToggleHabit={handleToggleHabit} />
            </Show>
          </Show>
        </div>
      </main>
    </div>
  );
}
