import type { LayerLineage, TechnicalParameterKey } from '../farm-builder/technical-recommendations';
import { hyLineBrownProductionRows } from './hyline-brown-production';
import { hyLineBrownAlternativeProductionRows, hyLineBrownAlternativeRearingRows } from './hyline-brown-alternative';

export type ManagementPhase = 'Cria' | 'Recria' | 'Pré-postura' | 'Produção';

export type LayerGuideSource = {
  id: string;
  lineage: LayerLineage;
  publisher: string;
  title: string;
  edition: string;
  url: string;
  coverage: string;
  dataStatus: 'weekly-rearing' | 'weekly-rearing-and-production' | 'milestones';
  housingSystem: 'conventional' | 'alternative';
};

export type LayerAgeReference = {
  lineage: LayerLineage;
  ageWeeks: number;
  ageRangeLabel?: string;
  phase: ManagementPhase;
  bodyWeightMinGrams?: number;
  bodyWeightMaxGrams?: number;
  dailyFeedMinGrams?: number;
  dailyFeedMaxGrams?: number;
  dailyWaterMinMl?: number;
  dailyWaterMaxMl?: number;
  cumulativeMortalityPercent?: number;
  uniformityMinPercent?: number;
  cumulativeFeedMinGrams?: number;
  cumulativeFeedMaxGrams?: number;
  layRateMinPercent?: number;
  layRateMaxPercent?: number;
  eggsPerHenDayMin?: number;
  eggsPerHenDayMax?: number;
  eggsPerHenHousedMin?: number;
  eggsPerHenHousedMax?: number;
  averageEggWeightMinGrams?: number;
  averageEggWeightMaxGrams?: number;
  eggMassPerHenHousedMinKg?: number;
  eggMassPerHenHousedMaxKg?: number;
  note?: string;
  sourceId?: string;
  page?: string;
  housingSystemApplicability?: string;
  reviewStatus?: 'transcribed-unreviewed';
};

export type SourcedLayerAgeReference = LayerAgeReference & {
  sourceId: string;
  page: string;
  housingSystemApplicability: string;
  reviewStatus: 'transcribed-unreviewed';
};

export const layerGuideSources: LayerGuideSource[] = [
  { id: 'hyline-brown-2025-conventional', lineage: 'Hy-Line Brown', publisher: 'Hy-Line International', title: 'Hy-Line Brown Commercial Layers — Conventional Systems, International Standards', edition: 'Dezembro de 2025', url: 'https://www.hyline.com/filesimages/Hy-Line-Products/Hy-Line-Product-PDFs/Brown/BRN%20STD%20ENG.pdf', coverage: 'Tabelas semanais completas de recria (1–17) e produção (18–100 semanas), com postura, ovos acumulados por ave-dia e por ave alojada, mortalidade, peso corporal, água, ração, massa de ovos e peso médio dos ovos. O guia não define uma semana obrigatória de descarte.', dataStatus: 'weekly-rearing-and-production', housingSystem: 'conventional' },
  { id: 'hyline-brown-2026-alternative', lineage: 'Hy-Line Brown', publisher: 'Hy-Line International', title: 'Hy-Line Brown — Guia de Desempenho, Poedeiras Comerciais, Sistemas Alternativos', edition: 'Maio de 2026 — Padrões Internacionais', url: 'https://www.hyline.com/resources', coverage: 'Tabelas semanais de recria (1–17) e produção (18–100) para sistemas alternativos. O endereço aponta para o catálogo oficial; o PDF específico foi fornecido na conversa e o link direto não foi confirmado.', dataStatus: 'weekly-rearing-and-production', housingSystem: 'alternative' },
  { id: 'lohmann-brown-classic-2020', lineage: 'Lohmann Brown-Classic', publisher: 'LOHMANN BREEDERS', title: 'LOHMANN BROWN-CLASSIC Layers — Management Guide, Cage Housing', edition: 'Guia oficial publicado em 2020; consultar a edição vigente do fabricante', url: 'https://lohmann-breeders.com/media/2020/07/ManagementGuideLBClassicCage-EN.pdf', coverage: 'Metas publicadas de recria e produção, incluindo consumo total na recria, consumo diário em produção, peso, viabilidade e ovos por ave alojada.', dataStatus: 'milestones', housingSystem: 'conventional' },
  { id: 'novogen-brown-commercial-2024', lineage: 'NOVOgen Brown', publisher: 'NOVOGEN', title: 'Guía de Manejo para Ponedoras Comerciales — NOVOgen BROWN', edition: 'Documento 202402; versão em espanhol', url: 'https://novocenter.novogen-layers.com/wp-content/uploads/2021/11/202402-Guide_management_CS_Brown_V2-EScomp.pdf', coverage: 'O manual contém tabelas semanais de recria e produção; a estrutura atual inclui recria 1–17, pontos de produção 18–26/60/100 e faixa de consumo de 26–100 semanas. É o guia de poedeiras comerciais, não Parent Stock.', dataStatus: 'weekly-rearing', housingSystem: 'conventional' },
  { id: 'hyline-w36-commercial', lineage: 'Hy-Line W-36', publisher: 'Hy-Line International', title: 'Hy-Line W-36 Commercial Layers — Performance Standards', edition: 'Janeiro de 2020; confirmar edição vigente na página de literatura W-36', url: 'https://www.hyline.com/filesimages/Hy-Line-Products/Hy-Line-Product-PDFs/W-36/36%20COM%20ENG.pdf', coverage: 'Tabela semanal de recria (1–17 semanas), marcos de produção e consumo médio de produção; manual inclui tabelas até 100 semanas.', dataStatus: 'weekly-rearing', housingSystem: 'conventional' },
];

