# Acompanhamento de Anúncios

O Firebase é inicializado pelo script `firebase-init.js`. Altere esse arquivo com as credenciais do seu projeto, se necessário. A antiga abordagem com `firebase.config.js` não é mais utilizada, exceto nos scripts de importação. Copie `firebase.config.example.js` para `firebase.config.js` caso ainda precise definir suas credenciais nesses scripts.

O arquivo `sw-register.js` registra automaticamente `service-worker.js` quando o navegador oferece suporte. Mantenha esse script referenciado no `index.html` para assegurar o funcionamento offline.
Ao carregar `firebase-init.js`, a instância do Firestore fica disponível em `window.db`. Os módulos do projeto devem referenciar esse objeto com `const db = window.db;`.

Os gráficos de desempenho agora analisam a variação diária dos dados. Caso um valor tenha mudança superior a 20% em relação ao dia anterior, o ponto é destacado e a informação aparece no tooltip.
