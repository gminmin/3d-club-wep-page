/**
 * admin-login.js
 * Login-only page for the admin area.
 */

document.addEventListener("DOMContentLoaded", () => {
  const wait = setInterval(() => {
    if (window.dataService) {
      clearInterval(wait);
      setupLogin();
    }
  }, 100);
});

function setupLogin() {
  const ds = window.dataService;
  const loginBtn = document.getElementById("login-btn");
  const emailInput = document.getElementById("admin-email");
  const pwdInput = document.getElementById("admin-password");
  const loginError = document.getElementById("login-error");

  if (!loginBtn || !emailInput || !pwdInput || !loginError) {
    return;
  }

  const login = async () => {
    try {
      loginError.style.display = "none";
      loginBtn.disabled = true;
      loginBtn.innerText = "로그인 중...";

      await ds.login(emailInput.value, pwdInput.value);
      window.location.href = "admin.html";
    } catch (error) {
      console.error("Login failed:", error);

      if (error?.code === "auth/unauthorized-domain") {
        loginError.innerText = "현재 배포 도메인이 Firebase Authentication 허용 도메인에 등록되어 있지 않습니다.";
      } else if (error?.code === "auth/invalid-credential" || error?.code === "auth/wrong-password" || error?.code === "auth/user-not-found") {
        loginError.innerText = "이메일 또는 비밀번호가 올바르지 않습니다.";
      } else {
        loginError.innerText = error?.message || "로그인에 실패했습니다.";
      }

      loginError.style.display = "block";
    } finally {
      loginBtn.disabled = false;
      loginBtn.innerText = "로그인";
    }
  };

  loginBtn.addEventListener("click", login);
  pwdInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      login();
    }
  });
}
