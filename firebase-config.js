// firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyCYw7cbj7I8K17d7JcEP1dR10qHyt446V8",
  authDomain: "saqim-store.firebaseapp.com",
  projectId: "saqim-store",
  storageBucket: "saqim-store.appspot.com",
  messagingSenderId: "653512894622",
  appId: "1:653512894622:web:bc69c07d4e5141b392738f",
  measurementId: "G-DYE0XZ88KP"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();