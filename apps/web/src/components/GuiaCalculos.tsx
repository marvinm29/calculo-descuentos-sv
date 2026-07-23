const SECTIONS = [
  {
    id: 'salario-hora',
    title: 'Salario por Hora',
    formula: 'salarioDiario = salarioMensual / 30',
    formula2: 'salarioHora = salarioDiario / 8',
    example: { salario: 800, diario: 26.67, hora: 3.33 },
    desc: 'Se divide el salario mensual entre 30 días para obtener el salario diario, luego entre 8 horas para obtener el salario por hora (Art. 168 CT).',
  },
  {
    id: 'recargo-nocturnidad',
    title: 'Recargo de Nocturnidad (Art. 168 CT)',
    formula: 'recargo = horasBaseNocturnas × salarioHora × 25%',
    example: { salario: 250, hora: 1.04, recargo: 0.26, total: 1.30 },
    desc: 'El recargo nocturno es un adicional del 25% sobre el salario por hora diurna. Se aplica a las horas base trabajadas en jornada nocturna. Es un recargo aditivo, no reemplaza el salario base. Ejemplo MTPS: $1.04 + $0.26 = $1.30.',
  },
  {
    id: 'incentivos',
    title: 'Incentivos (Bonos, Comisiones)',
    desc: 'Los bonos y comisiones habituales forman parte del salario y están sujetos a cotización de ISSS/AFP e ISR (LISR Art. 3). Por defecto, los incentivos se marcan como sujetos a descuentos de ley. Si se marca "No aplica descuentos", se suman al bruto total sin cotizar.',
  },
  {
    id: 'horas-extra',
    title: 'Horas Extra',
    desc: 'Las horas extras se pagan con factores adicionales sobre el salario por hora, según el Art. 168-173 del Código de Trabajo.',
    table: [
      { tipo: 'Extra diurna', factor: '2.00x', formula: 'salarioHora × 2.00' },
      { tipo: 'Extra nocturna', factor: '2.25x', formula: 'salarioHora × 2.25' },
      { tipo: 'Día libre diurna', factor: '1.50x', formula: 'salarioHora × 1.50' },
      { tipo: 'Día libre nocturna', factor: '1.75x', formula: 'salarioHora × 1.75' },
      { tipo: 'Asueto', factor: '2.00x', formula: 'salarioHora × 2.00' },
    ],
  },
  {
    id: 'isss',
    title: 'ISSS (Seguro Social)',
    formula: 'descuento = min(salarioBruto, $1,000.00) × 3%',
    example: { salario: 800, asegurable: 800, descuento: 24 },
    desc: 'El ISSS es el 3% del salario, con un tope máximo de descuento de $30.00 mensuales (salario asegurable máximo $1,000.00). Ley del Seguro Social.',
  },
  {
    id: 'afp',
    title: 'AFP (Fondo de Pensiones)',
    formula: 'descuento = min(salarioBruto, $6,843.48) × 7.25%',
    example: { salario: 800, cotizable: 800, descuento: 58 },
    desc: 'La AFP es el 7.25% del salario, con un tope de cotización de $6,843.48 mensuales. Art. 16 LISP.',
  },
  {
    id: 'renta',
    title: 'Renta (ISR)',
    desc: 'Se calcula sobre la base gravable (salario bruto - ISSS - AFP). Tabla progresiva por tramos según Art. 37 LISR (D.L. 293, 2025).',
    table: [
      { tipo: 'Tramo I', desde: '$0.00', hasta: '$550.00', cuota: '$0.00', exceso: '0%' },
      { tipo: 'Tramo II', desde: '$550.01', hasta: '$895.24', cuota: '$17.67', exceso: '10%' },
      { tipo: 'Tramo III', desde: '$895.25', hasta: '$2,038.10', cuota: '$60.00', exceso: '20%' },
      { tipo: 'Tramo IV', desde: '$2,038.11', hasta: '—', cuota: '$288.57', exceso: '30%' },
    ],
    formulaRenta:
      'baseGravable = salarioBruto - ISSS - AFP\nTramo II: (base - $550.00) × 10% + $17.67\nTramo III: (base - $895.24) × 20% + $60.00\nTramo IV: (base - $2,038.10) × 30% + $288.57',
    example: { salario: 800, isss: 24, afp: 58, base: 718, tramo: 'II', renta: 34.47 },
  },
  {
    id: 'aguinaldo',
    title: 'Aguinaldo',
    desc: 'Según Art. 198-200 CT. Se calcula con días de salario según antigüedad, sobre el salario base (sin extras).',
    table: [
      { tipo: 'Menos de 1 año', factor: 'Proporcional', formula: '(días / 365) × 15 × salarioDiario' },
      { tipo: '1 a 3 años', factor: '15 días', formula: '15 × salarioDiario' },
      { tipo: '3 a 9 años', factor: '19 días', formula: '19 × salarioDiario' },
      { tipo: '10+ años', factor: '21 días', formula: '21 × salarioDiario' },
    ],
  },
  {
    id: 'vacaciones',
    title: 'Vacaciones',
    formula: '15 días × salarioDiario + 30% bono vacacional',
    desc: 'El trabajador tiene derecho a 15 días de vacaciones pagadas, más un bono del 30% del monto vacacional. No sujeto a ISSS/AFP/Renta (Art. 177 CT).',
    example: { salario: 800, monto: 400, bono: 120, total: 520 },
  },
  {
    id: 'quincena25',
    title: 'Quincena 25',
    formula: 'monto = salarioMensual × 50% (si salario ≤ $1,500)',
    desc: 'Aplica solo para salarios mensuales de hasta $1,500. Es el 50% del salario mensual. No sujeto a descuentos. Obligatorio en el sector público.',
  },
];