export function getManagementPhase(ageWeeks: number): ManagementPhase {
  if (!Number.isFinite(ageWeeks) || ageWeeks < 0) throw new RangeError('Idade deve ser um número não negativo.');
  if (ageWeeks < 6) return 'Cria';
  if (ageWeeks < 15) return 'Recria';
  if (ageWeeks < 18) return 'Pré-postura';
  return 'Produção';
}

const hylineRearingUniformityTargets: Record<number, number> = { 2: 85, 5: 80, 7: 85, 17: 90 };

const hylineRearing: LayerAgeReference[] = [
  [1,69,73,16,17,24,33,0.40,110,117],
  [2,119,126,18,19,27,37,0.55,234,248],
  [3,186,197,21,23,31,45,0.65,378,406],
  [4,266,281,26,28,38,55,0.75,557,599],
  [5,357,377,31,33,47,67,0.85,777,832],
  [6,456,482,37,40,56,81,0.95,1039,1114],
  [7,561,593,43,46,65,92,1.05,1341,1438],
  [8,668,706,48,52,72,104,1.15,1679,1802],
  [9,772,816,53,57,80,114,1.25,2050,2201],
  [10,871,921,57,61,86,122,1.35,2449,2628],
  [11,963,1018,61,65,91,130,1.45,2876,3082],
  [12,1046,1105,63,68,94,136,1.55,3316,3557],
  [13,1120,1184,66,70,99,140,1.63,3777,4045],
  [14,1186,1254,68,73,102,145,1.70,4251,4554],
  [15,1246,1317,70,75,105,149,1.78,4740,5077],
  [16,1302,1377,73,78,109,155,1.85,5249,5620],
  [17,1357,1434,77,82,115,163,2.00,5786,6191],
].map(([ageWeeks,bwMin,bwMax,feedMin,feedMax,waterMin,waterMax,mortality,feedCumMin,feedCumMax]) => ({
  lineage: 'Hy-Line Brown',
  ageWeeks, phase: getManagementPhase(ageWeeks),
  bodyWeightMinGrams: bwMin, bodyWeightMaxGrams: bwMax,
  dailyFeedMinGrams: feedMin, dailyFeedMaxGrams: feedMax,
  dailyWaterMinMl: waterMin, dailyWaterMaxMl: waterMax,
  cumulativeMortalityPercent: mortality,
  uniformityMinPercent: hylineRearingUniformityTargets[ageWeeks],
  cumulativeFeedMinGrams: feedCumMin, cumulativeFeedMaxGrams: feedCumMax,
}));


const hylineProductionMilestones: LayerAgeReference[] = hyLineBrownProductionRows.map((row) => ({
  lineage: 'Hy-Line Brown',
  ageWeeks: row[0],
  phase: 'Produção',
  layRateMinPercent: row[1],
  layRateMaxPercent: row[2],
  eggsPerHenDayMin: row[3],
  eggsPerHenDayMax: row[4],
  eggsPerHenHousedMin: row[5],
  eggsPerHenHousedMax: row[6],
  cumulativeMortalityPercent: row[7],
  bodyWeightMinGrams: row[8],
  bodyWeightMaxGrams: row[9],
  dailyWaterMinMl: row[10],
  dailyWaterMaxMl: row[11],
  dailyFeedMinGrams: row[12],
  dailyFeedMaxGrams: row[13],
  eggMassPerHenHousedMinKg: row[14] ?? undefined,
  eggMassPerHenHousedMaxKg: row[15] ?? undefined,
  averageEggWeightMinGrams: row[16],
  averageEggWeightMaxGrams: row[17],
}));

