# Requerimientos - Calculadora de Descuentos de Ley SV

> Basado en SWEBOK Chapter 1: Software Requirements
> Cada requerimiento funcional incluye criterios de aceptacion verificables.

## Requisitos Funcionales

### RF01 - Configuracion Inicial

El usuario debe poder configurar:
- Salario base mensual (USD)
- Tipo de pago (mensual / quincenal)
- Antiguedad laboral (menos de 1 ano / 1-3 anos / 3-9 anos / 10+ anos)
- Fecha de ingreso a la empresa

**Criterios de aceptacion:**
- [ ] El formulario valida que el salario sea un numero positivo
- [ ] La seleccion de tipo de pago cambia los calculos (quincenal = /2)
- [ ] La antiguedad seleccionada determina los dias de aguinaldo
- [ ] Los datos de configuracion persisten en localStorage

### RF02 - Registro Semanal de Horas

El usuario debe poder registrar por cada dia de la semana (Lun-Dom):
- Tipo de jornada base: regular diurna, regular nocturna, descanso, asueto
- Horas trabajadas en la jornada base
- Horas extra diurnas (exceso sobre jornada regular)
- Horas extra nocturnas (exceso sobre jornada regular)
- Horas trabajadas en dia libre (diurnas/nocturnas)
- Horas trabajadas en dia de asueto festivo

**Criterios de aceptacion:**
- [ ] Interfaz de calendario semanal con navegacion entre semanas
- [ ] Por cada dia se puede seleccionar el tipo y las horas
- [ ] Se muestran los totales semanales en tiempo real
- [ ] Los datos se guardan automaticamente en localStorage
- [ ] Se puede navegar a semanas anteriores y ver su registro

### RF03 - Calculo de Pago de Horas Extra

El sistema debe calcular automaticamente el pago segun el Codigo de Trabajo:

| Tipo | Factor | Base Legal |
|------|--------|------------|
| Extra diurna | 2.00x | Art. 169 CT |
| Extra nocturna | 2.25x | Art. 168+169 CT |
| Dia libre diurna | 1.50x | Art. 173 CT |
| Dia libre nocturna | 1.75x | Art. 168+173 CT |
| Dia de asueto | 2.00x | Estandar laboral |

**Criterios de aceptacion:**
- [ ] El salario por hora se calcula como `salarioBase / 30 / 8`
- [ ] Cada tipo de hora usa su factor correcto
- [ ] La jornada nocturna base incluye 25% de nocturnidad (Art. 168)
- [ ] Los calculos coinciden con los de `misalariosv.com/horas-extra`

### RF04 - Calculo de Descuentos de Ley

El sistema debe calcular automaticamente:

**ISSS (Instituto Salvadoreno del Seguro Social):**
- 3% del salario bruto mensual asegurable
- Tope maximo: $1,000/mes ($30.00 max descuento laboral)

**AFP (Sistema de Pensiones):**
- 7.25% del salario bruto mensual cotizable
- Tope maximo: ~$6,843.48/mes

**Renta (Impuesto sobre la Renta):**
- Tabla progresiva mensual Art. 37 LISR
- Base gravable = salario bruto - ISSS - AFP
- Aplicar tramo correspondiente

**Criterios de aceptacion:**
- [ ] ISSS no excede $30.00 en ningun caso
- [ ] AFP no excede el tope maximo de cotizacion
- [ ] La renta se calcula correctamente para cada tramo
- [ ] Los resultados coinciden con `misalariosv.com`

### RF05 - Calculo de Prestaciones

**Aguinaldo (Art. 198-200 CT):**
- 15 dias (1-3 anos), 19 dias (3-9 anos), 21 dias (10+ anos)
- Proporcional si antiguedad < 1 ano

**Vacaciones (Art. 177 CT):**
- 30% del salario quincenal antes de descuentos

**Quincena 25:**
- 50% del salario mensual (empleados con salario <= $1,500)
- Obligatorio sector publico, opcional privado 2026

**Criterios de aceptacion:**
- [ ] El aguinaldo proporcional se calcula sobre el tiempo exacto laborado
- [ ] El bono de vacaciones es el 30% del salario de 15 dias
- [ ] La Quincena 25 solo aparece si el salario es <= $1,500

### RF06 - Resumen del Periodo

