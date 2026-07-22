import { useState, useEffect } from 'react';
import { Users, Euro, CalendarClock, Scissors } from 'lucide-react';
import { Cliente, Cita, Traje } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface DashboardViewProps {
  refreshTrigger: number;
}

export function DashboardView({ refreshTrigger }: DashboardViewProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [trajes, setTrajes] = useState<Traje[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resClientes, resCitas, resTrajes] = await Promise.all([
          fetch(`${API_URL}/api/clientes`),
          fetch(`${API_URL}/api/citas`),
          fetch(`${API_URL}/api/trajes`),
        ]);
        if (resClientes.ok) setClientes(await resClientes.json());
        if (resCitas.ok) setCitas(await resCitas.json());
        if (resTrajes.ok) setTrajes(await resTrajes.json());
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
      }
    };
    fetchData();
  }, [refreshTrigger]);

  // Cálculos de métricas
  const totalClientes = clientes.length;

  const totalEsperado = clientes.reduce((sum, c) => {
    const totalCliente = c.trajes.reduce((tSum, t) => tSum + parseFloat(t.precio as any), 0);
    return sum + totalCliente;
  }, 0);

  const totalRecaudado = clientes.reduce((sum, c) => sum + (parseFloat(c.pagado as any) || 0), 0);
  const totalPendiente = Math.max(0, totalEsperado - totalRecaudado);

  // Trajes más solicitados
  const trajeCounts: Record<string, { count: number; precio: number }> = {};
  trajes.forEach((t) => {
    trajeCounts[t.nombre] = { count: 0, precio: parseFloat(t.precio as any) };
  });

  clientes.forEach((c) => {
    c.trajes.forEach((t) => {
      if (trajeCounts[t.nombre]) {
        trajeCounts[t.nombre].count += 1;
      } else {
        trajeCounts[t.nombre] = { count: 1, precio: parseFloat(t.precio as any) };
      }
    });
  });

  const trajesPopulares = Object.entries(trajeCounts)
    .map(([nombre, { count, precio }]) => ({ nombre, count, precio }))
    .sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...trajesPopulares.map((t) => t.count), 1);

  // Top deudores
  const deudores = clientes
    .map((c) => {
      const total = c.trajes.reduce((sum, t) => sum + parseFloat(t.precio as any), 0);
      const pagado = parseFloat(c.pagado as any) || 0;
      const pendiente = total - pagado;
      return { ...c, pendiente };
    })
    .filter((c) => c.pendiente > 0)
    .sort((a, b) => b.pendiente - a.pendiente)
    .slice(0, 5);

  // Próximas citas ordenadas
  const proximasCitas = [...citas]
    .sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime())
    .slice(0, 5);

  const stats = [
    { label: "Clientas activas", value: totalClientes.toString(), Icon: Users },
    { label: "Ingresos totales", value: `${totalEsperado} €`, Icon: Euro },
    { label: "Pagos pendientes", value: `${totalPendiente} €`, Icon: Scissors },
    { label: "Próximas citas", value: citas.length.toString(), Icon: CalendarClock },
  ];

  return (
    <div className="relative w-full">
      <div className="relative mx-auto max-w-7xl px-8 py-6">
        {/* Header */}
        <header className="inline-flex max-w-2xl flex-col rounded-xl border border-[color:var(--color-border)] border-l-4 border-l-[color:var(--color-primary)] bg-[color:var(--color-surface-elevated)]/95 px-6 py-4 shadow-md backdrop-blur-md">
          <div className="eyebrow font-semibold text-[color:var(--color-primary)] opacity-90">Atelier · Resumen</div>
          <div className="flex items-center gap-3.5 mt-1">
            <div className="relative h-11 w-10 shrink-0 overflow-hidden rounded-xl border border-[color:var(--color-gold)] bg-[color-mix(in_oklab,var(--color-gold)_20%,transparent)] p-0.5 shadow-sm">
              <img src="/design/jewel-crown-logo.jpg" alt="Corona Crest" className="h-full w-full object-cover rounded-lg" />
            </div>
            <h1 className="font-display text-4xl text-[color:var(--color-primary)] font-bold tracking-tight">
              Dashboard
            </h1>
          </div>
          <p className="mt-1.5 text-sm text-[color:var(--color-foreground)] font-medium leading-relaxed">
            Un vistazo al estado del taller: encargos, pagos y próximas pruebas.
          </p>
        </header>

        {/* Tarjetas de Métricas */}
        <section className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="relative overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] p-6 shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="eyebrow">{s.label}</div>
                  <div className="mt-3 font-display text-4xl text-[color:var(--color-primary)] tabular font-bold">
                    {s.value}
                  </div>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--color-gold)_18%,transparent)] text-[color:var(--color-primary-deep)] shadow-xs">
                  <s.Icon className="h-5 w-5" strokeWidth={1.6} />
                </span>
              </div>
              <div className="gold-rule mt-4" />
            </div>
          ))}
        </section>

        {/* Secciones Dashboard */}
        <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Próximas Citas */}
          <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] lg:col-span-2 shadow-md">
            <div className="border-b border-[color:var(--color-border)] px-6 py-4">
              <h2 className="font-display text-2xl text-foreground font-semibold">Próximas citas</h2>
            </div>
            <ul className="divide-y divide-[color:var(--color-border)]">
              {proximasCitas.length === 0 ? (
                <li className="px-6 py-8 text-center text-sm text-muted-foreground">
                  No hay citas programadas actualmente.
                </li>
              ) : (
                proximasCitas.map((cita) => {
                  const dateObj = new Date(cita.fecha_hora);
                  return (
                    <li key={cita.id} className="flex items-center gap-4 px-6 py-4">
                      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-md bg-[color-mix(in_oklab,var(--color-primary)_10%,transparent)] text-[color:var(--color-primary)] border border-[color-mix(in_oklab,var(--color-primary)_20%,transparent)]">
                        <span className="tabular text-xs font-bold uppercase">
                          {dateObj.toLocaleDateString("es-ES", { month: "short" })}
                        </span>
                        <span className="font-display text-lg leading-none font-bold">
                          {dateObj.getDate()}
                        </span>
                      </div>

                      <div className="flex-1">
                        <div className="font-medium text-foreground text-sm font-semibold">
                          {cita.cliente_nombre || 'Clienta'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {cita.titulo}
                        </div>
                      </div>

                      <div className="tabular text-xs font-medium text-muted-foreground border border-[color:var(--color-border)] rounded-md px-2.5 py-1 bg-surface">
                        {dateObj.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} h
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </div>

          {/* Top Deudores */}
          <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] shadow-md">
            <div className="border-b border-[color:var(--color-border)] px-6 py-4">
              <h2 className="font-display text-2xl text-foreground font-semibold">Saldos pendientes</h2>
            </div>
            <ul className="divide-y divide-[color:var(--color-border)]">
              {deudores.length === 0 ? (
                <li className="px-6 py-8 text-center text-sm text-muted-foreground">
                  ¡Genial! No hay saldos impagados.
                </li>
              ) : (
                deudores.map((c) => (
                  <li key={c.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <div className="font-medium text-foreground text-sm font-semibold">{c.nombre_apellido}</div>
                      <div className="text-xs text-muted-foreground">{c.telefono || 'Sin tel.'}</div>
                    </div>
                    <div className="tabular font-display text-lg font-bold text-[color:var(--color-primary)]">
                      {c.pendiente} €
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>

        {/* Gráfico Trajes Más Solicitados */}
        <section className="mt-10 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] p-8 shadow-md">
          <h2 className="font-display text-2xl text-foreground font-semibold mb-6">
            Trajes y Corpiños Más Solicitados
          </h2>
          <div className="flex flex-col gap-5">
            {trajesPopulares.map((item) => {
              const pct = Math.round((item.count / maxCount) * 100);
              return (
                <div key={item.nombre} className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-foreground">{item.nombre}</span>
                    <span className="tabular text-muted-foreground">
                      {item.count} encargos ({item.precio} €)
                    </span>
                  </div>
                  <div className="h-3.5 w-full overflow-hidden rounded-full bg-surface border border-[color:var(--color-border)]">
                    <div
                      className="h-full bg-gradient-to-r from-[color:var(--color-primary)] to-[color:var(--color-gold)] transition-all duration-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
