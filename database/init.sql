-- Creación de las tablas

CREATE TABLE IF NOT EXISTS trajes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    precio DECIMAL(10, 2) NOT NULL DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nombre_apellido VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20) DEFAULT '',
    pagado DECIMAL(10, 2) NOT NULL DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS cliente_trajes (
    cliente_id INT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    traje_id INT NOT NULL REFERENCES trajes(id) ON DELETE CASCADE,
    PRIMARY KEY (cliente_id, traje_id)
);

CREATE TABLE IF NOT EXISTS citas (
    id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    titulo VARCHAR(100) NOT NULL,
    fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Semilla de trajes
INSERT INTO trajes (nombre, precio) VALUES
('Traje de Siglo', 600.00),
('Traje de Huertana', 530.00),
('Traje de farol', 555.00),
('Traje Antigua', 530.00),
('Chaleco para hombre', 90.00),
('Corpiño del siglo', 350.00),
('Corpiño antiguo', 330.00),
('Corpiño de huertana', 330.00),
('Corpiño farol', 330.00)
ON CONFLICT (nombre) DO UPDATE SET precio = EXCLUDED.precio;

-- Semilla de clientes
INSERT INTO clientes (id, nombre_apellido, telefono, pagado) VALUES
(1, 'maria', '+34 600 111 222', 500.00),
(2, 'maria clara', '+34 600 333 444', 240.00)
ON CONFLICT (nombre_apellido) DO NOTHING;

-- Relaciones de trajes para maria (Traje de Siglo) y maria clara (Corpiño antiguo)
INSERT INTO cliente_trajes (cliente_id, traje_id) VALUES
(1, (SELECT id FROM trajes WHERE nombre = 'Traje de Siglo')),
(2, (SELECT id FROM trajes WHERE nombre = 'Corpiño antiguo'))
ON CONFLICT DO NOTHING;

-- Semilla de citas (Julio 2026)
INSERT INTO citas (cliente_id, titulo, fecha_hora) VALUES
(1, '1 prueba', '2026-07-01 09:00:00+02'),
(2, '2 prueba', '2026-07-02 11:00:00+02')
ON CONFLICT DO NOTHING;

-- Ajustar secuencias en caso de que hayamos insertado ids explícitos
SELECT setval('clientes_id_seq', COALESCE((SELECT MAX(id)+1 FROM clientes), 1), false);
SELECT setval('citas_id_seq', COALESCE((SELECT MAX(id)+1 FROM citas), 1), false);
