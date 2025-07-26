import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

export async function submitPoem() {
  const text = document.getElementById('poemInput').value.trim();
  if (!text) return alert('Please enter a poem');
  
  await db.collection('poems').add({
    content: text,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });
  
  document.getElementById('poemInput').value = '';
  loadLatestPoem();
}

// ✅ Load the latest poem
async function loadLatestPoem() {
  const q = query(collection(db, "poems"), orderBy("timestamp", "desc"), limit(1));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const poem = snapshot.docs[0].data().content;
    document.getElementById("poemDisplay").innerText = poem;
  } else {
    document.getElementById("poemDisplay").innerText = "No poems yet.";
  }
}

// ✅ Run on load
loadLatestPoem();

// ✅ Make `submitPoem` globally callable by the button
window.submitPoem = submitPoem;