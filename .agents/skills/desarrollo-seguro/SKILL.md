---
name: desarrollo-seguro
description: Guía y estándar para el desarrollo seguro de software e implementación de controles en el ciclo de vida de desarrollo (Secure SDLC), basada en OWASP.
---

# Skill: Desarrollo Seguro

## Propósito
Esta habilidad establece el marco de referencia y el itinerario de aprendizaje para el desarrollo seguro de software dentro del proyecto Antigravity. Su propósito es dotar a los desarrolladores y revisores de las competencias necesarias para identificar, prevenir y mitigar vulnerabilidades de seguridad desde la fase de diseño hasta el despliegue.

Busca transformar la seguridad en un atributo intrínseco del código ("Security by Design") en lugar de una etapa final de corrección, reduciendo la deuda técnica de seguridad y protegiendo los activos del sistema contra las amenazas más comunes (OWASP Top 10 y más).

## Resultados de aprendizaje medibles
Al completar esta habilidad, el "Rol" podrá:
1. Identificar y remediar proactivamente las vulnerabilidades del OWASP Top 10 en código frontend y backend.
2. Realizar revisiones de código (Code Reviews) efectivas centradas en seguridad.
3. Implementar esquemas de validación de entrada y codificación de salida robustos.
4. Gestionar secretos, credenciales y configuraciones de forma segura, evitando exposición en repositorios.
5. Integrar controles de seguridad automatizados (SAST, SCA) en el flujo de trabajo.
6. Aplicar principios de menor privilegio y defensa en profundidad en el diseño de APIs y servicios.

## Prerrequisitos
- **Técnicos**: Dominio intermedio del stack tecnológico del proyecto (ej. React/Node.js, Bases de Datos SQL).
- **Conocimientos**: Comprensión básica de HTTP, autenticación (JWT/Sessions) y funcionamiento de APIs REST.
- **Herramientas**: Familiaridad con Git y el entorno de CI/CD del proyecto.

## Plan por niveles (Itinerario)

### Nivel 1: Fundamentos de Higiene en el Código
- **Objetivo**: Evitar errores básicos y exposición de secretos.
- **Conocimientos clave**: No hardcodear credenciales, validación básica de inputs, uso de librerías actualizadas.
- **Checklist (PR)**:
    - [ ] ¿No hay secretos/claves en el código?
    - [ ] ¿Las dependencias nuevas son seguras y necesarias?
    - [ ] ¿Se validan los parámetros de entrada requeridos?
- **Ejercicios prácticos**:
    1. Escanear el repositorio actual buscando secretos con una herramienta local (ej. trufflehog o grep regex).
    2. Actualizar dependencias vulnerables identificadas por `npm audit` u equivalente.
    3. Refactorizar un endpoint que reciba datos sin validar para usar un esquema de validación (ej. Zod/Joi).
- **Evidencias**: Reporte de escaneo limpio, PR de actualización de deps, PR con validación añadida.

### Nivel 2: Prevención de Inyecciones y XSS (OWASP A03:2021)
- **Objetivo**: Blindar la aplicación contra SQLi, NoSQLi y XSS.
- **Conocimientos clave**: Consultas parametrizadas (Prepared Statements), Context-aware Output Encoding.
- **Checklist (PR)**:
    - [ ] ¿Todas las queries usan parámetros/ORM seguro? (Prohibido concatenar strings).
    - [ ] ¿Los datos renderizados en UI están escapados por defecto? (Cuidado con `dangerouslySetInnerHTML`).
- **Ejercicios prácticos**:
    1. Identificar una query insegura (simulada o real) y convertirla a query parametrizada.
    2. Crear un componente React que renderice input de usuario de forma segura (p. ej. Markdown) sanitizando el HTML.
    3. Implementar Content Security Policy (CSP) básica en headers.
- **Evidencias**: Código corregido, test de "ataque" fallido (input malicioso no ejecuta script/query).

### Nivel 3: Autenticación y Autorización Robusta (OWASP A01 y A07)
- **Objetivo**: Asegurar que solo quien debe accede a lo que debe (Broken Access Control).
- **Conocimientos clave**: Gestión de sesiones, JWT seguro, RBAC/ABAC, IDOR (Insecure Direct Object References).
- **Checklist (PR)**:
    - [ ] ¿Se verifica el propietario del recurso antes de permitir lectura/edición? (No confiar solo en IDs de URL).
    - [ ] ¿Las rutas administrativas están protegidas por middleware de rol?
