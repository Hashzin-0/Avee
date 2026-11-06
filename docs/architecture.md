# Arquitetura inicial

## Classificação baseada no código entregue

- Aplicação de dados e dashboard: **confirmada** (interface de pesagem e métricas amostrais).
- Editor/visualização 3D: **confirmada** (Three.js via React Three Fiber).
- Integração de hardware: **não demonstrada** (catálogo vazio intencionalmente; nenhum protocolo foi validado).
- Backend multi-tenant e persistência: **não demonstrados** (não há credenciais ou projeto Supabase conectado).
- IA/RAG para leitura de manuais: **não demonstrados** (a biblioteca técnica é apenas uma tela de estado vazio).

## Limites entre módulos

- `features/weighing`: tipos, catálogo e registros da sessão de pesagem.
- `features/farm-builder/domain.ts`: schemas e cálculos determinísticos sem dependência de React ou Three.js.
- `features/farm-builder/FarmScene.tsx`: renderização da geometria paramétrica; não calcula requisitos zootécnicos.
- `src/app/App.tsx` (client component montado por `app/page.tsx`): composição da interface e estado transitório do protótipo.

## Decisões

1. Não existe uma lista fictícia de modelos de balança. Um dispositivo só entra no catálogo como suportado depois de documentação e teste físico do protocolo.
2. Parâmetros zootécnicos são opcionais e precisam ser fornecidos com fonte. O sistema não assume valores oficiais de linhagem.
3. O modelo 3D é preliminar e ilustrativo. Ainda não há telhado estrutural, gaiolas dimensionadas por fabricante, ventilação CFD, rede hidráulica, elétrica, drenagem ou validação normativa.
4. Pesagem por anilha e amostragem são suportadas. A amostragem não implica que o histórico seja individual.
5. Os dados atuais são mantidos em memória e desaparecem ao recarregar. Persistência será implementada em etapa posterior.

## Evolução proposta

- Adicionar schema PostgreSQL e RLS antes de habilitar dados multi-granja.
- Criar interface `ScaleAdapter` para adaptadores isolados por protocolo/modelo.
- Criar catálogo de parâmetros técnicos versionados com fonte, página, linhagem, fase, alojamento, unidade, data de vigência e revisor.
- Criar motor de geometria paramétrica independente do renderer, com unidades SI e testes de invariantes espaciais.
- Adicionar motor de ventilação apenas após obter curvas de ventiladores, condições climáticas de projeto, pressão estática e parâmetros de ambiência.

## Aplicação web

- Framework: Next.js 15 com App Router.
- `app/layout.tsx`: layout raiz, metadados e importação do CSS global.
- `app/page.tsx`: rota inicial.
- `src/app/App.tsx`: interface interativa marcada como Client Component; a cena Three.js permanece encapsulada em `FarmScene`.
- Não há Route Handlers, Server Actions, autenticação ou banco de dados nesta etapa.
