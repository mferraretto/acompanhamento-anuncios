# Importação de Planilhas

Para importar planilhas de produtos ou pedidos é necessário antes copiar `firebase.config.example.js` para `firebase.config.js` preenchendo suas credenciais do Firebase.

Durante a importação, os scripts removem campos que estejam `undefined` ou contenham valores inválidos (`NaN`, `Infinity`). Isso evita erros HTTP 400 ao gravar documentos no Firestore.

Certifique‑se de que as planilhas não possuam campos obrigatórios vazios. Os registros incompletos são ignorados.
