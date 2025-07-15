# Acompanhamento de Anúncios

Este projeto exige um arquivo `firebase.config.js` com as chaves do seu projeto Firebase.

1. Copie `firebase.config.example.js` para `firebase.config.js`.
2. Preencha o arquivo copiado com suas chaves pessoais.

Antes de executar o aplicativo, garanta que o `firebase.config.js` exista. Caso o arquivo esteja ausente, o *service worker* pode exibir um erro 404 ao tenta‑lo.

O `firebase.config.js` está listado no `.gitignore`. **Nunca** envie suas credenciais reais para o repositório.

O arquivo `sw-register.js` registra automaticamente `service-worker.js` quando o navegador oferece suporte. Mantenha esse script referenciado no `index.html` para garantir o funcionamento offline.

Ao carregar `firebase.js`, a instância do Firestore é exposta em `window.db`.
Os módulos do projeto referenciam esse objeto com `const db = window.db;`.