function FlowDiagram() {
  return (
    <div className="glass-card rounded-xl p-4 mb-6 overflow-x-auto">
      <h3 className="text-sm font-bold text-text mb-4">
        Diagrama del Cálculo
      </h3>
      <div className="flex items-start gap-0 min-w-[600px]">
        <FlowNode label="Salario Base" color="bg-primary" top />
        <FlowArrow />
        <FlowNodeGroup label="Extras + Recargo" items={['HE Diurna', 'HE Nocturna', 'Recargo 25%', 'Incentivos']} color="bg-accent" />
        <FlowArrow />
        <FlowNode label="Salario Bruto" color="bg-primary" top />
        <FlowArrow />
        <FlowSplit
          left={<FlowNodeSub label="ISSS 3%" color="bg-danger" />}
          right={<FlowNodeSub label="AFP 7.25%" color="bg-warning" />}
        />
        <FlowArrow />
        <FlowNode label="Base Gravable" color="bg-primary" top />
        <FlowArrow />
        <FlowNode label="Renta" color="bg-danger" top />
        <FlowArrow />
        <FlowNodeGroupExt
          label="Neto Líquido"
          items={['Bruto − ISSS − AFP − Renta']}
          color="bg-success"
        />
        <FlowArrow />
        <FlowNodeGroupExt
          label="Prestaciones"
          items={['Aguinaldo', 'Vacaciones', 'Quincena 25']}
          color="bg-success"
        />
      </div>
    </div>
  );
}

function FlowNode({ label, color, top }: { label: string; color: string; top?: boolean }) {
  return (
    <div className={`flex flex-col items-center ${top ? 'mt-0' : 'mt-8'}`}>
      <div className={`${color} text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-sm`}>
        {label}
      </div>
    </div>
  );
}

function FlowNodeSub({ label, color }: { label: string; color: string }) {
  return (
    <div className={`${color} text-white text-[9px] font-medium px-2 py-1 rounded-lg whitespace-nowrap shadow-sm`}>
      {label}
    </div>
  );
}