const hylineW36Rearing: LayerAgeReference[] = [
  [1,60,73,13,16,20,32,0.75,60,111], [2,100,118,17,20,25,41,1.30,209,253],
  [3,150,181,22,26,33,53,1.55,360,438], [4,200,259,29,34,43,67,1.66,560,673],
  [5,290,349,34,38,51,76,1.77,798,940], [6,372,440,39,43,59,86,1.88,1074,1242],
  [7,472,531,43,47,64,93,1.99,1373,1569], [8,549,621,46,51,69,102,2.10,1695,1927],
  [9,649,721,50,55,76,110,2.15,2047,2311], [10,739,812,54,58,80,116,2.20,2423,2717],
  [11,830,894,55,60,83,119,2.25,2810,3135], [12,921,971,56,61,84,123,2.30,3204,3564],
  [13,980,1039,58,64,87,128,2.35,3613,4013], [14,1039,1111,59,66,89,132,2.40,4027,4475],
  [15,1102,1161,61,68,91,135,2.45,4453,4948], [16,1152,1211,64,69,95,138,2.50,4898,5431],
  [17,1188,1252,67,72,100,144,2.55,5366,5936],
].map(([ageWeeks,bwMin,bwMax,feedMin,feedMax,waterMin,waterMax,mortality,feedCumMin,feedCumMax]) => ({
  lineage: 'Hy-Line W-36', ageWeeks, phase: getManagementPhase(ageWeeks),
  bodyWeightMinGrams: bwMin, bodyWeightMaxGrams: bwMax, dailyFeedMinGrams: feedMin, dailyFeedMaxGrams: feedMax,
  dailyWaterMinMl: waterMin, dailyWaterMaxMl: waterMax, cumulativeMortalityPercent: mortality,
  cumulativeFeedMinGrams: feedCumMin, cumulativeFeedMaxGrams: feedCumMax,
}));

