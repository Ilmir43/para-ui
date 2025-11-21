import { createMemo, createSignal, Show } from "solid-js";
import { Project, Task, TaskStatus, TimeBucket } from "../types";

interface ProcessingProps {
  projects: Project[];
  tasks: Task[];
  onUpdateTask: (id: string, payload: Partial<Task>) => void;
}

export default function Processing(props: ProcessingProps) {
  const inboxTasks = createMemo(() => props.tasks.filter((t) => t.status === "inbox"));
  const [cursor, setCursor] = createSignal(0);
  const current = createMemo(() => inboxTasks()[cursor()] || null);

  const [draftArea, setDraftArea] = createSignal("health");
  const [draftContext, setDraftContext] = createSignal("desktop");
  const [draftBucket, setDraftBucket] = createSignal<TimeBucket>("short");

  const handleCommit = (status: TaskStatus) => {
    const task = current();
    if (!task) return;
    props.onUpdateTask(task.id, {
      status,
      area: draftArea(),
      context: draftContext(),
      timeBucket: draftBucket(),
      estimatedMinutes: bucketToMinutes(draftBucket()),
      plannedDate: status === "planned_today" ? new Date().toISOString().slice(0, 10) : task.plannedDate,
      flags: {
        ...task.flags,
        quick: draftBucket() === "micro" ? true : task.flags.quick,
      },
    });
    setCursor((value) => value + 1);
  };

  const handleSkip = () => setCursor((value) => value + 1);

  return (
    <section class="card">
      <div class="section-title-row">
        <div>
          <div class="section-title">Processing</div>
          <div class="card-subtitle">
            {inboxTasks().length ? `${inboxTasks().length} задач в inbox` : "Очередь пуста"}
          </div>
        </div>
        <div class="pill">GTD / Smart morning</div>
      </div>

      <Show
        when={current()}
        fallback={<div class="empty-state">Все новые задачи разобраны — можно переключиться на Next Actions.</div>}
      >
        {(task) => {
          const project = props.projects.find((p) => p.id === task().projectId);
          return (
            <div class="stack" style={{ gap: "12px" }}>
              <div class="card">{task().title}</div>
              <div class="muted-label">{task().description || "Нет заметок"}</div>
              <div class="grid-3">
                <label class="form-field">
                  <span class="small-label">Сфера</span>
                  <select value={draftArea()} onInput={(e) => setDraftArea(e.currentTarget.value)}>
                    <option value="health">Здоровье</option>
                    <option value="career">Карьера</option>
                    <option value="learning">Обучение</option>
                    <option value="personal">Личное</option>
                  </select>
                </label>
                <label class="form-field">
                  <span class="small-label">Контекст</span>
                  <select value={draftContext()} onInput={(e) => setDraftContext(e.currentTarget.value)}>
                    <option value="desktop">ПК</option>
                    <option value="phone">Телефон</option>
                    <option value="outdoor">На улице</option>
                  </select>
                </label>
                <label class="form-field">
                  <span class="small-label">Длительность</span>
                  <select
                    value={draftBucket()}
                    onInput={(e) => setDraftBucket(e.currentTarget.value as TimeBucket)}
                  >
                    <option value="micro">До 10 минут</option>
                    <option value="short">11–30 минут</option>
                    <option value="medium">31–60 минут</option>
                    <option value="long">60+ минут</option>
                  </select>
                </label>
              </div>

              <div class="muted-label">Проект: {project ? project.title : "Без проекта"}</div>
              <div class="processing-actions">
                <button class="btn-solid" type="button" onClick={() => handleCommit("clarified")}>Уточнить</button>
                <button class="btn-outline" type="button" onClick={() => handleCommit("next")}>
                  Next action
                </button>
                <button class="btn-outline" type="button" onClick={() => handleCommit("planned_today")}>
                  В план дня
                </button>
                <button class="btn-ghost" type="button" onClick={() => handleCommit("waiting")}>
                  Жду ответ
                </button>
                <button class="btn-ghost" type="button" onClick={() => handleCommit("someday")}>
                  Когда-нибудь
                </button>
                <button class="btn-ghost" type="button" onClick={() => handleCommit("cancelled")}>
                  Отменить
                </button>
                <button class="btn-text" type="button" onClick={handleSkip}>
                  Пропустить
                </button>
              </div>
            </div>
          );
        }}
      </Show>
    </section>
  );
}

function bucketToMinutes(bucket: TimeBucket) {
  switch (bucket) {
    case "micro":
      return 5;
    case "short":
      return 20;
    case "medium":
      return 45;
    case "long":
      return 90;
    default:
      return 25;
  }
}
