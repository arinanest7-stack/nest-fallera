# Modularización y Escalabilidad

Al crear nuevas funcionalidades, realizar refactorizaciones o modificar código existente, se deberá mantener una estructura modular, escalable y fácil de mantener.

El objetivo de esta regla es evitar archivos monolíticos, reducir efectos colaterales entre funcionalidades y facilitar la evolución del proyecto a largo plazo.

---

### 1. Evitar archivos monolíticos

No se debe acumular lógica excesiva en un único archivo.

Los límites de líneas deben entenderse como señales de revisión, no como reglas rígidas:

- Si un archivo supera las **150-200 líneas**, se debe revisar si mantiene una única responsabilidad clara.
- Si un archivo supera las **300 líneas**, se debe evaluar obligatoriamente si conviene extraer componentes, hooks, servicios, utilidades, tipos, constantes o lógica auxiliar.
- Superar las 300 líneas no implica dividir automáticamente el archivo, pero sí exige justificar que sigue siendo cohesivo, legible y mantenible.
- No se deben permitir archivos de gran tamaño que mezclen UI, estado complejo, lógica de negocio, llamadas API, validaciones, tipos, constantes y transformación de datos en el mismo sitio.

La prioridad no es cumplir un número exacto de líneas, sino evitar archivos difíciles de entender, probar y modificar sin provocar efectos colaterales.

### Criterio de excepción

Un archivo puede superar el umbral recomendado cuando:

- Tiene una única responsabilidad clara.
- No mezcla capas distintas de la aplicación.
- Su división artificial empeoraría la comprensión.
- No contiene lógica duplicada.
- No provoca dependencias circulares.
- Es fácil de probar, revisar y mantener.

En estos casos, no se debe fragmentar el archivo solo por reducir líneas.
---

## 2. Separación clara de responsabilidades

Cada archivo debe tener una responsabilidad principal y fácilmente identificable.

Ejemplos:

- Un componente debe encargarse principalmente de la presentación o interacción de UI.
- Un hook debe encapsular lógica de estado, efectos o comportamiento reutilizable.
- Un servicio debe centralizar llamadas a API o comunicación externa.
- Un archivo de tipos debe contener interfaces, tipos o modelos.
- Un archivo de utilidades debe contener funciones puras y reutilizables.
- Un archivo de constantes debe contener valores fijos, opciones o configuraciones simples.
- Un archivo de mappers debe transformar datos entre API, dominio y UI.
- Un archivo de validación debe contener reglas de validación o esquemas.

No se debe mezclar lógica de distintas capas en el mismo archivo salvo que sea algo muy pequeño, puntual y justificado.

---

## 3. Organización por módulos o funcionalidades

La estructura del código debe organizarse preferiblemente por dominio, módulo o funcionalidad, no únicamente por tipo técnico.

Ejemplo recomendado:

```text
feature-name/
  components/
  hooks/
  services/
  utils/
  types/
  constants/
  schemas/
  mappers/
  index.ts
```

Esta estructura permite que cada funcionalidad tenga su propia organización interna y evita que carpetas globales como `components/`, `utils/` o `services/` se conviertan en contenedores desordenados.

---

## 4. Uso controlado de carpetas compartidas

Solo se debe mover código a carpetas globales o compartidas cuando realmente sea reutilizado por varios módulos.

Antes de crear o mover algo a una carpeta común, se debe comprobar:

- Si pertenece solo a una funcionalidad concreta.
- Si realmente será reutilizado por más de un módulo.
- Si al moverlo a una carpeta global aumenta o reduce la claridad.
- Si puede generar dependencias incompatibles entre módulos.
- Si existe ya una utilidad, tipo, componente o servicio equivalente.

La regla general es:

> Primero local al módulo. Después compartido solo si existe una necesidad real.

---

## 5. Extracción progresiva, no refactorización masiva innecesaria

Cuando se corrija un bug o se añada una pequeña mejora, no se debe reescribir un módulo completo salvo que sea necesario.

La modularización debe hacerse de forma segura y progresiva:

- Extraer solo la parte relacionada con el cambio.
- Evitar tocar código no relacionado.
- Mantener el comportamiento existente.
- Reducir el riesgo de introducir errores nuevos.
- Proponer una refactorización técnica separada si el archivo es demasiado grande pero el cambio actual no requiere tocarlo entero.

Si se detecta un archivo muy grande, se puede dividir en fases de refactorización en lugar de intentar resolverlo todo en un único cambio.

---

## 6. Barrels e interfaces públicas del módulo

Se pueden usar archivos `index.ts` para exponer la API pública de un módulo o subcarpeta.

Sin embargo:

- No deben exportar detalles internos innecesarios.
- No deben usarse para ocultar una mala estructura.
- No deben provocar dependencias circulares.
- Deben facilitar imports más limpios sin dificultar la trazabilidad del código.
- Deben exponer únicamente aquello que otros módulos necesitan consumir.

El archivo `index.ts` debe actuar como punto de entrada limpio y controlado, no como una exportación masiva de todo el contenido interno.

