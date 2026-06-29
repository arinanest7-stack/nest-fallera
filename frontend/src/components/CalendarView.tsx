import React, { useState, useEffect } from 'react';
import { Cita, Cliente } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface CalendarViewProps {
  refreshTrigger: number;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ refreshTrigger }) => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 6, 29)); // Inicializar en Julio de 2026 como la captura
  const [selectedDayForCita, setSelectedDayForCita] = useState<number | null>(null);

  // Formulario de Cita Rápida
  const [quickCitaTitulo, setQuickCitaTitulo] = useState('Prueba');
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
      console.error('Error fetching appointments:', e);
    }
  };

  const fetchClientes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/clientes`);
      if (res.ok) {
        const data = await res.json();
        setClientes(data);
        if (data.length > 0) {
          setQuickCitaClienteId(data[0].id);
        }
      }
    } catch (e) {
      console.error('Error fetching clients:', e);
    }
  };

  useEffect(() => {
    fetchCitas();
    fetchClientes();
  }, [refreshTrigger]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Nombre del mes en español
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Obtener días del mes
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Día de la semana del primer día (0 = Domingo, 1 = Lunes, etc.)
  let startDayOfWeek = firstDayOfMonth.getDay();
  // Ajustar para que la semana empiece el Lunes (0 = Lunes, 1 = Martes, ... 6 = Domingo)
  startDayOfWeek = (startDayOfWeek === 0) ? 6 : startDayOfWeek - 1;

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (day: number) => {
    setSelectedDayForCita(day);
  };

  const handleCreateQuickCita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDayForCita || !quickCitaClienteId || !quickCitaHora) return;

    const fechaCita = new Date(year, month, selectedDayForCita);
    const [hours, minutes] = quickCitaHora.split(':');
    fechaCita.setHours(parseInt(hours), parseInt(minutes), 0);

    try {
      const res = await fetch(`${API_URL}/api/citas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: quickCitaClienteId,
          titulo: quickCitaTitulo,
          fecha_hora: fechaCita.toISOString(),
        }),
      });

      if (res.ok) {
        setSelectedDayForCita(null);
        setQuickCitaTitulo('Prueba');
        fetchCitas();
      }
    } catch (e) {
      console.error('Error creating quick appointment:', e);
    }
  };

  // Renderizar la rejilla del calendario
  const renderDays = () => {
    const dayCells = [];

    // Celdas vacías del mes anterior
    for (let i = 0; i < startDayOfWeek; i++) {
      dayCells.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Celdas de los días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      
      // Filtrar citas de este día
      const dayAppointments = citas.filter((cita) => {
        const citaDate = new Date(cita.fecha_hora);
        return (
          citaDate.getDate() === day &&
          citaDate.getMonth() === month &&
          citaDate.getFullYear() === year
        );
      });

      const isToday =
        day === new Date().getDate() &&
        month === new Date().getMonth() &&
        year === new Date().getFullYear();

      dayCells.push(
        <div
          key={`day-${day}`}
          className={`calendar-day ${isToday ? 'today' : ''}`}
          onClick={() => handleDayClick(day)}
        >
          <div className="day-number">{day}</div>
          <div className="calendar-appointments">
            {dayAppointments.map((cita) => {
              const dateObj = new Date(cita.fecha_hora);
              const timeStr = dateObj.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              });
              const isCorpiño = cita.titulo.toLowerCase().includes('corpiño') || 
                                (cita.cliente_nombre && cita.cliente_nombre.toLowerCase().includes('clara'));
              return (
                <div
                  key={cita.id}
                  className={`calendar-appointment-item ${isCorpiño ? 'secondary' : ''}`}
                  title={`${timeStr} - ${cita.titulo} (${cita.cliente_nombre})`}
                >
                  <span style={{ fontWeight: 600 }}>{timeStr}</span> {cita.titulo}
                  <div style={{ fontSize: '9px', opacity: 0.8 }}>👤 {cita.cliente_nombre}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return dayCells;
  };

  return (
    <div className="calendar-container">
      <div className="page-header">
        <h1 className="page-title">Calendario de Citas</h1>
        <p className="page-subtitle">Visualiza y organiza las citas de pruebas de trajes de las clientas.</p>
      </div>

      <div className="card" style={{ padding: '16px' }}>
        <div className="calendar-header">
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>
            {monthNames[month]} {year}
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={prevMonth} className="button button-secondary" style={{ padding: '8px 12px' }}>
              ◀ Anterior
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="button button-secondary"
              style={{ padding: '8px 12px' }}
            >
              Hoy
            </button>
            <button onClick={nextMonth} className="button button-secondary" style={{ padding: '8px 12px' }}>
              Siguiente ▶
            </button>
          </div>
        </div>

        {/* Rejilla de Días de la Semana */}
        <div className="calendar-grid" style={{ gridTemplateRows: 'auto' }}>
          <div className="calendar-day-header">Lun</div>
          <div className="calendar-day-header">Mar</div>
          <div className="calendar-day-header">Mié</div>
          <div className="calendar-day-header">Jue</div>
          <div className="calendar-day-header">Vie</div>
          <div className="calendar-day-header">Sáb</div>
          <div className="calendar-day-header">Dom</div>
        </div>

        {/* Rejilla de Días */}
        <div className="calendar-grid" style={{ borderTop: 'none' }}>
          {renderDays()}
        </div>
      </div>

      {/* Modal para añadir Cita Rápida */}
      {selectedDayForCita !== null && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">
              Nueva Cita para el {selectedDayForCita} de {monthNames[month]}
            </h3>
            {clientes.length === 0 ? (
              <div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Primero debes registrar al menos una clienta en la sección de Gestión.
                </p>
                <div className="modal-actions">
                  <button onClick={() => setSelectedDayForCita(null)} className="button button-secondary">
                    Cerrar
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateQuickCita}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Clienta</label>
                  <select
                    value={quickCitaClienteId}
                    onChange={(e) => setQuickCitaClienteId(parseInt(e.target.value) || '')}
                    required
                  >
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre_apellido}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Detalle de Prueba</label>
                  <input
                    type="text"
                    value={quickCitaTitulo}
                    onChange={(e) => setQuickCitaTitulo(e.target.value)}
                    placeholder="Ej. 1ª prueba, Cita de ajustes"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Hora</label>
                  <input
                    type="time"
                    value={quickCitaHora}
                    onChange={(e) => setQuickCitaHora(e.target.value)}
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => setSelectedDayForCita(null)}
                    className="button button-secondary"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="button">
                    Crear Cita
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
