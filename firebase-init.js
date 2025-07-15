// firebase-init.js
const firebaseConfig = {
  apiKey: "AIzaSyDovLKo3djdRbs963vqKdbj-geRWyzMTrg",
  authDomain: "acompanhamento-anuncios.firebaseapp.com",
  projectId: "acompanhamento-anuncios",
  storageBucket: "acompanhamento-anuncios.appspot.com",
  messagingSenderId: "993424162956",
  appId: "1:993424162956:web:61e1b0b40bd6c36cb9bfc4"
};

firebase.initializeApp(firebaseConfig);


window.db = firebase.firestore();
