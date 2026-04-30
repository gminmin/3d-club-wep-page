/**
 * dataService.js - Firebase 데이터 액세스 계층
 * 이 모듈은 Firestore(DB), Auth(인증), Storage(파일)와의 모든 통신을 추상화합니다.
 */

// Firebase SDK 모듈 임포트
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";

// Firebase 프로젝트 설정 정보
const firebaseConfig = {
  apiKey: "AIzaSyA5AD2p4btrWooqUSIj6MklPmHebYWUsvc",
  authDomain: "jb3d-a98fd.firebaseapp.com",
  projectId: "jb3d-a98fd",
  storageBucket: "jb3d-a98fd.firebasestorage.app",
  messagingSenderId: "947731275999",
  appId: "1:947731275999:web:784722d0a9051128bec96a",
  measurementId: "G-6JFTMFPXY4"
};

const currentOrigin = window.location.origin;
let app;
let db;
let auth;
let storage;

/**
 * Firebase 오류 메시지를 사용자 친화적인 힌트로 변환합니다.
 */
function getFirebaseTroubleshootingHint(error) {
  const code = error?.code || "";

  if (code === "auth/unauthorized-domain") {
    return `현재 접속 도메인(${currentOrigin})이 Firebase Authentication 허용 도메인에 없습니다. Firebase Console > Authentication > Settings > Authorized domains에 이 도메인을 추가해주세요.`;
  }

  if (code === "permission-denied" || code === "storage/unauthorized") {
    return "Firebase 보안 규칙에서 현재 요청이 차단되었습니다. Firestore/Storage Rules를 다시 확인해주세요.";
  }

  if (code === "auth/network-request-failed") {
    return "네트워크 요청이 실패했습니다. GitHub Pages 주소가 HTTPS인지, 브라우저 확장 프로그램이 요청을 막지 않는지 확인해주세요.";
  }

  return "";
}

function logFirebaseHostingHints(error) {
  const code = error?.code || "unknown";
  const hint = getFirebaseTroubleshootingHint(error);

  console.group("[Firebase Debug]");
  console.log("Origin:", currentOrigin);
  console.log("Project ID:", firebaseConfig.projectId);
  console.log("Auth Domain:", firebaseConfig.authDomain);
  console.log("Error Code:", code);

  if (hint) {
    console.warn("Hint:", hint);
  }

  if (window.location.hostname.includes("github.io")) {
    console.warn(
      "GitHub Pages에서 접속 중입니다. Firebase Console의 Authorized domains에 현재 GitHub Pages 도메인이 등록되어 있는지 확인해주세요."
    );
  }

  console.groupEnd();
}

function wrapFirebaseError(prefix, error) {
  logFirebaseHostingHints(error);
  const hint = getFirebaseTroubleshootingHint(error);
  return new Error(`${prefix}: ${hint || error.message}`);
}

// Firebase 초기화 수행
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
  console.log("Firebase initialized:", currentOrigin);
} catch (error) {
  console.error("Firebase initialization failed:", error);
  logFirebaseHostingHints(error);
  alert(`Firebase 초기화에 실패했습니다.\n${getFirebaseTroubleshootingHint(error) || error.message}`);
}

/**
 * 통계 트래커 (현재 세션의 요청/응답 수)
 */
const requestStats = {
  requests: 0,
  responses: 0,
  errors: 0
};

/**
 * API 호출을 추적하기 위한 래퍼 함수
 */
async function trackApiCall(promise) {
  requestStats.requests++;
  try {
    const result = await promise;
    requestStats.responses++;
    return result;
  } catch (error) {
    requestStats.errors++;
    throw error;
  }
}

/**
 * 앱 전역에서 사용할 데이터 서비스 객체
 */
