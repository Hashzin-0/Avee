'use client';

import { useEffect, useMemo, useState } from 'react';
import { PullCord } from 'pullcord';
import { CaretLeftIcon, CaretRightIcon, XIcon } from '@phosphor-icons/react';
import type { FarmRecord } from '../workspace/types';

interface ActivityRecord {
  id: string;
  date: string;
  farmName: string;
  lotName: string;
  deaths: number;
  culls: number;
  feedKg: number;
  waterLiters: number;
  eggsProduced: number;
  averageBodyWeightGrams?: number;
  averageEggWeightGrams?: number;
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

function startOfWeek(value: Date) {
  const date = new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const offset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offset);
  return date;
}

function formatDate(value: string) {
  const parts = value.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(new Date(parts[0], parts[1] - 1, parts[2]));
}

function readActivities(farms: FarmRecord[]): ActivityRecord[] {
  const result: ActivityRecord[] = [];
  for (const farm of farms) {
    for (const lot of farm.lots) {
      try {
        const raw = window.localStorage.getItem('granja.flock-entries.v1.' + lot.id);
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(parsed)) continue;
        for (const value of parsed) {
          if (typeof value !== 'object' || value === null || Array.isArray(value)) continue;
          const entry = value as Record<string, unknown>;
          if (typeof entry.id !== 'string' || typeof entry.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) continue;
          const numericKeys = ['deaths', 'culls', 'feedKg', 'waterLiters', 'eggsProduced'];
          if (!numericKeys.every((key) => typeof entry[key] === 'number' && Number.isFinite(entry[key]))) continue;
          result.push({
            id: entry.id,
            date: entry.date,
            farmName: farm.name,
            lotName: lot.name,
            deaths: entry.deaths as number,
            culls: entry.culls as number,
            feedKg: entry.feedKg as number,
            waterLiters: entry.waterLiters as number,
            eggsProduced: entry.eggsProduced as number,
            averageBodyWeightGrams: typeof entry.averageBodyWeightGrams === 'number' ? entry.averageBodyWeightGrams : undefined,
            averageEggWeightGrams: typeof entry.averageEggWeightGrams === 'number' ? entry.averageEggWeightGrams : undefined,
          });
        }
      } catch {
        // Um histórico inválido não impede a leitura dos demais lotes.
      }
    }
  }
  return result.sort((a, b) => b.date.localeCompare(a.date) || a.farmName.localeCompare(b.farmName));
}

export function FarmActivityCalendar({ farms }: { farms: FarmRecord[] }) {
  const [open, setOpen] = useState(false);
  const [week, setWeek] = useState(() => startOfWeek(new Date()));
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = new Date(week);
    date.setDate(date.getDate() + index);
    return date;
  }), [week]);
  const byDate = useMemo(() => activities.reduce<Record<string, ActivityRecord[]>>((groups, entry) => {
    (groups[entry.date] ??= []).push(entry);
    return groups;
  }, {}), [activities]);
  const weekEntries = useMemo(() => days.flatMap((day) => byDate[dateKey(day)] ?? []), [days, byDate]);

  useEffect(() => {
    if (!open) return;
    const refresh = () => setActivities(readActivities(farms));
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    refresh();
    window.addEventListener('granja:flock-entries-updated', refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('granja:flock-entries-updated', refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, farms]);

  const moveWeek = (offset: number) => setWeek((current) => {
    const next = new Date(current);
    next.setDate(next.getDate() + offset * 7);
    return next;
  });
  const weekLabel = days[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + ' — ' + days[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <>
      <PullCord onPull={() => setOpen((value) => !value)} pulled={open} ariaLabel={open ? 'Fechar calendário de atividades' : 'Abrir calendário de atividades'} noEntrance />
      {open && <div className="farm-calendar-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
        <section className="farm-calendar-dialog" role="dialog" aria-modal="true" aria-labelledby="farm-calendar-title">
          <div className="farm-calendar-heading">
            <div><span className="eyebrow">HISTÓRICO DA OPERAÇÃO</span><h2 id="farm-calendar-title">Calendário de atividades</h2><p>Todos os lotes cadastrados · dias com registros reais do navegador</p></div>
            <button className="farm-calendar-close" aria-label="Fechar calendário" onClick={() => setOpen(false)}><XIcon size={18} /></button>
          </div>
          <div className="farm-calendar-controls">
            <button aria-label="Semana anterior" onClick={() => moveWeek(-1)}><CaretLeftIcon size={17} /></button>
            <strong className="farm-calendar-week-label">{weekLabel}</strong>
            <button aria-label="Próxima semana" onClick={() => moveWeek(1)}><CaretRightIcon size={17} /></button>
            <button onClick={() => setWeek(startOfWeek(new Date()))}>Hoje</button>
          </div>
          <div className="farm-calendar-grid" aria-label="Dias da semana">
            {days.map((day) => {
              const key = dateKey(day);
              const items = byDate[key] ?? [];
              const isToday = key === dateKey(new Date());
              return <article key={key} className={'farm-calendar-day ' + (items.length ? 'has-activity ' : '') + (isToday ? 'today' : '')}>
                <span>{day.toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                <strong>{day.getDate()}</strong>
                <small>{items.length ? items.length + ' registro(s)' : 'Sem atividade'}</small>
              </article>;
            })}
          </div>
          <div className="farm-calendar-activity-list">
            <h3>Atividades registradas nesta semana</h3>
            {weekEntries.length === 0 ? <div className="farm-calendar-empty">Nenhum registro diário encontrado nesta semana. Os dias cadastrados aparecerão aqui automaticamente.</div> : weekEntries.map((entry) => <article className="farm-calendar-activity" key={entry.id}>
              <time>{formatDate(entry.date)}</time>
              <div><strong>{entry.farmName} · {entry.lotName}</strong><p>{entry.eggsProduced.toLocaleString('pt-BR')} ovos · {entry.feedKg.toLocaleString('pt-BR')} kg de ração · {entry.waterLiters.toLocaleString('pt-BR')} L de água · {entry.deaths} mortes · {entry.culls} eliminações{entry.averageBodyWeightGrams !== undefined ? ' · peso médio ' + entry.averageBodyWeightGrams + ' g' : ''}{entry.averageEggWeightGrams !== undefined ? ' · ovo ' + entry.averageEggWeightGrams + ' g' : ''}</p></div>
            </article>)}
          </div>
        </section>
      </div>}
    </>
  );
}
