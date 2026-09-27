# Guía de agentes de IA

Estado: vigente desde 2026-09-20. Esta guía complementa, pero no reemplaza, `AGENTS.md`.

## Orden de autoridad

1. `AGENTS.md`: contrato operativo, comandos, arquitectura e invariantes.
2. `openspec/specs/*.md`: comportamiento requerido y criterios de aceptación.
3. `.agents/adr/*.md`: decisiones arquitectónicas y de diseño; el ADR más reciente puede
   superseder uno anterior, pero debe conservar el enlace y la razón.
4. `apps/*/DESIGN.md`, `CONTEXT.md`, `specs/*` y README: implementación y vocabulario.
5. `docs/sesion-*.md`: registro histórico solamente, nunca instrucciones normativas.

Si dos fuentes discrepan, detener la implementación, registrar la discrepancia y actualizar la
fuente de mayor autoridad antes de continuar. No resolver contradicciones copiando una tercera
versión en el código.

## Ciclo de trabajo

1. **Descubrir**: inspeccionar el árbol, scripts, consumidores, riesgos y estado de git. No
   modificar producción ni datos durante la inspección.
2. **Especificar**: formular el problema, causa, riesgo, invariantes, no-alcance y criterios de
   aceptación. Para cambios de UX incluir usuarios, contexto móvil/escritorio y accesibilidad.
3. **Diseñar**: elegir la solución mínima, actualizar ADR si cambia una decisión y definir
   estrategia de rollback.
4. **Implementar**: cambios pequeños, tipos estrictos, una fuente de verdad y mensajes de error
   útiles. Validar tanto en cliente como en API cuando el contrato lo requiera.
5. **Verificar**: ejecutar pruebas unitarias, integración, E2E, accesibilidad, rendimiento,
   lint, tipos, auditoría de dependencias y el gate completo proporcional al riesgo.
6. **Documentar**: sincronizar OpenSpec, README, CONTEXT, ADR, CHANGELOG, contratos y notas de
   despliegue. Marcar decisiones antiguas como supersedidas, no borrarlas sin motivo.
7. **Entregar**: informar archivos, pruebas ejecutadas, resultado, limitaciones y riesgos
   residuales. El usuario debe poder reproducir la evidencia.

## Reglas para cambios asistidos por IA

- No copiar secretos, datos personales, tokens, cookies, prompts privados o logs sensibles a una
  herramienta externa.
- No aceptar una sugerencia generada sin verificar tipos, invariantes, seguridad y regresiones.
- No generar cifras legales, tasas o citas normativas de memoria: usar `packages/shared/src/tasas.ts`
  y `specs/tasas-legales.md` como fuentes, y actualizar ambas cuando cambien.
- No inventar dependencias, scripts, skills ni rutas. Confirmar que existen con `rg --files` y
  `package.json`.
- No declarar conformidad o certificación ISO/IEEE. Este proyecto aplica prácticas seleccionadas;
  una certificación requeriría alcance, auditoría independiente y evidencia formal.
- Cuando se use IA para una decisión de diseño, registrar la decisión, sus alternativas y la
  validación con usuarios o pruebas; una tendencia no sustituye evidencia de usabilidad.

## Documentos que debe producir un cambio relevante

| Tipo de cambio           | Artefactos mínimos                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------- |
| Bug funcional            | Issue/criterio reproducible, causa raíz, test de regresión, CHANGELOG si es visible |
| Contrato o dominio       | OpenSpec, fixtures, pruebas API/UI, `specs/api-contract.md`, ADR si aplica          |
| Persistencia             | schema Zod, migración/fallback, prueba de datos corruptos, aviso de UX              |
| Diseño frontend          | OpenSpec visual, tokens, estados, teclado/lector, snapshots o evidencia visual      |
| Seguridad                | riesgo, control, prueba negativa, auditoría y rollback                              |
| Dependencia o despliegue | justificación, lockfile, audit, build reproducible y plan de reversión              |

La checklist ejecutable está en [`review-checklist.md`](review-checklist.md). El plan completo de
frontend y su matriz de trazabilidad están en [`../plan-frontend-calidad-sdd.md`](../plan-frontend-calidad-sdd.md).

## Alcance actual

El proyecto no tiene un agente o modelo dentro del producto: la calculadora es una SPA offline-first
y el API es stateless. Estas reglas gobiernan agentes de desarrollo que modifican el repositorio,
no convierten la calculadora en un sistema de IA ni autorizan telemetría de datos salariales.
