const TASAS = [
  {
    concepto: 'ISSS (Trabajador)',
    valor: '3.00%',
    detalle: 'Tope mensual $1,000.00 — descuento máx $30.00',
    fuente: 'Ley del Seguro Social',
    url: 'https://www.isss.gob.sv',
  },
  {
    concepto: 'AFP (Trabajador)',
    valor: '7.25%',
    detalle: 'Tope mensual $6,843.48',
    fuente: 'Art. 16 LISP',
    url: 'https://ssf.gob.sv',
  },
  {
    concepto: 'Renta — Tramo I',
    valor: 'Exento',
    detalle: 'Base gravable hasta $550.00',
    fuente: 'Art. 37 LISR (D.L. 293, D.O. Tomo 447, 30/04/2025)',
    url: 'https://www.mh.gob.sv',
  },
  {
    concepto: 'Renta — Tramo II',
    valor: '10% + $17.67',
    detalle: 'Base gravable de $550.01 a $895.24',
    fuente: 'Art. 37 LISR',
    url: 'https://www.diariooficial.gob.sv',
  },
  {
    concepto: 'Renta — Tramo III',
    valor: '20% + $60.00',
    detalle: 'Base gravable de $895.25 a $2,038.10',
    fuente: 'Art. 37 LISR',
    url: 'https://www.diariooficial.gob.sv',
  },
  {
    concepto: 'Renta — Tramo IV',
    valor: '30% + $288.57',
    detalle: 'Base gravable desde $2,038.11',
    fuente: 'Art. 37 LISR',
    url: 'https://www.diariooficial.gob.sv',
  },
  {
    concepto: 'Aguinaldo 1–3 años',
    valor: '15 días',
    detalle: 'Proporcional si antigüedad < 1 año',
    fuente: 'Art. 198 CT',
    url: 'https://www.mtps.gob.sv',
  },
  {
    concepto: 'Aguinaldo 3–9 años',
    valor: '19 días',
    detalle: '',
    fuente: 'Art. 198 CT',
    url: 'https://www.mtps.gob.sv',
  },
  {
    concepto: 'Aguinaldo 10+ años',
    valor: '21 días',
    detalle: '',
    fuente: 'Art. 198 CT',
    url: 'https://www.mtps.gob.sv',
  },
  {
    concepto: 'Vacaciones (bono)',
    valor: '30%',
    detalle: '30% del salario de 15 días',
    fuente: 'Art. 177 CT',
    url: 'https://www.mtps.gob.sv',
  },
  {
    concepto: 'Quincena 25',
    valor: '50%',
    detalle: 'Salario ≤ $1,500. Obligatorio sector público.',
    fuente: 'Ley Quincena 25',
    url: 'https://www.mtps.gob.sv',
  },
];

export function TablaTasas() {
  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="text-sm font-bold text-text">
        Tasas de Referencia Vigentes
      </h3>
      <p className="mt-1 text-xs text-text-muted">
        Última actualización: Julio 2026. Verificar vigencia en
        fuentes oficiales.
      </p>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-xs text-text-secondary">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-1.5 pr-2 font-bold">Concepto</th>
              <th className="py-1.5 pr-2 font-bold">Valor</th>
              <th className="py-1.5 pr-2 font-bold">Detalle</th>
              <th className="py-1.5 font-bold">Fuente</th>
            </tr>
          </thead>
          <tbody>
            {TASAS.map((t) => (
              <tr key={t.concepto} className="border-b border-border-light">
                <td className="py-1.5 pr-2">{t.concepto}</td>
                <td className="py-1.5 pr-2 font-mono font-semibold">{t.valor}</td>
                <td className="py-1.5 pr-2">{t.detalle}</td>
                <td className="py-1.5">
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-light underline underline-offset-2"
                  >
                    {t.fuente}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
