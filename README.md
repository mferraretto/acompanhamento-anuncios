# Acompanhamento de Anúncios

O Firebase é inicializado pelo script `firebase-init.js`. Altere esse arquivo com as credenciais do seu projeto, se necessário. Para os scripts de importação, crie localmente um arquivo `firebase.config.js` com suas credenciais a partir do modelo `firebase.config.example.js`. Esse arquivo é ignorado pelo Git.

O arquivo `sw-register.js` registra automaticamente `service-worker.js` quando o navegador oferece suporte. Mantenha esse script referenciado no `index.html` para assegurar o funcionamento offline.
Ao carregar `firebase-init.js`, a instância do Firestore fica disponível em `window.db`. Os módulos do projeto devem referenciar esse objeto com `const db = window.db;`.
