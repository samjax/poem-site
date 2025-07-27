  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
  import { getFirestore,collection,addDoc,serverTimestamp,getDocs,query,orderBy,limit } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

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

  // Initialize Firebase
const app = initializeApp(firebaseConfig);
 const db = getFirestore(app);

// Submit a new poem
export async function submitPoem() {
  const text = document.getElementById('poemInput').value.trim();
  if (!text) return alert('Please enter a poem');

  await addDoc(collection(db, 'poems'), {
    content: text,
    timestamp: serverTimestamp()
  });

  document.getElementById('poemInput').value = '';
  loadLatestPoem();
}

// Load the latest poem
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

// Run on load
loadLatestPoem();

// Expose submitPoem globally
window.submitPoem = submitPoem;
