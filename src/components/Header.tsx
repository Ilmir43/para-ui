import { JSX } from "solid-js";

interface HeaderProps {
  subtitle: string;
  children?: JSX.Element;
}

export default function Header({ subtitle, children }: HeaderProps) {
  return (
    <header>
      <div class="brand">
        <div class="brand-logo">OP</div>
        <div>
          <div class="brand-text-title">Obsidian Dashboard</div>
          <div class="brand-text-sub">{subtitle}</div>
        </div>
      </div>
      {children}
    </header>
  );
}
