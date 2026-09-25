# Treino Pro

PWA mobile-first para personal trainer acompanhar alunos, montar fichas e conduzir treinos presenciais com rapidez.

## Destaques desta reconstrução

- Interface redesenhada com hierarquia visual mais forte, tipografia e espaçamentos mais próximos de um app nativo.
- Treino ao vivo mais compacto e legível, com separação clara entre séries e estados concluídos.
- RPE opcional por série (1–10), preservado no histórico.
- Resumo final do treino com séries concluídas, duração, volume, RPE médio e distribuição de volume por grupamento.
- Histórico por exercício com evolução de carga.
- Filtros de exercícios por grupamento muscular.
- Ajustes de exercício durante a sessão com opção de salvar de volta na ficha.
- Treino individual e treino em dupla.
- Fotos de alunos, tema claro/escuro, exportação/importação de backup e impressão/PDF das fichas.
- Funciona como PWA e continua usando armazenamento local do navegador, sem backend obrigatório.

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

## Deploy no Vercel

1. Suba todos os arquivos para a raiz do repositório no GitHub.
2. Importe o repositório no Vercel.
3. Framework Preset: `Other`.
4. Não use Build Command.
5. Não defina Output Directory; a raiz já é o site.
6. Faça o deploy.

Também funciona como site estático em qualquer host HTTPS.

## Dados e compatibilidade

O app mantém as mesmas chaves de armazenamento local (`treinoLiveCleanV1` e `treinoLiveCleanV1_draft`) para aproveitar dados existentes no mesmo domínio/navegador. Também preserva a migração do formato legado `treinoLiveV4`.

Antes de substituir um deploy em produção, use o menu do app para **Exportar backup**.

## Instalar no iPhone

Abra o site no Safari, toque em **Compartilhar** → **Adicionar à Tela de Início**. O service worker mantém os arquivos principais em cache após o primeiro carregamento.

## Observação

Os dados continuam locais ao aparelho/navegador. Para sincronizar entre celular e computador, login de alunos ou trabalho multiusuário, a próxima etapa seria adicionar um backend (por exemplo, Supabase/Postgres).
