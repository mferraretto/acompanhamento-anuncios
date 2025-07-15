# Acompanhamento de Anúncios

O Firebase é inicializado pelo script `firebase-init.js`. Altere esse arquivo com as credenciais do seu projeto, se necessário. A antiga abordagem com `firebase.config.js` não é mais utilizada.

O arquivo `sw-register.js` registra automaticamente `service-worker.js` quando o navegador oferece suporte. Mantenha esse script referenciado no `index.html` para assegurar o funcionamento offline.
Ao carregar `firebase.js`, a instância do Firestore fica disponível em `window.db`. Os módulos do projeto referenciam esse objeto com `const db = window.db;`.
