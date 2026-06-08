/* ==========================================================================
   Firebase Configuration & Firestore Sync
   ========================================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyBdF8JMnan3KO5m-eGDWv_wXZAQFk0hT-M",
  authDomain: "chitieuvs.firebaseapp.com",
  projectId: "chitieuvs",
  storageBucket: "chitieuvs.firebasestorage.app",
  messagingSenderId: "12395297751",
  appId: "1:12395297751:web:16cbf56636d49c2581e992",
  measurementId: "G-7GXZZ22Y0M"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Document duy nhất lưu toàn bộ state của user Hải TM
const STATE_DOC = db.collection("users").doc("haitm");

// Lưu state lên Firestore (gọi song song với localStorage)
async function saveToFirestore(state) {
  try {
    await STATE_DOC.set(state);
    setSyncStatus("synced");
  } catch (e) {
    console.error("Lỗi lưu Firestore:", e);
    setSyncStatus("error");
  }
}

// Tải state từ Firestore (ưu tiên hơn localStorage)
async function loadFromFirestore() {
  try {
    const doc = await STATE_DOC.get();
    if (doc.exists) {
      return doc.data();
    }
    return null;
  } catch (e) {
    console.error("Lỗi tải Firestore:", e);
    return null;
  }
}

// Cập nhật icon trạng thái sync trên header
function setSyncStatus(status) {
  const el = document.getElementById("syncStatus");
  if (!el) return;
  if (status === "syncing") {
    el.innerHTML = '<span title="Đang đồng bộ...">⟳</span>';
    el.className = "sync-status syncing";
  } else if (status === "synced") {
    el.innerHTML = '<span title="Đã đồng bộ với cloud">☁</span>';
    el.className = "sync-status synced";
  } else if (status === "error") {
    el.innerHTML = '<span title="Lỗi đồng bộ — dùng bản cục bộ">⚠</span>';
    el.className = "sync-status error";
  } else if (status === "offline") {
    el.innerHTML = '<span title="Offline — dùng bản cục bộ">✗</span>';
    el.className = "sync-status offline";
  }
}
