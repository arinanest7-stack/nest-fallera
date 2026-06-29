import React, { useState, useEffect } from 'react';
import { DashboardData } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface DashboardViewProps {
  refreshTrigger: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ refreshTrigger }) => {
  const [data, setData] = useState<DashboardData | null>(null);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/dashboard`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [refreshTrigger]);

  if (!data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Cargando estadísticas...</p>
      </div>
    );
  }

  // Porcentaje cobrado
  const cobradoPorcentaje = data.esperado > 0 ? Math.round((data.cobradas / data.esperado) * 100) : 0;

  // Encontrar el valor máximo de cantidad para el gráfico de barras CSS
  const maxCantidad = data.distribucionTrajes.reduce((max, t) => (t.cantidad > max ? t.cantidad : max), 1);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('es-ES', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard del Taller</h1>
        <p className="page-subtitle">Resumen general de facturación, pedidos y próximas citas de costura.</p>
      </div>

      {/* Grid de Tarjetas de Métricas */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <span className="stat-title">Clientas Activas</span>
          <span className="stat-value">{data.totalClientes}</span>
          <span className="stat-subtitle">En el sistema</span>
        </div>

        <div className="stat-card">
          <span className="stat-title">Presupuesto Esperado</span>
          <span className="stat-value">{data.esperado.toFixed(2)} €</span>
          <span className="stat-subtitle">Valor total de encargos</span>
        </div>

        <div className="stat-card">
          <span className="stat-title">Total Cobrado</span>
          <span className="stat-value" style={{ color: '#10b981' }}>{data.cobradas.toFixed(2)} €</span>
          <div className="stat-subtitle">
            {cobradoPorcentaje}% recaudado
            <div className="stat-progress-bar">
              <div className="stat-progress" style={{ width: `${cobradoPorcentaje}%`, backgroundColor: '#10b981' }}></div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-title">Pendiente de Cobro</span>
          <span className="stat-value" style={{ color: '#ef4444' }}>{data.pendiente.toFixed(2)} €</span>
          <div className="stat-subtitle">
            {(100 - cobradoPorcentaje)}% pendiente
            <div className="stat-progress-bar">
              <div className="stat-progress" style={{ width: `${100 - cobradoPorcentaje}%`, backgroundColor: '#ef4444' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Secciones del Dashboard */}
      <div className="dashboard-sections">
        {/* Gráfico de Trajes más populares */}
        <div className="card">
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>📊 Tipos de Fallera Encargados</h2>
          <div className="bar-chart-container">
            {data.distribucionTrajes.map((traje) => {
              const pct = (traje.cantidad / maxCantidad) * 100;
              return (
                <div key={traje.nombre} className="bar-row">
                  <div className="bar-label-container">
                    <span className="bar-label">{traje.nombre}</span>
                    <span className="bar-value">{traje.cantidad} {traje.cantidad === 1 ? 'encargo' : 'encargos'}</span>
                  </div>
                  <div className="bar-outer">
                    <div className="bar-inner" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
            {data.distribucionTrajes.length === 0 && (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '24px' }}>
                No hay encargos suficientes para mostrar estadísticas.
              </p>
            )}
          </div>
        </div>

        {/* Cuentas Pendientes (Top Deudores) */}
        <div className="card">
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>⚠️ Pendientes de Pago (Top 5)</h2>
          <div className="list-container">
            {data.deudores.map((deudor) => (
              <div key={deudor.id} className="list-item">
                <div className="list-item-details">
                  <span className="list-item-title">{deudor.nombre_apellido}</span>
                  <span className="list-item-subtitle">📞 {deudor.telefono || 'Sin teléfono'}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="list-item-value" style={{ color: '#ef4444', display: 'block' }}>
                    -{parseFloat(deudor.falta_pagar as any).toFixed(2)} €
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Pagado: {parseFloat(deudor.pagado as any).toFixed(2)} € de {parseFloat(deudor.precio_total as any).toFixed(2)} €
                  </span>
                </div>
              </div>
            ))}
            {data.deudores.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px', color: '#10b981', fontWeight: 500 }}>
                🎉 ¡Todas las cuentas están al día!
              </div>
            )}
          </div>
        </div>

        {/* Próximas Citas */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>📅 Próximas Citas de Prueba</h2>
          <div className="list-container">
            {data.proximasCitas.map((cita) => (
              <div key={cita.id} className="list-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '24px' }}>📅</span>
                  <div className="list-item-details">
                    <span className="list-item-title" style={{ fontSize: '15px' }}>
                      {cita.titulo} con <strong>{cita.cliente_nombre}</strong>
                    </span>
                    <span className="list-item-subtitle">
                      Fecha: {formatDate(cita.fecha_hora)}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="list-item-value" style={{ color: '#60a5fa', display: 'block' }}>
                    {new Date(cita.fecha_hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} hs
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    📞 {cita.cliente_telefono || '-'}
                  </span>
                </div>
              </div>
            ))}
            {data.proximasCitas.length === 0 && (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '24px' }}>
                No hay próximas citas agendadas en los siguientes días.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
