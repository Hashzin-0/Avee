import type { LayerLineage } from '../farm-builder/technical-recommendations';

export type ManagementPhase = 'Cria' | 'Recria' | 'Pré-postura' | 'Produção';

export type LayerGuideSource = {
  id: string;
  lineage: LayerLineage;
  publisher: string;
  title: string;
  edition: string;
  url: string;
  coverage: string;
  dataStatus: 'weekly' | 'milestones';
};

export type LayerAgeReference = {
  lineage: LayerLineage;
  ageWeeks: number;
  phase: ManagementPhase;
  bodyWeightMinGrams?: number;
  bodyWeightMaxGrams?: number;
  dailyFeedMinGrams?: number;
  dailyFeedMaxGrams?: number;
  dailyWaterMinMl?: number;
  dailyWaterMaxMl?: number;
  cumulativeMortalityPercent?: number;
  cumulativeFeedMinGrams?: number;
  cumulativeFeedMaxGrams?: number;
  layRateMinPercent?: number;
  layRateMaxPercent?: number;
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
  { id: 'hyline-brown-2025', lineage: 'Hy-Line Brown', publisher: 'Hy-Line International', title: 'Hy-Line Brown Commercial Layers — International Standards', edition: 'Dezembro de 2025', url: 'https://www.hyline.com/filesimages/Hy-Line-Products/Hy-Line-Product-PDFs/Brown/BRN%20STD%20ENG.pdf', coverage: 'Tabela semanal de recria (1–17 semanas) e tabela de produção (18–100 semanas), com peso, consumo, água, mortalidade, postura e ovos acumulados.', dataStatus: 'weekly' },
  { id: 'lohmann-brown-classic-2020', lineage: 'Lohmann Brown-Classic', publisher: 'LOHMANN BREEDERS', title: 'LOHMANN BROWN-CLASSIC Layers — Management Guide, Cage Housing', edition: 'Guia oficial publicado em 2020; consultar a edição vigente do fabricante', url: 'https://lohmann-breeders.com/media/2020/07/ManagementGuideLBClassicCage-EN.pdf', coverage: 'Metas publicadas de recria e produção, incluindo consumo total na recria, consumo diário em produção, peso, viabilidade e ovos por ave alojada.', dataStatus: 'milestones' },
  { id: 'novogen-brown-commercial-2024', lineage: 'NOVOgen Brown', publisher: 'NOVOGEN', title: 'Guía de Manejo para Ponedoras Comerciales — NOVOgen BROWN', edition: 'Documento 202402; versão em espanhol', url: 'https://novocenter.novogen-layers.com/wp-content/uploads/2021/11/202402-Guide_management_CS_Brown_V2-EScomp.pdf', coverage: 'Tabela comercial semanal de resultados; a ficha estruturada inclui pontos de referência confirmados em 24, 60 e 100 semanas. Não confundir com documentos Parent Stock.', dataStatus: 'milestones' },
  { id: 'hyline-w36-commercial', lineage: 'Hy-Line W-36', publisher: 'Hy-Line International', title: 'Hy-Line W-36 Commercial Layers — Performance Standards', edition: 'Documento de desempenho oficial; verificar atualização na página de literatura W-36', url: 'https://www.hyline.com/filesimages/Hy-Line-Products/Hy-Line-Product-PDFs/W-36/36%20COM%20ENG.pdf', coverage: 'Metas publicadas de recria e produção, incluindo consumo, peso, viabilidade e ovos por ave alojada.', dataStatus: 'milestones' },
];

export function getManagementPhase(ageWeeks: number): ManagementPhase {
  if (!Number.isFinite(ageWeeks) || ageWeeks < 0) throw new RangeError('Idade deve ser um número não negativo.');
  if (ageWeeks < 6) return 'Cria';
  if (ageWeeks < 15) return 'Recria';
  if (ageWeeks < 18) return 'Pré-postura';
  return 'Produção';
}

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
  cumulativeFeedMinGrams: feedCumMin, cumulativeFeedMaxGrams: feedCumMax,
}));


