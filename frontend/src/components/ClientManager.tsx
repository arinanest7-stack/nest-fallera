import React, { useState, useEffect } from 'react';
import { Cliente, Traje, Cita } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ClientManagerProps {
  onRefreshCitas: () => void;
}

export const ClientManager: React.FC<ClientManagerProps> = ({ onRefreshCitas }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [trajes, setTrajes] = useState<Traje[]>([]);
  
  // Formulario nuevo cliente
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [pagado, setPagado] = useState(0);
  const [selectedTrajes, setSelectedTrajes] = useState<number[]>([]);
  
  // Cita inicial opcional
  const [crearCitaInicial, setCrearCitaInicial] = useState(false);
  const [citaTitulo, setCitaTitulo] = useState('1ª prueba');
  const [citaFecha, setCitaFecha] = useState('');
  const [citaHora, setCitaHora] = useState('09:00');

  // Modales
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [addingCitaCliente, setAddingCitaCliente] = useState<Cliente | null>(null);
  
  // Formulario añadir cita
  const [nuevaCitaTitulo, setNuevaCitaTitulo] = useState('Prueba');
  const [nuevaCitaFecha, setNuevaCitaFecha] = useState('');
  const [nuevaCitaHora, setNuevaCitaHora] = useState('10:00');

  const fetchClientes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/clientes`);
      if (res.ok) {
        const data = await res.json();
        setClientes(data);
      }
    } catch (e) {
      console.error('Error fetching clients:', e);
    }
  };

  const fetchTrajes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/trajes`);
      if (res.ok) {
        const data = await res.json();
        setTrajes(data);
      }
    } catch (e) {
      console.error('Error fetching trajes:', e);
    }
  };

  useEffect(() => {
    fetchClientes();
    fetchTrajes();
  }, []);

  const handleCreateCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    let cita_inicial = undefined;
    if (crearCitaInicial && citaFecha && citaHora) {
      cita_inicial = {
        titulo: citaTitulo,
        fecha_hora: new Date(`${citaFecha}T${citaHora}:00`).toISOString(),
      };
    }

    try {
      const res = await fetch(`${API_URL}/api/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_apellido: nombre,
          telefono,
          pagado,
          traje_ids: selectedTrajes,
          cita_inicial,
        }),
      });

      if (res.ok) {
        // Limpiar formulario
        setNombre('');
        setTelefono('');
        setPagado(0);
        setSelectedTrajes([]);
        setCrearCitaInicial(false);
        setCitaTitulo('1ª prueba');
        setCitaFecha('');
        setCitaHora('09:00');
        
        fetchClientes();
        onRefreshCitas();
      }
    } catch (e) {
      console.error('Error creating client:', e);
    }
  };

  const handleToggleTraje = (id: number) => {
    if (selectedTrajes.includes(id)) {
      setSelectedTrajes(selectedTrajes.filter((tId) => tId !== id));
    } else {
      setSelectedTrajes([...selectedTrajes, id]);
    }
  };

  const handleToggleEditTraje = (id: number) => {
    if (!editingCliente) return;
    const isSelected = editingCliente.trajes.some(t => t.id === id);
    let updatedTrajes: Traje[];
    if (isSelected) {
      updatedTrajes = editingCliente.trajes.filter(t => t.id !== id);
    } else {
      const trajeObj = trajes.find(t => t.id === id);
      updatedTrajes = trajeObj ? [...editingCliente.trajes, trajeObj] : editingCliente.trajes;
    }
    setEditingCliente({
      ...editingCliente,
      trajes: updatedTrajes
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
          traje_ids: editingCliente.trajes.map(t => t.id),
        }),
      });

      if (res.ok) {
        setEditingCliente(null);
        fetchClientes();
        onRefreshCitas();
      }
    } catch (e) {
      console.error('Error saving edits:', e);
    }
  };

  const handleDeleteCliente = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este cliente? Se borrarán también sus citas.')) return;
    try {
      const res = await fetch(`${API_URL}/api/clientes/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchClientes();
        onRefreshCitas();
      }
    } catch (e) {
      console.error('Error deleting client:', e);
    }
  };

  const handleAddCita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingCitaCliente || !nuevaCitaFecha || !nuevaCitaHora) return;

    try {
      const res = await fetch(`${API_URL}/api/citas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: addingCitaCliente.id,
          titulo: nuevaCitaTitulo,
          fecha_hora: new Date(`${nuevaCitaFecha}T${nuevaCitaHora}:00`).toISOString(),
        }),
      });

      if (res.ok) {
        setAddingCitaCliente(null);
        setNuevaCitaTitulo('Prueba');
        setNuevaCitaFecha('');
        setNuevaCitaHora('10:00');
        fetchClientes();
        onRefreshCitas();
      }
    } catch (e) {
      console.error('Error adding appointment:', e);
    }
  };

  const handleDeleteCita = async (citaId: number) => {
    if (!confirm('¿Deseas eliminar esta cita?')) return;
    try {
      const res = await fetch(`${API_URL}/api/citas/${citaId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchClientes();
        onRefreshCitas();
      }
    } catch (e) {
      console.error('Error deleting appointment:', e);
    }
  };

  const getTagClass = (name: string): string => {
    const lowercase = name.toLowerCase();
    if (lowercase.includes('siglo')) return 'tag tag-siglo';
    if (lowercase.includes('huertana') || lowercase.includes('huerana')) return 'tag tag-huertana';
    if (lowercase.includes('farol')) return 'tag tag-farol';
    if (lowercase.includes('antig')) return 'tag tag-antigua';
    if (lowercase.includes('chaleco')) return 'tag tag-chaleco';
    return 'tag tag-default';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="client-manager-container">
      <div className="page-header">
        <h1 className="page-title">Gestión de Clientes</h1>
        <p className="page-subtitle">Registra clientes, selecciona sus trajes y agenda sus citas de prueba.</p>
      </div>

      {/* Formulario de Alta */}
      <div className="card">
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>🧵 Nuevo Encargo / Cliente</h2>
        <form onSubmit={handleCreateCliente}>
          <div className="form-grid">
            <div className="form-group">
              <label>Nombre y Apellido</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Maria Clara"
                required
              />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej. +34 600 333 444"
              />
            </div>
            <div className="form-group">
              <label>Importe Pagado Inicial (€)</label>
              <input
                type="number"
                value={pagado}
                onChange={(e) => setPagado(parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Tipos de Fallera / Trajes (Selección Múltiple)</label>
            <div className="multiselect-container">
              {trajes.map((traje) => {
                const isSelected = selectedTrajes.includes(traje.id);
                return (
                  <div
                    key={traje.id}
                    className={`multiselect-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggleTraje(traje.id)}
                  >
                    <span>{traje.nombre}</span>
                    <span style={{ opacity: 0.7 }}>({traje.precio}€)</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Toggle para Cita Inicial */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textTransform: 'none' }}>
              <input
                type="checkbox"
                checked={crearCitaInicial}
                onChange={(e) => setCrearCitaInicial(e.target.checked)}
              />
              <span>Programar cita de prueba inicial inmediatamente</span>
            </label>
          </div>

          {crearCitaInicial && (
            <div className="form-grid" style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
              <div className="form-group">
                <label>Detalle / Título Cita</label>
                <input
                  type="text"
                  value={citaTitulo}
                  onChange={(e) => setCitaTitulo(e.target.value)}
                  placeholder="Ej. 1ª prueba"
                />
              </div>
              <div className="form-group">
                <label>Fecha</label>
                <input
                  type="date"
                  value={citaFecha}
                  onChange={(e) => setCitaFecha(e.target.value)}
                  required={crearCitaInicial}
                />
              </div>
              <div className="form-group">
                <label>Hora</label>
                <input
                  type="time"
                  value={citaHora}
                  onChange={(e) => setCitaHora(e.target.value)}
                  required={crearCitaInicial}
                />
              </div>
            </div>
          )}

          <button type="submit" className="button">
            Crear Cliente y Encargo
          </button>
        </form>
      </div>

      {/* Tabla de Clientes */}
      <div className="notion-table-container">
        <table className="notion-table">
          <thead>
            <tr>
              <th>Nombre y Apellido</th>
              <th>Tipos de Fallera</th>
              <th>Precio Total</th>
              <th>Citas</th>
              <th>Teléfono</th>
              <th>Pagado</th>
              <th>Falta por pagar</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px' }}>
                  No hay clientes registrados. ¡Agrega el primero arriba!
                </td>
              </tr>
            ) : (
              clientes.map((cliente) => {
                const totalPrecio = cliente.trajes.reduce((acc, t) => acc + parseFloat(t.precio as any), 0);
                const pagadoM = parseFloat(cliente.pagado as any) || 0;
                const faltaPagar = totalPrecio - pagadoM;

                return (
                  <tr key={cliente.id}>
                    <td style={{ fontWeight: 600 }}>{cliente.nombre_apellido}</td>
                    <td>
                      <div className="tag-container">
                        {cliente.trajes.map((t) => (
                          <span key={t.id} className={getTagClass(t.nombre)}>
                            {t.nombre}
                          </span>
                        ))}
                        {cliente.trajes.length === 0 && (
                          <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Ninguno</span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{totalPrecio} €</td>
                    <td>
                      <div className="citas-list">
                        {cliente.citas.map((c) => (
                          <div key={c.id} className="cita-pill">
                            <span>📅 {c.titulo}</span>
                            <span className="cita-date">({formatDate(c.fecha_hora)})</span>
                            <button
                              onClick={() => handleDeleteCita(c.id)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', marginLeft: '4px', fontSize: '10px' }}
                              title="Borrar cita"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        {cliente.citas.length === 0 && (
                          <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Sin citas</span>
                        )}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{cliente.telefono || '-'}</td>
                    <td className="amount-paid">{pagadoM} €</td>
                    <td>
                      {faltaPagar > 0 ? (
                        <span className="amount-pending">{faltaPagar} €</span>
                      ) : (
                        <span className="amount-paid" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                          ✓ Cobrado
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => setAddingCitaCliente(cliente)}
                          className="button button-secondary"
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                          title="Añadir Cita"
                        >
                          + Cita
                        </button>
                        <button
                          onClick={() => setEditingCliente(cliente)}
                          className="button button-secondary"
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteCliente(cliente.id)}
                          className="button button-danger"
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                        >
                          Eliminar
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

      {/* Modal Editar Cliente */}
      {editingCliente && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Editar Cliente: {editingCliente.nombre_apellido}</h3>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Nombre y Apellido</label>
              <input
                type="text"
                value={editingCliente.nombre_apellido}
                onChange={(e) => setEditingCliente({ ...editingCliente, nombre_apellido: e.target.value })}
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Teléfono</label>
              <input
                type="text"
                value={editingCliente.telefono}
                onChange={(e) => setEditingCliente({ ...editingCliente, telefono: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Importe Pagado (€)</label>
              <input
                type="number"
                value={editingCliente.pagado}
                onChange={(e) => setEditingCliente({ ...editingCliente, pagado: parseFloat(e.target.value) || 0 })}
                min="0"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Tipos de Fallera / Trajes</label>
              <div className="multiselect-container">
                {trajes.map((traje) => {
                  const isSelected = editingCliente.trajes.some((t) => t.id === traje.id);
                  return (
                    <div
                      key={traje.id}
                      className={`multiselect-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleToggleEditTraje(traje.id)}
                    >
                      <span>{traje.nombre}</span>
                      <span style={{ opacity: 0.7 }}>({traje.precio}€)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={() => setEditingCliente(null)} className="button button-secondary">
                Cancelar
              </button>
              <button onClick={handleSaveEditCliente} className="button">
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Añadir Cita */}
      {addingCitaCliente && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Nueva Cita para {addingCitaCliente.nombre_apellido}</h3>
            <form onSubmit={handleAddCita}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Detalle / Título de Prueba</label>
                <input
                  type="text"
                  value={nuevaCitaTitulo}
                  onChange={(e) => setNuevaCitaTitulo(e.target.value)}
                  placeholder="Ej. Cita de Ajustes, 2ª Prueba"
                  required
                />
              </div>

              <div className="form-grid" style={{ marginBottom: '16px' }}>
                <div className="form-group">
                  <label>Fecha</label>
                  <input
                    type="date"
                    value={nuevaCitaFecha}
                    onChange={(e) => setNuevaCitaFecha(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hora</label>
                  <input
                    type="time"
                    value={nuevaCitaHora}
                    onChange={(e) => setNuevaCitaHora(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setAddingCitaCliente(null)} className="button button-secondary">
                  Cancelar
                </button>
                <button type="submit" className="button">
                  Añadir Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
