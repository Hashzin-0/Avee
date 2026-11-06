# Granja — Gestão Avícola Inteligente

Base inicial de um sistema de gestão zootécnica, pesagem de aves e planejamento paramétrico de galpões em 3D.

## Estado desta versão

Este repositório contém um **protótipo funcional de interface e motor de cálculo paramétrico**. Ainda não há backend, autenticação, persistência em nuvem, integração física validada com balanças, biblioteca oficial de linhagens nem dimensionamento executivo de instalações.

Os parâmetros zootécnicos são preenchidos automaticamente somente quando há correspondência documentada de linhagem, alojamento, fase e idade. A primeira cobertura de parâmetros de alojamento inclui Hy-Line Brown (gaiolas convencionais, piso e free-range), Lohmann Brown-Classic (equipamentos de recria em gaiolas e densidade geral de piso em produção), NOVOgen Brown (gaiolas convencionais e piso, com clima quente ou temperado informado) e Hy-Line W-36 (gaiolas convencionais, nas faixas etárias documentadas). Gaiolas enriquecidas, clima frio para NOVOgen e combinações sem referência compatível permanecem sem preenchimento automático. A ficha também exibe indicadores zootécnicos de referência documentados para Hy-Line Brown, Lohmann Brown-Classic, NOVOgen Brown e Hy-Line W-36: mortalidade derivada da viabilidade, peso corporal em idades de referência, ovos acumulados por ave alojada, peso do ovo, consumo de ração, conversão alimentar e massa de ovos. Esses números são referências dos guias, não resultados medidos no lote. Capacidade de gaiolas e vazão de ventiladores continuam dependentes do equipamento real. O clima é informado pelo usuário; só altera coeficientes quando a fonte consultada os diferencia. A cena 3D é uma representação preliminar do layout, não um projeto de engenharia aprovado.

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
- **Gestão zootécnica:** lotes, linhagens, peso, uniformidade, CV, GPD, postura, ração, mortalidade e relatórios.
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