- **Ejercicios prácticos**:
    1. Implementar un test para detectar IDOR: intentar acceder al recurso del Usuario B con credenciales del Usuario A.
    2. Revisar y fortificar la configuración de Cookies (Secure, HttpOnly, SameSite).
    3. Implementar limitación de tasa (Rate Limiting) en endpoints de login.
- **Evidencias**: Tests de integración de seguridad (pasando), configuración de cookies.

### Nivel 4: Protección de Datos y Criptografía (OWASP A02)
- **Objetivo**: Proteger la confidencialidad e integridad de los datos en tránsito y reposo.
- **Conocimientos clave**: Cifrado (AES, RSA), Hashing (Argon2/Bcrypt), TLS, Gestión de claves.
- **Checklist (PR)**:
    - [ ] ¿Los datos sensibles (PII, tokens) se cifran en BD si es necesario?
    - [ ] ¿Se usa HTTPS en todas las comunicaciones externas?
    - [ ] ¿No se loguean datos sensibles?
- **Ejercicios prácticos**:
    1. Implementar cifrado a nivel de aplicación para un campo sensible en BD.
    2. Auditar los logs para asegurar que no se imprimen passwords ni tokens.
    3. Configurar headers de seguridad HTTP (HSTS, X-Frame-Options).
- **Evidencias**: Código de cifrado, configuración de logger (redacción de secretos), análisis de headers.

### Nivel 5: Secure SDLC y Automatización
- **Objetivo**: Integrar seguridad en el ciclo de vida y CI/CD.
- **Conocimientos clave**: SAST, DAST, Threat Modeling, Supply Chain Security.
- **Checklist (PR)**:
    - [ ] ¿Pasa el pipeline de seguridad sin fallos críticos?
    - [ ] ¿Se ha realizado un mini-threat model para cambios de arquitectura?
- **Ejercicios prácticos**:
    1. Configurar una herramienta SAST (ej. SonarQube, Semgrep, CodeQL) en el pipeline local o CI.
    2. Realizar un Threat Modeling (STRIDE simplificado) para una nueva feature.
    3. Definir y configurar reglas de "Quality Guard" para detener builds inseguras.
- **Evidencias**: Pipeline configurado, documento de Threat Model, reglas de Quality Guard.

## Estándar de Codificación Segura

Esta sección define las reglas de obligado cumplimiento.

### A. Validación Estricta
- **PERMITIDO**: Usar librerías de validación de esquemas (Zod, Joi, Pydantic) para **toda** entrada externa.
- **PERMITIDO**: "Allow-list" (lista blanca) de caracteres permitidos.
- **PROHIBIDO**: Confiar en validación solo en el frontend (client-side bypass).
- **PROHIBIDO**: Usar expresiones regulares complejas sin validar ReDoS (Catastrophic Backtracking).

### B. Gestión de Datos y Consultas
- **PERMITIDO**: Uso de ORMs con binding automático de parámetros.
- **PERMITIDO**: Consultas SQL nativas SOLO con `?` o `:params` (Prepared Statements).
- **PROHIBIDO**: Concatenación de strings para construir queries SQL, LDAP, OS Commands o XML.
  - *Mal*: `query = "SELECT * FROM users WHERE name = '" + userInput + "'"`
  - *Bien*: `query = "SELECT * FROM users WHERE name = ?", [userInput]`

### C. Gestión de Secretos
- **PERMITIDO**: Inyectar secretos vía variables de entorno (`process.env`) o gestores de secretos (Vault, AWS Secrets Manager).
- **PROHIBIDO**: Commitear archivos `.env`, claves `.pem`, o passwords hardcodeados.
- **PROHIBIDO**: Imprimir secretos en `console.log` o logs de error.

### D. Salida y Renderizado (XSS)
- **PERMITIDO**: Usar las funciones de escape por defecto del framework (React `{variable}`).
- **PERMITIDO**: Usar librerías de sanitización (ej. DOMPurify) para HTML permitido.
- **PROHIBIDO**: Deshabilitar el escaping automático sin justificación crítica y revisión manual.

