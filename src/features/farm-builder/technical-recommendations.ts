export type LayerLineage = 'Hy-Line Brown' | 'Hy-Line W-36' | 'Lohmann Brown-Classic' | 'NOVOgen Brown' | 'Outra / não definida';
export type HousingSystem = 'Gaiolas convencionais' | 'Gaiolas enriquecidas' | 'Sistema de piso' | 'Free-range';
export type ProductionPhase = 'Cria' | 'Recria' | 'Pré-postura' | 'Produção';
export type ClimateProfile = 'Quente' | 'Temperado' | 'Frio' | 'Outro / não informado';

export type TechnicalParameterKey =
  | 'areaPerBirdCm2'
  | 'birdsPerNipple'
  | 'feederCmPerBird';

export interface TechnicalSource {
  publisher: string;
  title: string;
  edition: string;
  page: string;
  url: string;
}

export interface PerformanceIndicator { label: string; value: string; period: string; }
export interface LayerPerformanceProfile { lineage: LayerLineage; indicators: PerformanceIndicator[]; source: TechnicalSource; note: string; }

export interface LayerTechnicalRecommendation {
  lineage: LayerLineage;
  housingSystem: HousingSystem;
  phase: ProductionPhase;
  ageWeeks: number;
  climateProfile: ClimateProfile;
  values: Partial<Record<TechnicalParameterKey, number>>;
  source: TechnicalSource;
  note: string;
}

const HYLINE_BROWN_CONVENTIONAL: TechnicalSource = {
  publisher: 'Hy-Line International',
  title: 'Hy-Line Brown Commercial Layers — Conventional Systems, Performance Guide',
  edition: 'Dezembro de 2025',
  page: '7',
  url: 'https://www.hyline.com/filesimages/Hy-Line-Products/Hy-Line-Product-PDFs/Brown/BRN%20STD%20ENG.pdf',
};

const HYLINE_BROWN_ALTERNATIVE: TechnicalSource = {
  publisher: 'Hy-Line International',
  title: 'Hy-Line Brown Alternative Systems — Management Guide',
  edition: 'Junho de 2021 (código do documento: BRN ALT ENG 062921)',
  page: '8',
  url: 'https://www.hyline.com/filesimages/Hy-Line-Products/Hy-Line-Product-PDFs/Brown/Brown%20Alt/BRN%20ALT%20COM%20ENG.pdf',
};

const LOHMANN_BROWN: TechnicalSource = {
  publisher: 'LOHMANN BREEDERS',
  title: 'LOHMANN BROWN-CLASSIC Layers — Management Guide, Cage Housing',
  edition: 'PDF oficial disponibilizado em 2020',
  page: '7',
  url: 'https://lohmann-breeders.com/media/2020/07/ManagementGuideLBClassicCage-EN.pdf',
};

const HYLINE_W36: TechnicalSource = {
  publisher: 'Hy-Line International',
  title: 'Hy-Line W-36 Commercial Layers — Management Guide',
  edition: 'Janeiro de 2020',
  page: '1',
  url: 'https://www.hyline.com/filesimages/Hy-Line-Products/Hy-Line-Product-PDFs/W-36/36%20COM%20ENG.pdf',
};

/**
 * Returns only values explicitly supported by the cited commercial-layer guide.
 * Equipment capacity and fan output are intentionally excluded: they depend on
 * the selected equipment, its performance curve, static pressure and installation.
 */
