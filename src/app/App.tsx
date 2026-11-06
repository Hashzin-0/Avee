'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  PulseIcon as Activity,
  BirdIcon as Bird,
  BookOpenIcon as BookOpen,
  StackIcon as Boxes,
  ChartLineIcon as ChartLine,
  CheckCircleIcon as CheckCircle,
  CaretDownIcon as ChevronDown,
  QuestionIcon as CircleHelp,
  DatabaseIcon as Database,
  EggIcon as Egg,
  GaugeIcon as Gauge,
  HouseIcon as House,
  StackIcon as Layers3,
  ListIcon as Menu,
  PlusIcon as Plus,
  ScalesIcon as Scale,
  MagnifyingGlassIcon as Search,
  GearIcon as Settings2,
  ShieldCheckIcon as ShieldCheck,
  SlidersHorizontalIcon as SlidersHorizontal,
  TagIcon as Tag,
  WifiHighIcon as Wifi,
  XIcon as X,
} from '@phosphor-icons/react';
import { FarmScene } from '../features/farm-builder/FarmScene';
import { getLayerTechnicalRecommendation, type ClimateProfile, type HousingSystem, type LayerLineage, type ProductionPhase, type TechnicalParameterKey } from '../features/farm-builder/technical-recommendations';
import { calculateFarm, calculateUniformity, type FarmInput } from '../features/farm-builder/domain';
import { connectionOptions, scaleCatalog } from '../features/weighing/catalog';
import type { IdentificationMode, WeighingRecord } from '../features/weighing/types';

type Section = 'overview' | 'weighing' | 'builder' | 'technical';

const initialFarm: FarmInput = {
  houseLengthM: 100,
  houseWidthM: 12,
  sideHeightM: 3,
  ridgeHeightM: 4.5,
  targetBirds: 5_000,
  usableAreaPercent: 80,
  areaPerBirdCm2: undefined,
  birdsPerNipple: undefined,
  feederCmPerBird: undefined,
  fanCapacityM3h: undefined,
  airflowM3hPerBird: undefined,
  cageCapacity: undefined,
};

function formatNumber(value: number, digits = 0) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value);
}

