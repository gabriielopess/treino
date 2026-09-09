# Treino Live — versão limpa

Aplicativo web/PWA mobile-first para personal trainer usar durante treinos presenciais.

## O que já funciona

- Cadastro, edição e exclusão de alunos
- Objetivo e observações do aluno
- Biblioteca de exercícios com múltiplos grupamentos musculares
- Criação e edição de treinos por aluno
- Séries, descanso e faixa-alvo de repetições por exercício
- Treino individual
- Treino em dupla, com dois alunos e dois treinos na mesma sessão
- Cronômetro da sessão
- Registro rápido de carga e repetições
- Pré-preenchimento com a última carga/repetições registradas
- Marcação de séries concluídas
- Adição e remoção de séries durante o treino
- Descanso automático após concluir uma série
- Ajuste de descanso em ±15s e botão para pular
- Aviso sonoro/visual quando o descanso termina
- Volume total em kg (`carga × repetições`)
- Contagem de séries concluídas
- Histórico completo por aluno
- Parecer/observação do treinador ao concluir a sessão
- Evolução por 30 dias, 3 meses, 6 meses, 1 ano ou todo o histórico
- Volume total, séries, média por sessão e melhor sessão
- Evolução de carga por exercício
- Pontos de atenção quando a maior carga cai
- Distribuição de volume por grupamento muscular
- Parecer automático copiável para enviar ao aluno
- Backup completo em JSON
- Restauração de backup
- Migração automática dos dados antigos salvos em `treinoLiveV4`
- PWA instalável na Tela de Início do iPhone
- Service Worker para abrir o app mesmo com conexão instável depois do primeiro carregamento

## Estrutura

```text
index.html
styles.css
app.js
manifest.webmanifest
sw.js
vercel.json
icons/
  icon-192.png
  icon-512.png
```

## Publicar no GitHub

1. Crie um repositório vazio.
2. Envie todos os arquivos desta pasta para a raiz do repositório.
3. Não é necessário `npm install`, build ou framework.

## Publicar no Vercel

1. Importe o repositório do GitHub no Vercel.
2. Framework Preset: `Other`.
3. Build Command: deixe vazio.
4. Output Directory: deixe vazio / raiz do projeto.
5. Faça o deploy.

Também é possível arrastar a pasta/projeto para um fluxo de deploy estático.

## Instalar no iPhone

Depois que estiver publicado em HTTPS:

1. Abra a URL no Safari.
2. Toque em **Compartilhar**.
3. Toque em **Adicionar à Tela de Início**.
4. Abra pelo novo ícone `Treino Live`.

## Onde os dados ficam

Nesta versão, os dados ficam no `localStorage` do próprio navegador/PWA. Isso é ótimo para uso pessoal em um único iPhone e não exige servidor, banco de dados ou mensalidade.

Use **Início → menu (...) → Exportar backup** regularmente.

Para sincronizar automaticamente entre iPhone, computador e outros aparelhos, ou para criar login de alunos, será necessário conectar um backend (por exemplo Supabase/Firebase/Postgres). Essa sincronização não faz parte desta versão estática.

## Observação sobre volume por grupamento

Quando um exercício pertence a mais de um grupamento muscular, o volume daquele exercício é dividido igualmente entre os grupamentos associados para que o volume total não seja contado duas vezes.
