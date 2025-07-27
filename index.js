import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, serverTimestamp,
  getDocs, query, orderBy, limit, startAfter, endBefore, limitToLast
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import {
  getAuth, signInWithPopup, GoogleAuthProvider,
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

const firebaseConfig = { /* your config */ };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const poemsRef = collection(db, "poems");

const pageSize = 4;
let firstVisible = null, lastVisible = null, currentPage = 1;

const ownerEmail = "owner@example.com"; // set the owner's email here

// UI elements
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const submitSection = document.getElementById("submitPoemSection");

loginBtn.addEventListener("click", () => {
  signInWithPopup(auth, new GoogleAuthProvider()).catch(console.error);
});
logoutBtn.addEventListener("click", () => {
  signOut(auth);
});

onAuthStateChanged(auth, user => {
  if (user && user.email === ownerEmail) {
    submitSection.style.display = "block";
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
  } else {
    submitSection.style.display = "none";
    loginBtn.style.display = user ? "none" : "inline-block";
    logoutBtn.style.display = user ? "inline-block" : "none";
  }
});

// prevent unauthorized submitting
document.getElementById("submitBtn").addEventListener("click", async () => {
  const text = document.getElementById("poemInput").value.trim();
  if (!text) return alert("Empty poem");
  await addDoc(poemsRef, { content: text, timestamp: serverTimestamp() });
  document.getElementById("poemInput").value = "";
  loadLatestPoem();
  loadPoemsPage("initial");
});

// load latest
async function loadLatestPoem() {
  const snap = await getDocs(query(poemsRef, orderBy("timestamp", "desc"), limit(1)));
  const display = document.getElementById("poemDisplay");
  if (!snap.empty) {
    const data = snap.docs[0].data();
    display.innerHTML = `<strong>${data.timestamp.toDate().toLocaleString()}</strong><br>${escapeHtml(data.content)}`;
  } else {
    display.innerText = "No poems yet.";
  }
}

// pagination loader
async function loadPoemsPage(direction = "initial") {
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
  const snap = await getDocs(q);
  const listEl = document.getElementById("poemList");
  listEl.innerHTML = "";
  if (snap.empty) {
    listEl.innerHTML = "<p>No poems to show.</p>";
  } else {
    firstVisible = snap.docs[0];
    lastVisible = snap.docs[snap.docs.length - 1];
    snap.forEach(doc => {
      const d = doc.data();
      listEl.innerHTML += `<div class="poem-card"><strong>${formatDate(d.timestamp)}</strong><br>${escapeHtml(d.content)}</div>`;
    });
  }
  document.getElementById("pageIndicator").innerText = `Page ${currentPage}`;
  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = snap.size < pageSize;
}

function formatDate(ts) {
  return ts ? ts.toDate().toLocaleString() : "Unknown";
}
function escapeHtml(text) {
  const d = document.createElement("div");
  d.textContent = text;
  return d.innerHTML;
}

loadLatestPoem();
loadPoemsPage("initial");
window.submitPoem = () => {}; // unused now

document.getElementById("nextPage").addEventListener("click", () => loadPoemsPage("next"));
document.getElementById("prevPage").addEventListener("click", () => loadPoemsPage("prev"));
