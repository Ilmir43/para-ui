interface TabsProps {
  active: string;
  onChange: (tab: "dashboard" | "projects" | "processing" | "today" | "daily") => void;
}

const tabs: { key: TabsProps["active"]; label: string }[] = [
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
