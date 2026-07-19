---
name: quality_guard
description: Reglamento Operativo y de Calidad del Proyecto AntiGravity. Asegura consistencia, reuso de lógica y validación obligatoria.
---

# Skill: Quality Guard (Reglamento de Calidad)

Esta skill define el estándar de oro para cualquier intervención en el repositorio de AntiGravity. **DEBE** consultarse antes de iniciar cualquier tarea de codificación o refactorización.

## 1. Reglas de Oro Obligatorias

- **No inventar ni asumir**: Si falta información, localizarla en el repo o preguntar.
- **Reutilizar antes de crear**: Comprobar si existe lógica equivalente en la base de código (helpers, validadores, componentes).
- **Validación Triple**:
  1. **Entrada**: Tipos, rangos, sanitización.
  2. **Dominio**: Reglas de negocio e invariantes.
  3. **Salida**: Mensajes claros y sin fugas de información sensible.
- **Reversibilidad**: Cada cambio debe tener un plan de rollback (rollback por versión o feature flag).
- **UX para no técnicos**: Mensajes humanos, estados de carga, estados vacíos y accesibilidad.

## 2. Flujo de Trabajo (Protocolo de Acción)

1. **Entender**: Definir escenarios "qué debería pasar" y "qué no".
2. **Localizar**: Buscar en el repo fuentes de verdad existentes.
3. **Plan Mínimo**: Cambios aislados y seguros.
4. **Implementar con Guardrails**: Manejo de errores centrado en el usuario.
5. **Verificar**: Pruebas de regresión manual o automatizada.
6. **Documentar**: Actualizar el `report.md` o documentación técnica relevante.

## 3. Estándar de Validaciones

| Capa        | Requisito                                                      |
| :---------- | :------------------------------------------------------------- |
| **UI/API**  | Formatos (email, fechas), obligatoriedad, sanitización.        |
| **Dominio** | Invariantes de negocio, transiciones de estado permitidas.     |
| **Salida**  | Respuestas consistentes y errores accionables para el usuario. |

## 4. Reuso de Lógica

- **Mapa de Lógica**: Consultar siempre `risk-management-app/src/utils` y `server/src/services` antes de crear nuevas funciones.
- **Cambiar en Origen**: Si se detecta duplicación, centralizar la lógica en un helper compartido.

## 5. Definition of Done (DoD)

Un cambio está terminado SOLO si:

- Cumple el requerimiento sin efectos colaterales.
- Reutiliza lógica existente.
- Incluye validaciones y gestión de errores.
- Incluye plan de rollback.
- No degrada la UX.
- Documentación actualizada.