const hylineW36ProductionMilestones: LayerAgeReference[] = [
  { lineage: 'Hy-Line W-36', ageWeeks: 18, phase: 'Produção', bodyWeightMinGrams: 1230, bodyWeightMaxGrams: 1300, dailyFeedMinGrams: 63, dailyFeedMaxGrams: 74, dailyWaterMinMl: 95, dailyWaterMaxMl: 148, cumulativeMortalityPercent: 0.1, layRateMinPercent: 2, layRateMaxPercent: 3, eggsPerHenHousedMin: 0.1, eggsPerHenHousedMax: 0.2, averageEggWeightMinGrams: 44.2, averageEggWeightMaxGrams: 44.2 },
  { lineage: 'Hy-Line W-36', ageWeeks: 24, phase: 'Produção', bodyWeightMinGrams: 1450, bodyWeightMaxGrams: 1510, dailyFeedMinGrams: 89, dailyFeedMaxGrams: 96, dailyWaterMinMl: 134, dailyWaterMaxMl: 192, cumulativeMortalityPercent: 0.4, layRateMinPercent: 91, layRateMaxPercent: 94, eggsPerHenHousedMin: 25.9, eggsPerHenHousedMax: 28.8, averageEggWeightMinGrams: 52.6, averageEggWeightMaxGrams: 52.6, eggMassPerHenHousedMinKg: 1.3, eggMassPerHenHousedMaxKg: 1.5 },
  { lineage: 'Hy-Line W-36', ageWeeks: 32, phase: 'Produção', bodyWeightMinGrams: 1510, bodyWeightMaxGrams: 1570, dailyFeedMinGrams: 98, dailyFeedMaxGrams: 104, dailyWaterMinMl: 146, dailyWaterMaxMl: 207, cumulativeMortalityPercent: 0.9, layRateMinPercent: 95, layRateMaxPercent: 96, eggsPerHenHousedMin: 78.5, eggsPerHenHousedMax: 82.3, averageEggWeightMinGrams: 58.5, averageEggWeightMaxGrams: 58.5, eggMassPerHenHousedMinKg: 4.2, eggMassPerHenHousedMaxKg: 4.5 },
  { lineage: 'Hy-Line W-36', ageWeeks: 60, phase: 'Produção', bodyWeightMinGrams: 1550, bodyWeightMaxGrams: 1610, dailyFeedMinGrams: 99, dailyFeedMaxGrams: 105, cumulativeMortalityPercent: 2.9, eggsPerHenHousedMin: 252, eggsPerHenHousedMax: 260 },
  { lineage: 'Hy-Line W-36', ageWeeks: 100, phase: 'Produção', bodyWeightMinGrams: 1550, bodyWeightMaxGrams: 1610, dailyFeedMinGrams: 99.6, dailyFeedMaxGrams: 99.6, cumulativeMortalityPercent: 8, eggsPerHenHousedMin: 456, eggsPerHenHousedMax: 472, averageEggWeightMinGrams: 63.8, averageEggWeightMaxGrams: 63.8 },
];
const novogenRearing: LayerAgeReference[] = [
  [1,65,70,11], [2,110,120,17], [3,180,190,25], [4,270,285,35], [5,360,385,40],
  [6,470,495,47], [7,570,600,51], [8,660,695,55], [9,750,790,58], [10,840,900,60],
  [11,930,990,62], [12,1020,1090,65], [13,1110,1180,68], [14,1190,1255,72],
  [15,1270,1340,75], [16,1350,1425,78], [17,1430,1510,82],
].map(([ageWeeks,bwMin,bwMax,feed]) => ({ lineage: 'NOVOgen Brown', ageWeeks, phase: getManagementPhase(ageWeeks), bodyWeightMinGrams: bwMin, bodyWeightMaxGrams: bwMax, dailyFeedMinGrams: feed, dailyFeedMaxGrams: feed }));
const milestoneReferences: LayerAgeReference[] = [
  { lineage: 'Lohmann Brown-Classic', ageWeeks: 17, phase: 'Pré-postura', bodyWeightMinGrams: 1380, bodyWeightMaxGrams: 1460, cumulativeFeedMinGrams: 5700, cumulativeFeedMaxGrams: 5900, note: 'Guia Cage Housing, p. 7.' },
  { lineage: 'Lohmann Brown-Classic', ageWeeks: 72, phase: 'Produção', eggsPerHenHousedMin: 318, eggsPerHenHousedMax: 323, averageEggWeightMinGrams: 63.5, averageEggWeightMaxGrams: 64.5, note: 'Guia Cage Housing, p. 7.' },
  { lineage: 'Lohmann Brown-Classic', ageWeeks: 80, phase: 'Produção', eggsPerHenHousedMin: 358, eggsPerHenHousedMax: 363, averageEggWeightMinGrams: 64, averageEggWeightMaxGrams: 65, note: 'Guia Cage Housing, p. 7.' },
  { lineage: 'Lohmann Brown-Classic', ageWeeks: 95, phase: 'Produção', eggsPerHenHousedMin: 428, eggsPerHenHousedMax: 433, averageEggWeightMinGrams: 65, averageEggWeightMaxGrams: 66, eggMassPerHenHousedMinKg: 27.5, eggMassPerHenHousedMaxKg: 28.5, note: 'Guia Cage Housing, p. 7.' },
  { lineage: 'NOVOgen Brown', ageWeeks: 18, phase: 'Produção', bodyWeightMinGrams: 1500, dailyFeedMinGrams: 81, dailyFeedMaxGrams: 89 },
  { lineage: 'NOVOgen Brown', ageWeeks: 19, phase: 'Produção', bodyWeightMinGrams: 1580, dailyFeedMinGrams: 83, dailyFeedMaxGrams: 91, layRateMinPercent: 1, layRateMaxPercent: 1, cumulativeMortalityPercent: 0.1, eggsPerHenHousedMin: 0.1, eggsPerHenHousedMax: 0.1, averageEggWeightMinGrams: 43.5, averageEggWeightMaxGrams: 43.5 },
  { lineage: 'NOVOgen Brown', ageWeeks: 20, phase: 'Produção', bodyWeightMinGrams: 1640, dailyFeedMinGrams: 90, dailyFeedMaxGrams: 98, layRateMinPercent: 14.8, layRateMaxPercent: 14.8, cumulativeMortalityPercent: 0.2, eggsPerHenHousedMin: 1, eggsPerHenHousedMax: 1, averageEggWeightMinGrams: 47.8, averageEggWeightMaxGrams: 47.8 },
  { lineage: 'NOVOgen Brown', ageWeeks: 21, phase: 'Produção', bodyWeightMinGrams: 1685, dailyFeedMinGrams: 100, dailyFeedMaxGrams: 108, layRateMinPercent: 39, layRateMaxPercent: 39, cumulativeMortalityPercent: 0.3, eggsPerHenHousedMin: 4, eggsPerHenHousedMax: 4, averageEggWeightMinGrams: 50.5, averageEggWeightMaxGrams: 50.5 },
  { lineage: 'NOVOgen Brown', ageWeeks: 22, phase: 'Produção', bodyWeightMinGrams: 1720, dailyFeedMinGrams: 104, dailyFeedMaxGrams: 112, layRateMinPercent: 69, layRateMaxPercent: 69, cumulativeMortalityPercent: 0.4, eggsPerHenHousedMin: 9, eggsPerHenHousedMax: 9, averageEggWeightMinGrams: 53, averageEggWeightMaxGrams: 53 },
  { lineage: 'NOVOgen Brown', ageWeeks: 23, phase: 'Produção', bodyWeightMinGrams: 1745, dailyFeedMinGrams: 108, dailyFeedMaxGrams: 116, layRateMinPercent: 87.9, layRateMaxPercent: 87.9, cumulativeMortalityPercent: 0.5, eggsPerHenHousedMin: 15, eggsPerHenHousedMax: 15, averageEggWeightMinGrams: 55, averageEggWeightMaxGrams: 55 },
  { lineage: 'NOVOgen Brown', ageWeeks: 25, phase: 'Produção', bodyWeightMinGrams: 1780, dailyFeedMinGrams: 110, dailyFeedMaxGrams: 118, layRateMinPercent: 94.5, layRateMaxPercent: 94.5, cumulativeMortalityPercent: 0.7, eggsPerHenHousedMin: 28, eggsPerHenHousedMax: 28, averageEggWeightMinGrams: 57.6, averageEggWeightMaxGrams: 57.6 },
  { lineage: 'NOVOgen Brown', ageWeeks: 26, phase: 'Produção', bodyWeightMinGrams: 1790, dailyFeedMinGrams: 111, dailyFeedMaxGrams: 119, layRateMinPercent: 95.5, layRateMaxPercent: 95.5, cumulativeMortalityPercent: 0.8, eggsPerHenHousedMin: 34, eggsPerHenHousedMax: 34, averageEggWeightMinGrams: 58.5, averageEggWeightMaxGrams: 58.5 },
  { lineage: 'NOVOgen Brown', ageWeeks: 24, phase: 'Produção', bodyWeightMinGrams: 1765, dailyFeedMinGrams: 109, dailyFeedMaxGrams: 117, cumulativeMortalityPercent: 0.6, layRateMinPercent: 93, layRateMaxPercent: 93, eggsPerHenHousedMin: 21, eggsPerHenHousedMax: 21, averageEggWeightMinGrams: 56.3, averageEggWeightMaxGrams: 56.3, note: 'Tabela de resultados comerciais, p. 41.' },
  { lineage: 'NOVOgen Brown', ageWeeks: 60, phase: 'Produção', bodyWeightMinGrams: 1890, dailyFeedMinGrams: 111, dailyFeedMaxGrams: 119, cumulativeMortalityPercent: 4.2, layRateMinPercent: 90.4, layRateMaxPercent: 90.4, eggsPerHenHousedMin: 254, eggsPerHenHousedMax: 254, averageEggWeightMinGrams: 64.5, averageEggWeightMaxGrams: 64.5, eggMassPerHenHousedMinKg: 15.699, eggMassPerHenHousedMaxKg: 15.699, note: 'Tabela de resultados comerciais, p. 41.' },
  { lineage: 'NOVOgen Brown', ageWeeks: 100, phase: 'Produção', bodyWeightMinGrams: 1950, dailyFeedMinGrams: 111, dailyFeedMaxGrams: 119, cumulativeMortalityPercent: 8, layRateMinPercent: 69.8, layRateMaxPercent: 69.8, eggsPerHenHousedMin: 465, eggsPerHenHousedMax: 465, averageEggWeightMinGrams: 66.2, averageEggWeightMaxGrams: 66.2, eggMassPerHenHousedMinKg: 29.505, eggMassPerHenHousedMaxKg: 29.505, note: 'Tabela de resultados comerciais, p. 41.' },
  { lineage: 'Hy-Line W-36', ageWeeks: 17, phase: 'Pré-postura', bodyWeightMinGrams: 1190, bodyWeightMaxGrams: 1250, cumulativeFeedMinGrams: 5360, cumulativeFeedMaxGrams: 5940, cumulativeMortalityPercent: 3, note: 'Performance summary; valores de recria.' },
  { lineage: 'Hy-Line W-36', ageWeeks: 26, phase: 'Produção', bodyWeightMinGrams: 1480, bodyWeightMaxGrams: 1540, averageEggWeightMinGrams: 54.7, averageEggWeightMaxGrams: 54.7, note: 'Performance summary.' },
  { lineage: 'Hy-Line W-36', ageWeeks: 32, phase: 'Produção', bodyWeightMinGrams: 1510, bodyWeightMaxGrams: 1570, averageEggWeightMinGrams: 58.5, averageEggWeightMaxGrams: 58.5, note: 'Performance summary.' },
  { lineage: 'Hy-Line W-36', ageWeeks: 60, phase: 'Produção', eggsPerHenHousedMin: 252, eggsPerHenHousedMax: 260, cumulativeMortalityPercent: 2.9, dailyFeedMinGrams: 99.6, dailyFeedMaxGrams: 99.6, note: 'Performance summary.' },
  { lineage: 'Hy-Line W-36', ageWeeks: 100, phase: 'Produção', eggsPerHenHousedMin: 456, eggsPerHenHousedMax: 472, cumulativeMortalityPercent: 8, dailyFeedMinGrams: 99.6, dailyFeedMaxGrams: 99.6, note: 'Performance summary.' },
];