Mostrar desglose completo en una tabla:
- Salario base del periodo
- Pago por cada tipo de hora extra (desglosado)
- Total bruto
- Cada descuento (ISSS, AFP, Renta) con formula y monto
- Cada prestacion calculada
- Salario neto liquido

**Criterios de aceptacion:**
- [ ] El desglose muestra el detalle de cada calculo
- [ ] Se indica la formula o % aplicado en cada linea
- [ ] El salario neto es la resta correcta de bruto - descuentos

### RF07 - Grafico de Distribucion

Mostrar grafico tipo pastel/ring con la distribucion del salario bruto:
- Salario neto (despues de descuentos)
- ISSS
- AFP
- Renta

**Criterios de aceptacion:**
- [ ] El grafico muestra porcentajes correctos
- [ ] Los colores son accesibles (contraste adecuado)
- [ ] Leyenda clara con montos en USD

### RF08 - Tabla de Tasas de Referencia

Mostrar tabla con las tasas vigentes y enlaces a fuentes oficiales.

**Criterios de aceptacion:**
- [ ] Cada tasa tiene su enlace a fuente .gob.sv verificable
- [ ] La tabla incluye fecha de ultima actualizacion
- [ ] Se indica que es responsabilidad del usuario verificar vigencia

### RF09 - Persistencia Local (localStorage)

- Los registros semanales se guardan automaticamente
- Permitir ver historial de periodos anteriores
- Permitir eliminar periodos guardados
- Los datos de configuracion inicial tambien persisten

**Criterios de aceptacion:**
- [ ] Al recargar la pagina, los datos se restauran
- [ ] El historial muestra fecha y monto neto de cada periodo
- [ ] Se puede eliminar un periodo del historial
- [ ] Los datos no se envian a ningun servidor externo

### RF10 - Exportacion

Permitir exportar el resumen del periodo como PDF o imprimir.

**Criterios de aceptacion:**
- [ ] El PDF incluye todos los datos del resumen
- [ ] El formato es legible y profesional
- [ ] Alternativa: impresion directa del navegador (window.print)

---

## Requisitos No Funcionales

### RNF01 - Rendimiento
- Tiempo de respuesta API < 200ms (p95)
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Lighthouse Performance score > 90

### RNF02 - Accesibilidad
- Cumplir WCAG 2.1 Nivel AA
- Navegacion completa por teclado
- Textos alternativos en elementos visuales
- Contraste adecuado (ratio minimo 4.5:1)

### RNF03 - Responsive Design
- Mobile-first: la aplicacion debe funcionar en dispositivos moviles
- Breakpoints: 320px, 640px, 768px, 1024px, 1280px
- La tabla de registro semanal debe ser usable en pantallas pequenas

### RNF04 - Seguridad
- Validacion de inputs en frontend y backend (Zod)
- CORS configurado correctamente en Express
- Sanitizacion de datos de entrada
- Rate limiting en API (max 100 req/min)
- HTTPS en produccion (Render y GitHub Pages lo proveen)

### RNF05 - Mantenibilidad
- TypeScript strict mode en todos los paquetes
- Cobertura de tests > 80% en logica de negocio
- Documentacion de API con tipos explicitos
- Codigo documentado con JSDoc en funciones publicas

### RNF06 - Disponibilidad
- Frontend: GitHub Pages (SLA > 99.9%)
- Backend: Render free tier (spin-down en inactividad)
- Modo offline: calculos funcionan sin backend (logica duplicada)

---

## Matriz de Trazabilidad

| Requerimiento | Prioridad | Componente | Criterio de Verificacion |
|---------------|-----------|------------|--------------------------|
| RF01 | Alta | ConfigInicial.tsx | Formulario valida y persiste |
| RF02 | Alta | RegistroSemanal.tsx | CRUD semanal con localStorage |
| RF03 | Alta | horasExtra.ts (shared) | Tests unitarios con valores conocidos |
| RF04 | Alta | descuentos.ts (shared) | Tests vs misalariosv.com |
| RF05 | Media | prestaciones.ts (shared) | Tests con casos borde |
| RF06 | Alta | ResultadoNeto.tsx | Desglose numerico correcto |
| RF07 | Media | GraficoPastel.tsx | Porcentajes y colores correctos |
| RF08 | Baja | TablaTasas.tsx | Links funcionales a .gob.sv |
| RF09 | Media | useLocalStorage.ts | CRUD persistente |
| RF10 | Baja | ExportarPDF.tsx | PDF generado correctamente |
