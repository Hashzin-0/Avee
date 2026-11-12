'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
import { FlockMonitoringPanel } from '../features/flock-management/FlockMonitoringPanel';
import { getManagementPhase } from '../features/flock-management/management-library';
import { TechnicalIndicatorsPage } from '../features/flock-management/TechnicalIndicatorsPage';
import { getLayerTechnicalRecommendation, type ClimateProfile, type HousingSystem, type LayerLineage, type TechnicalParameterKey } from '../features/farm-builder/technical-recommendations';
import { calculateFarm, calculateUniformity, type FarmInput } from '../features/farm-builder/domain';
import { connectionOptions, scaleCatalog } from '../features/weighing/catalog';
import type { IdentificationMode, WeighingRecord } from '../features/weighing/types';
import { WorkspacePages } from '../features/workspace/WorkspacePages';
import { FarmActivityCalendar } from '../features/dashboard/FarmActivityCalendar';
import { calculateFlockDashboard, type FlockDailyEntry } from '../features/flock-management/domain';
import { createInitialWorkspace, parseWorkspaceData, WORKSPACE_STORAGE_KEY } from '../features/workspace/storage';
import type { FarmRecord, FlockLot, WorkspaceData } from '../features/workspace/types';

type Section = 'overview' | 'weighing' | 'builder' | 'technical' | 'records' | 'farms' | 'settings' | 'profile';

const initialFarm: FarmInput = {
  houseLengthM: 100,
  houseWidthM: 20,
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
  installedNipples: undefined,
  installedFeederLengthM: undefined,
  installedFanCount: undefined,
  installedCageModules: undefined,
};

function formatNumber(value: number, digits = 0) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value);
}

function formatRange(min?: number, max?: number, digits = 1) {
  if (min === undefined || max === undefined) return '—';
  return min === max ? formatNumber(min, digits) : `${formatNumber(min, digits)}–${formatNumber(max, digits)}`;
}

function formatOptionalNumber(value: number | null | undefined, digits = 0) {
  return value === null || value === undefined ? '—' : formatNumber(value, digits);
}

