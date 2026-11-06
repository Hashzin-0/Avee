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
  edition: 'Edição disponibilizada no portal oficial; versão/data impressa não identificada no arquivo consultado',
  page: '8',
  url: 'https://www.hyline.com/filesimages/Hy-Line-Products/Hy-Line-Product-PDFs/Brown/Brown%20Alt/BRN%20ALT%20COM%20ENG.pdf',
};

const HYLINE_W36: TechnicalSource = {
  publisher: 'Hy-Line International',
  title: 'Hy-Line W-36 Commercial Layers — Management Guide',
  edition: 'Janeiro de 2020',
  page: '9',
  url: 'https://www.hyline.com/filesimages/Hy-Line-Products/Hy-Line-Product-PDFs/W-36/36%20COM%20ENG.pdf',
};

const SUPPORTED_KEYS: TechnicalParameterKey[] = [
  'areaPerBirdCm2',
  'birdsPerNipple',
  'feederCmPerBird',
];

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
        values: { areaPerBirdCm2: 750, birdsPerNipple: 12, feederCmPerBird: 12 },
        source: HYLINE_BROWN_CONVENTIONAL,
        note: 'O manual informa 490–750 cm²/ave, 1 nipple/12 aves e 7–12 cm de comedouro/ave entre 20 e 80 semanas. Foram aplicados 750 cm² e 12 cm, os limites mais conservadores de espaço e acesso ao comedouro. O perfil climático fica registrado, mas esta tabela não diferencia esses três coeficientes por clima.',
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

  if (lineage === 'Hy-Line W-36' && housingSystem === 'Gaiolas convencionais') {
    if (phase === 'Recria' && ageWeeks === 17) {
      return {
        ...input,
        values: { areaPerBirdCm2: 310, birdsPerNipple: 8, feederCmPerBird: 8 },
        source: HYLINE_W36,
        note: 'Referência pontual do guia para 17 semanas: 310 cm²/ave, 1 nipple/copo para 8 aves e 8 cm de comedouro/ave. Não interpolar para outras idades sem dado publicado.',
      };
    }
    if (phase === 'Produção' && ageWeeks >= 20 && ageWeeks <= 30) {
      return {
        ...input,
        values: { areaPerBirdCm2: 750, birdsPerNipple: 8, feederCmPerBird: 8 },
        source: HYLINE_W36,
        note: 'Para 20–30 semanas, o guia informa 490–750 cm²/ave, 1 nipple/8 aves e 8 cm de comedouro/ave. Foi aplicado o limite de 750 cm²/ave, mais conservador em espaço. O clima informado não altera os coeficientes desta tabela.',
      };
    }
    if (phase === 'Produção' && ageWeeks >= 40 && ageWeeks <= 80) {
      return {
        ...input,
        values: { areaPerBirdCm2: 750, birdsPerNipple: 12, feederCmPerBird: 12 },
        source: HYLINE_W36,
        note: 'Para 40–80 semanas, o guia informa 490–750 cm²/ave, 1 nipple/12 aves ou acesso a dois bebedouros e 7–12 cm de comedouro/ave. Foram aplicados 750 cm² e 12 cm, os limites mais conservadores de espaço e acesso ao comedouro. O clima informado não altera os coeficientes desta tabela.',
      };
    }
  }

  return null;
}

export function getTechnicalParameterKeys(): TechnicalParameterKey[] {
  return [...SUPPORTED_KEYS];
}
