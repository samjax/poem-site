import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, serverTimestamp,
  getDocs, query, orderBy, limit, startAfter, endBefore, limitToLast
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBfE7ISuxwPlKeiweLc5btE7Tlgnw2f9ts",
  authDomain: "my-web-projects-abacf.firebaseapp.com",
  projectId: "my-web-projects-abacf",
  storageBucket: "my-web-projects-abacf.appspot.com",
  messagingSenderId: "683801418693",
  appId: "1:683801418693:web:0b297d0db74f91578c49ac"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const pageSize = 4;
let currentDocs = [];
let firstVisible = null;
let lastVisible = null;
let currentPage = 1;

function formatDate(timestamp) {
  if (!timestamp) return 'Unknown time';
  const date = timestamp.toDate();
  return `${date.toLocaleDateString()}`;
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
    await loadPoemsPage("initial");
  } catch (error) {
    alert('You are not authorized to submit poems.');
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

async function loadPoemsPage(direction = "initial") {
  const poemsRef = collection(db, "poems");
  let q;

  if (direction === "next" && lastVisible) {
    q = query(poemsRef, orderBy("timestamp", "desc"), startAfter(lastVisible), limit(pageSize));
    currentPage++;
  } else if (direction === "prev" && firstVisible) {
    q = query(poemsRef, orderBy("timestamp", "desc"), endBefore(firstVisible), limitToLast(pageSize));
    currentPage = Math.max(1, currentPage - 1);
  } else {
    q = query(poemsRef, orderBy("timestamp", "desc"), limit(pageSize));
    currentPage = 1;
  }

  try {
    const snapshot = await getDocs(q);
    const listEl = document.getElementById("poemList");
    listEl.innerHTML = "";

    if (snapshot.empty) {
      listEl.innerHTML = "<p>No poems to show.</p>";
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
          <strong>${time}</strong><br>
          ${escapeHtml(data.content)}
        </div>`;
      listEl.innerHTML += poemHtml;
    });

    document.getElementById("pageNumber").innerText = `${currentPage}`;
    document.getElementById("prevPage").disabled = currentPage === 1;
    document.getElementById("nextPage").disabled = snapshot.size < pageSize;

  } catch (err) {
    console.error("Error loading poems:", err);
    alert("Failed to load poems.");
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showSubmitSection(show) {
  document.getElementById("submitPoemSection").style.display = show ? "block" : "none";
}

function updateAuthUI(user) {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  if (!loginBtn || !logoutBtn) return;

  if (user) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline";
    showSubmitSection(true);
  } else {
    loginBtn.style.display = "inline";
    logoutBtn.style.display = "none";
    showSubmitSection(false);
  }
}

document.getElementById("loginBtn").addEventListener("click", () => {
  document.getElementById("emailLoginForm").style.display = "block";
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth);
});

document.getElementById("emailLoginSubmit").addEventListener("click", async () => {
  const email = document.getElementById("emailInput").value;
  const password = document.getElementById("passwordInput").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    document.getElementById("emailLoginForm").style.display = "none";
  } catch (err) {
    alert("Login failed: " + err.message);
    console.error(err);
  }
});

onAuthStateChanged(auth, user => {
  updateAuthUI(user);
});

loadLatestPoem();
loadPoemsPage("initial");
window.submitPoem = submitPoem;

document.getElementById("nextPage").addEventListener("click", () => loadPoemsPage("next"));
document.getElementById("prevPage").addEventListener("click", () => loadPoemsPage("prev"));
