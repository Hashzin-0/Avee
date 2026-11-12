'use client';

import { useState } from 'react';
import type { FarmRecord, FlockLot, WorkspaceData } from './types';

interface WorkspacePagesProps {
  page: 'farms' | 'settings' | 'profile';
  data: WorkspaceData;
  onChange: (next: WorkspaceData) => void;
  onSelectFarm: (farm: FarmRecord) => void;
  onSelectLot: (farm: FarmRecord, lot: FlockLot) => void;
}

const lineages = ['Hy-Line Brown', 'Lohmann Brown-Classic', 'NOVOgen Brown', 'Hy-Line W-36', 'Outra / não definida'];
const housingSystems = ['Gaiolas convencionais', 'Gaiolas enriquecidas', 'Sistema de piso', 'Aviário / multinível', 'Free-range'];

function Field({ label, value, onChange, type = 'text', min, step }: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'tel' | 'number' | 'date';
  min?: number;
  step?: number;
}) {
  return <label className="field"><span>{label}</span><input type={type} min={min} step={step} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

export function WorkspacePages({ page, data, onChange, onSelectFarm, onSelectLot }: WorkspacePagesProps) {
  const [farmName, setFarmName] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [houseLength, setHouseLength] = useState('100');
  const [houseWidth, setHouseWidth] = useState('20');
  const [lotName, setLotName] = useState('');
  const [lotBirds, setLotBirds] = useState('5000');
  const [lotLineage, setLotLineage] = useState('Hy-Line Brown');
  const [lotHousing, setLotHousing] = useState('Gaiolas convencionais');
  const [lotAge, setLotAge] = useState('1');
  const [lotStart, setLotStart] = useState(new Date().toISOString().slice(0, 10));
  const [showFarmForm, setShowFarmForm] = useState(false);
  const [showLotForm, setShowLotForm] = useState(false);
  const [message, setMessage] = useState('');

  const activeFarm = data.farms.find((farm) => farm.id === data.activeFarmId) ?? data.farms[0];
  const activeLot = activeFarm?.lots.find((lot) => lot.id === data.activeLotId) ?? activeFarm?.lots.find((lot) => lot.status === 'active');

  const updateFarm = (farmId: string, updater: (farm: FarmRecord) => FarmRecord) => {
    onChange({ ...data, farms: data.farms.map((farm) => farm.id === farmId ? updater(farm) : farm) });
  };

  const createFarm = () => {
    const name = farmName.trim();
    const length = Number(houseLength);
    const width = Number(houseWidth);
    if (!name || !Number.isFinite(length) || !Number.isFinite(width) || length <= 0 || width <= 0) {
      setMessage('Informe o nome e dimensões positivas para cadastrar a granja.');
      return;
    }
    const id = crypto.randomUUID();
    const nextFarm: FarmRecord = {
      id,
      name,
      municipality: municipality.trim(),
      status: 'active',
      createdAt: new Date().toISOString(),
      configuration: { houseLengthM: length, houseWidthM: width, sideHeightM: 3, ridgeHeightM: 4.5, usableAreaPercent: 80 },
      lots: [],
    };
    const next = { ...data, farms: [...data.farms, nextFarm], activeFarmId: id, activeLotId: '' };
    onChange(next);
    onSelectFarm(nextFarm);
    setFarmName('');
    setMunicipality('');
    setShowFarmForm(false);
    setMessage('Granja cadastrada. Agora cadastre o primeiro lote.');
    setShowLotForm(true);
  };

  const createLot = () => {
    if (!activeFarm) return;
    const name = lotName.trim();
    const birds = Number(lotBirds);
    const age = Number(lotAge);
    if (!name || !Number.isSafeInteger(birds) || birds < 1 || !Number.isFinite(age) || age < 0 || age > 200 || !lotStart) {
      setMessage('Revise nome, quantidade de aves, idade e data de alojamento.');
      return;
    }
    const lot: FlockLot = {
      id: crypto.randomUUID(),
      name,
      lineage: lotLineage,
      housingSystem: lotHousing,
      initialBirds: birds,
      currentBirds: birds,
      startDate: lotStart,
      ageWeeks: age,
      status: 'active',
    };
    const nextFarm = { ...activeFarm, lots: [...activeFarm.lots, lot], configuration: { ...activeFarm.configuration, targetBirds: birds } };
    onChange({ ...data, farms: data.farms.map((farm) => farm.id === activeFarm.id ? nextFarm : farm), activeLotId: lot.id });
    onSelectLot(nextFarm, lot);
    setLotName('');
    setShowLotForm(false);
    setMessage('Lote cadastrado e selecionado para o acompanhamento.');
  };

  if (page === 'farms') {
    return (
      <div className="workspace-page">
        <div className="page-heading"><div><span className="eyebrow">CADASTRO E OPERAÇÃO</span><h1>Minhas granjas e lotes</h1><p>Organize propriedades, galpões e lotes. Cada granja mantém suas dimensões e seus lotes cadastrados.</p></div><button className="button button-primary" onClick={() => setShowFarmForm((open) => !open)}>+ Nova granja</button></div>
        <div className="workspace-context"><span>Granja ativa</span><strong>{activeFarm?.name ?? 'Nenhuma granja'}</strong><span>{activeFarm?.municipality || 'Município não informado'}</span><span>{activeFarm?.lots.length ?? 0} lotes cadastrados</span></div>
        {message && <p className="workspace-message" role="status">{message}</p>}
        {showFarmForm && <section className="panel workspace-form"><div className="panel-heading"><div><h2>Cadastrar granja</h2><p>Crie uma propriedade e informe as dimensões iniciais do galpão principal.</p></div></div><div className="field-grid"><Field label="Nome da granja" value={farmName} onChange={setFarmName} /><Field label="Município / UF" value={municipality} onChange={setMunicipality} /><Field label="Comprimento do galpão principal (m)" type="number" min={1} step={0.1} value={houseLength} onChange={setHouseLength} /><Field label="Largura do galpão principal (m)" type="number" min={1} step={0.1} value={houseWidth} onChange={setHouseWidth} /></div><div className="workspace-actions"><button className="button button-primary" onClick={createFarm}>Salvar granja</button><button className="button button-secondary" onClick={() => setShowFarmForm(false)}>Cancelar</button></div></section>}
        <div className="farm-registry-grid">
          {data.farms.map((farm) => <article className={farm.id === data.activeFarmId ? 'panel farm-registry-card selected' : 'panel farm-registry-card'} key={farm.id}>
            <div className="farm-card-heading"><div><span className="eyebrow">PROPRIEDADE</span><h2>{farm.name}</h2><p>{farm.municipality || 'Município não informado'}</p></div><span className="sample-count">{farm.status === 'active' ? 'Ativa' : 'Arquivada'}</span></div>
            <div className="farm-card-stats"><div><small>Galpão principal</small><strong>{farm.configuration.houseLengthM ?? '—'} × {farm.configuration.houseWidthM ?? '—'} m</strong></div><div><small>Lotes</small><strong>{farm.lots.length}</strong></div><div><small>Aves cadastradas</small><strong>{farm.lots.reduce((sum, lot) => sum + lot.currentBirds, 0).toLocaleString('pt-BR')}</strong></div></div>
            <div className="workspace-actions"><button className="button button-secondary" onClick={() => { onSelectFarm(farm); setMessage(`Granja ativa: ${farm.name}.`); }}>Abrir granja</button><button className="text-button" onClick={() => { onChange({ ...data, activeFarmId: farm.id, activeLotId: farm.lots[0]?.id ?? '' }); setShowLotForm(true); }}>Adicionar lote</button></div>
            <div className="lot-list">{farm.lots.length === 0 ? <p>Nenhum lote cadastrado nesta granja.</p> : farm.lots.map((lot) => <div className={lot.id === data.activeLotId ? 'lot-row active' : 'lot-row'} key={lot.id}><div><strong>{lot.name}</strong><small>{lot.lineage} · {lot.housingSystem} · {lot.ageWeeks} semanas</small><small>{lot.currentBirds.toLocaleString('pt-BR')} aves · alojado em {new Date(`${lot.startDate}T12:00:00`).toLocaleDateString('pt-BR')}</small></div><button className="text-button" onClick={() => { onSelectLot(farm, lot); setMessage(`Lote ativo: ${lot.name}.`); }}>Selecionar lote</button></div>)}</div>
          </article>)}
        </div>
        {showLotForm && activeFarm && <section className="panel workspace-form"><div className="panel-heading"><div><h2>Novo lote em {activeFarm.name}</h2><p>Cadastre o alojamento inicial, a linhagem e o sistema utilizado.</p></div></div><div className="field-grid"><Field label="Identificação do lote" value={lotName} onChange={setLotName} /><Field label="Quantidade inicial de aves" type="number" min={1} step={1} value={lotBirds} onChange={setLotBirds} /><label className="field"><span>Linhagem</span><select value={lotLineage} onChange={(event) => setLotLineage(event.target.value)}>{lineages.map((item) => <option key={item}>{item}</option>)}</select></label><label className="field"><span>Sistema de alojamento</span><select value={lotHousing} onChange={(event) => setLotHousing(event.target.value)}>{housingSystems.map((item) => <option key={item}>{item}</option>)}</select></label><Field label="Idade no cadastro (semanas)" type="number" min={0} step={0.1} value={lotAge} onChange={setLotAge} /><Field label="Data de alojamento" type="date" value={lotStart} onChange={setLotStart} /></div><div className="workspace-actions"><button className="button button-primary" onClick={createLot}>Salvar lote</button><button className="button button-secondary" onClick={() => setShowLotForm(false)}>Cancelar</button></div></section>}
        <p className="table-footnote">O cadastro de granjas e lotes é salvo neste navegador. Registros zootécnicos, pesagens e medições diárias ainda não são sincronizados nem isolados por usuário em servidor.</p>
      </div>
    );
  }

  if (page === 'settings') {
    return <div className="workspace-page"><div className="page-heading"><div><span className="eyebrow">PREFERÊNCIAS DO AMBIENTE</span><h1>Configurações</h1><p>Defina unidades e preferências de exibição usadas nesta instalação.</p></div><span className="local-badge">Salvo neste navegador</span></div><section className="panel workspace-form"><div className="panel-heading"><div><h2>Unidades e apresentação</h2><p>As preferências são aplicadas localmente e podem ser alteradas a qualquer momento.</p></div></div><div className="settings-row"><div><strong>Unidade de peso</strong><small>Unidade preferencial para relatórios e exibição.</small></div><select value={data.settings.weightUnit} onChange={(event) => onChange({ ...data, settings: { ...data.settings, weightUnit: event.target.value as WorkspaceData['settings']['weightUnit'] } })}><option value="g">Gramas (g)</option><option value="kg">Quilogramas (kg)</option></select></div><div className="settings-row"><div><strong>Unidade de área</strong><small>Unidade preferencial para dimensões e relatórios.</small></div><select value={data.settings.areaUnit} onChange={(event) => onChange({ ...data, settings: { ...data.settings, areaUnit: event.target.value as WorkspaceData['settings']['areaUnit'] } })}><option value="m2">Metros quadrados (m²)</option><option value="ha">Hectares (ha)</option></select></div><label className="settings-row"><div><strong>Notificações no painel</strong><small>Exibir avisos de atualização e validação.</small></div><input type="checkbox" checked={data.settings.notifications} onChange={(event) => onChange({ ...data, settings: { ...data.settings, notifications: event.target.checked } })} /></label><label className="settings-row"><div><strong>Tabelas compactas</strong><small>Reduzir espaçamento das tabelas técnicas.</small></div><input type="checkbox" checked={data.settings.compactTables} onChange={(event) => onChange({ ...data, settings: { ...data.settings, compactTables: event.target.checked } })} /></label></section><p className="table-footnote">Estas preferências não alteram os dados zootécnicos originais. A opção de tema e sincronização de conta ficará disponível quando houver autenticação e persistência em nuvem.</p></div>;
  }

  return <div className="workspace-page"><div className="page-heading"><div><span className="eyebrow">CONTA E IDENTIFICAÇÃO</span><h1>Perfil do administrador</h1><p>Edite os dados de identificação e contato do responsável pelo ambiente local.</p></div><span className="local-badge">Perfil local</span></div><section className="panel workspace-form"><div className="profile-summary"><div className="profile-avatar large">{data.profile.fullName.trim().charAt(0).toUpperCase() || 'A'}</div><div><h2>{data.profile.fullName || 'Administrador'}</h2><p>{data.profile.role} · {data.profile.organization || 'Organização não informada'}</p></div></div><div className="field-grid"><Field label="Nome completo" value={data.profile.fullName} onChange={(value) => onChange({ ...data, profile: { ...data.profile, fullName: value } })} /><Field label="E-mail de contato" type="email" value={data.profile.email} onChange={(value) => onChange({ ...data, profile: { ...data.profile, email: value } })} /><Field label="Telefone" type="tel" value={data.profile.phone} onChange={(value) => onChange({ ...data, profile: { ...data.profile, phone: value } })} /><Field label="Organização / empresa" value={data.profile.organization} onChange={(value) => onChange({ ...data, profile: { ...data.profile, organization: value } })} /></div><div className="settings-row"><div><strong>Permissão exibida</strong><small>O perfil atual é apenas um cadastro local, sem controle de acesso.</small></div><strong>{data.profile.role}</strong></div></section><p className="table-footnote">Alterar estes campos não cria uma conta nem autentica o usuário. O controle real de acesso, recuperação de senha e papéis administrativos exige integração de autenticação no servidor.</p></div>;
}
