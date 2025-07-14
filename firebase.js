let firebaseConfig = typeof window !== 'undefined' && window.firebaseConfig ? window.firebaseConfig : {
  apiKey: "<API_KEY>",
  authDomain: "<AUTH_DOMAIN>",
  projectId: "<PROJECT_ID>",
  storageBucket: "<STORAGE_BUCKET>",
  messagingSenderId: "<MESSAGING_SENDER_ID>",
  appId: "<APP_ID>"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
