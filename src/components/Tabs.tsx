import type { AppState } from "../types";

type TabKey = AppState["activeTab"];

interface TabsProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

const tabs: { key: TabKey; label: string }[] = [
  { key: "dashboard", label: "Дашборд" },
  { key: "projects", label: "Проекты" },
  { key: "processing", label: "Processing" },
  { key: "today", label: "Сегодня" },
  { key: "daily", label: "Ежедневник" },
];

export default function Tabs(props: TabsProps) {
  return (
    <nav>
      {tabs.map((tab) => (
        <button
          class={`tab-btn ${tab.key === props.active ? "active" : ""}`}
          data-tab={tab.key}
          type="button"
          onClick={() => props.onChange(tab.key)}
        >
          <span class="dot" />
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
