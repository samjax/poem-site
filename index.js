import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

// import { initializeApp } from "firebase/app";
  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyAogUzdoy8aiPCMsTyRCbHauiRyvfHy8dM",
    authDomain: "uncle-poems.firebaseapp.com",
    projectId: "uncle-poems",
    storageBucket: "uncle-poems.firebasestorage.app",
    messagingSenderId: "736476854304",
    appId: "1:736476854304:web:feb5cd6ea5bb96f8ea6445"
  };
 // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  async function submitPoem() {
    const text = document.getElementById('poemInput').value.trim();
    if (text === '') return alert('Please enter a poem');
    await db.collection('poems').add({
      content: text,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    document.getElementById('poemInput').value = '';
    loadLatestPoem();
  }

  async function loadLatestPoem() {
    const poemsRef = db.collection('poems').orderBy('timestamp', 'desc').limit(1);
    const snapshot = await poemsRef.get();
    if (!snapshot.empty) {
      const poem = snapshot.docs[0].data().content;
      document.getElementById('poemDisplay').innerText = poem;
    } else {
      document.getElementById('poemDisplay').innerText = 'No poems yet.';
    }
  }

  loadLatestPoem();
