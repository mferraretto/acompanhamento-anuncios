# Acompanhamento de Anúncios

This project tracks online ads using Firebase as the backend.

## Firebase Configuration

Credentials are no longer stored in the repository. Copy `firebase.config.example.js` to `firebase.config.js` and fill in your Firebase project details:

```javascript
window.firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

The `firebase.config.js` file is ignored by Git and loaded automatically by `index.html` before `firebase.js` is executed.