const dataService = {
  // 통계 데이터 가져오기
  getStats() {
    return { ...requestStats };
  },
  // --- 공지사항 (Notices) ---
  async getNotices() {
    try {
      const q = query(collection(db, "notices"), orderBy("date", "desc"));
      const querySnapshot = await trackApiCall(getDocs(q));
      return querySnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    } catch (error) {
      console.error("Notice fetch failed:", error);
      throw wrapFirebaseError("공지사항을 불러오지 못했습니다", error);
    }
  },

  async addNotice(notice) {
    try {
      const newNotice = {
        date: new Date().toISOString().split("T")[0],
        isNew: true,
        ...notice
      };
      return await trackApiCall(addDoc(collection(db, "notices"), newNotice));
    } catch (error) {
      console.error("Notice create failed:", error);
      throw wrapFirebaseError("공지사항 등록에 실패했습니다", error);
    }
  },

  async updateNotice(id, notice) {
    try {
      return await trackApiCall(updateDoc(doc(db, "notices", id), notice));
    } catch (error) {
      console.error("Notice update failed:", error);
      throw wrapFirebaseError("공지사항 수정에 실패했습니다", error);
    }
  },

  async deleteNotice(id) {
    try {
      return await trackApiCall(deleteDoc(doc(db, "notices", id)));
    } catch (error) {
      console.error("Notice delete failed:", error);
      throw wrapFirebaseError("공지사항 삭제에 실패했습니다", error);
    }
  },

  // --- 작품 (Works) ---
  async getWorks() {
    try {
      const q = query(collection(db, "works"), orderBy("id", "desc"));
      const querySnapshot = await trackApiCall(getDocs(q));
      return querySnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    } catch (error) {
      console.error("Work fetch failed:", error);
      throw wrapFirebaseError("작품을 불러오지 못했습니다", error);
    }
  },

  async addWork(work) {
    try {
      return await trackApiCall(addDoc(collection(db, "works"), work));
    } catch (error) {
      console.error("Work create failed:", error);
      throw wrapFirebaseError("작품 등록에 실패했습니다", error);
    }
  },

  async updateWork(id, work) {
    try {
      return await trackApiCall(updateDoc(doc(db, "works", id), work));
    } catch (error) {
      console.error("Work update failed:", error);
      throw wrapFirebaseError("작품 수정에 실패했습니다", error);
    }
  },

  async deleteWork(id) {
    try {
      return await trackApiCall(deleteDoc(doc(db, "works", id)));
    } catch (error) {
      console.error("Work delete failed:", error);
      throw wrapFirebaseError("작품 삭제에 실패했습니다", error);
    }
  },

  // --- 데모파일 (Demo Files) ---
  async getDemoFiles() {
    try {
      const q = query(collection(db, "demoFiles"), orderBy("timestamp", "desc"));
      const querySnapshot = await trackApiCall(getDocs(q));
      return querySnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    } catch (error) {
      console.error("Demo files fetch failed:", error);
      throw wrapFirebaseError("데모파일을 불러오지 못했습니다", error);
    }
  },

  async addDemoFile(demoFile) {
    try {
      const newDemoFile = {
        timestamp: new Date().toISOString(),
        ...demoFile
      };
      return await trackApiCall(addDoc(collection(db, "demoFiles"), newDemoFile));
    } catch (error) {
      console.error("Demo file create failed:", error);
      throw wrapFirebaseError("데모파일 등록에 실패했습니다", error);
    }
  },

  async updateDemoFile(id, demoFile) {
    try {
      return await trackApiCall(updateDoc(doc(db, "demoFiles", id), demoFile));
    } catch (error) {
      console.error("Demo file update failed:", error);
      throw wrapFirebaseError("데모파일 수정에 실패했습니다", error);
    }
  },

  async deleteDemoFile(id) {
    try {
      return await trackApiCall(deleteDoc(doc(db, "demoFiles", id)));
    } catch (error) {
      console.error("Demo file delete failed:", error);
      throw wrapFirebaseError("데모파일 삭제에 실패했습니다", error);
    }
  },

  // --- 갤러리 (Gallery) ---
  async getGallery() {
    try {
      const q = query(collection(db, "gallery"), orderBy("date", "desc"));
      const querySnapshot = await trackApiCall(getDocs(q));
      return querySnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    } catch (error) {
      console.error("Gallery fetch failed:", error);
      throw wrapFirebaseError("갤러리를 불러오지 못했습니다", error);
    }
  },

  async addGalleryItem(item) {
    try {
      return await trackApiCall(addDoc(collection(db, "gallery"), item));
    } catch (error) {
      console.error("Gallery create failed:", error);
      throw wrapFirebaseError("갤러리 등록에 실패했습니다", error);
    }
  },

  async updateGalleryItem(id, item) {
    try {
      return await trackApiCall(updateDoc(doc(db, "gallery", id), item));
    } catch (error) {
      console.error("Gallery update failed:", error);
      throw wrapFirebaseError("갤러리 수정에 실패했습니다", error);
    }
  },

  async deleteGalleryItem(id) {
    try {
      return await trackApiCall(deleteDoc(doc(db, "gallery", id)));
    } catch (error) {
      console.error("Gallery delete failed:", error);
      throw wrapFirebaseError("갤러리 삭제에 실패했습니다", error);
    }
  },

  // --- 문의사항 (Contacts) ---
  async getContacts() {
    try {
      const q = query(collection(db, "contacts"), orderBy("timestamp", "desc"));
      const querySnapshot = await trackApiCall(getDocs(q));
      return querySnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    } catch (error) {
      console.error("Contact fetch failed:", error);
      throw wrapFirebaseError("문의를 불러오지 못했습니다", error);
    }
  },

  async addContact(contact) {
    try {
      const newContact = {
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split("T")[0],
        ...contact
      };
      return await trackApiCall(addDoc(collection(db, "contacts"), newContact));
    } catch (error) {
      console.error("Contact create failed:", error);
      throw wrapFirebaseError("문의 등록에 실패했습니다", error);
    }
  },

  async deleteContact(id) {
    try {
      return await trackApiCall(deleteDoc(doc(db, "contacts", id)));
    } catch (error) {
      console.error("Contact delete failed:", error);
      throw wrapFirebaseError("문의 삭제에 실패했습니다", error);
    }
  },

  // --- 일정 (Schedule) ---
  async getSchedule() {
    try {
      const q = query(collection(db, "schedule"), orderBy("order", "asc"));
      const querySnapshot = await trackApiCall(getDocs(q));
      return querySnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    } catch (error) {
      console.error("Schedule fetch failed:", error);
      throw wrapFirebaseError("일정을 불러오지 못했습니다", error);
    }
  },

  async addSchedule(schedule) {
    try {
      return await trackApiCall(addDoc(collection(db, "schedule"), schedule));
    } catch (error) {
      console.error("Schedule create failed:", error);
      throw wrapFirebaseError("일정 등록에 실패했습니다", error);
    }
  },

  async updateSchedule(id, schedule) {
    try {
      return await trackApiCall(updateDoc(doc(db, "schedule", id), schedule));
    } catch (error) {
      console.error("Schedule update failed:", error);
      throw wrapFirebaseError("일정 수정에 실패했습니다", error);
    }
  },

  async deleteSchedule(id) {
    try {
      return await trackApiCall(deleteDoc(doc(db, "schedule", id)));
    } catch (error) {
      console.error("Schedule delete failed:", error);
      throw wrapFirebaseError("일정 삭제에 실패했습니다", error);
    }
  },

  // --- 시스템 설정 (Maintenance / Settings) ---
  async getMaintenanceSettings() {
    try {
      const q = query(collection(db, "settings"));
      const querySnapshot = await trackApiCall(getDocs(q));
      const doc = querySnapshot.docs.find(d => d.id === "maintenance");
      if (!doc) {
        return { isActive: false, message: "현재 점검 중입니다. 잠시 후 다시 접속해주세요." };
      }
      return doc.data();
    } catch (error) {
      console.error("Maintenance settings fetch failed:", error);
      return { isActive: false, message: "현재 점검 중입니다. 잠시 후 다시 접속해주세요." };
    }
  },

  async updateMaintenanceSettings(settings) {
    try {
      return await trackApiCall(updateDoc(doc(db, "settings", "maintenance"), {
        ...settings,
        updatedAt: new Date().toISOString()
      }));
    } catch (error) {
      if (error.code === 'not-found') {
        // 문서가 없으면 생성
        const { setDoc } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js");
        return await trackApiCall(setDoc(doc(db, "settings", "maintenance"), {
          ...settings,
          updatedAt: new Date().toISOString()
        }));
      }
      console.error("Maintenance settings update failed:", error);
      throw wrapFirebaseError("시스템 설정 수정에 실패했습니다", error);
    }
  },

  // --- 파일 업로드 (Firebase Storage) ---
  async uploadFile(file, path) {
    try {
      const maxSize = 10 * 1024 * 1024; // 최대 10MB
      if (file.size > maxSize) {
        throw new Error("파일 크기는 10MB를 초과할 수 없습니다.");
      }

      const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
      await trackApiCall(uploadBytes(storageRef, file));
      return await trackApiCall(getDownloadURL(storageRef));
    } catch (error) {
      console.error("File upload failed:", error);
      throw wrapFirebaseError("파일 업로드에 실패했습니다", error);
    }
  },

  // --- 인증 (Auth) ---
  async login(email, password) {
    try {
      if (!email || !password) {
        throw new Error("이메일과 비밀번호를 입력해주세요.");
      }
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login failed:", error);
      logFirebaseHostingHints(error);
      throw error;
    }
  },

  async logout() {
    try {
      return await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
      throw wrapFirebaseError("로그아웃에 실패했습니다", error);
    }
  },

  /**
   * 인증 상태 변경 감지 리스너
   * @param {Function} callback - 상태 변경 시 호출될 콜백 함수
   */
  onAuthChange(callback) {
    try {
      return onAuthStateChanged(auth, callback);
    } catch (error) {
      console.error("Auth state listener failed:", error);
      logFirebaseHostingHints(error);
      return undefined;
    }
  }
};

// 전역 객체로 등록하여 다른 스크립트에서 접근 가능하게 설정
window.dataService = dataService;
window.firebaseAuth = auth;
window.firebaseDebugInfo = {
  origin: currentOrigin,
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
};
