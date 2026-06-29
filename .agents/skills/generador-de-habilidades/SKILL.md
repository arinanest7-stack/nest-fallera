---
name: generador-de-habilidades
description: Habilidad maestra diseñada para crear otras habilidades (skills) dentro del workspace, asegurando que sigan el formato correcto y estén en idioma español.
---

# Skill: Generador de Habilidades (Maestra)

Esta es una habilidad de meta-nivel. Su única función es asistir en la creación de nuevas habilidades para el agente Antigravity, garantizando consistencia estructural y lingüística.

## Instrucciones para Crear una Nueva Skill

Cuando el usuario pida crear una nueva habilidad, DEBES seguir estos pasos:

### 1. Definición de Estructura
Toda skill debe residir en su propia carpeta bajo el directorio:
`c:\Users\Javier Domingo\Ramgestion\Gesdata - General\Antigravity\.agent\skills\<nombre-de-la-skill>`

### 2. Archivos Requeridos
- **SKILL.md**: El archivo principal de la habilidad. Debe contener el frontmatter YAML con `name` y `description`.
- **resources/** (Opcional): Carpeta para plantillas, archivos de datos o scripts adicionales.

### 3. Requisitos de Contenido (Idioma: Español)
- El `name` en el frontmatter debe ser un slug (kebab-case).
- La `description` y todo el cuerpo del `SKILL.md` debe estar en **Español de España**, con un tono profesional y técnico.
- Debes incluir secciones claras: # Skill: [Nombre], ## [Propósito], ## [Instrucciones/Reglas].

### 4. Integración con Quality Guard
Toda nueva habilidad debe heredar los principios de `quality_guard`:
- Validaciones obligatorias.
- Reuso de lógica antes de creación.
- Enfoque en usuario no técnico.

## Ejemplo de Uso
Si el usuario dice: "Crea una habilidad para documentar APIs", tú debes crear:
`.agent/skills/documentador-api/SKILL.md` con instrucciones específicas para esa tarea en español.

---
> [!IMPORTANT]
> Nunca sobrescribas una habilidad existente sin confirmación explícita del usuario.
