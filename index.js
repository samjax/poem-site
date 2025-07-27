import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

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

function formatDate(timestamp) {
  const date = timestamp.toDate();
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

export async function submitPoem() {
  const text = document.getElementById('poemInput').value.trim();
  if (!text) return alert('Please enter a poem');

  await addDoc(collection(db, 'poems'), {
    content: text,
    timestamp: serverTimestamp()
  });

  document.getElementById('poemInput').value = '';
  loadLatestPoem();
  loadAllPoems();
}

async function loadLatestPoem() {
  const q = query(collection(db, "poems"), orderBy("timestamp", "desc"), limit(1));
  const snapshot = await getDocs(q);
  const display = document.getElementById("poemDisplay");

  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    const data = doc.data();
    const poem = data.content;
    const time = data.timestamp ? formatDate(data.timestamp) : 'Unknown time';

    display.innerHTML = `<strong>${time}</strong><br>${poem}`;
  } else {
    display.innerText = "No poems yet.";
  }
}

async function loadAllPoems() {
  const q = query(collection(db, "poems"), orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);
  const listEl = document.getElementById("poemList");
  listEl.innerHTML = "";

  snapshot.forEach(doc => {
    const data = doc.data();
    const time = data.timestamp ? formatDate(data.timestamp) : "Unknown";
    const poemHtml = `<div class="poem-card"><strong>${time}</strong><br>${data.content}</div><hr>`;
    listEl.innerHTML += poemHtml;
  });
}

loadLatestPoem();
loadAllPoems();
window.submitPoem = submitPoem;
