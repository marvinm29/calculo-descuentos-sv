import { useRegistroSemanal } from '../hooks/useRegistroSemanal';
import { FilaDia } from './FilaDia';
import { TotalesSemana } from './TotalesSemana';
import { lunesDesdeSemanaId, formatearFecha } from './registroTypes';

export function RegistroSemanal() {
  const { semanaId, dias, updateDia } = useRegistroSemanal();

  const lunes = lunesDesdeSemanaId(semanaId);
  const domingo = new Date(lunes);
  domingo.setDate(domingo.getDate() + 6);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          Registro Semanal
        </h2>
        <span className="text-sm text-gray-500">
          {formatearFecha(lunes)} &mdash; {formatearFecha(domingo)}
        </span>
      </div>

      <div className="space-y-2">
        {dias.map((dia, index) => (
          <FilaDia
            key={dia.fecha}
            dia={dia}
            onChange={(updated) => {
              updateDia(index, updated);
            }}
          />
        ))}
      </div>

      <TotalesSemana dias={dias} />
    </section>
  );
}
