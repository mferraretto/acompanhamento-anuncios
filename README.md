# Acompanhamento de Anúncios

This project tracks online ads using Firebase as the backend.

## Firebase Configuration

Credentials are no longer stored in the repository. Copy `firebase.config.example.js` to `firebase.config.js` and fill in your Firebase project details:

```javascript
window.firebaseConfig = {
  apiKey: "AIzaSyAJHISEca3wibw92Bw6UQCpQuyhtkjAoWE",
  authDomain: "acompanhamento-anuncios.firebaseapp.com",
  projectId: "acompanhamento-anuncios",
  storageBucket: "acompanhamento-anuncios.appspot.com",
  messagingSenderId: "993424162956",
  appId: "1:993424162956:web:37bb9a39d8aee076cdfba9"
};
```

The `firebase.config.js` file is ignored by Git and loaded automatically by `index.html` before `firebase.js` is executed.

## License

This project is licensed under the [MIT License](LICENSE).
