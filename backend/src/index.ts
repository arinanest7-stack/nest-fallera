import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, query } from './db';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Endpoints de Trajes
app.get('/api/trajes', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM trajes ORDER BY nombre ASC');
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching trajes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoints de Clientes
app.get('/api/clientes', async (req: Request, res: Response) => {
  try {
    const sql = `
      SELECT
        c.id,
        c.nombre_apellido,
        c.telefono,
        c.pagado,
        COALESCE(
          (
            SELECT JSON_AGG(JSON_BUILD_OBJECT('id', t.id, 'nombre', t.nombre, 'precio', t.precio))
            FROM cliente_trajes ct
            JOIN trajes t ON ct.traje_id = t.id
            WHERE ct.cliente_id = c.id
          ),
          '[]'::json
        ) AS trajes,
        COALESCE(
          (
            SELECT JSON_AGG(JSON_BUILD_OBJECT('id', ci.id, 'titulo', ci.titulo, 'fecha_hora', ci.fecha_hora) ORDER BY ci.fecha_hora ASC)
            FROM citas ci
            WHERE ci.cliente_id = c.id
          ),
          '[]'::json
        ) AS citas
      FROM clientes c
      ORDER BY c.nombre_apellido ASC
    `;
    const result = await query(sql);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching clientes:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clientes', async (req: Request, res: Response) => {
  const { nombre_apellido, telefono, pagado, traje_ids, cita_inicial } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insertar cliente
    const clientInsertSql = `
      INSERT INTO clientes (nombre_apellido, telefono, pagado)
      VALUES ($1, $2, $3)
      RETURNING id, nombre_apellido, telefono, pagado
    `;
    const clientRes = await client.query(clientInsertSql, [
      nombre_apellido,
      telefono || '',
      pagado || 0,
    ]);
    const newClientId = clientRes.rows[0].id;

    // 2. Asociar trajes
    if (traje_ids && Array.isArray(traje_ids) && traje_ids.length > 0) {
      const relationSql = `
        INSERT INTO cliente_trajes (cliente_id, traje_id)
        SELECT $1, unnest($2::int[])
      `;
      await client.query(relationSql, [newClientId, traje_ids]);
    }

    // 3. Crear cita inicial si existe
    if (cita_inicial && cita_inicial.titulo && cita_inicial.fecha_hora) {
      const citaSql = `
        INSERT INTO citas (cliente_id, titulo, fecha_hora)
        VALUES ($1, $2, $3)
      `;
      await client.query(citaSql, [
        newClientId,
        cita_inicial.titulo,
        cita_inicial.fecha_hora,
      ]);
    }

    await client.query('COMMIT');

    // Recuperar el cliente completo recién creado
    const fullClientSql = `
      SELECT
        c.id,
        c.nombre_apellido,
        c.telefono,
        c.pagado,
        COALESCE(
          (
            SELECT JSON_AGG(JSON_BUILD_OBJECT('id', t.id, 'nombre', t.nombre, 'precio', t.precio))
            FROM cliente_trajes ct
            JOIN trajes t ON ct.traje_id = t.id
            WHERE ct.cliente_id = c.id
          ),
          '[]'::json
        ) AS trajes,
        COALESCE(
          (
            SELECT JSON_AGG(JSON_BUILD_OBJECT('id', ci.id, 'titulo', ci.titulo, 'fecha_hora', ci.fecha_hora))
            FROM citas ci
            WHERE ci.cliente_id = c.id
          ),
          '[]'::json
        ) AS citas
      FROM clientes c
      WHERE c.id = $1
    `;
    const finalRes = await client.query(fullClientSql, [newClientId]);
    res.status(201).json(finalRes.rows[0]);
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error creating cliente:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

app.put('/api/clientes/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombre_apellido, telefono, pagado, traje_ids } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Actualizar datos básicos
    const updateSql = `
      UPDATE clientes
      SET nombre_apellido = $1, telefono = $2, pagado = $3
      WHERE id = $4
    `;
    await client.query(updateSql, [nombre_apellido, telefono || '', pagado || 0, id]);

    // 2. Eliminar trajes anteriores
    await client.query('DELETE FROM cliente_trajes WHERE cliente_id = $1', [id]);

    // 3. Insertar nuevos trajes
    if (traje_ids && Array.isArray(traje_ids) && traje_ids.length > 0) {
      const relationSql = `
        INSERT INTO cliente_trajes (cliente_id, traje_id)
        SELECT $1, unnest($2::int[])
      `;
      await client.query(relationSql, [id, traje_ids]);
    }

    await client.query('COMMIT');

    // Recuperar el cliente completo actualizado
    const fullClientSql = `
      SELECT
        c.id,
        c.nombre_apellido,
        c.telefono,
        c.pagado,
        COALESCE(
          (
            SELECT JSON_AGG(JSON_BUILD_OBJECT('id', t.id, 'nombre', t.nombre, 'precio', t.precio))
            FROM cliente_trajes ct
            JOIN trajes t ON ct.traje_id = t.id
            WHERE ct.cliente_id = c.id
          ),
          '[]'::json
        ) AS trajes,
        COALESCE(
          (
            SELECT JSON_AGG(JSON_BUILD_OBJECT('id', ci.id, 'titulo', ci.titulo, 'fecha_hora', ci.fecha_hora) ORDER BY ci.fecha_hora ASC)
            FROM citas ci
            WHERE ci.cliente_id = c.id
          ),
          '[]'::json
        ) AS citas
      FROM clientes c
      WHERE c.id = $1
    `;
    const finalRes = await client.query(fullClientSql, [id]);
    res.json(finalRes.rows[0]);
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error updating cliente:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

app.delete('/api/clientes/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM clientes WHERE id = $1', [id]);
    res.json({ success: true, message: 'Cliente eliminado correctamente.' });
  } catch (error: any) {
    console.error('Error deleting cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoints de Citas
app.get('/api/citas', async (req: Request, res: Response) => {
  try {
    const sql = `
      SELECT
        ci.id,
        ci.titulo,
        ci.fecha_hora,
        ci.cliente_id,
        c.nombre_apellido AS cliente_nombre,
        c.telefono AS cliente_telefono
      FROM citas ci
      JOIN clientes c ON ci.cliente_id = c.id
      ORDER BY ci.fecha_hora ASC
    `;
    const result = await query(sql);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching citas:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/citas', async (req: Request, res: Response) => {
  const { cliente_id, titulo, fecha_hora } = req.body;
  try {
    const sql = `
      INSERT INTO citas (cliente_id, titulo, fecha_hora)
      VALUES ($1, $2, $3)
      RETURNING id, cliente_id, titulo, fecha_hora
    `;
    const result = await query(sql, [cliente_id, titulo, fecha_hora]);

    const selectNewSql = `
      SELECT
        ci.id,
        ci.titulo,
        ci.fecha_hora,
        ci.cliente_id,
        c.nombre_apellido AS cliente_nombre,
        c.telefono AS cliente_telefono
      FROM citas ci
      JOIN clientes c ON ci.cliente_id = c.id
      WHERE ci.id = $1
    `;
    const finalRes = await query(selectNewSql, [result.rows[0].id]);
    res.status(201).json(finalRes.rows[0]);
  } catch (error: any) {
    console.error('Error creating cita:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/citas/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM citas WHERE id = $1', [id]);
    res.json({ success: true, message: 'Cita eliminada correctamente.' });
  } catch (error: any) {
    console.error('Error deleting cita:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint de Dashboard
app.get('/api/dashboard', async (req: Request, res: Response) => {
  try {
    // 1. Clientes totales
    const countRes = await query('SELECT COUNT(*)::int AS count FROM clientes');
    const totalClientes = countRes.rows[0].count;

    // 2. Dinero cobrado y esperado
    const moneySql = `
      SELECT
        COALESCE(SUM(c.pagado), 0.00) AS total_pagado,
        COALESCE(
          SUM(
            (
              SELECT COALESCE(SUM(t.precio), 0.00)
              FROM cliente_trajes ct
              JOIN trajes t ON ct.traje_id = t.id
              WHERE ct.cliente_id = c.id
            )
          ),
          0.00
        ) AS total_esperado
      FROM clientes c
    `;
    const moneyRes = await query(moneySql);
    const { total_pagado, total_esperado } = moneyRes.rows[0];

    const pagado = parseFloat(total_pagado);
    const esperado = parseFloat(total_esperado);
    const pendiente = esperado - pagado;

    // 3. Distribución de trajes ordenados
    const distributionSql = `
      SELECT t.nombre, COUNT(ct.cliente_id)::int AS cantidad
      FROM trajes t
      LEFT JOIN cliente_trajes ct ON t.id = ct.traje_id
      GROUP BY t.id, t.nombre
      ORDER BY cantidad DESC, t.nombre ASC
    `;
    const distRes = await query(distributionSql);

    // 4. Top deudores (los que más dinero deben)
    const debtorsSql = `
      SELECT
        c.id,
        c.nombre_apellido,
        c.telefono,
        c.pagado,
        COALESCE((SELECT SUM(t.precio) FROM cliente_trajes ct JOIN trajes t ON ct.traje_id = t.id WHERE ct.cliente_id = c.id), 0.00) AS precio_total,
        (COALESCE((SELECT SUM(t.precio) FROM cliente_trajes ct JOIN trajes t ON ct.traje_id = t.id WHERE ct.cliente_id = c.id), 0.00) - c.pagado) AS falta_pagar
      FROM clientes c
      WHERE (COALESCE((SELECT SUM(t.precio) FROM cliente_trajes ct JOIN trajes t ON ct.traje_id = t.id WHERE ct.cliente_id = c.id), 0.00) - c.pagado) > 0
      ORDER BY falta_pagar DESC
      LIMIT 5
    `;
    const debtorsRes = await query(debtorsSql);

    // 5. Próximas citas (las 5 siguientes)
    const nextCitasSql = `
      SELECT ci.id, ci.titulo, ci.fecha_hora, c.nombre_apellido AS cliente_nombre, c.telefono AS cliente_telefono
      FROM citas ci
      JOIN clientes c ON ci.cliente_id = c.id
      WHERE ci.fecha_hora >= NOW() - INTERVAL '2 hours' -- margen por zona horaria
      ORDER BY ci.fecha_hora ASC
      LIMIT 5
    `;
    const nextCitasRes = await query(nextCitasSql);

    res.json({
      totalClientes,
      cobradas: pagado,
      esperado: esperado,
      pendiente: pendiente,
      distribucionTrajes: distRes.rows,
      deudores: debtorsRes.rows,
      proximasCitas: nextCitasRes.rows,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
