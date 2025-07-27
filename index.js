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
  if (!timestamp) return 'Unknown time';
  const date = timestamp.toDate();
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

export async function submitPoem() {
  const text = document.getElementById('poemInput').value.trim();
  if (!text) {
    alert('Please enter a poem');
    return;
  }

  try {
    await addDoc(collection(db, 'poems'), {
      content: text,
      timestamp: serverTimestamp()
    });

    document.getElementById('poemInput').value = '';
    await loadLatestPoem();
    await loadAllPoems();
  } catch (error) {
    alert('Error submitting poem. Please try again.');
    console.error(error);
  }
}

async function loadLatestPoem() {
  const q = query(collection(db, "poems"), orderBy("timestamp", "desc"), limit(1));
  const snapshot = await getDocs(q);
  const display = document.getElementById("poemDisplay");

  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    const data = doc.data();
    const time = formatDate(data.timestamp);
    display.innerHTML = `<strong>${time}</strong><br>${escapeHtml(data.content)}`;
  } else {
    display.innerText = "No poems yet.";
  }
}

async function loadAllPoems() {
let currentDocs = [];
let firstVisible = null;
let lastVisible = null;
const pageSize = 4;

async function loadPoemsPage(direction = "initial") {
  const poemsRef = collection(db, "poems");
  let q;

  if (direction === "next" && lastVisible) {
    q = query(poemsRef, orderBy("timestamp", "desc"), startAfter(lastVisible), limit(pageSize));
  } else if (direction === "prev" && firstVisible) {
    q = query(poemsRef, orderBy("timestamp", "desc"), endBefore(firstVisible), limitToLast(pageSize));
  } else {
    q = query(poemsRef, orderBy("timestamp", "desc"), limit(pageSize));
  }

  try {
    const snapshot = await getDocs(q);
    const listEl = document.getElementById("poemList");
    listEl.innerHTML = "";

    if (snapshot.empty) {
      listEl.innerHTML = "<p>No poems to show.</p>";
      document.getElementById("nextPage").disabled = true;
      document.getElementById("prevPage").disabled = true;
      return;
    }

    currentDocs = snapshot.docs;
    firstVisible = snapshot.docs[0];
    lastVisible = snapshot.docs[snapshot.docs.length - 1];

    snapshot.forEach(doc => {
      const data = doc.data();
      const time = formatDate(data.timestamp);
      const poemHtml = `
        <div class="poem-card">
          <strong>${time}</strong>
          ${escapeHtml(data.content)}
        </div>`;
      listEl.innerHTML += poemHtml;
    });

    // Enable/disable buttons based on snapshot size
    document.getElementById("prevPage").disabled = direction === "initial" || snapshot.size < pageSize;
    document.getElementById("nextPage").disabled = snapshot.size < pageSize;

  } catch (err) {
    console.error("Error loading poems:", err);
    alert("Failed to load poems. Please try again.");
  }
}


}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

loadLatestPoem();
loadAllPoems();

window.submitPoem = submitPoem;

document.getElementById("nextPage").addEventListener("click", () => loadPoemsPage("next"));
document.getElementById("prevPage").addEventListener("click", () => loadPoemsPage("prev"));

// Initial load
loadPoemsPage("initial");


