// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfE7ISuxwPlKeiweLc5btE7Tlgnw2f9ts",
  authDomain: "my-web-projects-abacf.firebaseapp.com",
  projectId: "my-web-projects-abacf",
  storageBucket: "my-web-projects-abacf.firebasestorage.app",
  messagingSenderId: "683801418693",
  appId: "1:683801418693:web:0b297d0db74f91578c49ac"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// async function submitPoem() {
//   const text = document.getElementById('poemInput').value.trim();
//   if (text === '') return alert('Please enter a poem');
//   await db.collection('poems').add({
//     content: text,
//     timestamp: firebase.firestore.FieldValue.serverTimestamp()
//   });
//   document.getElementById('poemInput').value = '';
//   loadLatestPoem();
// }

// async function loadLatestPoem() {
//   const poemsRef = db.collection('poems').orderBy('timestamp', 'desc').limit(1);
//   const snapshot = await poemsRef.get();
//   if (!snapshot.empty) {
//     const poem = snapshot.docs[0].data().content;
//     document.getElementById('poemDisplay').innerText = poem;
//   } else {
//     document.getElementById('poemDisplay').innerText = 'No poems yet.';
//   }
// }

// loadLatestPoem();
