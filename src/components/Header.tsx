import { JSX } from "solid-js";

interface HeaderProps {
  subtitle: string;
  children?: JSX.Element;
}

export default function Header(props: HeaderProps) {
  return (
    <header>
      <div class="brand">
        <div class="brand-logo">OP</div>
        <div>
          <div class="brand-text-title">Obsidian Dashboard</div>
          <div class="brand-text-sub">{props.subtitle}</div>
        </div>
      </div>
      {props.children}
    </header>
  );
}