const sourceMetadata: Record<LayerLineage, { id: string; pageForAge: (ageWeeks: number) => string; housing: string }> = {
  'Hy-Line Brown': { id: 'hyline-brown-2025-conventional', pageForAge: (age) => age <= 17 ? '4' : '5–6', housing: 'Sistema convencional; não aplicar a gaiolas enriquecidas, piso, aviário ou free-range sem fonte específica.' },
  'Lohmann Brown-Classic': { id: 'lohmann-brown-classic-2020', pageForAge: () => '7', housing: 'Gaiolas convencionais; não extrapolar para alojamento alternativo.' },
  'NOVOgen Brown': { id: 'novogen-brown-commercial-2024', pageForAge: (age) => age <= 17 ? '38' : '41', housing: 'Poedeiras comerciais; confirmar sistema e clima nas recomendações de alojamento do manual.' },
  'Hy-Line W-36': { id: 'hyline-w36-commercial', pageForAge: (age) => age <= 48 ? '2' : '3', housing: 'Sistemas convencionais; confirmar o guia de alojamento antes de dimensionar equipamentos.' },
  'Outra / não definida': { id: 'unsupported', pageForAge: () => '—', housing: 'Sem aplicabilidade definida.' },
};

const hylineBrownAlternativeRearing: SourcedLayerAgeReference[] = hyLineBrownAlternativeRearingRows.map((row) => ({
  lineage: 'Hy-Line Brown', ageWeeks: row[0], phase: getManagementPhase(row[0]),
  cumulativeMortalityPercent: row[1], bodyWeightMinGrams: row[2], bodyWeightMaxGrams: row[3],
  dailyWaterMinMl: row[4], dailyWaterMaxMl: row[5], dailyFeedMinGrams: row[6], dailyFeedMaxGrams: row[7],
  cumulativeFeedMinGrams: row[8] * 1000, cumulativeFeedMaxGrams: row[9] * 1000,
  uniformityMinPercent: row[0] <= 4 ? 85 : row[0] <= 7 ? 80 : row[0] <= 15 ? 85 : 90,
  sourceId: 'hyline-brown-2026-alternative', page: '4',
  housingSystemApplicability: 'Sistemas alternativos; metas de desempenho do guia de maio de 2026.',
  reviewStatus: 'transcribed-unreviewed',
}));