function Metric({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof Bird }) {
  return (
    <article className="metric-card">
      <div className="metric-top"><span>{label}</span><Icon size={19} weight="duotone" /></div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function Field({ label, value, onChange, unit, min = 0, step = 1, hint }: {
  label: string; value: number | undefined; onChange: (value: number | undefined) => void;
  unit?: string; min?: number; step?: number; hint?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="input-with-unit">
        <input type="number" min={min} step={step} value={value ?? ''} onChange={(event) => onChange(event.target.value === '' ? undefined : Number(event.target.value))} />
        {unit && <em>{unit}</em>}
      </div>
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function App() {
  const [section, setSection] = useState<Section>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [farm, setFarm] = useState<Partial<FarmInput>>(initialFarm);
  const [identification, setIdentification] = useState<IdentificationMode>('sampling');
  const [inputWeight, setInputWeight] = useState('');
  const [ringId, setRingId] = useState('');
  const [sampleNumber, setSampleNumber] = useState('1');
  const [records, setRecords] = useState<WeighingRecord[]>([]);
  const [scaleQuery, setScaleQuery] = useState('');
  const [connection, setConnection] = useState('usb');
  const [activeScale, setActiveScale] = useState('');
  const [notice, setNotice] = useState('');
  const [lineage, setLineage] = useState<LayerLineage>('Hy-Line Brown');
  const [housingSystem, setHousingSystem] = useState<HousingSystem>('Gaiolas convencionais');
  const [productionPhase, setProductionPhase] = useState<ProductionPhase>('Produção');
  const [ageWeeks, setAgeWeeks] = useState(18);
  const [climateProfile, setClimateProfile] = useState<ClimateProfile>('Quente');
  const [manualOverrides, setManualOverrides] = useState<Set<TechnicalParameterKey>>(() => new Set());
  const technicalRecommendation = useMemo(() => getLayerTechnicalRecommendation({ lineage, housingSystem, phase: productionPhase, ageWeeks, climateProfile }), [lineage, housingSystem, productionPhase, ageWeeks, climateProfile]);

  useEffect(() => {
    setFarm((current) => {
      const next = { ...current };
      if (!manualOverrides.has('areaPerBirdCm2')) next.areaPerBirdCm2 = technicalRecommendation?.values.areaPerBirdCm2;
      if (!manualOverrides.has('birdsPerNipple')) next.birdsPerNipple = technicalRecommendation?.values.birdsPerNipple;
      if (!manualOverrides.has('feederCmPerBird')) next.feederCmPerBird = technicalRecommendation?.values.feederCmPerBird;
      return next;
    });
  }, [technicalRecommendation, manualOverrides]);

  const calculation = useMemo(() => {
    try { return calculateFarm(farm as FarmInput); }
    catch { return null; }
  }, [farm]);
  const stats = useMemo(() => calculateUniformity(records.map((record) => record.weightGrams)), [records]);
  const visibleScales = scaleCatalog.filter((scale) => `${scale.manufacturer} ${scale.model}`.toLowerCase().includes(scaleQuery.toLowerCase()));

  const updateFarm = (key: keyof FarmInput, value: number | undefined) => {
    if (key === 'areaPerBirdCm2' || key === 'birdsPerNipple' || key === 'feederCmPerBird') {
      setManualOverrides((current) => new Set(current).add(key));
    }
    setFarm((current) => ({ ...current, [key]: value }));
  };

  const applyTechnicalRecommendation = () => {
    if (!technicalRecommendation) return;
    setManualOverrides(new Set());
    setFarm((current) => ({ ...current, ...technicalRecommendation.values }));
    setNotice('Parâmetros documentados aplicados. Você ainda pode editar cada valor.');
  };

  const addWeight = () => {
    const weight = Number(inputWeight);
    if (!Number.isFinite(weight) || weight <= 0) {
      setNotice('Informe um peso válido, maior que zero.');
      return;
    }
    if (identification === 'ring' && !ringId.trim()) {
      setNotice('Informe o número da anilha para registrar uma pesagem individual.');
      return;
    }
    if (identification === 'sampling' && (!Number.isInteger(Number(sampleNumber)) || Number(sampleNumber) < 1)) {
      setNotice('O número da amostra deve ser um inteiro maior que zero.');
      return;
    }
    const record: WeighingRecord = {
      id: crypto.randomUUID(),
      sessionId: 'sessao-local',
      timestamp: new Date().toISOString(),
      weightGrams: weight,
      identificationMode: identification,
      ringId: identification === 'ring' ? ringId.trim() : undefined,
      sampleNumber: identification === 'sampling' ? Number(sampleNumber) : undefined,
      source: 'manual',
    };
    setRecords((current) => [...current, record]);
    setInputWeight('');
    if (identification === 'ring') setRingId('');
    else setSampleNumber((current) => String(Number(current) + 1));
    setNotice('Pesagem adicionada à sessão local.');
  };

  const navigate = (next: Section) => {
    setSection(next);
    setMobileNavOpen(false);
    setNotice('');
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><Bird size={23} weight="fill" /></div>
          <div><strong>granja</strong><span>GESTÃO AVÍCOLA</span></div>
          <button className="icon-button mobile-close" aria-label="Fechar menu" onClick={() => setMobileNavOpen(false)}><X size={18} /></button>
        </div>
        <div className="workspace-switcher">
          <div className="workspace-avatar">GF</div>
          <div><strong>Granja Fazenda</strong><span>Ambiente de trabalho</span></div>
          <ChevronDown size={16} />
        </div>
        <nav className="primary-nav" aria-label="Navegação principal">
          <span className="nav-label">GESTÃO</span>
          <button className={section === 'overview' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('overview')}><House size={18} />Visão geral</button>
          <button className={section === 'weighing' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('weighing')}><Scale size={18} />Pesagem <span className="nav-count">{records.length || '—'}</span></button>
          <button className="nav-item" onClick={() => navigate('overview')}><Egg size={18} />Produção de ovos</button>
          <button className="nav-item" onClick={() => navigate('overview')}><Activity size={18} />Indicadores zootécnicos</button>
          <span className="nav-label nav-label-spaced">PLANEJAMENTO</span>
          <button className={section === 'builder' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('builder')}><Boxes size={18} />Montar minha granja <span className="new-pill">3D</span></button>
          <button className={section === 'technical' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('technical')}><BookOpen size={18} />Biblioteca técnica</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="sync-status"><span className="status-dot" /><div><strong>Modo local</strong><small>Sincronização em nuvem não configurada</small></div></div>
          <button className="nav-item" onClick={() => setNotice('Configurações de conta serão habilitadas após a integração de autenticação.')}><Settings2 size={18} />Configurações</button>
          <div className="profile-row"><div className="profile-avatar">K</div><div><strong>Administrador</strong><small>Perfil da granja</small></div><ChevronDown size={16} /></div>
        </div>
      </aside>

      {mobileNavOpen && <button className="mobile-scrim" aria-label="Fechar menu" onClick={() => setMobileNavOpen(false)} />}

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Abrir menu" onClick={() => setMobileNavOpen(true)}><Menu size={20} /></button>
          <div className="breadcrumb">Granja Fazenda <span>/</span> {section === 'builder' ? 'Construtor 3D' : section === 'weighing' ? 'Pesagem' : section === 'technical' ? 'Biblioteca técnica' : 'Visão geral'}</div>
          <div className="topbar-actions"><span className="environment-chip"><span className="status-dot" />Ambiente de desenvolvimento</span><button className="icon-button" aria-label="Ajuda" onClick={() => setNotice('Este é um protótipo local. Consulte o README para conhecer os limites atuais.')}><CircleHelp size={19} /></button></div>
        </header>

        <div className="page-content">
          {notice && <div className="notice" role="status"><CheckCircle size={17} />{notice}<button onClick={() => setNotice('')} aria-label="Fechar aviso"><X size={16} /></button></div>}

          {section === 'overview' && (
            <>
              <div className="page-heading"><div><span className="eyebrow">PAINEL DA GRANJA</span><h1>Visão geral</h1><p>Acompanhe a operação e acesse as ferramentas de manejo.</p></div><button className="button button-primary" onClick={() => navigate('weighing')}><Plus size={17} />Nova pesagem</button></div>
              <div className="metrics-grid">
                <Metric label="Plantel de referência" value="5.000" detail="Quantidade informada no planejamento" icon={Bird} />
                <Metric label="Pesagens nesta sessão" value={String(records.length)} detail="Registros locais ainda não sincronizados" icon={Scale} />
                <Metric label="Peso médio da amostra" value={stats.meanGrams === null ? '—' : `${formatNumber(stats.meanGrams)} g`} detail="Calculado sobre os registros desta sessão" icon={Gauge} />
                <Metric label="Uniformidade da amostra" value={stats.uniformityPercent === null ? '—' : `${formatNumber(stats.uniformityPercent, 1)}%`} detail="Faixa de ±10% da média amostral" icon={ChartLine} />
              </div>
              <section className="welcome-panel">
                <div className="welcome-copy"><span className="eyebrow">PLANEJAMENTO DE INSTALAÇÕES</span><h2>Projete seu galpão antes de construir.</h2><p>Informe as dimensões, adicione parâmetros técnicos com fonte identificada e visualize uma proposta tridimensional editável.</p><button className="button button-light" onClick={() => navigate('builder')}>Abrir construtor 3D <span>→</span></button></div>
                <div className="welcome-visual"><div className="blueprint-grid" /><div className="blueprint-building"><div className="blueprint-roof" /><div className="blueprint-body"><span /><span /><span /><span /></div><div className="blueprint-dimension dimension-x">100 m · exemplo editável</div><div className="blueprint-dimension dimension-y">12 m</div></div></div>
              </section>
              <div className="section-title-row"><div><h2>Acesso rápido</h2><p>Ferramentas disponíveis nesta versão inicial.</p></div></div>
              <div className="quick-grid">
                <button className="quick-card" onClick={() => navigate('weighing')}><span className="quick-icon"><Scale size={21} /></span><strong>Central de pesagem</strong><small>Registrar pesos e configurar identificação</small><span className="quick-arrow">→</span></button>
                <button className="quick-card" onClick={() => navigate('builder')}><span className="quick-icon"><Boxes size={21} /></span><strong>Montar minha granja</strong><small>Dimensionamento paramétrico e cena 3D</small><span className="quick-arrow">→</span></button>
                <button className="quick-card" onClick={() => navigate('technical')}><span className="quick-icon"><BookOpen size={21} /></span><strong>Biblioteca técnica</strong><small>Preparar referências oficiais por linhagem</small><span className="quick-arrow">→</span></button>
              </div>
              <div className="prototype-note"><ShieldCheck size={18} /><div><strong>Dados demonstrativos identificados</strong><p>Esta versão ainda não está conectada a uma balança, banco de dados ou manual oficial. Os registros feitos aqui permanecem apenas na memória desta sessão.</p></div></div>
            </>
          )}

          {section === 'weighing' && (
            <>
              <div className="page-heading"><div><span className="eyebrow">GESTÃO ZOOTÉCNICA</span><h1>Central de pesagem</h1><p>Registre pesagens por anilha ou por amostragem. A conexão física será ativada por modelo validado.</p></div><span className="local-badge"><span className="status-dot" />Sessão local</span></div>
              <div className="weighing-layout">
                <section className="panel weighing-panel">
                  <div className="panel-heading"><div><h2>Registrar pesagem</h2><p>Entrada manual disponível enquanto não houver balança conectada.</p></div><span className="panel-icon"><Scale size={20} /></span></div>
                  <div className="segmented-control"><button className={identification === 'sampling' ? 'selected' : ''} onClick={() => setIdentification('sampling')}><SlidersHorizontal size={16} />Amostragem</button><button className={identification === 'ring' ? 'selected' : ''} onClick={() => setIdentification('ring')}><Tag size={16} />Com anilha</button></div>
                  {identification === 'ring' ? <label className="field"><span>Identificador da anilha</span><div className="input-with-unit"><input type="text" value={ringId} onChange={(event) => setRingId(event.target.value)} placeholder="Ex.: A-00482" /></div><small>Use o código único registrado para a ave.</small></label> : <Field label="Número da amostra" value={Number(sampleNumber)} onChange={(value) => setSampleNumber(String(value ?? 1))} hint="Sequência dentro da sessão de pesagem." />}
                  <Field label="Peso registrado" value={inputWeight === '' ? undefined : Number(inputWeight)} onChange={(value) => setInputWeight(value === undefined ? '' : String(value))} unit="gramas (g)" step={1} />
                  <button className="button button-primary button-full" onClick={addWeight}><Plus size={17} />Adicionar pesagem manual</button>
                  <div className="form-divider" />
                  <div className="connection-heading"><div><strong>Conectar uma balança</strong><small>Catálogo extensível por protocolo e modelo.</small></div><Wifi size={20} /></div>
                  <label className="search-field"><Search size={17} /><input value={scaleQuery} onChange={(event) => setScaleQuery(event.target.value)} placeholder="Buscar fabricante ou modelo" /></label>
                  <div className="transport-row">{connectionOptions.map((option) => <button key={option.id} className={connection === option.id ? 'transport-chip selected' : 'transport-chip'} onClick={() => setConnection(option.id)}>{option.label}</button>)}</div>
                  {visibleScales.length === 0 ? <div className="empty-catalog"><Database size={24} /><strong>Nenhum equipamento validado no catálogo</strong><p>Não vamos declarar compatibilidade sem documentação do protocolo e teste com o equipamento real.</p><button className="text-button" onClick={() => setNotice(`Protocolo selecionado: ${connection.toUpperCase()}. O adaptador será cadastrado após validação técnica.`)}>Solicitar cadastro deste modelo</button></div> : visibleScales.map((scale) => <button key={scale.id} className="scale-result" onClick={() => setActiveScale(scale.id)}><span><strong>{scale.manufacturer} {scale.model}</strong><small>{scale.transports.join(', ')}</small></span><span className="scale-status">{scale.protocolStatus}</span></button>)}
                  {activeScale && <p className="inline-hint">Equipamento selecionado: {activeScale}. O driver ainda precisa ser configurado.</p>}
                </section>
                <section className="panel sample-panel">
                  <div className="panel-heading"><div><h2>Resumo da sessão</h2><p>Indicadores calculados a partir dos registros desta sessão.</p></div><span className="sample-count">{records.length} registros</span></div>
                  <div className="sample-stats"><div><small>Peso médio</small><strong>{stats.meanGrams === null ? '—' : `${formatNumber(stats.meanGrams)} g`}</strong></div><div><small>Coeficiente de variação</small><strong>{stats.cvPercent === null ? '—' : `${formatNumber(stats.cvPercent, 2)}%`}</strong></div><div><small>Uniformidade ±10%</small><strong>{stats.uniformityPercent === null ? '—' : `${formatNumber(stats.uniformityPercent, 1)}%`}</strong></div></div>
                  <div className="table-wrap"><table><thead><tr><th>Registro</th><th>Identificação</th><th>Peso</th><th>Origem</th></tr></thead><tbody>{records.length === 0 ? <tr><td colSpan={4} className="table-empty">Nenhuma pesagem registrada nesta sessão.</td></tr> : records.slice().reverse().map((record, index) => <tr key={record.id}><td>#{records.length - index}</td><td>{record.identificationMode === 'ring' ? `Anilha ${record.ringId}` : `Amostra ${record.sampleNumber}`}</td><td>{formatNumber(record.weightGrams)} g</td><td><span className="manual-label">Manual</span></td></tr>)}</tbody></table></div>
                  <div className="table-footnote">Amostra: {stats.count} aves válidas. Sem identificação por anilha, os registros não representam o histórico longitudinal de uma mesma ave.</div>
                </section>
              </div>
            </>
          )}

          {section === 'builder' && (
            <>
              <div className="page-heading"><div><span className="eyebrow">PLANEJAMENTO PARAMÉTRICO</span><h1>Montar minha granja</h1><p>Defina dimensões e parâmetros documentados. O modelo 3D acompanha as alterações.</p></div><span className="draft-badge"><span className="status-dot" />Rascunho local</span></div>
              <div className="builder-layout">
                <section className="panel builder-form">
                  <div className="panel-heading"><div><h2>Dados do galpão</h2><p>Dimensões da estrutura e capacidade pretendida.</p></div><span className="panel-icon"><House size={20} /></span></div>
                  <div className="form-section"><h3>Estrutura física</h3><div className="field-grid"><Field label="Comprimento" value={farm.houseLengthM} onChange={(value) => updateFarm('houseLengthM', value)} unit="m" step={0.1} /><Field label="Largura" value={farm.houseWidthM} onChange={(value) => updateFarm('houseWidthM', value)} unit="m" step={0.1} /><Field label="Altura lateral" value={farm.sideHeightM} onChange={(value) => updateFarm('sideHeightM', value)} unit="m" step={0.1} /><Field label="Altura da cumeeira" value={farm.ridgeHeightM} onChange={(value) => updateFarm('ridgeHeightM', value)} unit="m" step={0.1} /></div></div>
                  <div className="form-section"><h3>Planejamento do lote</h3><div className="field-grid"><Field label="Aves pretendidas" value={farm.targetBirds} onChange={(value) => updateFarm('targetBirds', value)} unit="aves" /><Field label="Área útil" value={farm.usableAreaPercent} onChange={(value) => updateFarm('usableAreaPercent', value)} unit="%" step={1} /></div><div className="field-grid"><label className="field"><span>Linhagem</span><select value={lineage} onChange={(event) => setLineage(event.target.value)}><option>Hy-Line Brown</option><option>Lohmann Brown-Classic</option><option>NOVOgen Brown</option><option>Hy-Line W-36</option><option>Outra / não definida</option></select></label><label className="field"><span>Sistema de alojamento</span><select value={housingSystem} onChange={(event) => setHousingSystem(event.target.value)}><option>Gaiolas convencionais</option><option>Gaiolas enriquecidas</option><option>Sistema de piso</option><option>Free-range</option></select></label><label className="field"><span>Fase produtiva</span><select value={productionPhase} onChange={(event) => setProductionPhase(event.target.value)}><option>Cria</option><option>Recria</option><option>Pré-postura</option><option>Produção</option></select></label><Field label="Idade das aves" value={ageWeeks} onChange={(value) => setAgeWeeks(value ?? 1)} unit="semanas" hint="Idade usada para filtrar parâmetros do manual." /><label className="field"><span>Clima informado da região</span><select value={climateProfile} onChange={(event) => setClimateProfile(event.target.value as ClimateProfile)}><option>Quente</option><option>Temperado</option><option>Frio</option><option>Outro / não informado</option></select><small>Definido pelo usuário; não usa geolocalização.</small></label></div></div>
                  <div className="form-section"><div className="form-section-heading"><div><h3>Parâmetros técnicos</h3><p>Preenchimento automático quando há correspondência exata no manual.</p></div><span className="source-required">{technicalRecommendation ? 'Referência encontrada' : 'Sem referência aplicável'}</span></div><div className="field-grid"><Field label="Área por ave" value={farm.areaPerBirdCm2} onChange={(value) => updateFarm('areaPerBirdCm2', value)} unit="cm²/ave" step={1} hint="Em free-range, representa somente a área interna útil." /><Field label="Aves por nipple" value={farm.birdsPerNipple} onChange={(value) => updateFarm('birdsPerNipple', value)} unit="aves" step={1} /><Field label="Comedouro linear por ave" value={farm.feederCmPerBird} onChange={(value) => updateFarm('feederCmPerBird', value)} unit="cm/ave" step={0.1} /><Field label="Capacidade por gaiola/módulo" value={farm.cageCapacity} onChange={(value) => updateFarm('cageCapacity', value)} unit="aves" step={1} hint="Depende do modelo e das dimensões do equipamento." /><Field label="Vazão útil por ventilador" value={farm.fanCapacityM3h} onChange={(value) => updateFarm('fanCapacityM3h', value)} unit="m³/h" step={100} hint="Informe a vazão na pressão estática de trabalho." /><Field label="Necessidade de ar por ave" value={farm.airflowM3hPerBird} onChange={(value) => updateFarm('airflowM3hPerBird', value)} unit="m³/h/ave" step={0.1} hint="Não há coeficiente universal validado para todas as linhagens e climas." /></div>{technicalRecommendation ? <><div className="source-warning"><ShieldCheck size={17} /><span><strong>{technicalRecommendation.source.publisher}</strong> · {technicalRecommendation.source.title} · {technicalRecommendation.source.edition} · página {technicalRecommendation.source.page}. {technicalRecommendation.note} Clima informado: {climateProfile}.</span></div><div className="source-actions"><a href={technicalRecommendation.source.url} target="_blank" rel="noreferrer">Abrir manual original</a><button className="text-button" onClick={applyTechnicalRecommendation}>Reaplicar valores do manual</button></div></> : <div className="source-warning"><ShieldCheck size={17} /><span>Não há combinação de linhagem, alojamento, fase e idade com coeficientes comerciais verificados nesta biblioteca local. Os campos permanecem editáveis, sem preenchimento presumido. Clima informado: {climateProfile}. Ventiladores e capacidade de gaiolas dependem de dados específicos do equipamento.</span></div>}</div>
                </section>
                <div className="builder-preview-column">
                  <section className="panel scene-panel"><div className="scene-heading"><div><h2>Pré-visualização 3D</h2><p>Modelo paramétrico simplificado · vista interativa</p></div><span className="scene-live"><span className="status-dot" />Atualizado</span></div><FarmScene length={farm.houseLengthM || 1} width={farm.houseWidthM || 1} rows={3} /><div className="scene-footer"><span><Layers3 size={15} />Estrutura ilustrativa</span><span>Arraste para orbitar · scroll para zoom</span></div></section>
                  <section className="panel calculation-panel"><div className="panel-heading"><div><h2>Dimensionamento preliminar</h2><p>Resultados derivados exclusivamente das entradas.</p></div><Gauge size={20} /></div><div className="calculation-grid"><div><small>Área bruta</small><strong>{calculation ? `${formatNumber(calculation.grossAreaM2, 1)} m²` : 'Pendente'}</strong></div><div><small>Área útil estimada</small><strong>{calculation ? `${formatNumber(calculation.usableAreaM2, 1)} m²` : 'Pendente'}</strong></div><div><small>Capacidade por área</small><strong>{!calculation || calculation.areaBasedCapacity === null ? 'Pendente' : `${formatNumber(calculation.areaBasedCapacity)} aves`}</strong></div><div><small>Nipples calculados</small><strong>{!calculation || calculation.nipplesRequired === null ? 'Pendente' : formatNumber(calculation.nipplesRequired)}</strong></div><div><small>Comedouro linear</small><strong>{!calculation || calculation.feederLengthM === null ? 'Pendente' : `${formatNumber(calculation.feederLengthM, 1)} m`}</strong></div><div><small>Ventiladores</small><strong>{!calculation || calculation.fansRequired === null ? 'Pendente' : formatNumber(calculation.fansRequired)}</strong></div><div><small>Gaiolas/módulos</small><strong>{!calculation || calculation.cagesRequired === null ? 'Pendente' : formatNumber(calculation.cagesRequired)}</strong></div></div><div className="calculation-disclaimer"><ShieldCheck size={17} /><p>Pré-dimensionamento. Não considera ainda perdas de carga, curvas de ventiladores, distribuição hidráulica, legislação ou validação de engenharia.</p></div></section>
                </div>
              </div>
            </>
          )}

          {section === 'technical' && (
            <>
              <div className="page-heading"><div><span className="eyebrow">BASE DE CONHECIMENTO</span><h1>Biblioteca técnica</h1><p>Parâmetros zootécnicos precisam manter origem, versão e contexto de aplicação.</p></div><button className="button button-primary" onClick={() => setNotice('O cadastro e a revisão documental serão ampliados junto com o armazenamento dos manuais originais.')}><Plus size={17} />Adicionar manual</button></div>
              <section className="panel library-empty"><div className="library-icon"><BookOpen size={27} /></div><h2>Biblioteca técnica em implantação</h2><p>Há referências oficiais vinculadas a algumas linhagens e sistemas, mas a cobertura ainda é parcial. Nenhum coeficiente será presumido quando o manual consultado não trouxer a combinação exata.</p><div className="library-checklist"><div><CheckCircle size={17} />Upload de PDF original</div><div><CheckCircle size={17} />Extração de tabelas e recomendações</div><div><CheckCircle size={17} />Revisão técnica e aprovação humana</div><div><CheckCircle size={17} />Rastreabilidade por página e versão</div></div></section>
            </>
          )}
        </div>
        <footer className="app-footer"><span>Granja · Gestão Avícola Inteligente</span><span>Protótipo inicial · Dados locais</span></footer>
      </main>
    </div>
  );
}
