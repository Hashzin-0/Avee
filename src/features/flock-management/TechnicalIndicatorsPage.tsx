'use client';

import { useEffect, useMemo, useState } from 'react';
import type { LayerLineage } from '../farm-builder/technical-recommendations';
import { calculateFlockDashboard, type FlockDailyEntry } from './domain';
import { getLayerAgeReference, getLayerGuideSource, layerAgeReferences } from './management-library';
import { hyLineTechnicalResources } from './hyline-resource-library';

type HousingVariant = 'conventional' | 'alternative';
const lineages: LayerLineage[] = ['Hy-Line Brown', 'Lohmann Brown-Classic', 'NOVOgen Brown', 'Hy-Line W-36'];
const categories = ['Todas', 'Desempenho', 'Manejo', 'Nutrição', 'Ambiência', 'Biossegurança', 'Sanidade', 'Qualidade dos ovos', 'Amostragem e laboratório', 'Incubatório'] as const;

function number(value: number | null | undefined, digits = 1) {
  return value === null || value === undefined || !Number.isFinite(value)
    ? '—'
    : new Intl.NumberFormat('pt-BR', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value);
}

function range(min?: number, max?: number, digits = 1) {
  if (min === undefined || max === undefined) return '—';
  return min === max ? number(min, digits) : `${number(min, digits)}–${number(max, digits)}`;
}

function readEntries(raw: string | null): FlockDailyEntry[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is FlockDailyEntry => {
      if (typeof item !== 'object' || item === null || Array.isArray(item)) return false;
      const entry = item as Record<string, unknown>;
      return typeof entry.id === 'string' && typeof entry.date === 'string'
        && Number.isFinite(entry.deaths) && Number.isFinite(entry.culls)
        && Number.isFinite(entry.feedKg) && Number.isFinite(entry.waterLiters)
        && Number.isFinite(entry.eggsProduced)
        && (entry.averageEggWeightGrams === undefined || Number.isFinite(entry.averageEggWeightGrams))
        && (entry.averageBodyWeightGrams === undefined || Number.isFinite(entry.averageBodyWeightGrams));
    });
  } catch {
    return [];
  }
}

