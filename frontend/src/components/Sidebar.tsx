import React from 'react';
import { Users, CalendarDays, LayoutDashboard } from 'lucide-react';
import { BrocadePattern, BrocadeMark } from './ornaments/BrocadePattern';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const items = [
  { id: 'clients', title: 'Clientes y Trajes', icon: Users },
  { id: 'calendar', title: 'Calendario', icon: CalendarDays },
  { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  return (
    <aside className="relative flex w-64 shrink-0 flex-col border-r border-[color:var(--color-sidebar-border)] bg-sidebar text-sidebar-foreground">
      <BrocadePattern
        className="pointer-events-none absolute inset-0 h-full w-full text-[color:var(--color-primary)]"
        opacity={0.05}
      />

      <div className="relative px-6 pt-8 pb-6">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('clients')}>
          <BrocadeMark className="h-7 w-7 text-[color:var(--color-primary)]" />
          <div className="flex flex-col leading-none">
            <span className="font-display text-2xl text-[color:var(--color-primary)] font-bold">
              Fallera Nest
            </span>
            <span className="eyebrow mt-1">Atelier</span>
          </div>
        </div>
        <div className="gold-rule mt-6" />
      </div>

      <nav className="relative flex-1 px-3">
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const active = activeView === item.id;
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveView(item.id)}
                  className={[
                    "w-full group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all text-left",
                    active
                      ? "bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] font-medium shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent",
                  ].join(" ")}
                >
                  {active && (
                    <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-[color:var(--color-gold)] rounded-full" />
                  )}
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                  <span className="tracking-wide">{item.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="relative px-5 py-6 border-t border-[color:var(--color-sidebar-border)]">
        <div className="eyebrow">Taller</div>
        <div className="mt-1 font-display text-lg text-[color:var(--color-foreground)] font-medium">
          Julio · 2026
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Gestión de Indumentaria
        </div>
      </div>
    </aside>
  );
};
