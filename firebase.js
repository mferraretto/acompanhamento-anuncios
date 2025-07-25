const firebaseConfig =
  typeof window !== 'undefined' && window.firebaseConfig
    ? window.firebaseConfig
    : {
        apiKey: "AIzaSyAJHISEca3wibw92Bw6UQCpQuyhtkjAoWE",
        authDomain: "acompanhamento-anuncios.firebaseapp.com",
        projectId: "acompanhamento-anuncios",
        storageBucket: "acompanhamento-anuncios.appspot.com",
        messagingSenderId: "993424162956",
        appId: "1:993424162956:web:37bb9a39d8aee076cdfba9"
      };

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ✅ Define window.db apenas se estiver no navegador
if (typeof window !== 'undefined') {
  window.db = db;
}