### E. Autenticación y Control de Acceso
- **PERMITIDO**: Usar algoritmos de hash robustos/lentos para contraseñas (Argon2, bcrypt, scrypt). MD5 y SHA1 están prohibidos.
- **PERMITIDO**: Verificar autorización en la capa de servicio/negocio, no solo en el controlador.
- **PROHIBIDO**: Mensajes de error de login que revelen si el usuario existe ("Usuario no encontrado" vs "Credenciales inválidas").

### F. Manejo de Errores y Logging
- **PERMITIDO**: Registrar errores con ID de correlación, timestamp y stack trace (solo en logs internos).
- **PERMITIDO**: Mostrar al usuario mensajes genéricos ("Ha ocurrido un error, contacte soporte con ID: XYZ").
- **PROHIBIDO**: Exponer stack traces, estructuras de BD o rutas de servidor en la respuesta HTTP al cliente.

## Plantillas Operativas

### Plantilla de Checklist de Revisión de Seguridad
Copia y pega esto en la descripción de tus Pull Requests críticos:

```markdown
## Security Review Checklist
**Entradas y Salidas:**
- [ ] ¿Todas las nuevas entradas de API tienen validación de esquema estricta?
- [ ] ¿Se sanitizan/escapan correctamente los datos mostrados en UI?

**Lógica y Acceso:**
- [ ] ¿Se verifica autorización (roles/permisos) para esta acción específica?
- [ ] ¿Se impide el acceso a objetos de otros usuarios (control de IDOR)?

**Datos y Secretos:**
- [ ] ¿No se incluyen secretos ni credenciales en el código?
- [ ] ¿No se loguean datos sensibles (PII, tokens)?

**Consultas:**
- [ ] ¿No hay concatenación de strings en queries a BD o comandos de sistema?
```

### Plantilla Ligera de Threat Modeling (Por Feature)
1. **¿Qué estamos construyendo?** (Diagrama simple de flujo de datos).
2. **¿Qué puede salir mal?** (STRIDE simplificado):
   - ¿Pueden suplantar identidad? (S)
   - ¿Pueden manipular datos? (T)
   - ¿Pueden ver datos confidenciales? (I)
3. **¿Qué vamos a hacer al respecto?** (Lista de controles/mitigaciones).

## Evaluación y Verificación

### Criterios de "Skill Completada"
1. Aprobar el test de conocimientos (Teórico).
2. Completar satisfactoriamente todos los ejercicios de los 5 niveles.
3. Entregar y aprobar el Proyecto Final (Capstone).

### Test de Conocimientos (Ejemplos)
*(El instructor debe generar un cuestionario de 15 preguntas cubriendo OWASP Top 10, Criptografía básica y Secure SDLC)*.
1. ¿Por qué la validación en el frontend no es suficiente de seguridad?
2. ¿Cuál es la diferencia entre autenticación y autorización?
3. Explique cómo previene SQL Injection el uso de parámetros.
4. ¿Qué es un IDOR y cómo se mitiga?
...

## Proyecto Final (Capstone)

**Definición**: Crear (o refactorizar) una API REST "Secure-by-Design" para una gestión de usuarios simple.

**Requisitos**:
1. **Enderspoints**: Registro, Login, Ver Perfil (Propio), Editar Perfil (Propio), Listar Usuarios (Solo Admin).
2. **Controles Obligatorios**:
   - Passwords hasheados con algoritmo robusto (Argon2/Bcrypt).
   - JWT con tiempo de expiración corto y refresh token (opcional) o Sesiones seguras.
   - Protección contra fuerza bruta en login.
   - Validación estricta de todos los inputs (Zod/Joi).
   - Control de Acceso: Un usuario normal NO puede listar usuarios ni editar a otro.
3. **Pipeline**: Incluir un script o paso en CI que ejecute un linter de seguridad o SAST básico (ej. `npm audit`, `eslint-plugin-security`).
4. **Evidencias**: Repositorio con código, README explicando las decisiones de seguridad, y reporte de herramienta SAST limpia.

---
**Nota**: Esta skill evoluciona con las nuevas amenazas. Consulta periódicamente OWASP y actualiza tus conocimientos.
