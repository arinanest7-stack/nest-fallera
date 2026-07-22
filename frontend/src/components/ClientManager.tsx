import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, CalendarPlus, Scissors, X } from 'lucide-react';
import { Cliente, Traje } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ClientManagerProps {
  onRefreshCitas: () => void;
}

export function ClientManager({ onRefreshCitas }: ClientManagerProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [trajes, setTrajes] = useState<Traje[]>([]);

  // Formulario nuevo cliente
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [pagado, setPagado] = useState<number | ''>('');
  const [selectedTrajes, setSelectedTrajes] = useState<number[]>([]);
  const [programarCitaInicial, setProgramarCitaInicial] = useState(false);

  // Modal Edición
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  // Modal Cita
  const [citaModalCliente, setCitaModalCliente] = useState<Cliente | null>(null);
  const [citaTitulo, setCitaTitulo] = useState('Prueba');
  const [citaFechaHora, setCitaFechaHora] = useState('');

  const fetchData = async () => {
    try {
      const [resClientes, resTrajes] = await Promise.all([
        fetch(`${API_URL}/api/clientes`),
        fetch(`${API_URL}/api/trajes`),
      ]);
      if (resClientes.ok) {
        const dataClientes = await resClientes.json();
        setClientes(dataClientes);
      }
      if (resTrajes.ok) {
        const dataTrajes = await resTrajes.json();
        setTrajes(dataTrajes);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleTraje = (id: number) => {
    if (selectedTrajes.includes(id)) {
      setSelectedTrajes(selectedTrajes.filter((tId) => tId !== id));
    } else {
      setSelectedTrajes([...selectedTrajes, id]);
    }
  };

  const handleCreateCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_apellido: nombre,
          telefono,
          pagado: Number(pagado) || 0,
          traje_ids: selectedTrajes,
        }),
      });

      if (res.ok) {
        const newCliente = await res.json();

        if (programarCitaInicial && newCliente.id) {
          const defaultDate = new Date();
          defaultDate.setDate(defaultDate.getDate() + 7);
          const fechaStr = defaultDate.toISOString().slice(0, 16);

          await fetch(`${API_URL}/api/citas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cliente_id: newCliente.id,
              titulo: '1ª prueba',
              fecha_hora: fechaStr,
            }),
          });
        }

        setNombre('');
        setTelefono('');
        setPagado('');
        setSelectedTrajes([]);
        setProgramarCitaInicial(false);
        fetchData();
        onRefreshCitas();
      }
    } catch (error) {
      console.error('Error creando cliente:', error);
    }
  };

  const handleDeleteCliente = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;
    try {
      const res = await fetch(`${API_URL}/api/clientes/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchData();
        onRefreshCitas();
      }
    } catch (error) {
      console.error('Error eliminando cliente:', error);
    }
  };

  const handleToggleEditTraje = (id: number) => {
    if (!editingCliente) return;
    const isSelected = editingCliente.trajes.some((t) => t.id === id);
    let updatedTrajes: Traje[];
    if (isSelected) {
      updatedTrajes = editingCliente.trajes.filter((t) => t.id !== id);
    } else {
      const trajeObj = trajes.find((t) => t.id === id);
      updatedTrajes = trajeObj ? [...editingCliente.trajes, trajeObj] : editingCliente.trajes;
    }
    setEditingCliente({
      ...editingCliente,
      trajes: updatedTrajes,
    });
  };

  const handleSaveEditCliente = async () => {
    if (!editingCliente) return;
    try {
      const res = await fetch(`${API_URL}/api/clientes/${editingCliente.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_apellido: editingCliente.nombre_apellido,
          telefono: editingCliente.telefono,
          pagado: editingCliente.pagado,
          traje_ids: editingCliente.trajes.map((t) => t.id),
        }),
      });

      if (res.ok) {
        setEditingCliente(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error editando cliente:', error);
    }
  };

  const handleCreateCita = async () => {
    if (!citaModalCliente || !citaFechaHora) return;
    try {
      const res = await fetch(`${API_URL}/api/citas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: citaModalCliente.id,
          titulo: citaTitulo,
          fecha_hora: citaFechaHora,
        }),
      });
      if (res.ok) {
        setCitaModalCliente(null);
        setCitaFechaHora('');
        fetchData();
        onRefreshCitas();
      }
    } catch (error) {
      console.error('Error agregando cita:', error);
    }
  };

  const handleDeleteCita = async (citaId: number) => {
    if (!confirm('¿Eliminar esta cita?')) return;
    try {
      const res = await fetch(`${API_URL}/api/citas/${citaId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchData();
        onRefreshCitas();
      }
    } catch (error) {
      console.error('Error eliminando cita:', error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateString;
    }
  };

  const getToneClass = (index: number) => {
    const tones = [
      'bg-[color-mix(in_oklab,var(--color-gold)_14%,transparent)] text-[color:var(--color-foreground)] border border-[color:var(--color-border)]',
      'bg-[color-mix(in_oklab,var(--color-merlot)_12%,transparent)] text-[color:var(--color-merlot)] border border-[color-mix(in_oklab,var(--color-merlot)_25%,transparent)]',
      'bg-[color-mix(in_oklab,var(--color-teal)_12%,transparent)] text-[color:var(--color-teal)] border border-[color-mix(in_oklab,var(--color-teal)_25%,transparent)]',
      'bg-[color-mix(in_oklab,var(--color-navy)_12%,transparent)] text-[color:var(--color-navy)] border border-[color-mix(in_oklab,var(--color-navy)_25%,transparent)]',
      'bg-[color-mix(in_oklab,var(--color-plum)_12%,transparent)] text-[color:var(--color-plum)] border border-[color-mix(in_oklab,var(--color-plum)_25%,transparent)]',
    ];
    return tones[index % tones.length];
  };

  return (
    <div className="relative w-full">
      <div className="relative mx-auto max-w-7xl px-8 py-6">
        {/* Header */}
        <header className="rounded-2xl border border-[color:var(--color-border)] border-l-4 border-l-[color:var(--color-primary)] bg-[color:var(--color-surface-elevated)]/95 p-6 shadow-md backdrop-blur-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="eyebrow font-semibold text-[color:var(--color-primary)] opacity-90">Atelier · Gestión</div>
            <div className="flex items-center gap-4 mt-1">
              <img src="/design/crowns.png" alt="Corona Crest" className="h-12 w-auto object-contain drop-shadow-md" />
              <h1 className="font-display text-5xl text-[color:var(--color-primary)] font-bold tracking-tight">
                Gestión de Clientas
              </h1>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-[color:var(--color-foreground)] font-medium">
              Registra clientas, selecciona sus trajes y agenda sus citas de prueba en tu taller.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-[color-mix(in_oklab,var(--color-surface)_90%,transparent)] p-3 rounded-xl border border-[color:var(--color-border)] shadow-xs">
            <img src="/design/green-element.png" alt="Detalle Verde" className="h-10 w-10 rounded-md object-cover shadow-inner" />
            <div className="text-xs">
              <span className="font-semibold block text-[color:var(--color-primary)]">Taller Tradicional</span>
              <span className="text-muted-foreground font-medium">Confección & Pruebas</span>
            </div>
          </div>
        </header>
        <div className="gold-rule mt-6 max-w-md" />

        {/* Card Nuevo Encargo */}
        <form onSubmit={handleCreateCliente} className="mt-10 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] shadow-md">
          <div className="flex items-center gap-3 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] px-8 py-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--color-primary)_10%,transparent)] text-[color:var(--color-primary)]">
              <Scissors className="h-4 w-4" strokeWidth={1.6} />
            </span>
            <h2 className="font-display text-2xl text-foreground font-semibold">
              Nuevo Encargo / Clienta
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 px-8 py-6 md:grid-cols-3">
            <label className="flex flex-col gap-2">
              <span className="eyebrow">Nombre y Apellido</span>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. María Clara"
                className="rounded-md border border-[color:var(--color-input)] bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-gold)] focus:border-transparent transition-all"
                required
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="eyebrow">Teléfono</span>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej. +34 600 333 444"
                className="rounded-md border border-[color:var(--color-input)] bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-gold)] focus:border-transparent transition-all"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="eyebrow">Importe Pagado Inicial (€)</span>
              <input
                type="number"
                value={pagado}
                onChange={(e) => setPagado(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="0"
                min="0"
                className="rounded-md border border-[color:var(--color-input)] bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-gold)] focus:border-transparent transition-all"
              />
            </label>
          </div>

          <div className="px-8 pb-6">
            <div className="eyebrow mb-3">Tipos de Fallera · Selección múltiple</div>
            <div className="flex flex-wrap gap-2">
              {trajes.map((traje, idx) => {
                const on = selectedTrajes.includes(traje.id);
                const toneClass = getToneClass(idx);
                return (
                  <button
                    type="button"
                    key={traje.id}
                    onClick={() => handleToggleTraje(traje.id)}
                    className={[
                      "group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all cursor-pointer",
                      on
                        ? "bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] border-transparent shadow-sm"
                        : `${toneClass} hover:border-[color:var(--color-border-strong)]`,
                    ].join(" ")}
                  >
                    <span>{traje.nombre}</span>
                    <span className="tabular text-xs opacity-80">
                      ({Number(traje.precio).toFixed(2)}€)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[color:var(--color-border)] px-8 py-5">
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={programarCitaInicial}
                onChange={(e) => setProgramarCitaInicial(e.target.checked)}
                className="h-4 w-4 rounded border-[color:var(--color-border-strong)] accent-[color:var(--color-primary)] cursor-pointer"
              />
              Programar cita de prueba inicial inmediatamente
            </label>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md bg-[color:var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-[color:var(--color-primary-foreground)] transition-all hover:bg-[color:var(--color-primary-deep)] shadow-md cursor-pointer"
            >
              <Plus className="h-4 w-4" strokeWidth={2.2} />
              Crear Clienta y Encargo
            </button>
          </div>
        </form>

        {/* Tabla Clientas */}
        <section className="mt-10 overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] shadow-md">
          <div className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] px-8 py-5">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-2xl text-foreground font-semibold">Clientas activas</h2>
              <span className="eyebrow">{clientes.length} registros</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[color:var(--color-border)] text-left bg-surface">
                  {["Nombre", "Trajes", "Precio total", "Citas", "Teléfono", "Pagos", "Acciones"].map((h) => (
                    <th key={h} className="eyebrow px-6 py-4 text-left font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      No hay clientes registrados. ¡Agrega el primero arriba!
                    </td>
                  </tr>
                ) : (
                  clientes.map((c) => {
                    const totalPrecio = c.trajes.reduce((acc, t) => acc + parseFloat(t.precio as any), 0);
                    const pagadoM = parseFloat(c.pagado as any) || 0;
                    const faltaPagar = Math.max(0, totalPrecio - pagadoM);
                    const pct = totalPrecio > 0 ? Math.min(100, (pagadoM / totalPrecio) * 100) : 0;

                    return (
                      <tr
                        key={c.id}
                        className="group border-b border-[color:var(--color-border)] last:border-0 transition-colors hover:bg-[color-mix(in_oklab,var(--color-gold)_8%,transparent)]"
                      >
                        <td className="px-6 py-5">
                          <div className="font-display text-lg text-foreground font-semibold">
                            {c.nombre_apellido}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-1.5">
                            {c.trajes.map((t, idx) => (
                              <span
                                key={t.id}
                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getToneClass(idx)}`}
                              >
                                {t.nombre}
                              </span>
                            ))}
                            {c.trajes.length === 0 && (
                              <span className="text-xs text-muted-foreground">Ninguno</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 tabular font-display text-lg text-foreground font-semibold">
                          {totalPrecio} €
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1.5">
                            {c.citas.map((cita) => (
                              <div
                                key={cita.id}
                                className="inline-flex items-center justify-between gap-2 rounded-md border border-[color:var(--color-border)] bg-surface px-2.5 py-1 text-xs text-muted-foreground"
                              >
                                <span className="inline-flex items-center gap-1.5">
                                  <CalendarPlus className="h-3.5 w-3.5 text-[color:var(--color-primary)]" strokeWidth={1.8} />
                                  <span className="tabular font-medium text-foreground">
                                    {cita.titulo} ({formatDate(cita.fecha_hora)})
                                  </span>
                                </span>
                                <button
                                  onClick={() => handleDeleteCita(cita.id)}
                                  className="text-muted-foreground hover:text-[color:var(--color-primary)] cursor-pointer"
                                  title="Eliminar cita"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                            {c.citas.length === 0 && (
                              <span className="text-xs text-muted-foreground">Sin citas</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 tabular text-muted-foreground">
                          {c.telefono || '-'}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1.5 min-w-[130px]">
                            <div className="flex items-baseline justify-between gap-4 text-xs font-medium">
                              <span className="text-[color:var(--color-teal)] tabular font-semibold">
                                {pagadoM} € pagado
                              </span>
                              <span
                                className={
                                  faltaPagar > 0
                                    ? "text-[color:var(--color-primary)] tabular font-bold"
                                    : "text-muted-foreground tabular"
                                }
                              >
                                {faltaPagar} € falta
                              </span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--color-primary)_12%,transparent)]">
                              <div
                                className="h-full bg-[color:var(--color-gold)] transition-all duration-300"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setCitaModalCliente(c)}
                              title="Añadir cita"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[color:var(--color-border)] text-muted-foreground hover:bg-[color-mix(in_oklab,var(--color-gold)_15%,transparent)] hover:text-foreground transition-colors cursor-pointer"
                            >
                              <Plus className="h-4 w-4" strokeWidth={1.8} />
                            </button>
                            <button
                              onClick={() => setEditingCliente(c)}
                              title="Editar cliente"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[color:var(--color-border)] text-muted-foreground hover:bg-[color-mix(in_oklab,var(--color-gold)_15%,transparent)] hover:text-foreground transition-colors cursor-pointer"
                            >
                              <Pencil className="h-4 w-4" strokeWidth={1.8} />
                            </button>
                            <button
                              onClick={() => handleDeleteCliente(c.id)}
                              title="Eliminar cliente"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[color:var(--color-border)] text-[color:var(--color-primary)] hover:bg-[color-mix(in_oklab,var(--color-primary)_10%,transparent)] transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Modal Editar Cliente */}
        {editingCliente && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-xl border border-[color:var(--color-border)] border-t-4 border-t-[color:var(--color-primary)] bg-surface-elevated p-8 shadow-2xl">
              <h3 className="font-display text-2xl text-foreground font-semibold mb-4">Editar Clienta</h3>
              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-2">
                  <span className="eyebrow">Nombre y Apellido</span>
                  <input
                    type="text"
                    value={editingCliente.nombre_apellido}
                    onChange={(e) => setEditingCliente({ ...editingCliente, nombre_apellido: e.target.value })}
                    className="rounded-md border border-[color:var(--color-input)] bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[color:var(--color-gold)]"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="eyebrow">Teléfono</span>
                  <input
                    type="text"
                    value={editingCliente.telefono}
                    onChange={(e) => setEditingCliente({ ...editingCliente, telefono: e.target.value })}
                    className="rounded-md border border-[color:var(--color-input)] bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[color:var(--color-gold)]"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="eyebrow">Importe Pagado (€)</span>
                  <input
                    type="number"
                    value={editingCliente.pagado}
                    onChange={(e) => setEditingCliente({ ...editingCliente, pagado: parseFloat(e.target.value) || 0 })}
                    className="rounded-md border border-[color:var(--color-input)] bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[color:var(--color-gold)]"
                  />
                </label>
                <div className="flex flex-col gap-2">
                  <span className="eyebrow">Trajes Encargados</span>
                  <div className="flex flex-wrap gap-2">
                    {trajes.map((traje, idx) => {
                      const isSelected = editingCliente.trajes.some((t) => t.id === traje.id);
                      return (
                        <button
                          type="button"
                          key={traje.id}
                          onClick={() => handleToggleEditTraje(traje.id)}
                          className={[
                            "rounded-full border px-3 py-1.5 text-xs font-medium cursor-pointer transition-all",
                            isSelected
                              ? "bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] border-transparent"
                              : `${getToneClass(idx)}`,
                          ].join(" ")}
                        >
                          {traje.nombre}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => setEditingCliente(null)}
                  className="rounded-md border border-[color:var(--color-border)] px-4 py-2 text-sm text-foreground hover:bg-surface cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEditCliente}
                  className="rounded-md bg-[color:var(--color-primary)] px-5 py-2 text-sm font-semibold text-[color:var(--color-primary-foreground)] hover:bg-[color:var(--color-primary-deep)] cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Nueva Cita */}
        {citaModalCliente && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-xl border border-[color:var(--color-border)] border-t-4 border-t-[color:var(--color-gold)] bg-surface-elevated p-8 shadow-2xl">
              <h3 className="font-display text-2xl text-foreground font-semibold mb-2">Programar Cita</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Clienta: <strong className="text-foreground">{citaModalCliente.nombre_apellido}</strong>
              </p>
              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-2">
                  <span className="eyebrow">Título de Cita</span>
                  <select
                    value={citaTitulo}
                    onChange={(e) => setCitaTitulo(e.target.value)}
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
                  <span className="eyebrow">Fecha y Hora</span>
                  <input
                    type="datetime-local"
                    value={citaFechaHora}
                    onChange={(e) => setCitaFechaHora(e.target.value)}
                    className="rounded-md border border-[color:var(--color-input)] bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[color:var(--color-gold)]"
                  />
                </label>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => setCitaModalCliente(null)}
                  className="rounded-md border border-[color:var(--color-border)] px-4 py-2 text-sm text-foreground hover:bg-surface cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateCita}
                  className="rounded-md bg-[color:var(--color-primary)] px-5 py-2 text-sm font-semibold text-[color:var(--color-primary-foreground)] hover:bg-[color:var(--color-primary-deep)] cursor-pointer"
                >
                  Guardar Cita
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
