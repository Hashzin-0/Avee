'use client';

import { useMemo, useState } from 'react';
import type { LayerLineage } from '../farm-builder/technical-recommendations';
import { calculateFlockDashboard, type FlockDailyEntry } from './domain';
import { getLayerAgeReference, getLayerGuideSource, getManagementPhase } from './management-library';

function number(value: number | null | undefined, digits = 1) {
  return value === null || value === undefined || !Number.isFinite(value)
    ? '—'
    : new Intl.NumberFormat('pt-BR', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value);
}

function todayLocal() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

export function FlockMonitoringPanel({ lineage, ageWeeks, defaultBirds }: {
  lineage: LayerLineage;
  ageWeeks: number;
  defaultBirds: number;
}) {
  const [initialBirds, setInitialBirds] = useState(String(defaultBirds));
  const [date, setDate] = useState(todayLocal);
  const [deaths, setDeaths] = useState('0');
  const [culls, setCulls] = useState('0');
  const [feedKg, setFeedKg] = useState('');
  const [waterLiters, setWaterLiters] = useState('');
  const [eggsProduced, setEggsProduced] = useState('');
  const [eggWeight, setEggWeight] = useState('');
  const [bodyWeight, setBodyWeight] = useState('');
  const [entries, setEntries] = useState<FlockDailyEntry[]>([]);
  const [error, setError] = useState('');

  const dashboard = useMemo(() => {
    const count = Number(initialBirds);
    if (!Number.isInteger(count) || count <= 0) return null;
    try { return calculateFlockDashboard(count, entries); } catch { return null; }
  }, [initialBirds, entries]);
  const reference = getLayerAgeReference(lineage, ageWeeks);
  const guide = getLayerGuideSource(lineage);
  const phase = getManagementPhase(ageWeeks);
  const latest = dashboard?.latest ?? null;

  const addEntry = () => {
    const entry: FlockDailyEntry = {
      id: crypto.randomUUID(),
      date,
      deaths: Number(deaths),
      culls: Number(culls),
      feedKg: Number(feedKg),
      waterLiters: Number(waterLiters),
      eggsProduced: Number(eggsProduced),
      averageEggWeightGrams: eggWeight === '' ? undefined : Number(eggWeight),
      averageBodyWeightGrams: bodyWeight === '' ? undefined : Number(bodyWeight),
    };
    try {
      const count = Number(initialBirds);
      if (!Number.isInteger(count) || count <= 0) throw new RangeError('Informe o número inicial de aves alojadas.');
      calculateFlockDashboard(count, [...entries, entry]);
      setEntries((current) => [...current, entry].sort((a, b) => a.date.localeCompare(b.date)));
      setError('');
      setDeaths('0');
      setCulls('0');
      setFeedKg('');
      setWaterLiters('');
      setEggsProduced('');
      setEggWeight('');
      setBodyWeight('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível validar o registro.');
    }
  };

  const feedStatus = latest?.feedGramsPerBirdDay !== null && latest?.feedGramsPerBirdDay !== undefined
    && reference?.dailyFeedMinGrams !== undefined && reference?.dailyFeedMaxGrams !== undefined
    ? latest.feedGramsPerBirdDay < reference.dailyFeedMinGrams ? 'Abaixo da faixa de referência'
      : latest.feedGramsPerBirdDay > reference.dailyFeedMaxGrams ? 'Acima da faixa de referência'
        : 'Dentro da faixa de referência'
    : null;

  return (
    <section className="panel flock-panel">
      <div className="panel-heading">
        <div><h2>Acompanhamento real do lote</h2><p>Indicadores calculados com os registros diários informados pelo produtor.</p></div>
        <span className="sample-count">Registro local</span>
      </div>
      <div className="flock-context">
        <strong>{lineage}</strong>
        <span>Idade informada: {number(ageWeeks, 1)} semanas</span>
        <span>Fase identificada: {phase}</span>
        {reference && <span>Referência técnica disponível para esta idade</span>}
      </div>
      <div className="flock-entry-grid">
        <label className="field"><span>Aves alojadas no início do lote</span><div className="input-with-unit"><input type="number" min="1" step="1" value={initialBirds} onChange={(event) => setInitialBirds(event.target.value)} /></div><small>Base para mortalidade acumulada e ovos por ave alojada.</small></label>
        <label className="field"><span>Data do registro</span><div className="input-with-unit"><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></div></label>
        <label className="field"><span>Aves mortas no dia</span><div className="input-with-unit"><input type="number" min="0" step="1" value={deaths} onChange={(event) => setDeaths(event.target.value)} /></div></label>
        <label className="field"><span>Aves eliminadas no dia</span><div className="input-with-unit"><input type="number" min="0" step="1" value={culls} onChange={(event) => setCulls(event.target.value)} /></div><small>Separadas da mortalidade, sem somar como óbito.</small></label>
        <label className="field"><span>Ração consumida no dia</span><div className="input-with-unit"><input type="number" min="0" step="0.01" value={feedKg} onChange={(event) => setFeedKg(event.target.value)} placeholder="Ex.: 560" /><em>kg</em></div></label>
        <label className="field"><span>Água consumida no dia</span><div className="input-with-unit"><input type="number" min="0" step="0.1" value={waterLiters} onChange={(event) => setWaterLiters(event.target.value)} placeholder="Ex.: 1.200" /><em>litros</em></div></label>
        <label className="field"><span>Ovos coletados no dia</span><div className="input-with-unit"><input type="number" min="0" step="1" value={eggsProduced} onChange={(event) => setEggsProduced(event.target.value)} placeholder="Quantidade" /></div></label>
        <label className="field"><span>Peso médio dos ovos</span><div className="input-with-unit"><input type="number" min="0" step="0.1" value={eggWeight} onChange={(event) => setEggWeight(event.target.value)} placeholder="Opcional" /><em>g</em></div></label>
        <label className="field"><span>Peso corporal médio da amostra</span><div className="input-with-unit"><input type="number" min="0" step="1" value={bodyWeight} onChange={(event) => setBodyWeight(event.target.value)} placeholder="Opcional" /><em>g</em></div></label>
      </div>
      {error && <p className="flock-error" role="alert">{error}</p>}
      <button className="button button-primary" onClick={addEntry}>Registrar dados do dia</button>
      <div className="form-divider" />
      <div className="section-title-row"><div><h3>Indicadores reais calculados</h3><p>Baseados no último dia cadastrado e no acumulado do lote.</p></div></div>
      <div className="flock-metrics-grid">
        <article><small>Aves vivas estimadas</small><strong>{dashboard ? number(dashboard.currentBirds, 0) : '—'}</strong><span>Inventário após mortes e eliminações</span></article>
        <article><small>Mortalidade acumulada</small><strong>{dashboard ? `${number(dashboard.cumulativeMortalityPercent, 2)}%` : '—'}</strong><span>Óbitos ÷ aves alojadas</span></article>
        <article><small>Eliminações acumuladas</small><strong>{dashboard ? `${number(dashboard.cumulativeCullsPercent, 2)}%` : '—'}</strong><span>Eliminadas, sem classificar como morte</span></article>
        <article><small>Viabilidade atual</small><strong>{dashboard ? `${number(dashboard.liveabilityPercent, 2)}%` : '—'}</strong><span>Aves vivas ÷ aves alojadas</span></article>
        <article><small>Ração por ave/dia</small><strong>{latest ? `${number(latest.feedGramsPerBirdDay)} g` : '—'}</strong><span>Consumo ÷ inventário médio do dia</span></article>
        <article><small>Água por ave/dia</small><strong>{latest ? `${number(latest.waterMlPerBirdDay)} ml` : '—'}</strong><span>Consumo ÷ inventário médio do dia</span></article>
        <article><small>Postura hen-day</small><strong>{latest ? `${number(latest.henDayProductionPercent)}%` : '—'}</strong><span>Ovos ÷ aves vivas no fim do dia</span></article>
        <article><small>Postura hen-housed</small><strong>{latest ? `${number(latest.henHousedProductionPercent)}%` : '—'}</strong><span>Ovos ÷ aves alojadas inicialmente</span></article>
        <article><small>Massa de ovos acumulada</small><strong>{dashboard ? `${number(dashboard.eggMassTotalKg)} kg` : '—'}</strong><span>{dashboard?.eggMassCoverageComplete ? 'Cobertura completa dos dias com postura' : 'Parcial: falta peso médio em dias com ovos'}</span></article>
        <article><small>Conversão alimentar acumulada</small><strong>{!dashboard?.eggMassCoverageComplete || dashboard?.cumulativeFeedConversion === null || dashboard?.cumulativeFeedConversion === undefined ? '—' : `${number(dashboard.cumulativeFeedConversion, 2)} kg/kg`}</strong><span>Ração acumulada ÷ massa de ovos acumulada</span></article>
        <article><small>Ovos acumulados</small><strong>{dashboard ? number(dashboard.eggsTotal, 0) : '—'}</strong><span>Todos os dias registrados</span></article>
        <article><small>Ração acumulada</small><strong>{dashboard ? `${number(dashboard.feedTotalKg)} kg` : '—'}</strong><span>Total dos registros diários</span></article>
      </div>
      {feedStatus && <p className="flock-comparison"><strong>Comparação com o guia na idade selecionada:</strong> {feedStatus}. Referência: {reference?.dailyFeedMinGrams}–{reference?.dailyFeedMaxGrams} g/ave/dia. A comparação é válida apenas quando a referência estruturada existe para esta linhagem e idade.</p>}
      {reference && <div className="flock-reference"><strong>Referência oficial para {lineage}, {reference.ageWeeks} semanas</strong><span>{reference.bodyWeightMinGrams !== undefined ? `Peso corporal: ${reference.bodyWeightMinGrams}–${reference.bodyWeightMaxGrams} g. ` : ''}{reference.dailyFeedMinGrams !== undefined ? `Ração: ${reference.dailyFeedMinGrams}–${reference.dailyFeedMaxGrams} g/ave/dia. ` : ''}{reference.dailyWaterMinMl !== undefined ? `Água: ${reference.dailyWaterMinMl}–${reference.dailyWaterMaxMl} ml/ave/dia. ` : ''}{reference.cumulativeMortalityPercent !== undefined ? `Mortalidade acumulada: ${reference.cumulativeMortalityPercent}%. ` : ''}{reference.cumulativeFeedMinGrams !== undefined ? `Ração acumulada: ${reference.cumulativeFeedMinGrams}–${reference.cumulativeFeedMaxGrams} g/ave. ` : ''}{reference.eggsPerHenHousedMin !== undefined ? `Ovos por ave alojada: ${reference.eggsPerHenHousedMin}–${reference.eggsPerHenHousedMax}. ` : ''}{reference.note ?? ''}</span></div>}
      {!reference && <p className="flock-reference">O guia desta linhagem foi catalogado, mas não há um ponto de idade estruturado exatamente para {number(ageWeeks, 1)} semanas. O sistema não interpola nem inventa uma meta.</p>}
      {guide && <div className="performance-source"><strong>{guide.publisher}</strong> · {guide.title} · {guide.edition}. Cobertura cadastrada: {guide.coverage} <a href={guide.url} target="_blank" rel="noreferrer">Abrir guia oficial</a></div>}
      <div className="table-wrap">
        <table><thead><tr><th>Data</th><th>Aves vivas</th><th>Mortes</th><th>Ração g/ave</th><th>Água ml/ave</th><th>Ovos</th><th>Postura HD</th></tr></thead>
          <tbody>{dashboard?.daily.length ? dashboard.daily.slice().reverse().map((item) => <tr key={item.id}><td>{item.date}</td><td>{number(item.birdsAtEnd, 0)}</td><td>{item.deaths}</td><td>{number(item.feedGramsPerBirdDay)}</td><td>{number(item.waterMlPerBirdDay)}</td><td>{item.eggsProduced}</td><td>{number(item.henDayProductionPercent)}%</td></tr>) : <tr><td colSpan={7} className="table-empty">Nenhum dia registrado. Cadastre os dados reais para iniciar os indicadores.</td></tr>}</tbody>
        </table>
      </div>
      <p className="table-footnote">Os registros desta versão ficam apenas na memória da sessão do navegador. O cálculo usa inventário médio diário; a mortalidade é separada das eliminações. Para sincronizar entre dispositivos e manter histórico, será necessária persistência em banco de dados.</p>
    </section>
  );
}
