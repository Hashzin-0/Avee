# Granja — Gestão Avícola Inteligente

Base inicial de um sistema de gestão zootécnica, pesagem de aves e planejamento paramétrico de galpões em 3D.

## Estado desta versão

Este repositório contém um **protótipo funcional de interface e motor de cálculo paramétrico**. Ainda não há backend, autenticação, persistência em nuvem, integração física validada com balanças nem dimensionamento executivo de instalações. Existe uma biblioteca técnica rastreável para quatro linhagens comerciais, agora com referências Hy-Line Brown separadas por sistemas convencionais (guia de dezembro de 2025) e alternativos (guia de maio de 2026), além de resumos temáticos de documentos Hy-Line. Um módulo local acompanha registros diários do lote; a cobertura por idade e sistema é indicada no catálogo.

Os parâmetros zootécnicos são preenchidos automaticamente somente quando há correspondência documentada de linhagem, alojamento, fase e idade. A primeira cobertura de parâmetros de alojamento inclui Hy-Line Brown (gaiolas convencionais, piso e free-range), Lohmann Brown-Classic (equipamentos de recria em gaiolas e densidade geral de piso em produção), NOVOgen Brown (gaiolas convencionais e piso, com clima quente ou temperado informado) e Hy-Line W-36 (gaiolas convencionais, nas faixas etárias documentadas). Gaiolas enriquecidas, clima frio para NOVOgen e combinações sem referência compatível permanecem sem preenchimento automático. A biblioteca técnica cataloga os guias oficiais Hy-Line Brown convencional e alternativo, Lohmann Brown-Classic, NOVOgen Brown e Hy-Line W-36, além de documentos Hy-Line sobre manejo, nutrição, ambiência, biossegurança, sanidade, qualidade de ovos e coleta de amostras. Hy-Line Brown, Hy-Line W-36 e NOVOgen Brown possuem tabelas semanais de recria estruturadas (1–17 semanas); a cobertura da produção está estruturada por marcos e faixas médias documentadas, não por toda semana em todas as linhagens. Lohmann Brown-Classic está catalogada por marcos de desempenho e consumo médio de produção. A fase de manejo é identificada automaticamente pela idade: cria (<6 semanas), recria (6 até menos de 15 semanas), pré-postura (15 até menos de 18 semanas) e produção (a partir de 18 semanas). Esses limites são uma classificação operacional inicial e devem ser ajustados se o guia específico da linhagem definir transições diferentes. O módulo de acompanhamento calcula mortalidade diária e acumulada, eliminações, aves vivas, consumo de ração e água por ave/dia, postura hen-day e hen-housed, massa de ovos e conversão alimentar a partir dos registros do produtor. A conversão acumulada só é exibida quando o peso dos ovos foi informado em todos os dias com produção. Esses resultados são calculados a partir dos dados cadastrados; nesta versão permanecem apenas na memória da sessão. Capacidade de gaiolas e vazão de ventiladores continuam dependentes do equipamento real. O clima é informado pelo usuário; só altera coeficientes quando a fonte consultada os diferencia. A cena 3D é uma representação preliminar do layout, não um projeto de engenharia aprovado.

## Requisitos

- Node.js 22+
- npm 10+
- Next.js 15 (App Router) e React 19 (instalados pelo npm)

## Executar

```bash
npm install
npm run dev
```

## Verificações

```bash
npm run typecheck
npm test
npm run build
```

## Módulos previstos

- **Pesagem:** catálogo de equipamentos, conectores por protocolo validado, captura manual alternativa, identificação individual por anilha ou amostragem.
- **Gestão zootécnica:** acompanhamento diário local de lote com mortalidade, eliminações, inventário, ração, água, postura, massa de ovos e conversão alimentar; histórico ainda não persistido em banco.
- **Construtor 3D:** dimensões do galpão, parâmetros técnicos rastreáveis, cálculo determinístico, layout Three.js editável e documentação do projeto.

## Princípios de domínio

1. Cada parâmetro técnico deve guardar fonte documental, versão, página, sistema de alojamento, faixa etária, unidade e estado de validação.
2. Os cálculos são independentes da cena 3D. O Three.js apenas renderiza o modelo paramétrico calculado.
3. Leituras de balança não são associadas a uma ave individual sem identificador confiável.
4. Uniformidade e CV são calculados sobre a amostra efetivamente registrada; a cobertura da amostra deve aparecer no relatório.
5. Nenhum valor ilustrativo pode ser confundido com dado real da granja.

## Próximas integrações

- Supabase: autenticação, PostgreSQL, RLS, armazenamento de manuais e histórico multi-granja.
- Serviço local de balanças: adaptadores isolados para USB/serial/Bluetooth/Wi-Fi, conforme documentação real de cada modelo.
- Biblioteca técnica: ingestão e revisão humana de manuais oficiais de linhagens.
- Motor de ventilação e ambiência: cálculo por dados de clima, curva de ventiladores, pressão estática, perdas de carga e geometria real.

## Licença

A definir pelo proprietário do projeto antes de publicação pública.

## Framework e rotas

A aplicação usa Next.js com App Router. A rota `/` é definida em `app/page.tsx`; o layout raiz e os metadados ficam em `app/layout.tsx`. A interface existente é um Client Component porque utiliza estado React e renderização 3D no navegador.
