'use client';

import { useEffect, useMemo, useState } from 'react';
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

export function FlockMonitoringPanel({ lineage, ageWeeks, initialBirds, lotId = 'unassigned', referenceSystem = 'conventional' }: {
  lineage: LayerLineage;
  ageWeeks: number;
  initialBirds: number;
  lotId?: string;
  referenceSystem?: 'conventional' | 'alternative' | 'unsupported';
}) {
  const [date, setDate] = useState(todayLocal);
  const [deaths, setDeaths] = useState('0');
  const [culls, setCulls] = useState('0');
  const [feedKg, setFeedKg] = useState('');
  const [waterLiters, setWaterLiters] = useState('');
  const [eggsProduced, setEggsProduced] = useState('');
  const [eggWeight, setEggWeight] = useState('');
  const [bodyWeight, setBodyWeight] = useState('');
  const [entries, setEntries] = useState<FlockDailyEntry[]>([]);
  const [loadedLotId, setLoadedLotId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setLoadedLotId('');
    setEntries([]);
    try {
      const raw = window.localStorage.getItem(`granja.flock-entries.v1.${lotId}`);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        const validEntries = parsed.filter((item): item is FlockDailyEntry => {
          if (typeof item !== 'object' || item === null || Array.isArray(item)) return false;
          const entry = item as Record<string, unknown>;
          return typeof entry.id === 'string' && typeof entry.date === 'string'
            && Number.isFinite(entry.deaths) && Number.isFinite(entry.culls)
            && Number.isFinite(entry.feedKg) && Number.isFinite(entry.waterLiters)
            && Number.isFinite(entry.eggsProduced)
            && (entry.averageEggWeightGrams === undefined || Number.isFinite(entry.averageEggWeightGrams))
            && (entry.averageBodyWeightGrams === undefined || Number.isFinite(entry.averageBodyWeightGrams));
        });
        setEntries(validEntries);
      }
    } catch {
      setError('Não foi possível carregar o histórico local deste lote.');
    }
    setLoadedLotId(lotId);
  }, [lotId]);

  useEffect(() => {
    if (loadedLotId !== lotId) return;
    try {
      window.localStorage.setItem(`granja.flock-entries.v1.${lotId}`, JSON.stringify(entries));
      window.dispatchEvent(new CustomEvent("granja:flock-entries-updated", { detail: { lotId } }));
    } catch {
      setError('Não foi possível salvar o histórico local deste lote. Verifique o espaço disponível no navegador.');
    }
  }, [entries, loadedLotId, lotId]);

  const dashboard = useMemo(() => {
    if (!Number.isInteger(initialBirds) || initialBirds <= 0) return null;
    try { return calculateFlockDashboard(initialBirds, entries); } catch { return null; }
  }, [initialBirds, entries]);
  const reference = referenceSystem === 'unsupported' ? null : getLayerAgeReference(lineage, ageWeeks, referenceSystem);
  const guide = referenceSystem === 'unsupported' ? null : getLayerGuideSource(lineage, referenceSystem);
  const phase = Number.isFinite(ageWeeks) && ageWeeks >= 0 ? getManagementPhase(ageWeeks) : 'Cria';
  const latest = dashboard?.latest ?? null;

  const addEntry = () => {
    if (feedKg === '' || waterLiters === '' || eggsProduced === '') {
      setError('Informe ração, água e quantidade de ovos. Use zero quando não houver produção.');
      return;
    }
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
      if (!Number.isInteger(initialBirds) || initialBirds <= 0) throw new RangeError('O cadastro do lote não possui uma quantidade inicial válida de aves.');
      calculateFlockDashboard(initialBirds, [...entries, entry]);
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
        <div><h2>Acompanhamento Diário</h2><p>Registre os dados reais do dia; os indicadores calculados ficam disponíveis na Visão geral.</p></div>
        <span className="sample-count">Registro local</span>
      </div>
      <div className="flock-context">
        <strong>{lineage}</strong>
        <span>Idade cadastrada: {number(ageWeeks, 1)} semanas</span>
        <span>Aves alojadas no início: {number(initialBirds, 0)}</span>
        <span>Fase identificada: {phase}</span>
        {lineage === 'Hy-Line Brown' && <span>Sistema de referência: {referenceSystem === 'conventional' ? 'convencional' : referenceSystem === 'alternative' ? 'alternativo' : 'sem guia compatível'}</span>}
        {reference && <span>Referência técnica disponível para esta idade</span>}
      </div>
      <div className="flock-entry-grid">
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
      {feedStatus && <p className="flock-comparison"><strong>Comparação com o guia na idade selecionada:</strong> {feedStatus}. Referência: {reference?.dailyFeedMinGrams}–{reference?.dailyFeedMaxGrams} g/ave/dia. A comparação é válida apenas quando a referência estruturada existe para esta linhagem e idade.</p>}
      {reference && <div className="flock-reference"><strong>Referência oficial para {lineage}, {reference.ageRangeLabel ?? `${reference.ageWeeks} semanas`}</strong><span>{reference.bodyWeightMinGrams !== undefined ? `Peso corporal: ${reference.bodyWeightMinGrams}–${reference.bodyWeightMaxGrams} g. ` : ''}{reference.dailyFeedMinGrams !== undefined ? `Ração: ${reference.dailyFeedMinGrams}–${reference.dailyFeedMaxGrams} g/ave/dia. ` : ''}{reference.dailyWaterMinMl !== undefined ? `Água: ${reference.dailyWaterMinMl}–${reference.dailyWaterMaxMl} ml/ave/dia. ` : ''}{reference.cumulativeMortalityPercent !== undefined ? `Mortalidade acumulada: ${reference.cumulativeMortalityPercent}%. ` : ''}{reference.cumulativeFeedMinGrams !== undefined ? `Ração acumulada: ${reference.cumulativeFeedMinGrams}–${reference.cumulativeFeedMaxGrams} g/ave. ` : ''}{reference.eggsPerHenDayMin !== undefined ? `Ovos por ave-dia acumulados: ${reference.eggsPerHenDayMin}–${reference.eggsPerHenDayMax}. ` : ''}{reference.eggsPerHenHousedMin !== undefined ? `Ovos por ave alojada: ${reference.eggsPerHenHousedMin}–${reference.eggsPerHenHousedMax}. ` : ''}{reference.eggMassPerHenHousedMinKg !== undefined ? `Massa de ovos acumulada: ${reference.eggMassPerHenHousedMinKg}–${reference.eggMassPerHenHousedMaxKg} kg/ave alojada. ` : ''}{reference.note ?? ''} Fonte: {reference.sourceId}, página {reference.page}, versão {guide?.edition ?? 'não informada'}. Aplicabilidade: {reference.housingSystemApplicability} Status: {reference.reviewStatus}.</span></div>}
      {!reference && <p className="flock-reference">{lineage === 'Hy-Line Brown' && ageWeeks > 100 ? 'O acompanhamento de referência Hy-Line Brown termina na semana 100, último marco publicado no guia.' : `O guia desta linhagem foi catalogado, mas não há um ponto de idade estruturado exatamente para ${number(ageWeeks, 1)} semanas. O sistema não interpola nem inventa uma meta.`}</p>}
      {guide && <div className="performance-source"><strong>{guide.publisher}</strong> · {guide.title} · {guide.edition}. Cobertura cadastrada: {guide.coverage} <a href={guide.url} target="_blank" rel="noreferrer">Abrir guia oficial</a></div>}
      <div className="table-wrap">
        <table><thead><tr><th>Data</th><th>Aves vivas</th><th>Mortes</th><th>Ração g/ave</th><th>Água ml/ave</th><th>Ovos</th><th>Postura HD</th></tr></thead>
          <tbody>{dashboard?.daily.length ? dashboard.daily.slice().reverse().map((item) => <tr key={item.id}><td>{item.date}</td><td>{number(item.birdsAtEnd, 0)}</td><td>{item.deaths}</td><td>{number(item.feedGramsPerBirdDay)}</td><td>{number(item.waterMlPerBirdDay)}</td><td>{item.eggsProduced}</td><td>{number(item.henDayProductionPercent)}%</td></tr>) : <tr><td colSpan={7} className="table-empty">Nenhum dia registrado. Cadastre os dados reais para iniciar os indicadores.</td></tr>}</tbody>
        </table>
      </div>
      <p className="table-footnote">Os registros diários são persistidos localmente neste navegador e separados por lote. O cálculo usa inventário médio diário; a mortalidade é separada das eliminações. Para sincronizar entre dispositivos e manter histórico centralizado, será necessária persistência em banco de dados.</p>
    </section>
  );
}
