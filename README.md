# Granja — Gestão Avícola Inteligente

Base inicial de um sistema de gestão zootécnica, pesagem de aves e planejamento paramétrico de galpões em 3D.

## Estado desta versão

Este repositório contém um **protótipo funcional de interface e motor de cálculo paramétrico**. Ainda não há backend, autenticação, persistência em nuvem, integração física validada com balanças nem dimensionamento executivo de instalações. Existe uma biblioteca técnica rastreável para quatro linhagens comerciais, agora com referências Hy-Line Brown separadas por sistemas convencionais (guia de dezembro de 2025) e alternativos (guia de maio de 2026), além de resumos temáticos de documentos Hy-Line. Um módulo local acompanha registros diários por lote, com persistência no navegador; a cobertura por idade e sistema é indicada no catálogo.

Os parâmetros zootécnicos são preenchidos automaticamente somente quando há correspondência documentada de linhagem, alojamento, fase e idade. A primeira cobertura de parâmetros de alojamento inclui Hy-Line Brown (gaiolas convencionais, piso e free-range), Lohmann Brown-Classic (equipamentos de recria em gaiolas e densidade geral de piso em produção), NOVOgen Brown (gaiolas convencionais e piso, com clima quente ou temperado informado) e Hy-Line W-36 (gaiolas convencionais, nas faixas etárias documentadas). Gaiolas enriquecidas, clima frio para NOVOgen e combinações sem referência compatível permanecem sem preenchimento automático. A biblioteca técnica cataloga os guias oficiais Hy-Line Brown, Lohmann Brown-Classic, NOVOgen Brown e Hy-Line W-36. Hy-Line Brown possui tabelas semanais completas de recria (1–17) e produção (18–100 semanas), com indicadores separados de ovos por ave-dia e por ave alojada; o guia não determina uma semana obrigatória de descarte. Hy-Line W-36 e NOVOgen Brown possuem tabelas semanais de recria (1–17 semanas) e marcos/faixas documentados de produção, sem cobertura semanal integral. Lohmann Brown-Classic está catalogada por marcos de desempenho e consumo médio de produção. A fase de manejo é identificada automaticamente pela idade: cria (<6 semanas), recria (6 até menos de 15 semanas), pré-postura (15 até menos de 18 semanas) e produção (a partir de 18 semanas). Esses limites são uma classificação operacional inicial e devem ser ajustados se o guia específico da linhagem definir transições diferentes. O módulo de acompanhamento calcula mortalidade diária e acumulada, eliminações, aves vivas, consumo de ração e água por ave/dia, postura hen-day e hen-housed, massa de ovos e conversão alimentar a partir dos registros do produtor. A conversão acumulada só é exibida quando o peso dos ovos foi informado em todos os dias com produção. Esses resultados são calculados a partir dos dados cadastrados; os registros diários são persistidos localmente por lote no navegador. Capacidade de gaiolas e vazão de ventiladores continuam dependentes do equipamento real. O clima é informado pelo usuário; só altera coeficientes quando a fonte consultada os diferencia. A cena 3D é uma representação preliminar do layout, não um projeto de engenharia aprovado.

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

## Cena 3D e desempenho

O construtor usa estrutura paramétrica, um modelo GLB de ventilador axial otimizado (com fallback procedural), linhas de comedouro e linhas de água com nipples instanciados. A cena usa renderização sob demanda, DPR limitado e amostragem visual de aves por GPU: até 180 instâncias em viewport compacto e 360 em viewport maior. O número zootécnico do lote não é limitado por esse orçamento visual; quando o lote supera o limite, a cena mostra uma amostra distribuída e mantém o total real nos cálculos. Isso evita criar um objeto React/Three.js por ave.

