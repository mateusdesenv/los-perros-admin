# Los Perros Market Admin

Projeto inicial em React + Vite pronto para deploy na Vercel.

## Funcionalidades

- Menu lateral: Dashboard, Categorias, Produtos, Configurações, Importar/Exportar
- CRUD de categorias
- CRUD de produtos
- Persistência em `localStorage`
- Importação e exportação do cardápio em JSON
- Seed inicial baseado no cardápio transcrito das imagens

## Rodar localmente

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy na Vercel

Suba o projeto para o GitHub e importe na Vercel. O projeto já tem `vercel.json` configurado para Vite.

## Estrutura principal

```text
src/
  App.jsx
  main.jsx
  styles.css
  data/initialMenu.js
  pages/
  components/
  utils/
```

## Observações

- Os dados ficam no navegador do usuário, dentro do `localStorage`.
- Para usar com backend futuramente, substitua as funções de leitura/escrita em `src/utils/storage.js` por chamadas HTTP.
# los-perros-admin
