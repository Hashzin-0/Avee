/**
 * Hy-Line public technical resources reviewed for the Granja knowledge library.
 * Summaries are original concise notes, not reproductions of source PDFs.
 * Always consult the linked source and local veterinarian/nutritionist before applying guidance.
 */
export type HyLineResourceCategory =
  | 'Desempenho'
  | 'Manejo'
  | 'Nutrição'
  | 'Ambiência'
  | 'Biossegurança'
  | 'Sanidade'
  | 'Qualidade dos ovos'
  | 'Amostragem e laboratório'
  | 'Incubatório';

export type HyLineTechnicalResource = {
  id: string;
  title: string;
  publisher: 'Hy-Line International' | 'International Egg Commission / Hy-Line listing';
  category: HyLineResourceCategory;
  language: string;
  pages: number;
  edition?: string;
  housingApplicability: string;
  summary: string;
  topics: string[];
  url: string;
  extractionStatus: 'summary-extracted' | 'source-indexed';
};

const HYLINE = 'https://www.hyline.com/Upload/Resources/';

export const hyLineTechnicalResources: readonly HyLineTechnicalResource[] = [
  {
    id: 'brown-alternative-2026',
    title: 'Hy-Line Brown — Guia de Desempenho, Poedeiras Comerciais, Sistemas Alternativos',
    publisher: 'Hy-Line International', category: 'Desempenho', language: 'Português', pages: 20,
    edition: 'Maio de 2026 — Padrões Internacionais', housingApplicability: 'Sistemas alternativos; o guia discrimina piso e sistemas multiníveis em recomendações de alojamento.',
    summary: 'Contém padrões de linhagem, tabelas semanais de recria (1–17) e produção (18–100), recomendações de espaço, qualidade e distribuição do tamanho dos ovos, manejo de cria e transição, iluminação, nutrição por número e peso de ovos, vitaminas, minerais-traço e qualidade da água. Na recria, a densidade de transferência indicada cai de 15 aves/m² na semana 15 para 12 aves/m² na semana 18. Na produção em piso, publica 7–9 aves/m²; para multiníveis, não fixa densidade única e remete ao fabricante. Semana 100 é o último marco de desempenho publicado, não uma determinação de descarte.',
    topics: ['Tabelas semanais 1–100', 'Densidade e equipamentos para piso/multinível', 'Iluminação e transição', 'Nutrição e água', 'Qualidade de ovos'],
    url: 'https://www.hyline.com/resources', extractionStatus: 'summary-extracted',
  },
  {
    id: 'brown-conventional-2025',
    title: 'Hy-Line Brown Commercial Layers — Conventional Systems, International Standards',
    publisher: 'Hy-Line International', category: 'Desempenho', language: 'Inglês / documento convencional anexado em português', pages: 20,
    edition: 'Dezembro de 2025', housingApplicability: 'Sistemas convencionais; não aplicar automaticamente a piso, aviário ou free-range.',
    summary: 'Guia de desempenho convencional com padrões de recria e produção, tabelas semanais, recomendações de espaço e equipamentos, manejo, iluminação, nutrição, vitaminas, minerais e água. O catálogo identifica explicitamente este documento como convencional para impedir mistura com o guia de sistemas alternativos de maio de 2026.',
    topics: ['Padrões de desempenho', 'Recria e produção', 'Alojamento convencional', 'Nutrição', 'Manejo'],
    url: 'https://www.hyline.com/filesimages/Hy-Line-Products/Hy-Line-Product-PDFs/Brown/BRN%20STD%20ENG.pdf', extractionStatus: 'summary-extracted',
  },
  {
    id: 'feed-particle-size',
    title: 'Feed Granulometry and the Importance of Feed Particle Size in Layers',
    publisher: 'Hy-Line International', category: 'Nutrição', language: 'Inglês', pages: 4,
    housingApplicability: 'Poedeiras comerciais; aplicabilidade geral, com ajustes pela fase e pelo sistema de fornecimento.',
    summary: 'Explica como a distribuição granulométrica influencia o desenvolvimento da moela e do trato intestinal, digestibilidade e ingestão seletiva. Apresenta perfis de partículas por fase, avaliação por peneiras, diferenças entre moagem por martelos e rolos e efeitos de correntes, sem-fim e hoppers na segregação do alimento.',
    topics: ['Granulometria', 'Peneiramento', 'Moagem', 'Distribuição de ração', 'Ingestão seletiva'],
    url: HYLINE + 'TU%20PART%20ENG.pdf', extractionStatus: 'summary-extracted',
  },
  {
    id: 'thiamin-deficiency',
    title: 'Thiamin Deficiency in Pullets',
    publisher: 'Hy-Line International', category: 'Nutrição', language: 'Inglês', pages: 2,
    edition: '2020', housingApplicability: 'Frangas e aves adultas; não restrito a um sistema de alojamento.',
    summary: 'Descreve causas de deficiência de tiamina (B1), incluindo falhas de premix, armazenamento, absorção intestinal, amprolium e tiaminases em farinha de peixe. Resume sinais neurológicos, diagnósticos diferenciais, necropsia, investigação da fábrica de ração e medidas de prevenção nutricional.',
    topics: ['Vitamina B1', 'Premix', 'Sinais neurológicos', 'Micotoxinas', 'Controle de qualidade da ração'],
    url: HYLINE + 'TU%20THIA%20ENG.pdf', extractionStatus: 'summary-extracted',
  },
  {
    id: 'heat-stress',
    title: 'Understanding Heat Stress in Layers',
    publisher: 'Hy-Line International', category: 'Ambiência', language: 'Inglês', pages: 8,
    housingApplicability: 'Poedeiras comerciais; contém considerações específicas para gaiolas e galpões abertos.',
    summary: 'Relaciona temperatura e umidade ao estresse térmico, perda de ingestão, postura, peso e qualidade da casca. Aborda termorregulação, água e vazão de nipples, resfriamento evaporativo, velocidade do ar, horários de manejo, iluminação e ajustes nutricionais conforme consumo observado.',
    topics: ['Temperatura e umidade', 'Ventilação', 'Água', 'Resfriamento evaporativo', 'Nutrição em calor'],
    url: HYLINE + 'TU%20HEAT%20ENG.pdf', extractionStatus: 'summary-extracted',
  },
  {
    id: 'growing-management',
    title: 'Growing Management of Commercial Pullets',
    publisher: 'Hy-Line International', category: 'Manejo', language: 'Inglês', pages: 8,
    housingApplicability: 'Recria de poedeiras comerciais; verificar as recomendações específicas do sistema utilizado.',
    summary: 'Organiza o desenvolvimento da franga em torno de peso, conformação corporal e uniformidade antes do início da postura. Inclui preparação e higienização do galpão, cronograma pré-alojamento, ambiente de cria, alimentação, água, crescimento, pesagem e preparação para transferência.',
    topics: ['Cria e recria', 'Peso corporal', 'Uniformidade', 'Preparação de galpão', 'Transferência'],
    url: HYLINE + 'TU%20PULLET%20MGMT%20ENG.pdf', extractionStatus: 'summary-extracted',
  },
  {
    id: 'tarp-color',
    title: 'Impact of Tarp Color on Poultry Lighting',
    publisher: 'Hy-Line International', category: 'Ambiência', language: 'Inglês', pages: 4,
    housingApplicability: 'Galpões abertos com cortinas/lonas; considerar a iluminação artificial e a luz natural incidentes.',
    summary: 'Avalia como a cor e a transmissão espectral das lonas alteram a luz que chega às aves. Discute espectros azul-verde e vermelho-laranja, temperatura de cor, intensidade luminosa e possíveis efeitos distintos na recria e na produção.',
    topics: ['Luz natural filtrada', 'Cortinas e lonas', 'Espectro luminoso', 'Temperatura de cor'],
    url: HYLINE + 'TU%20TARP%20ENG.pdf', extractionStatus: 'summary-extracted',
  },
  {
    id: 'non-fasting-molt',
    title: 'Recomendações na Muda Forçada sem Jejum',
    publisher: 'Hy-Line International', category: 'Manejo', language: 'Português', pages: 12,
    housingApplicability: 'Lotes comerciais em produção; confirmar legislação local e condição sanitária.',
    summary: 'Discute decisão econômica e técnica de indução de muda sem jejum, idade do lote, água, condição corporal, interrupção da postura e recuperação pós-muda. O documento exige atenção às regras locais; não deve ser convertido em protocolo automático sem avaliação veterinária e nutricional.',
    topics: ['Muda sem jejum', 'Extensão do ciclo', 'Peso corporal', 'Água', 'Legislação'],
    url: HYLINE + 'TU%20MOLT%20POR.pdf', extractionStatus: 'summary-extracted',
  },
  {
    id: 'vaccination-recommendations',
    title: 'Recomendações de Vacinação',
    publisher: 'Hy-Line International', category: 'Sanidade', language: 'Português', pages: 4,
    edition: '2019', housingApplicability: 'Poedeiras comerciais; programa depende do desafio sanitário regional.',
    summary: 'Apresenta princípios e opções para vacinação contra Marek, Newcastle, bronquite infecciosa, Gumboro, encefalomielite, bouba e agentes adicionais conforme a região. O próprio documento afirma que não existe um programa único universal e orienta seguir bula, vacina certificada e médico-veterinário local.',
    topics: ['Marek', 'Newcastle', 'Bronquite', 'Gumboro', 'Bouba', 'Vacinas vetorizadas'],
    url: HYLINE + 'TU%20VACC%20POR.pdf', extractionStatus: 'summary-extracted',
  },
  {
    id: 'colibacillosis',
    title: 'Colibacillosis in Layers: An Overview',
    publisher: 'Hy-Line International', category: 'Sanidade', language: 'Inglês', pages: 8,
    housingApplicability: 'Poedeiras e matrizes; exposição ambiental e desafios concomitantes.',
    summary: 'Revisa a colibacilose por E. coli, vias de exposição por fezes, água, poeira e ambiente, apresentações localizadas e sistêmicas, lesões, salpingite, mortalidade e queda de produção. Destaca a frequência de infecções concomitantes e a necessidade de diagnóstico diferencial.',
    topics: ['Escherichia coli', 'Salpingite', 'Diagnóstico', 'Mortalidade', 'Biossegurança'],
    url: HYLINE + 'TU%20COL%20ENG.pdf', extractionStatus: 'summary-extracted',
  },
  {
    id: 'focal-duodenal-necrosis',
    title: 'An Overview of Focal Duodenal Necrosis (FDN)',
    publisher: 'Hy-Line International', category: 'Sanidade', language: 'Inglês', pages: 2,
    housingApplicability: 'Gaiolas, cage-free e orgânico; frangas a partir de 15 semanas até o fim da postura.',
    summary: 'Descreve a necrose duodenal focal, também chamada intestino cinzento, sua ocorrência em diferentes alojamentos e sinais pouco específicos. O material relaciona lesões intestinais a possíveis perdas de peso do ovo, postura, absorção de cálcio e integridade esquelética.',
    topics: ['FDN', 'Lesões intestinais', 'Peso do ovo', 'Postura', 'Diagnóstico'],
    url: HYLINE + 'TU%20FDN%20ENG.pdf', extractionStatus: 'summary-extracted',
  },
  {
    id: 'mycoplasma-gallisepticum',
    title: 'MG Control in Commercial Layers',
    publisher: 'Hy-Line International', category: 'Sanidade', language: 'Inglês', pages: 4,
    housingApplicability: 'Poedeiras comerciais; inclui transmissão vertical e horizontal.',
    summary: 'Aborda Mycoplasma gallisepticum, transmissão por ovos, contato, superfícies e aerossóis a curta distância. Discute infecção respiratória, queda de produção, mortalidade associada a infecções secundárias e estratégias gerais de controle por biossegurança, vacinação e programas sanitários.',
    topics: ['Mycoplasma gallisepticum', 'Transmissão', 'Controle', 'Vacinação', 'Biossegurança'],
    url: HYLINE + 'TU%20MG%20ENG.pdf', extractionStatus: 'summary-extracted',
  },
  {
    id: 'newcastle-disease',
    title: 'Newcastle Disease',
    publisher: 'Hy-Line International', category: 'Sanidade', language: 'Inglês', pages: 8,
    housingApplicability: 'Aves comerciais; risco e medidas de controle variam conforme região e patotipo.',
    summary: 'Apresenta etiologia, classificação de patotipos, manifestações respiratórias, digestivas, neurológicas e reprodutivas, além do impacto sanitário e produtivo. Reforça notificação e medidas de controle para cepas virulentas, com vacinação como parte de programas locais.',
    topics: ['APMV-1', 'Patotipos', 'Sinais clínicos', 'Vacinação', 'Notificação sanitária'],
    url: HYLINE + 'TU%20ND%20ENG.pdf', extractionStatus: 'summary-extracted',
  },
  {
    id: 'soft-bone',
    title: 'Soft-Bone in Cage and Cage-Free Layers',
    publisher: 'Hy-Line International', category: 'Sanidade', language: 'Inglês', pages: 2,
    edition: 'Novembro de 2020', housingApplicability: 'Gaiolas e cage-free; documento indica aplicabilidade em diferentes linhagens.',
    summary: 'Explica osteomalácia associada a desequilíbrios ou baixa disponibilidade de cálcio, fósforo e vitamina D3. Descreve palpação do quilha e costelas, critérios de atenção do lote e opções de suplementação apresentadas pelo fabricante, sempre condicionadas à avaliação do nutricionista.',
    topics: ['Osteomalácia', 'Quilha', 'Cálcio', 'Fósforo', 'Vitamina D3'],
    url: HYLINE + 'TU%20BONE%20ENG.pdf', extractionStatus: 'summary-extracted',
  },
  {
    id: 'egg-size',
    title: 'Optimizing Egg Size in Commercial Layers',
    publisher: 'Hy-Line International', category: 'Qualidade dos ovos', language: 'Inglês', pages: 4,
    edition: '2018', housingApplicability: 'Poedeiras comerciais.',
    summary: 'Organiza a gestão do peso do ovo em quatro pilares: genética, peso corporal, nutrição e iluminação. Relaciona maturidade, ingestão de aminoácidos, energia, ácido linoleico e programas luminosos ao perfil de peso do ovo e ressalta o compromisso entre tamanho, número de ovos e qualidade da casca.',
    topics: ['Peso do ovo', 'Genética', 'Nutrição', 'Iluminação', 'Massa de ovos'],
    url: HYLINE + 'TU%20EGG%20ENG.pdf', extractionStatus: 'summary-extracted',
  },
  {
    id: 'egg-quality',
    title: 'The Science of Egg Quality',
    publisher: 'Hy-Line International', category: 'Qualidade dos ovos', language: 'Inglês', pages: 8,
    housingApplicability: 'Poedeiras comerciais; qualidade externa e interna do ovo.',
    summary: 'Apresenta critérios de qualidade externa e interna, formação do ovo no oviduto, componentes da casca, albúmen e gema, fatores de manejo e nutrição e principais defeitos. Serve como referência de inspeção e interpretação, não como substituto de análise laboratorial.',
    topics: ['Casca', 'Albúmen', 'Gema', 'Oviduto', 'Defeitos do ovo'],
    url: HYLINE + 'TU%20EQ%20ENG.pdf', extractionStatus: 'summary-extracted',
  },
  {
    id: 'skeleton-egg-production',
    title: 'Understanding the Role of the Skeleton in Egg Production',
    publisher: 'Hy-Line International', category: 'Sanidade', language: 'Inglês', pages: 8,
    housingApplicability: 'Poedeiras de alto desempenho; diferentes sistemas de alojamento.',
    summary: 'Explica os tipos de tecido ósseo, remodelação e mobilização de cálcio durante a formação da casca. Relaciona crescimento da franga, consumo, nutrição, fósforo, cálcio e vitamina D3 à integridade esquelética, fraturas, quilha desviada e qualidade da casca.',
    topics: ['Esqueleto', 'Osso medular', 'Cálcio', 'Fósforo', 'Vitamina D3'],
    url: HYLINE + 'TU%20SKELETON%20ENG.pdf', extractionStatus: 'summary-extracted',
  },
  {
    id: 'diagnostic-samples-part1',
    title: 'Proper Collection and Handling of Diagnostic Samples — Part 1: Serology and Blood Collection',
    publisher: 'Hy-Line International', category: 'Amostragem e laboratório', language: 'Inglês', pages: 8,
    housingApplicability: 'Frangas, poedeiras e matrizes.',
    summary: 'Orienta a identificação do lote, idade, data, histórico produtivo e programa vacinal que devem acompanhar a amostra. Resume seleção de aves representativas, coleta e formação de coágulo, separação de soro, conservação refrigerada e periodicidade de amostragem descrita para lotes comerciais.',
    topics: ['Sorologia', 'Coleta de sangue', 'Soro', 'Identificação do lote', 'Transporte'],
    url: HYLINE + 'TU%20SER1%20ENG.pdf', extractionStatus: 'summary-extracted',
  },
  {
    id: 'diagnostic-swabs',
    title: 'Proper Collection and Handling of Diagnostic Samples — Part 3: Swabs',
    publisher: 'Hy-Line International', category: 'Amostragem e laboratório', language: 'Inglês', pages: 2,
    housingApplicability: 'Frangas, poedeiras e matrizes.',
    summary: 'Resume o uso de swabs para PCR, RT-PCR, isolamento viral e bacteriano. Indica sítios de coleta como fenda coanal, traqueia, cloaca, articulações e órgãos, além da necessidade de envio imediato ao laboratório e de não congelar as amostras.',
    topics: ['Swabs', 'PCR', 'RT-PCR', 'Coleta', 'Transporte'],
    url: HYLINE + 'TU%20SER3%20ENG.pdf', extractionStatus: 'summary-extracted',
  },
  {
    id: 'diagnostic-histopathology',
    title: 'Proper Collection and Handling of Diagnostic Samples — Part 4: Tissue Collection and Submission for Histopathology',
    publisher: 'Hy-Line International', category: 'Amostragem e laboratório', language: 'Inglês', pages: 4,
    housingApplicability: 'Necropsia e investigação sanitária de lotes.',
    summary: 'Explica a utilidade da histopatologia e a importância de coletar tecidos frescos, não congelados, com instrumentos cortantes e estéreis. Descreve dimensões de amostras, fixação e envio para preservar arquitetura celular e permitir interpretação diagnóstica.',
    topics: ['Histopatologia', 'Necropsia', 'Fixação', 'Coleta de tecidos', 'Diagnóstico'],
    url: HYLINE + 'TU%20SER4%20ENG.pdf', extractionStatus: 'summary-extracted',
  },
  {
    id: 'infrared-beak-treatment',
    title: 'Infrared Beak Treatment',
    publisher: 'Hy-Line International', category: 'Incubatório', language: 'Inglês', pages: 4,
    housingApplicability: 'Tratamento realizado no incubatório em pintainhas de um dia.',
    summary: 'Descreve o tratamento infravermelho do bico como alternativa automatizada ao corte por lâmina quente. Apresenta o equipamento, posicionamento e contenção da cabeça, integração com injeções e contagem de pintainhas e fatores de consistência do procedimento.',
    topics: ['Tratamento infravermelho', 'Incubatório', 'Bem-estar', 'Automação', 'Manejo do bico'],
    url: HYLINE + 'TU%20BEAK%20ENG.pdf', extractionStatus: 'summary-extracted',
  },
  {
    id: 'nesting-behavior',
    title: 'Entendiendo el comportamiento del uso de los nidos',
    publisher: 'Hy-Line International', category: 'Manejo', language: 'Espanhol', pages: 10,
    housingApplicability: 'Sistemas livres de gaiola e aviários.',
    summary: 'Analisa fatores que levam à postura no piso, incluindo comportamento pré-postura, ambiente, genética, treinamento e disponibilidade/atratividade dos ninhos. Relaciona ovos fora do ninho a contaminação, quebras, perdas comerciais e riscos de canibalismo cloacal.',
    topics: ['Ninhos', 'Ovos no piso', 'Aviários', 'Comportamento', 'Treinamento'],
    url: HYLINE + 'TU%20NEST%20SPN.pdf', extractionStatus: 'summary-extracted',
  },
  {
    id: 'smothering-behavior',
    title: 'Manejo del comportamiento de estampida y amontonamiento en gallinas ponedoras',
    publisher: 'Hy-Line International', category: 'Manejo', language: 'Espanhol', pages: 3,
    housingApplicability: 'Poedeiras em diferentes alojamentos; atenção a ninhos, cantos e equipamentos.',
    summary: 'Define amontoamento e comportamento de estampida como aglomerações que podem causar hipertermia, asfixia e mortalidade. Distingue amontoamento em ninhos, por pânico e recorrente, e lista fatores ambientais e operacionais como luz, ventilação, calor, espaço, ruído e manejo.',
    topics: ['Amontoamento', 'Estampida', 'Mortalidade', 'Luz', 'Ventilação'],
    url: HYLINE + 'TU%20SMO%20SPN.pdf', extractionStatus: 'summary-extracted',
  },
  {
    id: 'iec-biosecurity-checklist',
    title: 'Bioseguridad Práctica — Lista de Verificación',
    publisher: 'International Egg Commission / Hy-Line listing', category: 'Biossegurança', language: 'Espanhol', pages: 14,
    edition: '2017', housingApplicability: 'Granjas de ovos; plano específico por local e estrutura.',
    summary: 'Checklist para estruturar e auditar programas de biossegurança, com ênfase em influenza aviária. Recomenda plano escrito, procedimentos operacionais, responsáveis, auditorias, separação de áreas limpas e sujas e adaptação às características de cada complexo.',
    topics: ['Plano de biossegurança', 'Influenza aviária', 'Fluxo limpo/sujo', 'Auditoria', 'Controle de acesso'],
    url: HYLINE + 'IEC%20BIO%20SPN.pdf', extractionStatus: 'summary-extracted',
  },
  {
    id: 'fly-management',
    title: 'Manejo de Moscas: Vigilancia y Control',
    publisher: 'Hy-Line International', category: 'Biossegurança', language: 'Espanhol', pages: 8,
    housingApplicability: 'Instalações de recria e produção com cama, esterco e fossas.',
    summary: 'Aborda biologia e ecologia da mosca doméstica, riscos como vetor de patógenos, impactos sobre conforto, postura e relações com a comunidade. Organiza o controle a partir de vigilância, manejo do esterco, redução de criadouros e medidas integradas.',
    topics: ['Moscas', 'Esterco', 'Vigilância', 'Vetores', 'Controle integrado'],
    url: HYLINE + 'TU%20FLY%20SPN.pdf', extractionStatus: 'summary-extracted',
  },
  {
    id: 'biosecurity-poster-pt',
    title: 'Poster: Biossegurança em Granjas de Poedeiras Comerciais',
    publisher: 'Hy-Line International', category: 'Biossegurança', language: 'Português', pages: 1,
    housingApplicability: 'Granjas de poedeiras comerciais.',
    summary: 'Material visual de consulta rápida para reforçar práticas de biossegurança na rotina da granja. Deve ser usado como apoio de treinamento e não substitui um plano operacional escrito, procedimentos de acesso e auditorias.',
    topics: ['Biossegurança', 'Treinamento', 'Rotina da granja'],
    url: HYLINE + 'BIO%20POSTER%20POR.pdf', extractionStatus: 'summary-extracted',
  },
  {
    id: 'pre-housing-checklist',
    title: 'Pre-Housing Cleaning, Disinfection & Maintenance Checklist',
    publisher: 'Hy-Line International', category: 'Biossegurança', language: 'Inglês', pages: 4,
    housingApplicability: 'Instalações de recria e produção antes do alojamento.',
    summary: 'Checklist em etapas para limpeza a seco, lavagem e pós-lavagem. Inclui remoção de poeira, penas, ração e matéria orgânica, limpeza de linhas de água e equipamentos, higienização de superfícies, manutenção de aquecedores, filtros e armadilhas de roedores.',
    topics: ['Vazio sanitário', 'Limpeza', 'Desinfecção', 'Manutenção', 'Controle de roedores'],
    url: HYLINE + 'PH%20CHECKLIST%20ENG.pdf', extractionStatus: 'summary-extracted',
  },
  {
    id: 'range-birds-indoors',
    title: '8 Tips for Keeping Ranging Birds Indoors',
    publisher: 'Hy-Line International', category: 'Manejo', language: 'Inglês', pages: 2,
    edition: '2020', housingApplicability: 'Lotes free-range temporariamente confinados por risco sanitário.',
    summary: 'Reúne práticas para manter aves de acesso externo confortáveis durante confinamento temporário: cama adequada e seca, ventilação mínima, observação de aglomerações, enriquecimento ambiental, intensidade luminosa controlada, avaliação de fibra e granulometria e prevenção de doenças.',
    topics: ['Free-range', 'Confinamento temporário', 'Cama', 'Enriquecimento', 'Influenza aviária'],
    url: HYLINE + 'TU%20TIPS%20ENG.pdf', extractionStatus: 'summary-extracted',
  },
];

export function getHyLineResources(category?: HyLineResourceCategory): readonly HyLineTechnicalResource[] {
  return category ? hyLineTechnicalResources.filter((item) => item.category === category) : hyLineTechnicalResources;
}