A galinha usada como referência visual é o modelo genérico **Low Poly Chicken**, disponibilizado por Grab3D em GLB (aprox. 300 KB, 2.997 triângulos), sob licença CC0 1.0: https://grab3d.com/models/animals/low-poly-chicken/ . O arquivo é carregado sob demanda pelo endereço público do fornecedor. Se o host, a rede ou o CORS impedir o carregamento, a cena usa uma representação procedural simplificada como fallback. O modelo é uma galinha marrom genérica; não é um escaneamento nem um modelo oficial/licenciado pela Hy-Line Brown e não deve ser usado para identificação genética ou avaliação morfológica. O ventilador usa o modelo GLB **Exhaust Fan** da Render a House (43,9 KB, 1.476 triângulos, geometria estática), liberado para uso pessoal e comercial sem atribuição: https://www.renderahouse.com/blog/free-exhaust-fan-3d-model . O modelo é carregado do fornecedor e tem fallback paramétrico se o host/CORS falhar; não é um produto certificado nem representa curva de vazão, pressão estática ou fabricante avícola. As linhas de água, nipples, comedouros e estrutura continuam sendo geometrias paramétricas ilustrativas, não réplicas de fabricantes específicos.

## Princípios de domínio

1. Cada parâmetro técnico deve guardar fonte documental, versão, página, sistema de alojamento, faixa etária, unidade e estado de validação.
2. Os cálculos são independentes da cena 3D. O Three.js apenas renderiza o modelo paramétrico calculado.
3. Leituras de balança não são associadas a uma ave individual sem identificador confiável.
4. Uniformidade e CV são calculados sobre a amostra efetivamente registrada; a cobertura da amostra deve aparecer no relatório.
5. Nenhum valor ilustrativo pode ser confundido com dado real da granja.

## Próximas integrações

- Supabase: autenticação, PostgreSQL, RLS, armazenamento de manuais e histórico multi-granja.
- Serviço local de balanças: adaptadores isolados para USB/serial/Bluetooth/Wi-Fi, conforme documentação real de cada modelo.
- Biblioteca técnica: guias Hy-Line Brown convencionais e alternativos separados por sistema; catálogo pesquisável de resumos de documentos Hy-Line sobre manejo, nutrição, ambiência, biossegurança, sanidade, qualidade de ovos e coleta de amostras. A transcrição numérica permanece pendente de revisão técnica independente.
- Motor de ventilação e ambiência: cálculo por dados de clima, curva de ventiladores, pressão estática, perdas de carga e geometria real.

## Licença

A definir pelo proprietário do projeto antes de publicação pública.

## Framework e rotas

A aplicação usa Next.js com App Router. O shell interativo permanece montado no layout raiz para preservar o estado local durante a navegação entre páginas. As rotas disponíveis são:

- `/` — dashboard geral, com indicadores operacionais e acesso rápido.
- `/granja` — construtor paramétrico 3D, dimensionamento e indicadores zootécnicos de referência.
- `/pesagem` — registro de pesagens por amostragem ou identificação por anilha e catálogo de balanças.
- `/registros` — lançamentos diários do lote e acompanhamento zootécnico.
- `/indicadores-zootecnicos` — indicadores zootécnicos, metas semanais por linhagem/sistema, resultados reais do lote e biblioteca técnica integrada.
- `/biblioteca` — rota legada redirecionada para os indicadores zootécnicos.
- `/granjas` — cadastro e seleção de granjas, dimensões, lotes, linhagem, alojamento, idade e quantidade inicial de aves.
- `/configuracoes` — preferências locais de unidades, notificações e densidade de tabelas.
- `/perfil` — dados de identificação e contato do administrador local.
- Calendário semanal de atividades, aberto pela cordinha interativa FeralUI no dashboard.
- Tema escuro padrão, com opção clara em Configurações.

As páginas usam o mesmo shell e os mesmos estados locais enquanto a navegação ocorre no cliente. O cadastro de granjas, lotes, perfil do administrador e preferências é salvo no `localStorage` com schema versionado. Os registros diários zootécnicos também são salvos localmente em uma chave separada por lote. O calendário do dashboard consulta essas mesmas chaves e lista os dias com atividades registradas. A preferência de tema claro/escuro é salva nas configurações locais; o padrão inicial é escuro. Pesagens e alguns estados operacionais permanecem em memória da sessão. Limpar os dados do navegador remove os cadastros locais. Não há autenticação, isolamento multiusuário, backup ou sincronização entre dispositivos; esses recursos exigem backend e autorização no servidor.
