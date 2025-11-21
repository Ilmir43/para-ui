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

export default function Tabs({ active, onChange }: TabsProps) {
  return (
    <nav>
      {tabs.map((tab) => (
        <button
          class={`tab-btn ${tab.key === active ? "active" : ""}`}
          data-tab={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
        >
          <span class="dot" />
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