const hylineProductionMilestones: LayerAgeReference[] = [
  { lineage: 'Hy-Line Brown', ageWeeks: 18, phase: 'Produção', bodyWeightMinGrams: 1411, bodyWeightMaxGrams: 1492, dailyFeedMinGrams: 81, dailyFeedMaxGrams: 86, dailyWaterMinMl: 121, dailyWaterMaxMl: 173, cumulativeMortalityPercent: 0.24, layRateMinPercent: 6.7, layRateMaxPercent: 7, averageEggWeightMinGrams: 42.8, averageEggWeightMaxGrams: 45.5 },
  { lineage: 'Hy-Line Brown', ageWeeks: 24, phase: 'Produção', bodyWeightMinGrams: 1739, bodyWeightMaxGrams: 1838, dailyFeedMinGrams: 107, dailyFeedMaxGrams: 114, dailyWaterMinMl: 161, dailyWaterMaxMl: 228, cumulativeMortalityPercent: 0.49, layRateMinPercent: 92.4, layRateMaxPercent: 97, eggsPerHenHousedMin: 29.9, eggsPerHenHousedMax: 31.4, averageEggWeightMinGrams: 53.1, averageEggWeightMaxGrams: 56.4, eggMassPerHenHousedMinKg: 1.6, eggMassPerHenHousedMaxKg: 1.6 },
  { lineage: 'Hy-Line Brown', ageWeeks: 60, phase: 'Produção', bodyWeightMinGrams: 1947, bodyWeightMaxGrams: 2058, dailyFeedMinGrams: 110, dailyFeedMaxGrams: 118, dailyWaterMinMl: 165, dailyWaterMaxMl: 236, cumulativeMortalityPercent: 2.83, layRateMinPercent: 87.4, layRateMaxPercent: 93.2, eggsPerHenHousedMin: 256.2, eggsPerHenHousedMax: 270.8, averageEggWeightMinGrams: 60.9, averageEggWeightMaxGrams: 64.6, eggMassPerHenHousedMinKg: 15.5, eggMassPerHenHousedMaxKg: 16.4 },
  { lineage: 'Hy-Line Brown', ageWeeks: 100, phase: 'Produção', bodyWeightMinGrams: 1965, bodyWeightMaxGrams: 2078, dailyFeedMinGrams: 110, dailyFeedMaxGrams: 118, dailyWaterMinMl: 165, dailyWaterMaxMl: 236, cumulativeMortalityPercent: 8.6, layRateMinPercent: 70.8, layRateMaxPercent: 77.6, eggsPerHenHousedMin: 466.4, eggsPerHenHousedMax: 497.9, averageEggWeightMinGrams: 62.2, averageEggWeightMaxGrams: 66.1, eggMassPerHenHousedMinKg: 28.9, eggMassPerHenHousedMaxKg: 30.8 },
];

const milestoneReferences: LayerAgeReference[] = [
  { lineage: 'Lohmann Brown-Classic', ageWeeks: 17, phase: 'Pré-postura', bodyWeightMinGrams: 1380, bodyWeightMaxGrams: 1460, cumulativeFeedMinGrams: 5700, cumulativeFeedMaxGrams: 5900, note: 'Guia Cage Housing, p. 7.' },
  { lineage: 'Lohmann Brown-Classic', ageWeeks: 72, phase: 'Produção', eggsPerHenHousedMin: 318, eggsPerHenHousedMax: 323, averageEggWeightMinGrams: 63.5, averageEggWeightMaxGrams: 64.5, note: 'Guia Cage Housing, p. 7.' },
  { lineage: 'Lohmann Brown-Classic', ageWeeks: 80, phase: 'Produção', eggsPerHenHousedMin: 358, eggsPerHenHousedMax: 363, averageEggWeightMinGrams: 64, averageEggWeightMaxGrams: 65, note: 'Guia Cage Housing, p. 7.' },
  { lineage: 'Lohmann Brown-Classic', ageWeeks: 95, phase: 'Produção', eggsPerHenHousedMin: 428, eggsPerHenHousedMax: 433, averageEggWeightMinGrams: 65, averageEggWeightMaxGrams: 66, eggMassPerHenHousedMinKg: 27.5, eggMassPerHenHousedMaxKg: 28.5, note: 'Guia Cage Housing, p. 7.' },
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
  'Hy-Line Brown': { id: 'hyline-brown-2025', pageForAge: (age) => age <= 17 ? '4' : '5–6', housing: 'Sistemas convencionais; os dados de performance não substituem recomendações específicas de alojamento.' },
  'Lohmann Brown-Classic': { id: 'lohmann-brown-classic-2020', pageForAge: () => '7', housing: 'Gaiolas convencionais; não extrapolar para alojamento alternativo.' },
  'NOVOgen Brown': { id: 'novogen-brown-commercial-2024', pageForAge: () => '41', housing: 'Poedeiras comerciais; confirmar sistema e clima nas recomendações de alojamento do manual.' },
  'Hy-Line W-36': { id: 'hyline-w36-commercial', pageForAge: () => '1', housing: 'Sistemas convencionais; confirmar o guia de alojamento antes de dimensionar equipamentos.' },
  'Outra / não definida': { id: 'unsupported', pageForAge: () => '—', housing: 'Sem aplicabilidade definida.' },
};

export const layerAgeReferences: SourcedLayerAgeReference[] = [...hylineRearing, ...hylineProductionMilestones, ...milestoneReferences]
  .map((reference) => {
    const metadata = sourceMetadata[reference.lineage];
    return { ...reference, sourceId: metadata.id, page: metadata.pageForAge(reference.ageWeeks), housingSystemApplicability: metadata.housing, reviewStatus: 'transcribed-unreviewed' as const };
  });

export function getLayerAgeReference(lineage: LayerLineage, ageWeeks: number): SourcedLayerAgeReference | null {
  if (!Number.isFinite(ageWeeks) || ageWeeks < 0) return null;
  const exact = layerAgeReferences.find((item) => item.lineage === lineage && item.ageWeeks === Math.ceil(ageWeeks));
  return exact ?? null;
}

export function getLayerGuideSource(lineage: LayerLineage): LayerGuideSource | null {
  return layerGuideSources.find((source) => source.lineage === lineage) ?? null;
}
