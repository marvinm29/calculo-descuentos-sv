# GitHub Copilot Instructions

## Project Context

This is a Salvadoran payroll deductions calculator (ISSS, AFP, Income Tax)
with overtime tracking. It uses React + Vite (frontend) and Express (backend)
in a Turborepo monorepo.

## Instructions

- Use TypeScript strict mode conventions throughout
- Prefer functional components with hooks in React
- Use Zod for input validation in Express routes
- Write tests alongside implementation files (`*.test.ts` / `*.test.tsx`)
- All monetary values are in USD, use `number` type with 2 decimal precision
- Legal rates are defined in `packages/shared/src/tasas.ts` -- always import from there
- Follow the feature-based directory structure documented in `specs/architecture.md`
- Read `specs/tasas-legales.md` before modifying any rate constants

## Commands to Verify Work

Always run these commands after making changes:

```bash
pnpm lint         # ESLint
pnpm check-types  # TypeScript type checking
pnpm test         # Vitest test suite
pnpm build        # Build all packages
```

## Do NOT

- Do not add new npm dependencies without checking if they already exist
- Do not use `any` type -- use `unknown` and proper type narrowing
- Do not modify `packages/shared/src/tasas.ts` without updating `specs/tasas-legales.md`
- Do not create files outside the established directory structure
- Do not use classes for React components -- functional components + hooks only
- Do not mix English and Spanish in variable names -- use English for code,
  Spanish only for legal domain concepts (`isss`, `afp`, `renta`, `aguinaldo`,
  `horasExtra`, `salarioBase`)
