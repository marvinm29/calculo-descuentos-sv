# Claude Code — Configuración del proyecto

Este archivo es un índice breve. El contrato completo y vigente está en [`AGENTS.md`](AGENTS.md);
si hay una diferencia, gana `AGENTS.md`, las OpenSpecs vigentes y los ADR aceptados.

Para cualquier cambio estructural, seguir el flujo SDD documentado en
[`docs/ai-agents/README.md`](docs/ai-agents/README.md): spec/ADR antes del código, trazabilidad,
pruebas y documentación sincronizada. No asumir skills o rutas de herramientas que no existan
en el entorno actual.

Verificar siempre con el gate:

```bash
pnpm lint && pnpm check-types && pnpm test
```

Para cambios de frontend también ejecutar `pnpm --filter=@calc/web build`, revisar el presupuesto
de bundle y ejecutar las pruebas de accesibilidad/flujo indicadas en
[`docs/plan-frontend-calidad-sdd.md`](docs/plan-frontend-calidad-sdd.md).
