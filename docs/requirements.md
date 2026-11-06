# Requisitos e critérios de aceitação iniciais

## Pesagem

- O usuário escolhe pesagem manual ou conexão a equipamento.
- O usuário escolhe identificação por anilha ou amostragem sem identificação individual.
- Registro guarda peso em gramas, instante, sessão, método e identificador quando aplicável.
- A UI não declara compatibilidade com marca/modelo sem adaptador validado.
- Falha de conexão mantém disponível o registro manual.
- Métricas estatísticas usam apenas pesos válidos e informam tamanho da amostra.

## Construtor 3D

- O usuário informa comprimento, largura, alturas e capacidade pretendida.
- A geometria renderizada acompanha as dimensões.
- Parâmetros de equipamentos são fornecidos e versionados com fonte antes de gerar quantitativos.
- Cálculos são determinísticos, testáveis e separados do renderer.
- A interface distingue pré-dimensionamento de projeto executivo.
- A cena tem controles de câmera e fallback textual quando WebGL não estiver disponível.

## Segurança e dados

- Nenhum segredo em arquivos versionados.
- Futuro backend exige autenticação e autorização server-side e isolamento por granja.
- PDFs e payloads de balanças serão tratados como entrada não confiável.
- Mudanças em medições precisam preservar trilha de auditoria.