export function TechnicalIndicatorsPage({ initialLineage, initialHousingSystem, lotId, initialBirds, ageWeeks }: {
  initialLineage: LayerLineage;
  initialHousingSystem: HousingVariant;
  lotId: string;
  initialBirds: number;
  ageWeeks: number;
}) {
  const [lineage, setLineage] = useState<LayerLineage>(initialLineage);
  const [housingSystem, setHousingSystem] = useState<HousingVariant>(initialHousingSystem);
  const [resourceQuery, setResourceQuery] = useState('');
  const [resourceCategory, setResourceCategory] = useState<(typeof categories)[number]>('Todas');
  const [resourceLanguage, setResourceLanguage] = useState('Todos');
  const [entries, setEntries] = useState<FlockDailyEntry[]>([]);

  useEffect(() => {
    const key = `granja.flock-entries.v1.${lotId}`;
    const load = () => setEntries(readEntries(window.localStorage.getItem(key)));
    load();
    window.addEventListener('storage', load);
    window.addEventListener('granja:flock-entries-updated', load);
    return () => {
      window.removeEventListener('storage', load);
      window.removeEventListener('granja:flock-entries-updated', load);
    };
  }, [lotId]);


  const referenceSystem: HousingVariant = lineage === 'Hy-Line Brown' ? housingSystem : 'conventional';
  const source = getLayerGuideSource(lineage, referenceSystem);
  const referenceRows = useMemo(() => layerAgeReferences
    .filter((item) => item.lineage === lineage && (lineage !== 'Hy-Line Brown' || item.sourceId === (referenceSystem === 'alternative' ? 'hyline-brown-2026-alternative' : 'hyline-brown-2025-conventional')))
    .sort((a, b) => a.ageWeeks - b.ageWeeks), [lineage, referenceSystem]);
  const currentReference = getLayerAgeReference(lineage, ageWeeks, referenceSystem);
  const dashboard = useMemo(() => {
    if (!Number.isInteger(initialBirds) || initialBirds <= 0) return null;
    try { return calculateFlockDashboard(initialBirds, entries); } catch { return null; }
  }, [initialBirds, entries]);
  const latest = dashboard?.latest ?? null;
  const comparisonRows = currentReference && dashboard && latest ? [
    {
      indicator: 'Peso corporal médio',
      actual: latest.averageBodyWeightGrams,
      target: range(currentReference.bodyWeightMinGrams, currentReference.bodyWeightMaxGrams, 0),
      status: latest.averageBodyWeightGrams === undefined || currentReference.bodyWeightMinGrams === undefined || currentReference.bodyWeightMaxGrams === undefined
        ? 'Sem dados comparáveis'
        : latest.averageBodyWeightGrams < currentReference.bodyWeightMinGrams ? 'Abaixo da faixa'
          : latest.averageBodyWeightGrams > currentReference.bodyWeightMaxGrams ? 'Acima da faixa' : 'Dentro da faixa',
      unit: 'g',
    },
    {
      indicator: 'Consumo de ração',
      actual: latest.feedGramsPerBirdDay,
      target: range(currentReference.dailyFeedMinGrams, currentReference.dailyFeedMaxGrams),
      status: latest.feedGramsPerBirdDay === null || currentReference.dailyFeedMinGrams === undefined || currentReference.dailyFeedMaxGrams === undefined
        ? 'Sem dados comparáveis'
        : latest.feedGramsPerBirdDay < currentReference.dailyFeedMinGrams ? 'Abaixo da faixa'
          : latest.feedGramsPerBirdDay > currentReference.dailyFeedMaxGrams ? 'Acima da faixa' : 'Dentro da faixa',
      unit: 'g/ave/dia',
    },
    {
      indicator: 'Consumo de água',
      actual: latest.waterMlPerBirdDay,
      target: range(currentReference.dailyWaterMinMl, currentReference.dailyWaterMaxMl, 0),
      status: latest.waterMlPerBirdDay === null || currentReference.dailyWaterMinMl === undefined || currentReference.dailyWaterMaxMl === undefined
        ? 'Sem dados comparáveis'
        : latest.waterMlPerBirdDay < currentReference.dailyWaterMinMl ? 'Abaixo da faixa'
          : latest.waterMlPerBirdDay > currentReference.dailyWaterMaxMl ? 'Acima da faixa' : 'Dentro da faixa',
      unit: 'ml/ave/dia',
    },
    {
      indicator: 'Mortalidade acumulada',
      actual: dashboard.cumulativeMortalityPercent,
      target: currentReference.cumulativeMortalityPercent === undefined ? '—' : `até ${number(currentReference.cumulativeMortalityPercent, 2)}%`,
      status: currentReference.cumulativeMortalityPercent === undefined
        ? 'Sem meta publicada'
        : dashboard.cumulativeMortalityPercent > currentReference.cumulativeMortalityPercent ? 'Acima da referência' : 'Dentro/abaixo da referência',
      unit: '%',
    },
    {
      indicator: 'Postura hen-day',
      actual: latest.henDayProductionPercent,
      target: range(currentReference.layRateMinPercent, currentReference.layRateMaxPercent),
      status: latest.henDayProductionPercent === null || currentReference.layRateMinPercent === undefined || currentReference.layRateMaxPercent === undefined
        ? 'Sem dados comparáveis'
        : latest.henDayProductionPercent < currentReference.layRateMinPercent ? 'Abaixo da faixa'
          : latest.henDayProductionPercent > currentReference.layRateMaxPercent ? 'Acima da faixa' : 'Dentro da faixa',
      unit: '%',
    },
    {
      indicator: 'Ovos acumulados por ave alojada',
      actual: dashboard.eggsPerHousedBird,
      target: range(currentReference.eggsPerHenHousedMin, currentReference.eggsPerHenHousedMax),
      status: currentReference.eggsPerHenHousedMin === undefined || currentReference.eggsPerHenHousedMax === undefined
        ? 'Sem meta publicada'
        : dashboard.eggsPerHousedBird < currentReference.eggsPerHenHousedMin ? 'Abaixo da faixa'
          : dashboard.eggsPerHousedBird > currentReference.eggsPerHenHousedMax ? 'Acima da faixa' : 'Dentro da faixa',
      unit: 'ovos/ave',
    },
    {
      indicator: 'Peso médio do ovo',
      actual: latest.averageEggWeightGrams,
      target: range(currentReference.averageEggWeightMinGrams, currentReference.averageEggWeightMaxGrams),
      status: latest.averageEggWeightGrams === undefined || currentReference.averageEggWeightMinGrams === undefined || currentReference.averageEggWeightMaxGrams === undefined
        ? 'Sem dados comparáveis'
        : latest.averageEggWeightGrams < currentReference.averageEggWeightMinGrams ? 'Abaixo da faixa'
          : latest.averageEggWeightGrams > currentReference.averageEggWeightMaxGrams ? 'Acima da faixa' : 'Dentro da faixa',
      unit: 'g',
    },
    {
      indicator: 'Massa de ovos por ave alojada',
      actual: dashboard.eggMassPerHousedBirdKg,
      target: range(currentReference.eggMassPerHenHousedMinKg, currentReference.eggMassPerHenHousedMaxKg, 2),
      status: dashboard.eggMassPerHousedBirdKg === null || currentReference.eggMassPerHenHousedMinKg === undefined || currentReference.eggMassPerHenHousedMaxKg === undefined
        ? 'Sem dados comparáveis'
        : dashboard.eggMassPerHousedBirdKg < currentReference.eggMassPerHenHousedMinKg ? 'Abaixo da faixa'
          : dashboard.eggMassPerHousedBirdKg > currentReference.eggMassPerHenHousedMaxKg ? 'Acima da faixa' : 'Dentro da faixa',
      unit: 'kg/ave',
    },
  ] : [];

  const visibleResources = useMemo(() => hyLineTechnicalResources.filter((resource) => {
    const query = resourceQuery.trim().toLocaleLowerCase('pt-BR');
    const matchesQuery = !query || [resource.title, resource.publisher, resource.summary, ...resource.topics].join(' ').toLocaleLowerCase('pt-BR').includes(query);
    const matchesCategory = resourceCategory === 'Todas' || resource.category === resourceCategory;
    const matchesLanguage = resourceLanguage === 'Todos' || resource.language.toLocaleLowerCase('pt-BR').includes(resourceLanguage.toLocaleLowerCase('pt-BR'));
    return matchesQuery && matchesCategory && matchesLanguage;
  }), [resourceQuery, resourceCategory, resourceLanguage]);
  const languages = useMemo(() => ['Todos', ...Array.from(new Set(hyLineTechnicalResources.map((resource) => resource.language))).sort()], []);

  return (
    <>
      <div className="page-heading">
        <div><span className="eyebrow">DESEMPENHO E MANEJO</span><h1>Indicadores zootécnicos</h1><p>Metas documentadas por linhagem e sistema de alojamento, comparadas com os registros reais do lote selecionado.</p></div>
      </div>

      <section className="panel guide-standards-panel">
        <div className="panel-heading"><div><h2>Referências técnicas e resultados do lote</h2><p>Selecione a linhagem e a variante do guia. As tabelas abaixo usam somente valores estruturados, sem interpolação.</p></div></div>
        <div className="field-grid">
          <label className="field"><span>Espécie / linhagem</span><select value={lineage} onChange={(event) => { setLineage(event.target.value as LayerLineage); setHousingSystem('conventional'); }}>{lineages.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label className="field"><span>Variante do guia</span><select value={referenceSystem} disabled={lineage !== 'Hy-Line Brown'} onChange={(event) => setHousingSystem(event.target.value as HousingVariant)}><option value="conventional">Sistemas convencionais</option><option value="alternative">Sistemas alternativos</option></select></label>
          <div className="phase-indicator"><span>Idade cadastrada do lote</span><strong>{number(ageWeeks, 1)} semanas</strong></div>
        </div>
        {source && <div className="performance-source"><strong>{source.publisher}</strong> · {source.title} · {source.edition}. {source.coverage} <a href={source.url} target="_blank" rel="noreferrer">Consultar guia original</a></div>}
        {!source && <p className="table-footnote">Não existe guia documentado para esta combinação de linhagem e sistema. Nenhuma referência de outro sistema será usada como substituta.</p>}
        <div className="section-title-row"><div><h3>1. Metas do guia</h3><p>{lineage} · {referenceSystem === 'alternative' ? 'sistemas alternativos' : 'sistemas convencionais'}</p></div></div>
        <div className="table-wrap guide-standards-table">
          <table>
            <thead><tr><th>Sem.</th><th>Fase</th><th>Uniformidade mínima (%)</th><th>Peso corporal (g)</th><th>Ração (g/ave/dia)</th><th>Água (ml/ave/dia)</th><th>Mortalidade acum. (%)</th><th>Postura ave-dia (%)</th><th>Ovos/ave-dia acum.</th><th>Ovos/ave alojada acum.</th><th>Massa de ovos (kg)</th><th>Peso do ovo (g)</th></tr></thead>
            <tbody>{referenceRows.map((item) => <tr key={item.lineage + '-' + item.sourceId + '-' + item.ageWeeks}>
              <td>{item.ageWeeks}</td><td>{item.phase}</td>
              <td>{item.uniformityMinPercent === undefined ? '—' : `> ${number(item.uniformityMinPercent, 0)}`}</td>
              <td>{range(item.bodyWeightMinGrams, item.bodyWeightMaxGrams, 0)}</td>
              <td>{range(item.dailyFeedMinGrams, item.dailyFeedMaxGrams)}</td>
              <td>{range(item.dailyWaterMinMl, item.dailyWaterMaxMl, 0)}</td>
              <td>{item.cumulativeMortalityPercent === undefined ? '—' : number(item.cumulativeMortalityPercent, 2)}</td>
              <td>{range(item.layRateMinPercent, item.layRateMaxPercent)}</td>
              <td>{range(item.eggsPerHenDayMin, item.eggsPerHenDayMax)}</td>
              <td>{range(item.eggsPerHenHousedMin, item.eggsPerHenHousedMax)}</td>
              <td>{range(item.eggMassPerHenHousedMinKg, item.eggMassPerHenHousedMaxKg, 2)}</td>
              <td>{range(item.averageEggWeightMinGrams, item.averageEggWeightMaxGrams)}</td>
            </tr>)}
            {!referenceRows.length && <tr><td colSpan={12} className="table-empty">Não há metas estruturadas para esta linhagem e variante.</td></tr>}</tbody>
          </table>
        </div>
        <p className="table-footnote">“—” significa que o guia não publica aquele indicador naquela idade. As transcrições permanecem com status transcribed-unreviewed e exigem revisão técnica independente antes de uso como norma de engenharia ou decisão sanitária.</p>
        <div className="section-title-row"><div><h3>2. Resultados reais do lote</h3><p>Dados registrados no Acompanhamento Diário para o lote selecionado. Idade atual: {number(ageWeeks, 1)} semanas.</p></div></div>
        {dashboard && latest ? (
          <>
            <div className="flock-metrics-grid">
              <article><small>Aves vivas estimadas</small><strong>{number(dashboard.currentBirds, 0)}</strong><span>Após mortes e eliminações registradas</span></article>
              <article><small>Mortalidade acumulada</small><strong>{number(dashboard.cumulativeMortalityPercent, 2)}%</strong><span>Óbitos ÷ aves alojadas inicialmente</span></article>
              <article><small>Ração por ave/dia</small><strong>{number(latest.feedGramsPerBirdDay)} g</strong><span>Último dia registrado</span></article>
              <article><small>Água por ave/dia</small><strong>{number(latest.waterMlPerBirdDay)} ml</strong><span>Último dia registrado</span></article>
              <article><small>Postura hen-day</small><strong>{number(latest.henDayProductionPercent)}%</strong><span>Ovos ÷ aves vivas no fim do dia</span></article>
              <article><small>Postura hen-housed</small><strong>{number(latest.henHousedProductionPercent)}%</strong><span>Ovos ÷ aves alojadas inicialmente</span></article>
              <article><small>Peso corporal medido</small><strong>{latest.averageBodyWeightGrams ? `${number(latest.averageBodyWeightGrams, 0)} g` : '—'}</strong><span>Última amostra informada</span></article>
              <article><small>Peso médio do ovo</small><strong>{latest.averageEggWeightGrams ? `${number(latest.averageEggWeightGrams)} g` : '—'}</strong><span>Última amostra informada</span></article>
            </div>
            {currentReference && <div className="section-title-row"><div><h3>Comparação direta por idade</h3><p>Resultado real confrontado com a meta publicada para {number(ageWeeks, 1)} semanas. Indicadores sem dados ou sem meta permanecem sem classificação.</p></div></div>}
            {comparisonRows.length > 0 && <div className="table-wrap"><table><thead><tr><th>Indicador</th><th>Resultado real</th><th>Referência do guia</th><th>Comparação</th></tr></thead><tbody>{comparisonRows.map((row) => <tr key={row.indicator}><td>{row.indicator}</td><td>{number(typeof row.actual === 'number' ? row.actual : null, 2)} {row.actual === null || row.actual === undefined ? '' : row.unit}</td><td>{typeof row.target === 'string' ? row.target : `${row.target} ${row.unit}`}</td><td>{row.status}</td></tr>)}</tbody></table></div>}
          </>
        ) : <p className="table-empty">Ainda não há registros diários válidos para este lote. Registre dados no Acompanhamento Diário para preencher a tabela de resultados reais.</p>}
        <div className="table-wrap">
          <table><thead><tr><th>Data</th><th>Aves vivas</th><th>Mortes</th><th>Ração (g/ave)</th><th>Água (ml/ave)</th><th>Ovos</th><th>Postura HD (%)</th><th>Peso corporal (g)</th><th>Peso do ovo (g)</th></tr></thead>
            <tbody>{dashboard?.daily.length ? dashboard.daily.slice().reverse().map((item) => <tr key={item.id}><td>{item.date}</td><td>{number(item.birdsAtEnd, 0)}</td><td>{item.deaths}</td><td>{number(item.feedGramsPerBirdDay)}</td><td>{number(item.waterMlPerBirdDay)}</td><td>{item.eggsProduced}</td><td>{number(item.henDayProductionPercent)}</td><td>{number(item.averageBodyWeightGrams, 0)}</td><td>{number(item.averageEggWeightGrams)}</td></tr>) : <tr><td colSpan={9} className="table-empty">Nenhum dia registrado.</td></tr>}</tbody>
          </table>
        </div>
        <p className="table-footnote">A tabela de resultados contém somente registros reais do lote; não substitui as metas publicadas. Para esta versão, os registros permanecem no armazenamento local do navegador e separados por lote.</p>
      </section>

      <section className="panel">
        <div className="panel-heading"><div><h2>Biblioteca técnica</h2><p>Catálogo pesquisável de documentos Hy-Line por tema, idioma e aplicabilidade.</p></div></div>
        <div className="field-grid">
          <label className="field"><span>Pesquisar documento ou assunto</span><input value={resourceQuery} onChange={(event) => setResourceQuery(event.target.value)} placeholder="Ex.: estresse térmico, nutrição, biossegurança" /></label>
          <label className="field"><span>Categoria</span><select value={resourceCategory} onChange={(event) => setResourceCategory(event.target.value as (typeof categories)[number])}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="field"><span>Idioma</span><select value={resourceLanguage} onChange={(event) => setResourceLanguage(event.target.value)}>{languages.map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        <p className="table-footnote">{visibleResources.length} de {hyLineTechnicalResources.length} documentos exibidos.</p>
        <div className="guide-library-grid">{visibleResources.map((resource) => <article className="panel guide-library-card" key={resource.id}><div className="guide-library-top"><span className="sample-count">{resource.category}</span><span className="sample-count">{resource.language}</span></div><h2>{resource.title}</h2><strong>{resource.publisher}{resource.edition ? ` · ${resource.edition}` : ''}</strong><p>{resource.housingApplicability}</p><small>{resource.summary}</small><p className="table-footnote">Tópicos: {resource.topics.join(' · ')}. Extração: {resource.extractionStatus}.</p><a href={resource.url} target="_blank" rel="noreferrer">Consultar documento original</a></article>)}</div>
      </section>
    </>
  );
}