export function getLayerTechnicalRecommendation(input: {
  lineage: LayerLineage;
  housingSystem: HousingSystem;
  phase: ProductionPhase;
  ageWeeks: number;
  climateProfile: ClimateProfile;
}): LayerTechnicalRecommendation | null {
  const { lineage, housingSystem, phase, ageWeeks, climateProfile } = input;
  if (!Number.isFinite(ageWeeks) || ageWeeks < 0) return null;

  if (lineage === 'Hy-Line Brown' && phase === 'Produção') {
    if (housingSystem === 'Gaiolas convencionais' && ageWeeks >= 20 && ageWeeks <= 80) {
      return {
        ...input,
        values: { birdsPerNipple: 12, feederCmPerBird: 12 },
        source: HYLINE_BROWN_CONVENTIONAL,
        note: 'O manual informa 490–750 cm² de piso de gaiola por ave, 1 nipple/12 aves e 7–12 cm de comedouro/ave entre 20 e 80 semanas. Foram aplicados 12 cm de comedouro/ave. A área de piso da gaiola não é inserida no campo de área do galpão, pois são bases geométricas diferentes. O perfil climático fica registrado, mas esta tabela não diferencia estes coeficientes por clima.',
      };
    }

    if ((housingSystem === 'Sistema de piso' || housingSystem === 'Free-range') && ageWeeks >= 18 && ageWeeks <= 90) {
      return {
        ...input,
        values: { areaPerBirdCm2: 1429, birdsPerNipple: 10, feederCmPerBird: 10 },
        source: HYLINE_BROWN_ALTERNATIVE,
        note: 'Para piso, o guia informa 7–9 aves/m², nipple/copo 1/10 aves e comedouro 5 cm/ave com acesso dos dois lados ou 10 cm/ave com acesso por um lado. Foram aplicados 1.429 cm²/ave (7 aves/m²) e 10 cm/ave. Em free-range, a área calculada é apenas a área interna útil; a área externa/pasto não está incluída. O perfil climático fica registrado, mas não altera estes coeficientes da tabela.',
      };
    }
  }

  if (lineage === 'Lohmann Brown-Classic' && phase === 'Produção') {
    if (housingSystem === 'Gaiolas convencionais' && ageWeeks >= 20 && ageWeeks <= 95) {
      return { ...input, values: { birdsPerNipple: 8, feederCmPerBird: 5 }, source: LOHMANN_BROWN, note: 'Na produção em gaiolas, o guia indica 6–8 aves por nipple e 5 m de comedouro de corrente por 100 aves. Foram aplicados 8 aves/nipple e 5 cm de comedouro/ave. O manual também indica 475–540 cm² de área de piso de gaiola por ave; esse valor não é transferido para o campo de área útil do galpão.' };
    }
    if (housingSystem === 'Sistema de piso' && ageWeeks >= 20 && ageWeeks <= 95) {
      return { ...input, values: { areaPerBirdCm2: 1667, birdsPerNipple: 8, feederCmPerBird: 5 }, source: LOHMANN_BROWN, note: 'Para alojamento não enjaulado, o guia indica 6–8 aves/m²; foi usado o limite mais conservador de 6 aves/m² (1.667 cm²/ave). Na produção, indica 6–8 aves por nipple e 5 m de comedouro de corrente por 100 aves. Free-range exige referência específica para a área externa e não é inferido desta tabela.' };
    }
  }
  if (lineage === 'Hy-Line W-36' && housingSystem === 'Gaiolas convencionais') {
    if (phase === 'Recria' && ageWeeks === 17) {
      return {
        ...input,
        values: { birdsPerNipple: 8, feederCmPerBird: 8 },
        source: HYLINE_W36,
        note: 'Referência pontual do guia para 17 semanas: 310 cm² de piso de gaiola por ave, 1 nipple/copo para 8 aves e 8 cm de comedouro/ave. Foram aplicados nipple e comedouro; a área de piso da gaiola não é inserida no cálculo de área útil do galpão. Não interpolar para outras idades sem dado publicado.',
      };
    }
    if (phase === 'Produção' && ageWeeks >= 20 && ageWeeks <= 30) {
      return {
        ...input,
        values: { birdsPerNipple: 8, feederCmPerBird: 8 },
        source: HYLINE_W36,
        note: 'Para 20–30 semanas, o guia informa 490–750 cm² de piso de gaiola por ave, 1 nipple/8 aves e 8 cm de comedouro/ave. Foram aplicados nipple e comedouro; a área de piso da gaiola não é inserida no cálculo de área útil do galpão. O clima informado não altera os coeficientes desta tabela.',
      };
    }
    if (phase === 'Produção' && ageWeeks >= 40 && ageWeeks <= 80) {
      return {
        ...input,
        values: { birdsPerNipple: 12, feederCmPerBird: 12 },
        source: HYLINE_W36,
        note: 'Para 40–80 semanas, o guia informa 490–750 cm² de piso de gaiola por ave, 1 nipple/12 aves ou acesso a dois bebedouros e 7–12 cm de comedouro/ave. Foram aplicados nipple e 12 cm de comedouro/ave; a área de piso da gaiola não é inserida no cálculo de área útil do galpão. O clima informado não altera os coeficientes desta tabela.',
      };
    }
  }

  return null;
}

export function getTechnicalParameterKeys(): TechnicalParameterKey[] {
  return [...SUPPORTED_KEYS];
}