function readFlockEntries(raw: string | null): FlockDailyEntry[] {
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
  const pathname = usePathname();
  const router = useRouter();
  const section: Section = pathname === '/granja' ? 'builder' : pathname === '/pesagem' ? 'weighing' : pathname === '/registros' ? 'records' : pathname === '/biblioteca' || pathname === '/indicadores-zootecnicos' ? 'technical' : pathname === '/granjas' ? 'farms' : pathname === '/configuracoes' ? 'settings' : pathname === '/perfil' ? 'profile' : 'overview';
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [workspace, setWorkspace] = useState<WorkspaceData>(() => createInitialWorkspace());
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const activeFarm = workspace.farms.find((item) => item.id === workspace.activeFarmId) ?? workspace.farms[0];
  const activeLot = activeFarm?.lots.find((item) => item.id === workspace.activeLotId) ?? activeFarm?.lots.find((item) => item.status === 'active');
  const [farm, setFarm] = useState<Partial<FarmInput>>(initialFarm);
  const [planningMode, setPlanningMode] = useState<'birds' | 'house'>('birds');
  const [layoutRows, setLayoutRows] = useState(3);
  const [identification, setIdentification] = useState<IdentificationMode>('sampling');
  const [inputWeight, setInputWeight] = useState('');
  const [ringId, setRingId] = useState('');
  const [sampleNumber, setSampleNumber] = useState('1');
  const [records, setRecords] = useState<WeighingRecord[]>([]);
  const [flockEntries, setFlockEntries] = useState<FlockDailyEntry[]>([]);
  const [scaleQuery, setScaleQuery] = useState('');
  const [connection, setConnection] = useState('usb');
  const [activeScale, setActiveScale] = useState('');
  const [notice, setNotice] = useState('');
  const [lineage, setLineage] = useState<LayerLineage>('Hy-Line Brown');
  const [housingSystem, setHousingSystem] = useState<HousingSystem>('Gaiolas convencionais');
  const [ageWeeks, setAgeWeeks] = useState(24);
  const productionPhase = Number.isFinite(ageWeeks) && ageWeeks >= 0 ? getManagementPhase(ageWeeks) : 'Cria';
  const [climateProfile, setClimateProfile] = useState<ClimateProfile>('Outro / não informado');
  const [manualOverrides, setManualOverrides] = useState<Set<TechnicalParameterKey>>(() => new Set());
  const flockReferenceSystem = housingSystem === 'Gaiolas enriquecidas' ? 'unsupported' : housingSystem === 'Gaiolas convencionais' ? 'conventional' : 'alternative';
  const technicalRecommendation = useMemo(() => getLayerTechnicalRecommendation({ lineage, housingSystem, phase: productionPhase, ageWeeks, climateProfile }), [lineage, housingSystem, productionPhase, ageWeeks, climateProfile]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
      const next = saved ? (parseWorkspaceData(saved) ?? createInitialWorkspace()) : createInitialWorkspace();
      setWorkspace(next);
      const selectedFarm = next.farms.find((item) => item.id === next.activeFarmId) ?? next.farms[0];
      const selectedLot = selectedFarm?.lots.find((item) => item.id === next.activeLotId) ?? selectedFarm?.lots[0];
      if (selectedFarm) setFarm({ ...initialFarm, ...selectedFarm.configuration, targetBirds: selectedLot?.initialBirds ?? selectedFarm.configuration.targetBirds ?? initialFarm.targetBirds });
      if (selectedLot) {
        setLineage(selectedLot.lineage as LayerLineage);
        setHousingSystem(selectedLot.housingSystem as HousingSystem);
        setAgeWeeks(selectedLot.ageWeeks);
      }
    } catch {
      setNotice('Não foi possível ler o cadastro local. Os dados atuais permanecem disponíveis nesta sessão.');
    }
    setWorkspaceReady(true);
  }, []);

  useEffect(() => {
    const lotId = activeLot?.id;
    if (!lotId) {
      setFlockEntries([]);
      return;
    }
    const key = `granja.flock-entries.v1.${lotId}`;
    const loadEntries = () => setFlockEntries(readFlockEntries(window.localStorage.getItem(key)));
    loadEntries();
    window.addEventListener('storage', loadEntries);
    window.addEventListener('granja:flock-entries-updated', loadEntries);
    return () => {
      window.removeEventListener('storage', loadEntries);
      window.removeEventListener('granja:flock-entries-updated', loadEntries);
    };
  }, [activeLot?.id]);

  useEffect(() => {
    if (!workspaceReady) return;
    try {
      window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(workspace));
    } catch {
      setNotice('O armazenamento local está indisponível ou cheio. Exporte seus dados antes de fechar o navegador.');
    }
  }, [workspace, workspaceReady]);

  useEffect(() => {
    if (!workspaceReady || !activeFarm) return;
    setWorkspace((current) => ({
      ...current,
      farms: current.farms.map((item) => item.id === activeFarm.id
        ? { ...item, configuration: { ...item.configuration, ...farm } }
        : item),
    }));
  }, [farm, workspaceReady, activeFarm?.id]);

  useEffect(() => {
    setManualOverrides(new Set());
  }, [lineage, housingSystem, ageWeeks, climateProfile]);

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
  const equipmentCalculation = useMemo(() => {
    if (!calculation) return null;
    const birdsToDimension = planningMode === 'house' ? calculation.availableBirdCapacity : farm.targetBirds;
    if (!birdsToDimension || birdsToDimension < 1) return null;
    try { return calculateFarm({ ...(farm as FarmInput), targetBirds: birdsToDimension }); }
    catch { return null; }
  }, [calculation, farm, planningMode]);
  const stats = useMemo(() => calculateUniformity(records.map((record) => record.weightGrams)), [records]);
  const flockDashboard = useMemo(() => {
    if (!activeLot || !Number.isInteger(activeLot.initialBirds) || activeLot.initialBirds <= 0) return null;
    try { return calculateFlockDashboard(activeLot.initialBirds, flockEntries); } catch { return null; }
  }, [activeLot?.id, activeLot?.initialBirds, flockEntries]);
  const latestFlockDay = flockDashboard?.latest ?? null;
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
    const routes: Record<Section, string> = { overview: '/', builder: '/granja', weighing: '/pesagem', records: '/registros', technical: '/indicadores-zootecnicos', farms: '/granjas', settings: '/configuracoes', profile: '/perfil' };
    router.push(routes[next]);
    setMobileNavOpen(false);
    setNotice('');
  };

  return (
    <div className={workspace.settings.compactTables ? "app-shell compact-tables" : "app-shell"} data-theme={workspace.settings.theme}>
      <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><Bird size={23} weight="fill" /></div>
          <div><strong>granja</strong><span>GESTÃO AVÍCOLA</span></div>
          <button className="icon-button mobile-close" aria-label="Fechar menu" onClick={() => setMobileNavOpen(false)}><X size={18} /></button>
        </div>
        <div className="workspace-switcher">
          <div className="workspace-avatar">GF</div>
          <div><strong>{activeFarm?.name ?? 'Cadastrar granja'}</strong><span>{activeLot?.name ?? 'Nenhum lote selecionado'}</span></div>
          <ChevronDown size={16} />
        </div>
        <nav className="primary-nav" aria-label="Navegação principal">
          <span className="nav-label">GESTÃO</span>
          <button className={section === 'overview' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('overview')}><House size={18} />Visão geral</button>
          <button className={section === 'weighing' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('weighing')}><Scale size={18} />Pesagem <span className="nav-count">{records.length || '—'}</span></button>
          <button className={section === 'records' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('records')}><Egg size={18} />Registros diários</button>
          <button className={section === 'technical' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('technical')}><ChartLine size={18} />Indicadores zootécnicos</button>
          <span className="nav-label nav-label-spaced">PLANEJAMENTO</span>
          <button className={section === 'builder' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('builder')}><Boxes size={18} />Montar minha granja <span className="new-pill">3D</span></button>
          
          <span className="nav-label nav-label-spaced">ADMINISTRAÇÃO</span>
          <button className={section === 'farms' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('farms')}><House size={18} />Minhas granjas</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="sync-status"><span className="status-dot" /><div><strong>Modo local</strong><small>Sincronização em nuvem não configurada</small></div></div>
          <button className={section === 'settings' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('settings')}><Settings2 size={18} />Configurações</button>
          <button className="profile-row profile-button" onClick={() => navigate('profile')}><div className="profile-avatar">{workspace.profile.fullName.trim().charAt(0).toUpperCase() || 'A'}</div><div><strong>{workspace.profile.fullName || 'Administrador'}</strong><small>Perfil do administrador</small></div><ChevronDown size={16} /></button>
        </div>
      </aside>

      {mobileNavOpen && <button className="mobile-scrim" aria-label="Fechar menu" onClick={() => setMobileNavOpen(false)} />}

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Abrir menu" onClick={() => setMobileNavOpen(true)}><Menu size={20} /></button>
          <div className="breadcrumb">{activeFarm?.name ?? 'Granja'} <span>/</span> {section === 'builder' ? 'Construtor 3D' : section === 'weighing' ? 'Pesagem' : section === 'technical' ? 'Indicadores zootécnicos' : section === 'records' ? 'Registros diários' : section === 'farms' ? 'Minhas granjas' : section === 'settings' ? 'Configurações' : section === 'profile' ? 'Perfil do administrador' : 'Visão geral'}</div>
          <div className="topbar-actions"><span className="environment-chip"><span className="status-dot" />Ambiente de desenvolvimento</span><button className="icon-button" aria-label="Ajuda" onClick={() => setNotice('Este é um protótipo local. Consulte o README para conhecer os limites atuais.')}><CircleHelp size={19} /></button></div>
        </header>

        <div className="page-content">
          {notice && <div className="notice" role="status"><CheckCircle size={17} />{notice}<button onClick={() => setNotice('')} aria-label="Fechar aviso"><X size={16} /></button></div>}

          {(section === 'farms' || section === 'settings' || section === 'profile') && <WorkspacePages
            page={section}
            data={workspace}
            onChange={setWorkspace}
            onSelectFarm={(selected: FarmRecord) => {
              const lot = selected.lots[0];
              setWorkspace((current) => ({ ...current, activeFarmId: selected.id, activeLotId: lot?.id ?? '' }));
              setFarm({ ...initialFarm, ...selected.configuration, targetBirds: lot?.initialBirds ?? selected.configuration.targetBirds ?? 0 });
              if (lot) {
                setLineage(lot.lineage as LayerLineage);
                setHousingSystem(lot.housingSystem as HousingSystem);
                setAgeWeeks(lot.ageWeeks);
              }
            }}
            onSelectLot={(selected: FarmRecord, lot: FlockLot) => {
              setWorkspace((current) => ({ ...current, activeFarmId: selected.id, activeLotId: lot.id }));
              setFarm({ ...initialFarm, ...selected.configuration, targetBirds: lot.initialBirds });
              setLineage(lot.lineage as LayerLineage);
              setHousingSystem(lot.housingSystem as HousingSystem);
              setAgeWeeks(lot.ageWeeks);
            }}
          />}
          {section === 'overview' && (
            <>
              <FarmActivityCalendar farms={workspace.farms} />
              <div className="page-heading"><div><span className="eyebrow">PAINEL DA GRANJA</span><h1>Visão geral</h1><p>Acompanhe a operação e acesse as ferramentas de manejo.</p></div><button className="button button-primary" onClick={() => navigate('weighing')}><Plus size={17} />Nova pesagem</button></div>
              <div className="metrics-grid">
                <Metric label="Plantel de referência" value={formatNumber(activeLot?.currentBirds ?? farm.targetBirds ?? 0)} detail={activeLot?.name ?? 'Quantidade informada no planejamento'} icon={Bird} />
                <Metric label="Pesagens nesta sessão" value={String(records.length)} detail="Registros locais ainda não sincronizados" icon={Scale} />
                <Metric label="Peso médio da amostra" value={stats.meanGrams === null ? '—' : `${formatNumber(stats.meanGrams)} g`} detail="Calculado sobre os registros desta sessão" icon={Gauge} />
                <Metric label="Uniformidade da amostra" value={stats.uniformityPercent === null ? '—' : `${formatNumber(stats.uniformityPercent, 1)}%`} detail="Faixa de ±10% da média amostral" icon={ChartLine} />
                <Metric label="Aves vivas estimadas" value={latestFlockDay ? formatNumber(flockDashboard?.currentBirds ?? 0) : '—'} detail="Após mortes e eliminações registradas" icon={Bird} />
                <Metric label="Mortalidade do dia" value={latestFlockDay ? `${formatNumber(latestFlockDay.dailyMortalityPercent, 3)}%` : '—'} detail="Óbitos ÷ aves no início do dia" icon={Activity} />
                <Metric label="Mortalidade acumulada" value={latestFlockDay ? `${formatNumber(flockDashboard?.cumulativeMortalityPercent ?? 0, 2)}%` : '—'} detail="Óbitos ÷ aves alojadas inicialmente" icon={Activity} />
                <Metric label="Eliminações acumuladas" value={latestFlockDay ? `${formatNumber(flockDashboard?.cumulativeCullsPercent ?? 0, 2)}%` : '—'} detail="Eliminações, sem classificar como morte" icon={Bird} />
                <Metric label="Viabilidade atual" value={latestFlockDay ? `${formatNumber(flockDashboard?.liveabilityPercent ?? 0, 2)}%` : '—'} detail="Aves vivas ÷ aves alojadas inicialmente" icon={CheckCircle} />
                <Metric label="Ração por ave/dia" value={latestFlockDay ? `${formatOptionalNumber(latestFlockDay.feedGramsPerBirdDay)} g` : '—'} detail="Último dia registrado" icon={Activity} />
                <Metric label="Água por ave/dia" value={latestFlockDay ? `${formatOptionalNumber(latestFlockDay.waterMlPerBirdDay)} ml` : '—'} detail="Último dia registrado" icon={Activity} />
                <Metric label="Postura hen-day" value={latestFlockDay ? `${formatOptionalNumber(latestFlockDay.henDayProductionPercent)}%` : '—'} detail="Ovos ÷ aves vivas no fim do dia" icon={Egg} />
                <Metric label="Postura hen-housed" value={latestFlockDay ? `${formatOptionalNumber(latestFlockDay.henHousedProductionPercent)}%` : '—'} detail="Ovos ÷ aves alojadas inicialmente" icon={Egg} />
                <Metric label="Massa de ovos acumulada" value={latestFlockDay ? `${formatNumber(flockDashboard?.eggMassTotalKg ?? 0)} kg` : '—'} detail={flockDashboard?.eggMassCoverageComplete ? 'Cobertura completa dos dias com postura' : 'Parcial: falta peso médio em dias com ovos'} icon={Egg} />
                <Metric label="Conversão alimentar acumulada" value={!latestFlockDay || !flockDashboard?.eggMassCoverageComplete || flockDashboard.cumulativeFeedConversion === null ? '—' : `${formatNumber(flockDashboard.cumulativeFeedConversion, 2)} kg/kg`} detail="Ração acumulada ÷ massa de ovos acumulada" icon={Gauge} />
                <Metric label="Ovos acumulados" value={latestFlockDay ? formatNumber(flockDashboard?.eggsTotal ?? 0) : '—'} detail="Total dos dias registrados" icon={Egg} />
                <Metric label="Ovos por ave alojada" value={latestFlockDay ? formatNumber(flockDashboard?.eggsPerHousedBird ?? 0, 2) : '—'} detail="Ovos acumulados ÷ aves alojadas inicialmente" icon={Egg} />
                <Metric label="Massa de ovos por ave alojada" value={!latestFlockDay || flockDashboard?.eggMassPerHousedBirdKg === null || flockDashboard?.eggMassPerHousedBirdKg === undefined ? '—' : `${formatNumber(flockDashboard.eggMassPerHousedBirdKg, 3)} kg`} detail="Massa acumulada ÷ aves alojadas inicialmente" icon={Egg} />
                <Metric label="Ração acumulada" value={latestFlockDay ? `${formatNumber(flockDashboard?.feedTotalKg ?? 0)} kg` : '—'} detail="Total dos registros diários" icon={Activity} />
                <Metric label="Peso corporal médio medido" value={latestFlockDay?.averageBodyWeightGrams ? `${formatNumber(latestFlockDay.averageBodyWeightGrams, 0)} g` : '—'} detail="Amostra informada no último registro" icon={Gauge} />
                <Metric label="Peso médio do ovo medido" value={latestFlockDay?.averageEggWeightGrams ? `${formatNumber(latestFlockDay.averageEggWeightGrams)} g` : '—'} detail="Amostra informada no último registro" icon={Egg} />
              </div>
              <section className="welcome-panel">
                <div className="welcome-copy"><span className="eyebrow">PLANEJAMENTO DE INSTALAÇÕES</span><h2>Projete seu galpão antes de construir.</h2><p>Informe as dimensões, adicione parâmetros técnicos com fonte identificada e visualize uma proposta tridimensional editável.</p><button className="button button-light" onClick={() => navigate('builder')}>Abrir construtor 3D <span>→</span></button></div>
                <div className="welcome-visual"><div className="blueprint-grid" /><div className="blueprint-building"><div className="blueprint-roof" /><div className="blueprint-body"><span /><span /><span /><span /></div><div className="blueprint-dimension dimension-x">100 m · exemplo editável</div><div className="blueprint-dimension dimension-y">20 m</div></div></div>
              </section>
              <div className="section-title-row"><div><h2>Acesso rápido</h2><p>Ferramentas disponíveis nesta versão inicial.</p></div></div>
              <div className="quick-grid">
                <button className="quick-card" onClick={() => navigate('weighing')}><span className="quick-icon"><Scale size={21} /></span><strong>Central de pesagem</strong><small>Registrar pesos e configurar identificação</small><span className="quick-arrow">→</span></button>
                <button className="quick-card" onClick={() => navigate('builder')}><span className="quick-icon"><Boxes size={21} /></span><strong>Montar minha granja</strong><small>Dimensionamento paramétrico e cena 3D</small><span className="quick-arrow">→</span></button>
                <button className="quick-card" onClick={() => navigate('technical')}><span className="quick-icon"><BookOpen size={21} /></span><strong>Indicadores zootécnicos</strong><small>Metas do guia, resultados reais e biblioteca técnica</small><span className="quick-arrow">→</span></button>
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
                  <div className="panel-heading"><div><h2>Dados do galpão</h2><p>Dimensione a partir do plantel ou descubra a capacidade da estrutura existente.</p></div><span className="panel-icon"><House size={20} /></span></div>
                  <div className="form-section"><h3>Modo de dimensionamento</h3><div className="segmented-control"><button type="button" className={planningMode === 'birds' ? 'selected' : ''} aria-pressed={planningMode === 'birds'} onClick={() => setPlanningMode('birds')}>Tenho as aves</button><button type="button" className={planningMode === 'house' ? 'selected' : ''} aria-pressed={planningMode === 'house'} onClick={() => setPlanningMode('house')}>Tenho o galpão</button></div>{planningMode === 'house' && <div className="capacity-mode-summary"><strong>Descobrir capacidade do galpão</strong><p>Informe o sistema de alojamento e um coeficiente de área útil por ave documentado. A capacidade será calculada automaticamente; sem esse dado, o sistema não presumirá uma densidade.</p></div>}</div>
                  <div className="form-section"><h3>Estrutura física</h3><div className="field-grid"><Field label="Comprimento" value={farm.houseLengthM} onChange={(value) => updateFarm('houseLengthM', value)} unit="m" step={0.1} /><Field label="Largura" value={farm.houseWidthM} onChange={(value) => updateFarm('houseWidthM', value)} unit="m" step={0.1} /><Field label="Altura lateral" value={farm.sideHeightM} onChange={(value) => updateFarm('sideHeightM', value)} unit="m" step={0.1} /><Field label="Altura da cumeeira" value={farm.ridgeHeightM} onChange={(value) => updateFarm('ridgeHeightM', value)} unit="m" step={0.1} /></div></div>
                  <div className="form-section"><h3>Planejamento do lote</h3><div className="field-grid">{planningMode === 'birds' ? <Field label="Aves pretendidas" value={farm.targetBirds} onChange={(value) => updateFarm('targetBirds', value)} unit="aves" /> : <div className="capacity-mode-summary"><span>Capacidade com dados informados</span><strong>{calculation?.availableBirdCapacity !== null && calculation?.availableBirdCapacity !== undefined ? `${formatNumber(calculation.availableBirdCapacity)} aves` : 'Aguardando dados instalados'}</strong></div>}<Field label="Área útil" value={farm.usableAreaPercent} onChange={(value) => updateFarm('usableAreaPercent', value)} unit="%" step={1} hint="Percentual disponível após corredores e áreas técnicas; ajuste conforme a planta real." /></div><div className="field-grid"><label className="field"><span>Linhagem</span><select value={lineage} onChange={(event) => setLineage(event.target.value as LayerLineage)}><option>Hy-Line Brown</option><option>Lohmann Brown-Classic</option><option>NOVOgen Brown</option><option>Hy-Line W-36</option><option>Outra / não definida</option></select></label><label className="field"><span>Sistema de alojamento</span><select value={housingSystem} onChange={(event) => setHousingSystem(event.target.value as HousingSystem)}><option>Gaiolas convencionais</option><option>Gaiolas enriquecidas</option><option>Sistema de piso</option><option>Aviário / multinível</option><option>Free-range</option></select></label><div className="phase-indicator"><span>Fase identificada automaticamente pela idade</span><strong>{productionPhase}</strong></div><Field label="Idade das aves" value={ageWeeks} onChange={(value) => setAgeWeeks(value ?? 0)} unit="semanas" step={0.1} hint="Informe a idade real; a fase é convertida automaticamente." /><label className="field"><span>Clima informado da região</span><select value={climateProfile} onChange={(event) => setClimateProfile(event.target.value as ClimateProfile)}><option>Quente</option><option>Temperado</option><option>Frio</option><option>Outro / não informado</option></select><small>Definido pelo usuário; não usa geolocalização.</small></label></div></div>
                  <div className="form-section"><h3>Disposição interna</h3><div className="field-grid"><Field label="Linhas de alojamento" value={layoutRows} onChange={(value) => setLayoutRows(Math.min(12, Math.max(1, Math.floor(value ?? 1))))} unit="linhas" min={1} step={1} hint="Quantidade de linhas representadas no modelo 3D." /></div></div>
                  <div className="form-section"><div className="form-section-heading"><div><h3>Parâmetros técnicos</h3><p>Preenchimento automático quando há correspondência exata no manual.</p></div><span className="source-required">{technicalRecommendation ? 'Parâmetros encontrados' : 'Sem tabela compatível'}</span></div><div className="field-grid"><Field label="Área útil do galpão por ave" value={farm.areaPerBirdCm2} onChange={(value) => updateFarm('areaPerBirdCm2', value)} unit="cm²/ave" step={1} hint="Coeficiente de área útil interna do galpão. Não use a área de piso da gaiola como substituta; informe apenas valor com fonte ou premissa técnica validada." /><Field label="Aves por nipple" value={farm.birdsPerNipple} onChange={(value) => updateFarm('birdsPerNipple', value)} unit="aves" step={1} /><Field label="Comedouro linear por ave" value={farm.feederCmPerBird} onChange={(value) => updateFarm('feederCmPerBird', value)} unit="cm/ave" step={0.1} /><Field label="Capacidade por gaiola/módulo" value={farm.cageCapacity} onChange={(value) => updateFarm('cageCapacity', value)} unit="aves" step={1} hint="Depende do modelo e das dimensões do equipamento." /><Field label="Vazão útil por ventilador" value={farm.fanCapacityM3h} onChange={(value) => updateFarm('fanCapacityM3h', value)} unit="m³/h" step={100} hint="Informe a vazão na pressão estática de trabalho." /><Field label="Necessidade de ar por ave" value={farm.airflowM3hPerBird} onChange={(value) => updateFarm('airflowM3hPerBird', value)} unit="m³/h/ave" step={0.1} hint="Não há coeficiente universal validado para todas as linhagens e climas." /></div>{technicalRecommendation ? <><div className="source-warning"><ShieldCheck size={17} /><span><strong>{technicalRecommendation.source.publisher}</strong> · {technicalRecommendation.source.title} · {technicalRecommendation.source.edition} · página {technicalRecommendation.source.page}. Faixa etária: {technicalRecommendation.ageRangeLabel}. Sistema: {technicalRecommendation.housingSystem}. Revisão: {technicalRecommendation.reviewStatus}. {technicalRecommendation.note} Clima informado: {climateProfile}.</span></div><div className="source-actions"><a href={technicalRecommendation.source.url} target="_blank" rel="noreferrer">Abrir manual original</a><button className="text-button" onClick={applyTechnicalRecommendation}>Reaplicar valores do manual</button></div></> : <div className="source-warning"><ShieldCheck size={17} /><span>{lineage === 'NOVOgen Brown' && climateProfile !== 'Quente' && climateProfile !== 'Temperado' ? 'Para NOVOgen Brown, informe clima Quente ou Temperado: o guia não apresenta coeficientes de alojamento para clima frio ou não informado.' : 'Não há coeficientes de instalação para esta combinação exata de linhagem, alojamento, fase e idade. Isso não impede a consulta aos indicadores zootécnicos da linhagem. Ajuste idade/fase ou consulte o guia original.'} Clima informado: {climateProfile}. Ventiladores e capacidade de gaiolas dependem de dados específicos do equipamento.</span></div>}</div>
                  <div className="form-section"><h3>Equipamentos já instalados</h3><p className="section-help">Informe as quantidades existentes para calcular a capacidade real limitada pelos equipamentos.</p><div className="field-grid"><Field label="Nipples instalados" value={farm.installedNipples} onChange={(value) => updateFarm('installedNipples', value)} unit="unidades" step={1} /><Field label="Comedouro linear instalado" value={farm.installedFeederLengthM} onChange={(value) => updateFarm('installedFeederLengthM', value)} unit="metros" step={0.1} /><Field label="Ventiladores instalados" value={farm.installedFanCount} onChange={(value) => updateFarm('installedFanCount', value)} unit="unidades" step={1} /><Field label="Módulos/gaiolas instalados" value={farm.installedCageModules} onChange={(value) => updateFarm('installedCageModules', value)} unit="unidades" step={1} /></div></div>
                </section>
                <div className="builder-preview-column">
                  <section className="panel scene-panel"><div className="scene-heading"><div><h2>Pré-visualização 3D</h2><p>Modelo paramétrico detalhado · vista interativa</p></div><span className="scene-live"><span className="status-dot" />Atualizado</span></div><FarmScene length={farm.houseLengthM || 1} width={farm.houseWidthM || 1} sideHeight={farm.sideHeightM || 3} ridgeHeight={farm.ridgeHeightM || 4.5} rows={layoutRows} fans={planningMode === 'house' && farm.installedFanCount !== undefined ? farm.installedFanCount : (equipmentCalculation?.fansRequired ?? 0)} birds={planningMode === 'house' ? (calculation?.availableBirdCapacity ?? farm.targetBirds ?? 0) : (farm.targetBirds ?? 0)} nipples={equipmentCalculation?.nipplesRequired ?? farm.installedNipples ?? 0} /><div className="scene-footer"><span><Layers3 size={15} />Estrutura paramétrica · equipamentos ilustrativos</span><span>Plantel considerado: {formatNumber(planningMode === 'house' ? (calculation?.availableBirdCapacity ?? farm.targetBirds ?? 0) : (farm.targetBirds ?? 0))} aves · amostra visual otimizada · arraste para orbitar · scroll para zoom</span></div></section>
                  <section className="panel calculation-panel"><div className="panel-heading"><div><h2>Dimensionamento preliminar</h2><p>Resultados derivados exclusivamente das entradas.</p></div><Gauge size={20} /></div><div className="calculation-grid"><div><small>Área bruta</small><strong>{calculation ? `${formatNumber(calculation.grossAreaM2, 1)} m²` : 'Pendente'}</strong></div><div><small>Área útil estimada</small><strong>{calculation ? `${formatNumber(calculation.usableAreaM2, 1)} m²` : 'Pendente'}</strong></div><div><small>Capacidade pela área</small><strong>{!calculation || calculation.areaBasedCapacity === null ? 'Sem coeficiente' : `${formatNumber(calculation.areaBasedCapacity)} aves`}</strong></div><div><small>Menor limite conhecido</small><strong>{!calculation || calculation.availableBirdCapacity === null ? 'Dados insuficientes' : `${formatNumber(calculation.availableBirdCapacity)} aves`}</strong></div><div><small>Aves consideradas</small><strong>{planningMode === 'house' ? (calculation?.availableBirdCapacity !== null && calculation?.availableBirdCapacity !== undefined ? formatNumber(calculation.availableBirdCapacity) : 'Pendente') : formatNumber(farm.targetBirds ?? 0)}</strong></div><div><small>Nipples calculados</small><strong>{!equipmentCalculation || equipmentCalculation.nipplesRequired === null ? 'Pendente' : formatNumber(equipmentCalculation.nipplesRequired)}</strong></div><div><small>Comedouro linear</small><strong>{!equipmentCalculation || equipmentCalculation.feederLengthM === null ? 'Pendente' : `${formatNumber(equipmentCalculation.feederLengthM, 1)} m`}</strong></div><div><small>Ventiladores</small><strong>{!equipmentCalculation || equipmentCalculation.fansRequired === null ? 'Pendente' : formatNumber(equipmentCalculation.fansRequired)}</strong></div><div><small>Gaiolas/módulos</small><strong>{!equipmentCalculation || equipmentCalculation.cagesRequired === null ? 'Pendente' : formatNumber(equipmentCalculation.cagesRequired)}</strong></div></div><div className="capacity-constraints"><strong>{calculation?.limitingConstraints.length ? 'Fator(es) limitante(s) entre os dados informados' : 'Capacidade ainda não determinada'}</strong>{calculation?.limitingConstraints.length ? <ul>{calculation.limitingConstraints.map((item) => <li key={item.key}>{item.label}: {formatNumber(item.capacity)} aves</li>)}</ul> : <p>Informe coeficientes técnicos e quantidades instaladas compatíveis com o sistema para calcular a capacidade.</p>}</div><div className="calculation-disclaimer"><ShieldCheck size={17} /><p>Pré-dimensionamento. A capacidade considera somente os fatores com coeficiente e quantidade instalada informados. Não representa capacidade final enquanto os demais fatores aplicáveis não forem avaliados. Ainda não inclui perdas de carga, qualidade da água, vazão hidráulica, área externa, legislação local ou validação de engenharia.</p></div></section>

                </div>
              </div>

            </>
          )}

          {section === 'technical' && (
            <TechnicalIndicatorsPage
              initialLineage={lineage}
              initialHousingSystem={flockReferenceSystem === 'alternative' ? 'alternative' : 'conventional'}
              lotId={activeLot?.id ?? 'unassigned'}
              initialBirds={activeLot?.initialBirds ?? 0}
              ageWeeks={activeLot?.ageWeeks ?? ageWeeks}
            />
          )}
          {section === 'records' && <div className="dashboard-flock-section">
            <div className="section-title-row">
              <div><h2>Cálculos reais da granja</h2><p>Registros diários, indicadores do lote e comparação com referências da linhagem.</p></div>
            </div>
            <FlockMonitoringPanel key={activeLot?.id ?? "unassigned"} lineage={activeLot?.lineage as LayerLineage ?? lineage} ageWeeks={activeLot?.ageWeeks ?? ageWeeks} initialBirds={activeLot?.initialBirds ?? farm.targetBirds ?? 1} lotId={activeLot?.id ?? "unassigned"} referenceSystem={activeLot ? (activeLot.housingSystem === 'Gaiolas enriquecidas' ? 'unsupported' : activeLot.housingSystem === 'Gaiolas convencionais' ? 'conventional' : 'alternative') : flockReferenceSystem} />
          </div>}
        </div>
        <footer className="app-footer"><span>Granja · Gestão Avícola Inteligente</span><span>Protótipo inicial · Dados locais</span></footer>
      </main>
    </div>
  );
}
