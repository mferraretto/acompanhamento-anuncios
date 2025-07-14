# Importação de Planilhas

Para importar planilhas de produtos ou pedidos é necessário antes copiar `firebase.config.example.js` para `firebase.config.js` preenchendo suas credenciais do Firebase.

Antes de executar os processos de importação, garanta que o `firebase.config.js` exista. Caso o arquivo esteja ausente, o *service worker* da aplicação pode exibir um erro 404 ao tenta‑lo.
O `service-worker.js` é registrado automaticamente pelo script `sw-register.js`, já incluído no `index.html`.

Durante a importação, os scripts removem campos que estejam `undefined` ou contenham valores inválidos (`NaN`, `Infinity`). Isso evita erros HTTP 400 ao gravar documentos no Firestore.

Certifique‑se de que as planilhas não possuam campos obrigatórios vazios. Os registros incompletos são ignorados.

As planilhas de **envio** aceitam cabeçalhos em português ou no formato `et_title_product_*`. Por exemplo, é possível usar `Peso do Produto/kg`, `Comprimento`, `Largura` e `Altura` ou, opcionalmente, `et_title_product_weight`, `et_title_product_length`, `et_title_product_width` e `et_title_product_height`. Ambas as formas são tratadas pelo script de importação.

O identificador de cada item deve estar na coluna `et_title_product_id` (ou `ID do Produto`) para que os dados sejam combinados corretamente.
