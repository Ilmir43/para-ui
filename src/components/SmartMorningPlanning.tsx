import { createMemo, createSignal, For, Show } from "solid-js";
import { Task } from "../types";

interface SmartMorningPlanningProps {
  tasks: Task[];
  onApply: (dailyPriorityId: string | null, supportIds: string[]) => void;
  onClose: () => void;
}

export default function SmartMorningPlanning(props: SmartMorningPlanningProps) {
  const nextTasks = createMemo(() => props.tasks.filter((task) => task.status === "next"));
  const [dailyPriorityId, setDailyPriorityId] = createSignal<string | null>(null);
  const [supportIds, setSupportIds] = createSignal<string[]>([]);

  const totalMinutes = createMemo(() => {
    const selectedIds = new Set([dailyPriorityId(), ...supportIds()].filter(Boolean) as string[]);
    return nextTasks()
      .filter((task) => selectedIds.has(task.id))
      .reduce((sum, task) => sum + (task.estimatedMinutes || 0), 0);
  });

  const handleToggleSupport = (id: string) => {
    setSupportIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const handleApply = () => {
    props.onApply(dailyPriorityId(), supportIds());
    props.onClose();
  };

  return (
    <div class="card" style={{ padding: "16px", "margin-bottom": "16px" }}>
      <div class="section-title-row">
        <div>
          <div class="section-title">Smart Morning Planning</div>
          <div class="card-subtitle">
            Выбери приоритет и 2–5 поддерживающих задач, чтобы не перегрузить день.
          </div>
        </div>
        <button class="btn-outline" type="button" onClick={props.onClose}>
          Закрыть
        </button>
      </div>

      <Show
        when={nextTasks().length}
        fallback={<div class="empty-state">Нет Next Actions — сначала разберись с inbox.</div>}
      >
        <div class="planner-grid">
          <div>
            <div class="small-label">Daily Priority</div>
            <div class="muted-label" style={{ "margin-bottom": "8px" }}>
              Выбери одну задачу, которую точно продвинешь сегодня.
            </div>
            <ul class="tasks-list">
              <For each={nextTasks()}>
                {(task) => (
                  <li class={`task-item ${dailyPriorityId() === task.id ? "selected" : ""}`}>
                    <label class="planner-task">
                      <input
                        type="radio"
                        name="daily-priority"
                        checked={dailyPriorityId() === task.id}
                        onInput={() => setDailyPriorityId(task.id)}
                      />
                      <div>
                        <div class="task-title">{task.title}</div>
                        <div class="task-meta">{task.area} · {task.context}</div>
                        <div class="task-flags">
                          <span class={`pill-soft pill-${task.timeBucket}`}>{formatBucket(task.timeBucket)}</span>
                          {task.flags.frog && <span class="pill-soft">Frog</span>}
                          {task.flags.quick && <span class="pill-soft">Quick</span>}
                        </div>
                      </div>
                    </label>
                  </li>
                )}
              </For>
            </ul>
          </div>

          <div>
            <div class="small-label">Поддерживающие задачи</div>
            <div class="muted-label" style={{ "margin-bottom": "8px" }}>
              2–5 шагов, которые помогут сдвинуть проекты. Группируй по контексту/энергии.
            </div>
            <ul class="tasks-list">
              <For each={nextTasks()}>
                {(task) => (
                  <li class={`task-item ${supportIds().includes(task.id) ? "selected" : ""}`}>
                    <label class="planner-task">
                      <input
                        type="checkbox"
                        checked={supportIds().includes(task.id)}
                        onInput={() => handleToggleSupport(task.id)}
                      />
                      <div>
                        <div class="task-title">{task.title}</div>
                        <div class="task-meta">{task.area} · {task.context}</div>
                        <div class="task-flags">
                          <span class={`pill-soft pill-${task.timeBucket}`}>{formatBucket(task.timeBucket)}</span>
                          {task.flags.batchable && <span class="pill-soft">Batch</span>}
                          {task.flags.quick && <span class="pill-soft">Quick</span>}
                        </div>
                      </div>
                    </label>
                  </li>
                )}
              </For>
            </ul>
          </div>
        </div>

        <div class="planner-summary">
          <div>
            <div class="small-label">Временной бюджет</div>
            <div class={totalMinutes() > 240 ? "danger-label" : "muted-label"}>
              {totalMinutes()} мин из рекомендованных 180–240 минут.
            </div>
          </div>
          {totalMinutes() > 240 && (
            <div class="danger-label">
              Перегруз. Сними часть задач обратно в Next Actions.
            </div>
          )}
          <button class="btn-solid" type="button" onClick={handleApply} disabled={!dailyPriorityId()}>
            Запланировать день
          </button>
        </div>
      </Show>
    </div>
  );
}

function formatBucket(bucket: Task["timeBucket"]) {
  switch (bucket) {
    case "micro":
      return "до 10 мин";
    case "short":
      return "11–30 мин";
    case "medium":
      return "31–60 мин";
    case "long":
      return "60+ мин";
    default:
      return bucket;
  }
}