const hylineBrownAlternativeProduction: SourcedLayerAgeReference[] = hyLineBrownAlternativeProductionRows.map((row) => ({
  lineage: 'Hy-Line Brown', ageWeeks: row[0], phase: 'Produção',
  layRateMinPercent: row[1], layRateMaxPercent: row[2],
  eggsPerHenDayMin: row[3], eggsPerHenDayMax: row[4],
  eggsPerHenHousedMin: row[5], eggsPerHenHousedMax: row[6],
  cumulativeMortalityPercent: row[7], bodyWeightMinGrams: row[8], bodyWeightMaxGrams: row[9],
  dailyFeedMinGrams: row[10], dailyFeedMaxGrams: row[11], dailyWaterMinMl: row[12], dailyWaterMaxMl: row[13],
  eggMassPerHenHousedMinKg: row[14], eggMassPerHenHousedMaxKg: row[15],
  averageEggWeightMinGrams: row[16], averageEggWeightMaxGrams: row[17],
  sourceId: 'hyline-brown-2026-alternative', page: '5–6',
  housingSystemApplicability: 'Sistemas alternativos; metas de desempenho do guia de maio de 2026.',
  reviewStatus: 'transcribed-unreviewed',
}));

const conventionalReferences = [...hylineRearing, ...hylineProductionMilestones, ...hylineW36Rearing, ...hylineW36ProductionMilestones, ...novogenRearing, ...milestoneReferences]
  .map((reference) => {
    const metadata = sourceMetadata[reference.lineage];
    return { ...reference, sourceId: metadata.id, page: metadata.pageForAge(reference.ageWeeks), housingSystemApplicability: metadata.housing, reviewStatus: 'transcribed-unreviewed' as const };
  });

