import { createMemo } from "solid-js";
import { DailyNote } from "../types";

interface DailyProps {
  notes: DailyNote[];
  onToggleHabit: (id: string) => void;
}

export default function Daily(props: DailyProps) {
  if (!props.notes.length) {
    return (
      <section class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Ежедневник</div>
            <div class="card-subtitle">Не загружена ни одна папка с ежедневниками.</div>
          </div>
        </div>
        <div class="empty-state">Выбери папку с ежедневниками (Daily / Journal).</div>
      </section>
    );
  }

  const latest = createMemo(() => props.notes[0]);
  const blocksMap = createMemo(() => {
    const map: Record<string, DailyNote["habits"]> = {};
    latest().habits.forEach((habit) => {
      if (!map[habit.block]) map[habit.block] = [];
      map[habit.block].push(habit);
    });
    return map;
  });

  return (
    <>
      <section class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Привычки за {latest().date}</div>
            <div class="card-subtitle">Блоки привычек по заголовкам в ежедневнике</div>
          </div>
        </div>
        {Object.keys(blocksMap()).map((blockName) => (
          <div class="habit-block">
            <div class="habit-block-title">{blockName}</div>
            <ul class="tasks-list">
              {blocksMap()[blockName].map((habit) => (
                <li
                  class={`task-item ${habit.done ? "done" : ""}`}
                  data-habit-id={habit.id}
                  onClick={() => props.onToggleHabit(habit.id)}
                >
                  <div class={`checkbox ${habit.done ? "checked" : ""}`}>{habit.done ? "✓" : ""}</div>
                  <div>
                    <div class="task-title">{habit.title}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section class="card" style={{ "margin-top": "12px" }}>
        <div class="card-header">
          <div>
            <div class="card-title">История ежедневников</div>
            <div class="card-subtitle">{props.notes.length} файлов</div>
          </div>
        </div>
        <div>
          {props.notes.slice(0, 10).map((note) => (
            <div class="daily-day">
              <div class="daily-day-header">
                <span>{note.date}</span>
                <span class="muted-label">{note.habits.length} привычек</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