function FlowNodeGroup({ label, items, color }: { label: string; items: string[]; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[9px] font-semibold text-text-secondary">{label}</span>
      <div className="flex gap-1">
        {items.map((item) => (
          <div key={item} className={`${color} text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-sm`}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function FlowNodeGroupExt({ label, items, color }: { label: string; items: string[]; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[9px] font-semibold text-text-secondary">{label}</span>
      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <div key={item} className={`${color} text-white text-[9px] font-bold px-2 py-1 rounded-lg whitespace-nowrap shadow-sm`}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="flex items-center mt-2.5 px-1">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-text-muted shrink-0">
        <path d="M3 10h12M11 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function FlowSplit({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1 mt-2">
      <div className="flex gap-1">
        {left}
        {right}
      </div>
    </div>
  );
}

export function GuiaCalculos() {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-text">
        Guía de Cálculos
      </h2>

      <p className="text-xs text-text-secondary leading-relaxed">
        Esta calculadora aplica las tasas vigentes de ISSS, AFP y Renta según la legislación
        salvadoreña actualizada a Julio 2026. A continuación se explica cada cálculo con
        fórmulas y ejemplos.
      </p>

      <FlowDiagram />

      <div className="space-y-3">
        {SECTIONS.map((s) => (
          <div key={s.id} id={s.id} className="glass-card rounded-xl p-4 scroll-mt-4">
            <h3 className="text-sm font-bold text-text mb-2">{s.title}</h3>

            {s.desc && (
              <p className="text-xs text-text-secondary mb-3 leading-relaxed">{s.desc}</p>
            )}

            {s.formula && (
              <div className="mb-2">
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">Fórmula</span>
                <pre className="mt-1 glass-card rounded-lg px-3 py-2 text-xs font-mono text-primary leading-relaxed">
                  {s.formula}
                </pre>
              </div>
            )}

            {s.formula2 && (
              <div className="mb-2">
                <pre className="glass-card rounded-lg px-3 py-2 text-xs font-mono text-primary leading-relaxed">
                  {s.formula2}
                </pre>
              </div>
            )}

            {s.formulaRenta && (
              <div className="mb-2">
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">Fórmula</span>
                <pre className="mt-1 glass-card rounded-lg px-3 py-2 text-xs font-mono text-primary leading-relaxed">
                  {s.formulaRenta}
                </pre>
              </div>
            )}

            {s.example && (
              <div className="mb-3">
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">Ejemplo</span>
                <div className="mt-1 glass-card rounded-lg px-3 py-2 text-xs text-text-secondary leading-relaxed">
                  {(() => {
                    const ex = s.example as Record<string, unknown> | undefined;
                    if (!ex) return null;
                    if (s.id === 'salario-hora') return <>Salario ${ex['salario']}/mes → salario diario = ${Number(ex['diario']).toFixed(2)} → salario/hora = ${Number(ex['hora']).toFixed(2)}</>;

                    if (s.id === 'isss') return <>Salario ${ex['salario']} → asegurable ${ex['asegurable']} × 3% = ${Number(ex['descuento']).toFixed(2)}</>;
                    if (s.id === 'afp') return <>Salario ${ex['salario']} → cotizable ${ex['cotizable']} × 7.25% = ${Number(ex['descuento']).toFixed(2)}</>;
                    if (s.id === 'renta') return <>Salario ${ex['salario']} − ISSS ${ex['isss']} − AFP ${ex['afp']} = base ${ex['base']} (Tramo {ex['tramo']}) → Renta = ${Number(ex['renta']).toFixed(2)}</>;
                    if (s.id === 'vacaciones') return <>Salario ${ex['salario']} → 15 días = ${Number(ex['monto']).toFixed(2)} + bono 30% = ${Number(ex['bono']).toFixed(2)} → Total = ${Number(ex['total']).toFixed(2)}</>;
                    return null;
                  })()}
                </div>
              </div>
            )}

            {s.table && (
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] text-text-secondary">
                  <thead>
                    <tr className="border-b border-border text-left">
                      {Object.keys(s.table[0]!).map((key) => (
                        <th key={key} className="py-1 pr-2 font-bold text-text-muted uppercase tracking-wide text-[10px]">
                          {key === 'tipo' ? 'Tipo' : key === 'desde' ? 'Desde' : key === 'hasta' ? 'Hasta' : key === 'cuota' ? 'Cuota Fija' : key === 'exceso' ? '% Exceso' : key === 'factor' ? 'Factor' : key === 'formula' ? 'Fórmula' : key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.table.map((row, i) => (
                      <tr key={i} className="border-b border-border-light">
                        {Object.values(row).map((val, j) => (
                          <td key={j} className={`py-1 pr-2 ${j === 0 ? 'font-semibold text-text' : ''}`}>
                            {row.tipo && j === Object.keys(row).indexOf('formula') ? (
                              <code className="text-primary text-[10px]">{val}</code>
                            ) : (
                              val
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-[10px] text-text-muted text-center pt-2">
        Tasas actualizadas a Julio 2026. Verificar vigencia en fuentes oficiales.
      </p>
    </section>
  );
}