export const layerAgeReferences: SourcedLayerAgeReference[] = [
  ...conventionalReferences,
  ...hylineBrownAlternativeRearing,
  ...hylineBrownAlternativeProduction,
];
export function getLayerAgeReference(
  lineage: LayerLineage,
  ageWeeks: number,
  housingSystem: 'conventional' | 'alternative' = 'conventional',
): SourcedLayerAgeReference | null {
  if (!Number.isFinite(ageWeeks) || ageWeeks < 0) return null;
  if (lineage === 'Hy-Line Brown' && ageWeeks > 100) return null;
  if (housingSystem === 'alternative' && lineage !== 'Hy-Line Brown') return null;

  const expectedSourceId = lineage === 'Hy-Line Brown'
    ? housingSystem === 'alternative'
      ? 'hyline-brown-2026-alternative'
      : 'hyline-brown-2025-conventional'
    : undefined;
  const exact = layerAgeReferences.find((item) =>
    item.lineage === lineage &&
    item.ageWeeks === Math.floor(ageWeeks) &&
    (expectedSourceId === undefined || item.sourceId === expectedSourceId),
  );
  if (exact) return exact;

  const metadata = sourceMetadata[lineage];
  if (lineage === 'Hy-Line Brown' && housingSystem === 'conventional' && ageWeeks >= 19 && ageWeeks <= 100) {
    return { lineage, ageWeeks, ageRangeLabel: '19–100 semanas', phase: 'Produção', dailyFeedMinGrams: 109.1, dailyFeedMaxGrams: 116.9, sourceId: metadata.id, page: '3', housingSystemApplicability: metadata.housing, reviewStatus: 'transcribed-unreviewed', note: 'Faixa média diária publicada no resumo do guia convencional; não representa uma meta individual semanal.' };
  }
  if (lineage === 'Lohmann Brown-Classic' && ageWeeks >= 20 && ageWeeks <= 95) {
    return { lineage, ageWeeks, ageRangeLabel: 'Período de produção', phase: 'Produção', dailyFeedMinGrams: 110, dailyFeedMaxGrams: 120, sourceId: metadata.id, page: '7', housingSystemApplicability: metadata.housing, reviewStatus: 'transcribed-unreviewed', note: 'Faixa diária geral publicada para produção; o guia não discrimina o consumo em cada semana nesta tabela.' };
  }
  if (lineage === 'NOVOgen Brown' && ageWeeks >= 26 && ageWeeks <= 100) {
    return { lineage, ageWeeks, ageRangeLabel: '26–100 semanas', phase: 'Produção', dailyFeedMinGrams: 111, dailyFeedMaxGrams: 119, sourceId: metadata.id, page: '41', housingSystemApplicability: metadata.housing, reviewStatus: 'transcribed-unreviewed', note: 'Faixa diária publicada na tabela comercial para as semanas 26 a 100; os demais indicadores devem usar o ponto semanal quando disponível.' };
  }
  if (lineage === 'Hy-Line W-36' && ageWeeks >= 18 && ageWeeks <= 100) {
    return { lineage, ageWeeks, ageRangeLabel: '18–100 semanas', phase: 'Produção', dailyFeedMinGrams: 99.6, dailyFeedMaxGrams: 99.6, sourceId: metadata.id, page: '1', housingSystemApplicability: metadata.housing, reviewStatus: 'transcribed-unreviewed', note: 'Consumo médio publicado para o período de produção; não é uma meta semanal variável.' };
  }
  return null;
}

export function getLayerGuideSource(
  lineage: LayerLineage,
  housingSystem: 'conventional' | 'alternative' = 'conventional',
): LayerGuideSource | null {
  if (lineage !== 'Hy-Line Brown' && housingSystem === 'alternative') return null;
  return layerGuideSources.find((source) =>
    source.lineage === lineage && (lineage !== 'Hy-Line Brown' || source.housingSystem === housingSystem),
  ) ?? null;
}


export type LayerHousingRecommendation = {
  lineage: 'Hy-Line Brown';
  housingSystem: 'Gaiolas convencionais' | 'Sistema de piso' | 'Aviário / multinível' | 'Free-range';
  referenceSystem: 'conventional' | 'alternative';
  minAgeWeeks: number;
  maxAgeWeeks?: number;
  ageRangeLabel: string;
  values: Partial<Record<TechnicalParameterKey, number>>;
  page: string;
  note: string;
};

/**
 * Coeficientes de alojamento extraídos dos guias Hy-Line Brown catalogados.
 * Valores de área para gaiolas são área de piso da gaiola/colônia e não podem
 * ser usados como densidade da área útil do galpão.
 */
