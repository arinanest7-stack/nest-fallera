# Fallera Nest 🪡

**Fallera Nest** es un sistema inteligente de gestión de costura diseñado para una modista. Permite llevar el control completo de clientas, trajes de fallera encargados (con cálculo automático de importes) y citas para pruebas de trajes, todo en una interfaz oscura moderna estilo Notion.

---

## Características Principales

1. **Gestión de Clientes e Importes (Inicio)**:
   - Registro de clientas con nombre y teléfono.
   - Selección múltiple de tipos de trajes/corpiños de fallera (base de datos de precios oculta).
   - Control de importes: dinero pagado y cálculo en tiempo real de la cantidad pendiente.
   - Alerta visual en color rojo para saldos impagos.
   - Gestión y borrado de citas directamente desde la fila del cliente.
2. **Calendario Mensual**:
   - Calendario interactivo (semana de Lunes a Domingo) que filtra citas por mes.
   - Registro rápido de citas haciendo clic en cualquier celda de día.
   - Resaltado del día actual.
3. **Dashboard de Métricas**:
   - Tarjetas de resumen: total de clientas, facturación total esperada, total recaudado y total pendiente.
   - Gráfico de barras premium (CSS puro) con la distribución de los trajes más solicitados.
   - Top de deudores para facilitar el cobro rápido.
   - Agenda con las próximas citas programadas.

---

## Estructura de Contenedores Docker

El proyecto se compone de 3 contenedores coordinados:
1. **Frontend**: React + TypeScript + Vite (Puerto `3000`).
2. **Backend**: Node.js + Express + TypeScript + pg driver (Puerto `5000`).
3. **Base de Datos (SQL)**: PostgreSQL (Puerto `5432`).

---

## Cómo Iniciar la Aplicación

Para poner en marcha la aplicación, simplemente ejecuta el siguiente comando en la raíz del proyecto:

```bash
docker compose up --build
```

### URL de Acceso

Una vez levantados los servicios, la terminal imprimirá un aviso claro con el enlace. Puedes acceder directamente desde:

👉 **http://localhost:3000**
