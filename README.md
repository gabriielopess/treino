# Treino Pro

PWA estática mobile-first para personal trainer acompanhar alunos, montar fichas e conduzir sessões presenciais.

## Principais recursos

- Alunos, modalidades, fotos, objetivos e observações
- Biblioteca de exercícios por grupamento muscular
- Fichas por aluno, carga de referência, séries, faixa de repetições e descanso
- Início rápido de treino pela tela inicial
- Treino individual e em dupla
- Histórico da última execução por exercício
- Carga, repetições e RPE por série
- Timer automático de descanso com ±15 s e pular
- Ajustes durante a sessão e opção de salvar na ficha original
- Resumo final com duração, séries, volume, RPE médio e volume por grupamento
- Histórico e evolução por exercício
- Evolução de volume por ficha e distribuição por grupamento
- Impressão/PDF de fichas
- Tema claro/escuro
- Backup/importação JSON
- PWA e Service Worker para uso após o primeiro carregamento

## Deploy no Vercel

1. Extraia o ZIP e envie o conteúdo da pasta para a raiz do repositório GitHub.
2. Importe o repositório no Vercel.
3. Framework Preset: `Other`.
4. Build Command: vazio.
5. Output Directory: vazio.
6. Faça o deploy.

Não há `npm install` nem processo de build.

## Dados

Os dados continuam no `localStorage` do navegador/PWA. Antes de substituir uma versão em produção, exporte um backup JSON pelo app atual.