const layerHousingRecommendations: LayerHousingRecommendation[] = [
  {
    lineage: 'Hy-Line Brown', housingSystem: 'Gaiolas convencionais', referenceSystem: 'conventional',
    minAgeWeeks: 0, maxAgeWeeks: 4, ageRangeLabel: '0–4 semanas',
    values: { birdsPerNipple: 12, feederCmPerBird: 4.5 }, page: '7',
    note: 'Guia de sistemas convencionais: 1 bebedouro nipple/copo para 12 aves e 4,5 cm de comedouro por ave. A faixa de 100–200 cm²/ave refere-se ao piso de gaiola/colônia, não à área útil do galpão.',
  },
  {
    lineage: 'Hy-Line Brown', housingSystem: 'Gaiolas convencionais', referenceSystem: 'conventional',
    minAgeWeeks: 4, maxAgeWeeks: 15, ageRangeLabel: '4–15 semanas',
    values: { birdsPerNipple: 8, feederCmPerBird: 7 }, page: '7',
    note: 'Guia de sistemas convencionais: 1 bebedouro nipple/copo para 8 aves e 5–7 cm de comedouro por ave. O cálculo usa 7 cm/ave. A referência de 360 cm²/ave refere-se ao piso de gaiola/colônia, não à área útil do galpão.',
  },
  {
    lineage: 'Hy-Line Brown', housingSystem: 'Gaiolas convencionais', referenceSystem: 'conventional',
    minAgeWeeks: 15, ageRangeLabel: '15 semanas ou mais',
    values: { birdsPerNipple: 12, feederCmPerBird: 9 }, page: '7',
    note: 'Guia de sistemas convencionais: 1 bebedouro nipple/copo para 12 aves (ou acesso a dois bebedouros) e 7–9 cm de comedouro por ave. O cálculo usa 9 cm/ave. A referência de 490 cm²/ave refere-se ao piso de gaiola/colônia, não à área útil do galpão.',
  },
  {
    lineage: 'Hy-Line Brown', housingSystem: 'Sistema de piso', referenceSystem: 'alternative',
    minAgeWeeks: 18, maxAgeWeeks: 100, ageRangeLabel: '18–100 semanas',
    values: { areaPerBirdCm2: 1429, birdsPerNipple: 10, feederCmPerBird: 10 }, page: '7',
    note: 'Guia de sistemas alternativos, maio de 2026: 7–9 aves/m² de área útil em piso; aplicado o limite conservador de 7 aves/m² (1.429 cm²/ave). Nipple/copo: 1/10 aves. Comedouro: 5 cm/ave com acesso bilateral ou 10 cm/ave com acesso por um lado; aplicado 10 cm/ave.',
  },
  {
    lineage: 'Hy-Line Brown', housingSystem: 'Free-range', referenceSystem: 'alternative',
    minAgeWeeks: 18, maxAgeWeeks: 100, ageRangeLabel: '18–100 semanas',
    values: { areaPerBirdCm2: 1429, birdsPerNipple: 10, feederCmPerBird: 10 }, page: '7',
    note: 'Guia de sistemas alternativos, maio de 2026: a área calculada representa somente a área interna em piso (7 aves/m², limite conservador). Nipple/copo: 1/10 aves. Comedouro: 10 cm/ave com acesso por um lado. A área externa não é dimensionada nesta tabela.',
  },
  {
    lineage: 'Hy-Line Brown', housingSystem: 'Aviário / multinível', referenceSystem: 'alternative',
    minAgeWeeks: 18, maxAgeWeeks: 100, ageRangeLabel: '18–100 semanas',
    values: { birdsPerNipple: 10, feederCmPerBird: 5 }, page: '7',
    note: 'Guia de sistemas alternativos: não fixa densidade única de aves/m² para aviários/multiníveis e remete ao fabricante; por isso a área não é presumida. Publica 1 nipple/copo para 10 aves, 5 cm/ave de comedouro com acesso bilateral (ou 10 cm/ave com acesso por um lado) e 10–15 cm/ave de poleiro.',
  },
];

export function getLayerHousingRecommendation(
  lineage: LayerLineage,
  housingSystem: LayerHousingRecommendation['housingSystem'],
  ageWeeks: number,
): LayerHousingRecommendation | null {
  if (!Number.isFinite(ageWeeks) || ageWeeks < 0) return null;
  return layerHousingRecommendations.find((item) =>
    item.lineage === lineage
    && item.housingSystem === housingSystem
    && ageWeeks >= item.minAgeWeeks
    && (item.maxAgeWeeks === undefined || ageWeeks <= item.maxAgeWeeks),
  ) ?? null;
}
