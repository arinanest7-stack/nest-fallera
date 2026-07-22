import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { Cita, Cliente } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

interface CalendarViewProps {
  refreshTrigger: number;
}

export function CalendarView({ refreshTrigger }: CalendarViewProps) {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDayForCita, setSelectedDayForCita] = useState<number | null>(null);

  // Formulario de Cita Rápida
  const [quickCitaTitulo, setQuickCitaTitulo] = useState('1ª prueba');
  const [quickCitaClienteId, setQuickCitaClienteId] = useState<number | ''>('');
  const [quickCitaHora, setQuickCitaHora] = useState('10:00');

  const fetchCitas = async () => {
    try {
      const res = await fetch(`${API_URL}/api/citas`);
      if (res.ok) {
        const data = await res.json();
        setCitas(data);
      }
    } catch (e) {
      console.error('Error cargando citas:', e);
    }
  };

  const fetchClientes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/clientes`);
      if (res.ok) {
        const data = await res.json();
        setClientes(data);
      }
    } catch (e) {
      console.error('Error cargando clientes:', e);
    }
  };

  useEffect(() => {
    fetchCitas();
    fetchClientes();
  }, [refreshTrigger]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleCreateQuickCita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDayForCita || !quickCitaClienteId) return;

    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(selectedDayForCita).padStart(2, '0');
    const fechaHoraStr = `${year}-${formattedMonth}-${formattedDay}T${quickCitaHora}:00`;

    try {
      const res = await fetch(`${API_URL}/api/citas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: Number(quickCitaClienteId),
          titulo: quickCitaTitulo,
          fecha_hora: fechaHoraStr,
        }),
      });

      if (res.ok) {
        setSelectedDayForCita(null);
        setQuickCitaClienteId('');
        fetchCitas();
      }
    } catch (error) {
      console.error('Error creando cita:', error);
    }
  };

  const handleDeleteCita = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Eliminar esta cita?')) return;
    try {
      const res = await fetch(`${API_URL}/api/citas/${id}`, { method: 'DELETE' });
      if (res.ok) fetchCitas();
    } catch (error) {
      console.error('Error eliminando cita:', error);
    }
  };

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  return (
    <div className="relative w-full">
      <div className="relative mx-auto max-w-7xl px-8 py-6">
        <header className="rounded-2xl border border-[color:var(--color-border)] border-l-4 border-l-[color:var(--color-primary)] bg-[color:var(--color-surface-elevated)]/95 p-6 shadow-md backdrop-blur-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="eyebrow font-semibold text-[color:var(--color-primary)] opacity-90">Atelier · Agenda</div>
            <div className="flex items-center gap-4 mt-1">
              <img src="/design/crowns.png" alt="Corona Emblem" className="h-12 w-auto object-contain drop-shadow-md" />
              <h1 className="font-display text-5xl text-[color:var(--color-primary)] font-bold tracking-tight">
                Calendario de Citas
              </h1>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-[color:var(--color-foreground)] font-medium">
              Visualiza y organiza las citas de pruebas de trajes de las clientas.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-[color-mix(in_oklab,var(--color-surface)_90%,transparent)] p-3 rounded-xl border border-[color:var(--color-border)] shadow-xs">
            <img src="/design/green-element.png" alt="Detalle" className="h-10 w-10 rounded-md object-cover shadow-inner" />
            <div className="text-xs">
              <span className="font-semibold block text-[color:var(--color-primary)]">Gestión de Citas</span>
              <span className="text-muted-foreground font-medium">Agenda de Pruebas</span>
            </div>
          </div>
        </header>
        <div className="gold-rule mt-6 max-w-md" />

        <section className="mt-10 overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] shadow-md">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] px-8 py-5">
            <div className="flex items-baseline gap-3">
              <h2 className="font-display text-3xl text-foreground font-semibold">{MONTHS[month]}</h2>
              <span className="eyebrow tabular">{year}</span>
            </div>

            <div className="inline-flex items-center rounded-md border border-[color:var(--color-border)] bg-background p-1">
              <button
                onClick={prevMonth}
                className="inline-flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-[color-mix(in_oklab,var(--color-gold)_15%,transparent)] hover:text-foreground cursor-pointer"
                aria-label="Mes Anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1 text-xs font-semibold tracking-wide uppercase text-foreground hover:text-[color:var(--color-primary)] cursor-pointer"
              >
                Hoy
              </button>
              <button
                onClick={nextMonth}
                className="inline-flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-[color-mix(in_oklab,var(--color-gold)_15%,transparent)] hover:text-foreground cursor-pointer"
                aria-label="Siguiente Mes"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekday Header */}
          <div className="grid grid-cols-7 border-b border-[color:var(--color-border)] bg-[color-mix(in_oklab,var(--color-surface)_70%,var(--color-background))]">
            {WEEKDAYS.map((d) => (
              <div key={d} className="eyebrow px-3 py-3 text-center font-bold">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 bg-[color:var(--color-surface-elevated)]">
            {cells.map((day, idx) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[120px] border-b border-r border-[color:var(--color-border)] bg-[color-mix(in_oklab,var(--color-surface)_50%,var(--color-background))]"
                  />
                );
              }

              const isToday = isCurrentMonth && today.getDate() === day;
              const dayAppointments = citas.filter((cita) => {
                const citaDate = new Date(cita.fecha_hora);
                return (
                  citaDate.getDate() === day &&
                  citaDate.getMonth() === month &&
                  citaDate.getFullYear() === year
                );
              });

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => setSelectedDayForCita(day)}
                  className={[
                    "group relative min-h-[120px] border-b border-r border-[color:var(--color-border)] p-2.5 transition-all cursor-pointer hover:bg-[color-mix(in_oklab,var(--color-gold)_8%,transparent)]",
                    (idx + 1) % 7 === 0 && "border-r-0",
                  ].join(" ")}
                >
                  <div className="mb-2 flex items-center justify-between">
                    {isToday ? (
                      <span className="tabular inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--color-gold)] text-xs font-bold text-[color:var(--color-primary-deep)] shadow-sm">
                        {day}
                      </span>
                    ) : (
                      <span className="tabular text-sm font-semibold text-muted-foreground group-hover:text-foreground">
                        {day}
                      </span>
                    )}
                    <span className="opacity-0 group-hover:opacity-100 text-xs text-[color:var(--color-primary)] font-medium">
                      + Cita
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[85px]">
                    {dayAppointments.map((cita) => (
                      <div
                        key={cita.id}
                        className="group/item flex items-center justify-between rounded-md border border-[color-mix(in_oklab,var(--color-primary)_20%,transparent)] bg-[color-mix(in_oklab,var(--color-primary)_8%,transparent)] px-2 py-1 text-xs text-[color:var(--color-primary)] font-medium shadow-2xs"
                      >
                        <div className="truncate">
                          <span className="font-semibold">{cita.cliente_nombre || 'Clienta'}: </span>
                          <span>{cita.titulo}</span>
                        </div>
                        <button
                          onClick={(e) => handleDeleteCita(cita.id, e)}
                          className="opacity-0 group-hover/item:opacity-100 text-[color:var(--color-primary)] hover:text-red-700 cursor-pointer ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Modal Nueva Cita Rápida */}
        {selectedDayForCita !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <form onSubmit={handleCreateQuickCita} className="w-full max-w-md rounded-xl border border-[color:var(--color-border)] border-t-4 border-t-[color:var(--color-primary)] bg-surface-elevated p-8 shadow-2xl">
              <h3 className="font-display text-2xl text-foreground font-semibold mb-1">
                Agendar Cita Rápida
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Fecha: <strong className="text-foreground">{selectedDayForCita} de {MONTHS[month]} {year}</strong>
              </p>

              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-2">
                  <span className="eyebrow">Seleccionar Clienta</span>
                  <select
                    value={quickCitaClienteId}
                    onChange={(e) => setQuickCitaClienteId(Number(e.target.value))}
                    className="rounded-md border border-[color:var(--color-input)] bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[color:var(--color-gold)]"
                    required
                  >
                    <option value="">-- Elige una clienta --</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre_apellido}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="eyebrow">Tipo / Título de Cita</span>
                  <select
                    value={quickCitaTitulo}
                    onChange={(e) => setQuickCitaTitulo(e.target.value)}
                    className="rounded-md border border-[color:var(--color-input)] bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[color:var(--color-gold)]"
                  >
                    <option value="1ª prueba">1ª prueba</option>
                    <option value="2ª prueba">2ª prueba</option>
                    <option value="Prueba final">Prueba final</option>
                    <option value="Entrega de traje">Entrega de traje</option>
                    <option value="Cita general">Cita general</option>
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="eyebrow">Hora de la Cita</span>
                  <input
                    type="time"
                    value={quickCitaHora}
                    onChange={(e) => setQuickCitaHora(e.target.value)}
                    className="rounded-md border border-[color:var(--color-input)] bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[color:var(--color-gold)]"
                    required
                  />
                </label>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedDayForCita(null)}
                  className="rounded-md border border-[color:var(--color-border)] px-4 py-2 text-sm text-foreground hover:bg-surface cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-md bg-[color:var(--color-primary)] px-5 py-2 text-sm font-semibold text-[color:var(--color-primary-foreground)] hover:bg-[color:var(--color-primary-deep)] cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Agendar Cita
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
