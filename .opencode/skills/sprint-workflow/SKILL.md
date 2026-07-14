---
name: sprint-workflow
description: Cadencia de implementación por sprints para calculoDescuentos. Úsala SIEMPRE que se empiece o termine un sprint, se actualice specs/sprints.md, se vaya a documentar avance, o el usuario confirme o cancele un sprint. Garantiza el gate pnpm lint && pnpm check-types && pnpm test, la documentación en specs/sprints.md al cerrar cada sprint, y la pausa para confirmación del usuario antes de iniciar el siguiente. También cuando el usuario mencione sprint, avance, siguiente, continuar, terminar.
license: MIT
metadata:
  workflow: 7-sprint-cadence
---

# Workflow de sprints — calculoDescuentos

ver `specs/sprints.md` para el plan completo de 7 sprints. Esta skill codifica el **cómo ejecutarlos**.

## Reglas no negociables

1. **Un sprint a la vez.** NUNCA empieces Sprint N+1 sin confirmación explícita del usuario. Es válido responder "Sprint N terminado y documentado, espero confirmación para arrancar el Sprint N+1" y parar.
2. **Plan en `specs/sprints.md`.** Cualquier desviación se documenta en ese archivo, no secisiona en chat sin persisted.
3. **Gate post-cambio obligatorio** antes de declarar un sprint terminado:

   ```bash
   pnpm lint && pnpm check-types && pnpm test
   ```

   Si cualquiera falla, el sprint NO está terminado. Arregla antes de reportar. Si necesitas `--coverage` para verificar umbral > 80% (Sprint 2 en adelante), agrégalo.

4. **Documento cierre del sprint** en `specs/sprints.md`:
   - Marca la fila correspondiente en la tabla "Estado de ejecución" (`pendiente` → `completado`).
   - Añade subsección "## Sprint N — <nombre>" con: qué se creó (archivos clave), comandos verificados y su salida resumida, desviaciones del plan, known issues.
5. **No push directo a `main`** ni commit sin pedido expreso del usuario (regla del `AGENTS.md`).
6. **No deps nuevas** sin verificar si ya existen (regla del `AGENTS.md`). Si crees que falta una, propónla y espera respuesta.

## Cadencia por turno de trabajo

Cuando arrancas una sesión y el usuario dice "continúa" o "sigue con el sprint X":

1. **Lee** `specs/sprints.md` (estado de ejecución) y el `AGENTS.md` para recordar el convenio.
2. **Confirma** verbalmente qué sprint vas a retomar y lo que falta.
3. **Ejecuta** los TODO del sprint, llamando las skills relevantes (sv-legal-calc, react-vite-tailwind4, vitest-rtl-supertest) según el sprint.
4. **Verifica** con el gate `pnpm lint && pnpm check-types && pnpm test`.
5. **Documanda** el cierre en `specs/sprints.md`.
6. **Reporta** al usuario y para. No arranques el siguiente.

## Trigger de parada

Detente inmediatamente y pregunta al usuario si:

- Encuentras ambigüedad que el `AGENTS.md` y las specs no resuelven.
- Una dependencia nueva parece necesaria.
- El gate falla por algo no trivial (no por typos fáciles).
- El plan del sprint choca con una restricción del repo (ej. "no archivos fuera de `apps/`, `packages/`").

## Flujo si el usuario cancela o pivota

- Marca el sprint como `en-progreso` o `cancelado` (no `completado`).
- Anota el motivo en `specs/sprints.md`.
- No borres trabajo parcial sin confirmación.

## Cierre de todos los sprints

Al cerrar el Sprint 7:

- Verifica que `pnpm turbo run build --filter=web` produce `apps/web/dist` válido (deploy GitHub Pages).
- Verifica que el build de `apps/api` no rompe (`pnpm build`).
- Confirma coverage global > 80%.
- Reporta feature-complete RF01–RF10.