export function getLayerPerformanceProfile(lineage: LayerLineage): LayerPerformanceProfile | null {
  const sourceIndicators: Record<string, PerformanceIndicator[]> = {
    'Hy-Line Brown': [
      { label: 'Mortalidade acumulada na recria', value: '2%', period: 'Até 17 semanas; derivada de 98% de viabilidade' },
      { label: 'Mortalidade acumulada na produção', value: '2,83%', period: 'Até 60 semanas; derivada de 97,17% de viabilidade' },
      { label: 'Mortalidade acumulada na produção', value: '8,60%', period: 'Até 100 semanas; derivada de 91,40% de viabilidade' },
      { label: 'Peso corporal médio', value: '1.411–1.492 g', period: '18 semanas' },
      { label: 'Peso corporal médio', value: '1.810–1.913 g', period: '26 semanas' },
      { label: 'Peso corporal médio', value: '1.876–1.984 g', period: '32 semanas' },
      { label: 'Peso corporal médio', value: '1.954–2.066 g', period: '70 semanas' },
      { label: 'Ovos por ave alojada', value: '256,2–270,8 ovos', period: 'Acumulado até 60 semanas' },
      { label: 'Ovos por ave alojada', value: '466,4–497,9 ovos', period: 'Acumulado até 100 semanas' },
      { label: 'Pico de postura', value: '93,6–98,5%', period: 'Pico do ciclo' },
      { label: 'Peso médio do ovo', value: '55,2–58,6 g', period: '26 semanas' },
      { label: 'Peso médio do ovo', value: '58,9–62,6 g', period: '32 semanas' },
      { label: 'Consumo médio de ração', value: '109,1–116,9 g/ave/dia', period: '19–100 semanas' },
      { label: 'Conversão alimentar', value: '2,06–2,15 kg/kg', period: '20–60 semanas; ração/massa de ovos' },
      { label: 'Massa de ovos por ave alojada', value: '29,8 kg', period: '18–100 semanas' },
      { label: 'Ração consumida na recria', value: '5,99 kg/ave', period: 'Até 17 semanas' },
    ],
    'Lohmann Brown-Classic': [
      { label: 'Mortalidade acumulada na recria', value: '2–3%', period: 'Recria; derivada de 97–98% de viabilidade' },
      { label: 'Mortalidade acumulada na produção', value: '6–8%', period: 'Postura; derivada de 92–94% de viabilidade' },
      { label: 'Peso corporal médio', value: '1,38–1,46 kg', period: '17 semanas' },
      { label: 'Peso corporal médio', value: '1,90–2,20 kg', period: 'Final da produção' },
      { label: 'Ovos por ave alojada', value: '318–323 ovos', period: 'Acumulado até 72 semanas' },
      { label: 'Ovos por ave alojada', value: '358–363 ovos', period: 'Acumulado até 80 semanas' },
      { label: 'Ovos por ave alojada', value: '428–433 ovos', period: 'Acumulado até 95 semanas' },
      { label: 'Pico de postura', value: '93–95%', period: 'Pico do ciclo' },
      { label: 'Peso médio do ovo', value: '63,5–64,5 g', period: '72 semanas' },
      { label: 'Peso médio do ovo', value: '64,0–65,0 g', period: '80 semanas' },
      { label: 'Consumo médio de ração', value: '110–120 g/ave/dia', period: 'Produção' },
      { label: 'Conversão alimentar', value: '2,0–2,1 kg/kg', period: 'Ração/massa de ovos' },
      { label: 'Massa de ovos por ave alojada', value: '27,5–28,5 kg', period: 'Até 95 semanas' },
      { label: 'Ração consumida na recria', value: '5,7–5,9 kg/ave', period: '1ª–17ª semana' },
    ],
    'Hy-Line W-36': [
      { label: 'Mortalidade acumulada na recria', value: '3%', period: 'Até 17 semanas; derivada de 97% de viabilidade' },
      { label: 'Mortalidade acumulada na produção', value: '2,9%', period: 'Até 60 semanas; derivada de 97,1% de viabilidade' },
      { label: 'Mortalidade acumulada na produção', value: '8%', period: 'Até 100 semanas; derivada de 92% de viabilidade' },
      { label: 'Peso corporal médio', value: '1.190–1.250 g', period: '17 semanas' },
      { label: 'Peso corporal médio', value: '1.480–1.540 g', period: '26 semanas' },
      { label: 'Peso corporal médio', value: '1.510–1.570 g', period: '32 semanas' },
      { label: 'Ovos por ave alojada', value: '252–260 ovos', period: 'Acumulado até 60 semanas' },
      { label: 'Ovos por ave alojada', value: '456–472 ovos', period: 'Acumulado até 100 semanas' },
      { label: 'Pico de postura', value: '95–97%', period: 'Pico do ciclo' },
      { label: 'Peso médio do ovo', value: '54,7 g', period: '26 semanas' },
      { label: 'Peso médio do ovo', value: '58,5 g', period: '32 semanas' },
      { label: 'Consumo médio de ração', value: '99,6 g/ave/dia', period: '18–100 semanas' },
      { label: 'Conversão alimentar', value: '1,81–1,94 kg/kg', period: '20–60 semanas; ração/massa de ovos' },
      { label: 'Massa de ovos por ave alojada', value: '27,4–29,4 kg', period: '18–100 semanas' },
      { label: 'Ração consumida na recria', value: '5,36–5,94 kg/ave', period: 'Até 17 semanas' },
    ],
  };
  const indicators = sourceIndicators[lineage];
  if (!indicators) return null;
  const source = lineage === 'Hy-Line Brown' ? HYLINE_BROWN_CONVENTIONAL : lineage === 'Lohmann Brown-Classic' ? LOHMANN_BROWN : HYLINE_W36;
  return { lineage, indicators, source, note: 'Indicadores de desempenho de referência do manual da linhagem. Mortalidade é calculada como 100% menos viabilidade publicada. Ovos por ave alojada são acumulados até a idade indicada, não produção diária. Os valores são metas/resultados de referência e não substituem os dados medidos do lote.' };
}