---

## 7. Evitar duplicación de lógica

Antes de crear una nueva función, componente, tipo, constante o servicio, se debe revisar si ya existe algo similar en el módulo o en una carpeta compartida.

No se debe duplicar innecesariamente:

- Tipos de datos.
- Validaciones.
- Llamadas a API.
- Mappers.
- Constantes.
- Componentes equivalentes.
- Lógica de permisos.
- Lógica de estados.
- Funciones auxiliares reutilizables.

Si existe código similar, se debe reutilizar, adaptar o extraer una abstracción común cuando tenga sentido.

No obstante, se debe evitar crear abstracciones prematuras si el código todavía no tiene una reutilización clara.

---

## 8. Mantener bajo acoplamiento entre módulos

Un módulo no debe depender innecesariamente de detalles internos de otro módulo.

Se debe evitar:

- Importar archivos internos profundos de otras funcionalidades.
- Compartir estados de forma desordenada.
- Crear dependencias circulares.
- Mezclar reglas de negocio de módulos distintos.
- Hacer que un módulo dependa de estructuras internas que podrían cambiar.

Cada módulo debe poder evolucionar con el menor impacto posible sobre el resto de la aplicación.

---

## 9. Refactorizar sin cambiar comportamiento

Una refactorización estructural no debe modificar la lógica funcional salvo que se indique expresamente.

Después de modularizar, se debe comprobar que:

- La funcionalidad sigue comportándose igual.
- No se han cambiado validaciones sin querer.
- No se han alterado permisos, estados o flujos.
- No se han roto llamadas a API.
- No se han introducido regresiones visuales o funcionales.
- No se han modificado contratos de datos sin necesidad.

Si durante la refactorización se detecta un bug o mejora funcional, debe documentarse como cambio separado o solicitar confirmación antes de incluirlo.

---

## 10. Validación obligatoria tras cambios

Después de crear o modificar código siguiendo esta regla, se debe validar:

- Que los archivos modificados siguen teniendo responsabilidades claras.
- Que ningún archivo nuevo nace ya con demasiada complejidad.
- Que no existen imports circulares.
- Que no se ha duplicado lógica existente.
- Que el flujo afectado funciona correctamente.
- Que los cambios son fáciles de revisar en Git.
- Que se han mantenido los patrones existentes del proyecto.
- Que no se han introducido dependencias innecesarias.

Siempre que sea posible, se deberán ejecutar las pruebas, linters o comprobaciones disponibles en el proyecto.

---

## 11. Criterio práctico de decisión

Antes de añadir código a un archivo existente, se deben plantear estas preguntas:

- ¿Este código pertenece realmente a este archivo?
- ¿Estoy mezclando responsabilidades?
- ¿Este archivo ya está creciendo demasiado?
- ¿Esto se puede extraer a un componente, hook, servicio, utilidad, tipo, mapper o constante?
- ¿Estoy tocando partes no relacionadas con la tarea?
- ¿Este cambio será fácil de entender dentro de tres meses?
- ¿Estoy duplicando algo que ya existe?
- ¿Estoy creando una dependencia innecesaria entre módulos?
- ¿La estructura resultante será fácil de probar y mantener?

Si la respuesta indica complejidad innecesaria, se debe modularizar.

---

## 12. Reglas específicas para nuevas funcionalidades

Toda nueva funcionalidad debe crearse desde el inicio con una estructura modular.

Al iniciar una nueva funcionalidad:

- Crear una carpeta propia para el módulo o dominio cuando tenga entidad suficiente.
- Separar componentes visuales de lógica de estado.
- Separar llamadas a API de componentes de UI.
- Centralizar tipos, constantes y validaciones.
- Evitar que el archivo principal de la pantalla o módulo acumule toda la lógica.
- Mantener los componentes principales como orquestadores simples.

El archivo principal de una página o módulo debería coordinar el flujo, no contener todos los detalles internos.

---

## 13. Reglas específicas para modificaciones sobre código existente

Cuando se trabaje sobre código existente:

- Respetar la estructura modular ya aplicada en esa zona del proyecto.
- No introducir nuevos patrones si el módulo ya tiene una convención clara.
- Si un archivo es demasiado grande, extraer únicamente la parte relacionada con el cambio.
- No mezclar una corrección funcional con una refactorización extensa salvo que sea necesario.
- Documentar cualquier separación importante de responsabilidades.

El objetivo es mejorar la estructura sin aumentar el riesgo de regresiones.

---

## 14. Objetivo final

La estructura del proyecto debe favorecer:

- Mantenimiento sencillo.
- Menos errores colaterales.
- Mayor facilidad para probar funcionalidades.
- Mejor legibilidad.
- Menos conflictos de Git.
- Refactorizaciones más seguras.
- Desarrollo escalable a largo plazo.
- Mejor colaboración entre desarrolladores.
- Mayor control sobre cambios realizados por herramientas de IA.

La modularización no consiste en crear muchos archivos pequeños sin criterio, sino en separar responsabilidades de forma clara, coherente y mantenible.
