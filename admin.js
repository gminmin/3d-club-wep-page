/**
 * admin.js
 * Dashboard-only admin logic.
 */

document.addEventListener("DOMContentLoaded", () => {
  const wait = setInterval(() => {
    if (window.dataService) {
      clearInterval(wait);
      setupAdmin();
    }
  }, 100);
});

function setupAdmin() {
  const ds = window.dataService;

  const adminContainer = document.getElementById("admin-container");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(".admin-section");
  const pageTitle = document.getElementById("page-title");
  const logoutBtn = document.getElementById("logout-btn");
  const noticeContent = document.getElementById("notice-content");
  const noticePreview = document.getElementById("notice-preview");

  let currentTarget = "dashboard";

  if (noticeContent && noticePreview && typeof marked !== "undefined") {
    noticeContent.addEventListener("input", () => {
      noticePreview.innerHTML = marked.parse(noticeContent.value || "");
    });
  }

  ds.onAuthChange((user) => {
    if (!user) {
      window.location.href = "admin_Login.html";
      return;
    }

    if (adminContainer) {
      adminContainer.style.display = "flex";
    }

    loadDashboardData();
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await ds.logout();
      window.location.href = "admin_Login.html";
    });
  }

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.dataset.target;
      currentTarget = target;

      navLinks.forEach(item => item.classList.remove("active"));
      link.classList.add("active");

      sections.forEach(section => (section.style.display = "none"));

      const section = document.getElementById(`section-${target}`);
      if (section) section.style.display = "block";
      if (pageTitle) pageTitle.innerText = link.innerText;

      if (target === "dashboard") loadDashboardData();
      if (target === "notices") renderNotices();
      if (target === "works") renderWorks();
      if (target === "gallery") renderGallery();
      if (target === "contacts") renderContacts();
      if (target === "schedule") renderSchedule();
      if (target === "demofiles") renderDemoFiles();
      if (target === "maintenance") renderMaintenanceSettings();
    });
  });

  async function renderMaintenanceSettings() {
    try {
      const settings = await ds.getMaintenanceSettings();
      const dot = document.getElementById("maint-status-dot");
      const text = document.getElementById("maint-status-text");
      const card = document.getElementById("maint-status-card");
      
      const activeInput = document.getElementById("maint-active");
      const toggleLabel = document.getElementById("maint-toggle-label");
      const toggleSwitch = document.getElementById("maint-toggle-switch");
      const toggleKnob = document.getElementById("maint-toggle-knob");
      
      const messageText = document.getElementById("maint-message");

      activeInput.value = settings.isActive.toString();
      messageText.value = settings.message;

      // 토글 버튼 상태 업데이트 함수
      const updateToggleUI = (isActive) => {
          if (isActive) {
              toggleLabel.innerText = "활성 상태 (임시 페이지 표시 중)";
              toggleLabel.style.color = "#ef4444";
              toggleSwitch.style.background = "#ef4444";
              toggleKnob.style.left = "26px";
          } else {
              toggleLabel.innerText = "비활성 상태 (정상 운영)";
              toggleLabel.style.color = "#64748b";
              toggleSwitch.style.background = "#cbd5e1";
              toggleKnob.style.left = "2px";
          }
      };

      updateToggleUI(settings.isActive);

      // 토글 이벤트 리스너 (한 번만 등록되도록 처리)
      if (!document.getElementById("maint-toggle-btn").dataset.listener) {
          document.getElementById("maint-toggle-btn").addEventListener("click", () => {
              const currentActive = activeInput.value === "true";
              const nextActive = !currentActive;
              activeInput.value = nextActive.toString();
              updateToggleUI(nextActive);
          });
          document.getElementById("maint-toggle-btn").dataset.listener = "true";
      }

      if (settings.isActive) {
        dot.style.background = "#ef4444";
        text.innerText = "현재 임시 페이지가 활성화된 상태입니다.";
        text.style.color = "#ef4444";
        card.style.background = "#fef2f2";
        card.style.border = "1px solid #fee2e2";
      } else {
        dot.style.background = "#22c55e";
        text.innerText = "홈페이지가 정상 운영 중입니다.";
        text.style.color = "#166534";
        card.style.background = "#f0fdf4";
        card.style.border = "1px solid #dcfce7";
      }
    } catch (e) {
      console.error(e);
    }
  }

  document.getElementById("maintenance-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const isActive = document.getElementById("maint-active").value === "true";
    const message = document.getElementById("maint-message").value.trim();

    // 재인증 절차
    const password = prompt("보안을 위해 관리자 비밀번호를 다시 입력해주세요.");
    if (!password) return;

    btn.innerText = "인증 및 저장 중..."; btn.disabled = true;

    try {
      // 현재 로그인된 사용자의 이메일 가져오기
      const user = ds.onAuthChange((u) => {
        if (u) {
            // Firebase Auth에서 재인증은 복잡하므로 간단하게 다시 로그인 시도
            ds.login(u.email, password).then(async () => {
                await ds.updateMaintenanceSettings({ isActive, message });
                alert("설정이 저장되었습니다.");
                renderMaintenanceSettings();
            }).catch(err => {
                alert("비밀번호가 틀렸거나 인증에 실패했습니다.");
                console.error(err);
            }).finally(() => {
                btn.innerText = "설정 저장하기"; btn.disabled = false;
            });
        }
      });
    } catch (error) {
      console.error("Maintenance save failed:", error);
      alert("저장에 실패했습니다. 다시 시도해주세요.");
      btn.innerText = "설정 저장하기"; btn.disabled = false;
    }
  });

  document.getElementById("maint-preview-btn").addEventListener("click", () => {
    window.open("maintenance.html", "_blank");
  });

  async function loadDashboardData() {
    try {
      const notices = await ds.getNotices();
      const works = await ds.getWorks();
      const gallery = await ds.getGallery();
      const contacts = await ds.getContacts();
      const demoFiles = await ds.getDemoFiles();

      document.getElementById("stat-notices").innerText = notices.length;
      document.getElementById("stat-works").innerText = works.length;
      document.getElementById("stat-gallery").innerText = gallery.length;
      document.getElementById("stat-contacts").innerText = contacts.length;
      document.getElementById("stat-demofiles").innerText = demoFiles.length;

      // 저장소 사용량 계산 (파일이 포함된 항목 수 합산)
      const storageCount =
        works.filter(w => w.imageUrl).length +
        gallery.filter(g => g.fileUrl).length +
        demoFiles.filter(df => df.fileUrl).length +
        demoFiles.filter(df => df.previewImageUrl).length;

      document.getElementById("stat-storage-usage").innerText = storageCount;

      updateSessionStats();
    } catch (error) {
      console.error("Dashboard load failed:", error);
      alert("데이터를 불러오지 못했습니다. 서버 연결을 확인해주세요.");
    }
  }

  function updateSessionStats() {
    const stats = ds.getStats();
    const reqEl = document.getElementById("stat-api-requests");
    const resEl = document.getElementById("stat-api-responses");
    if (reqEl) reqEl.innerText = stats.requests;
    if (resEl) resEl.innerText = stats.responses;
  }

  // 실시간으로 세션 통계 업데이트 (2초마다)
  setInterval(updateSessionStats, 2000);

  async function renderNotices() {
    try {
      const listBody = document.getElementById("notice-list-body");
      listBody.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';
      const data = await ds.getNotices();
      listBody.innerHTML = data.length === 0
        ? '<tr><td colspan="3" style="text-align:center; color:#94a3b8;">공지사항이 없습니다.</td></tr>'
        : data.map(n => `
          <tr>
            <td>${n.date}</td>
            <td><strong>${n.title}</strong></td>
            <td>
              <button class="btn-delete" style="background:#00000000; margin-right:5px;" onclick="editNotice('${n.id}', '${n.title.replace(/'/g, "\\'")}', \`${n.content.replace(/`/g, "\\`")}\`)">수정</button>
              <button class="btn-delete" onclick="deleteItem('notice', '${n.id}')">삭제</button>
            </td>
          </tr>
        `).join("");
    } catch (error) {
      console.error("Notice load failed:", error);
      document.getElementById("notice-list-body").innerHTML = '<tr><td colspan="3" style="text-align:center; color:#ef4444;">데이터를 불러오지 못했습니다.</td></tr>';
    }
  }

  async function renderWorks() {
    try {
      const listBody = document.getElementById("work-list-body");
      listBody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
      const data = await ds.getWorks();
      listBody.innerHTML = data.length === 0
        ? '<tr><td colspan="4" style="text-align:center; color:#94a3b8;">등록된 작품이 없습니다.</td></tr>'
        : data.map(w => `
          <tr>
            <td><span class="badge">${w.category}</span></td>
            <td><strong>${w.title}</strong></td>
            <td>${w.author}</td>
            <td>
              <button class="btn-delete" style="background:#00000000; margin-right:5px;" onclick="editWork('${w.id}', '${w.title.replace(/'/g, "\\'")}', '${w.category.replace(/'/g, "\\'")}', '${w.author.replace(/'/g, "\\'")}')">수정</button>
              <button class="btn-delete" onclick="deleteItem('work', '${w.id}')">삭제</button>
            </td>
          </tr>
        `).join("");
    } catch (error) {
      console.error("Work load failed:", error);
      document.getElementById("work-list-body").innerHTML = '<tr><td colspan="4" style="text-align:center; color:#ef4444;">데이터를 불러오지 못했습니다.</td></tr>';
    }
  }

  async function renderGallery() {
    try {
      const listBody = document.getElementById("gallery-list-body");
      listBody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
      const data = await ds.getGallery();
      listBody.innerHTML = data.length === 0
        ? '<tr><td colspan="4" style="text-align:center; color:#94a3b8;">갤러리 항목이 없습니다.</td></tr>'
        : data.map(item => `
          <tr>
            <td>${item.type === "photo" ? "사진" : "영상"}</td>
            <td><strong>${item.title}</strong></td>
            <td>${item.date}</td>
            <td>
              <button class="btn-delete" style="background:#00000000; margin-right:5px;" onclick="editGallery('${item.id}', '${item.type}', '${item.title.replace(/'/g, "\\'")}', '${item.date}')">수정</button>
              <button class="btn-delete" onclick="deleteItem('gallery', '${item.id}')">삭제</button>
            </td>
          </tr>
        `).join("");
    } catch (error) {
      console.error("Gallery load failed:", error);
      document.getElementById("gallery-list-body").innerHTML = '<tr><td colspan="4" style="text-align:center; color:#ef4444;">데이터를 불러오지 못했습니다.</td></tr>';
    }
  }

  async function renderContacts() {
    try {
      const listBody = document.getElementById("contact-list-body");
      listBody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';
      const data = await ds.getContacts();
      listBody.innerHTML = data.length === 0
        ? '<tr><td colspan="6" style="text-align:center; color:#94a3b8;">받은 문의가 없습니다.</td></tr>'
        : data.map(c => `
          <tr>
            <td>${c.date}</td>
            <td><strong>${c.name}</strong></td>
            <td>${c.email}</td>
            <td>${c.subject || "-"}</td>
            <td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${c.message}</td>
            <td><button class="btn-delete" onclick="deleteItem('contact', '${c.id}')">삭제</button></td>
          </tr>
        `).join("");
    } catch (error) {
      console.error("Contact load failed:", error);
      document.getElementById("contact-list-body").innerHTML = '<tr><td colspan="6" style="text-align:center; color:#ef4444;">데이터를 불러오지 못했습니다.</td></tr>';
    }
  }

  async function renderSchedule() {
    try {
      const listBody = document.getElementById("schedule-list-body");
      listBody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
      const data = await ds.getSchedule();
      listBody.innerHTML = data.length === 0
        ? '<tr><td colspan="5" style="text-align:center; color:#94a3b8;">등록된 일정이 없습니다.</td></tr>'
        : data.map(s => `
          <tr>
            <td>${s.month}</td>
            <td>${s.activity}</td>
            <td>${s.goal}</td>
            <td>${s.order || "-"}</td>
            <td>
              <button class="btn-delete" style="background:#00000000; margin-right:5px;" onclick="editSchedule('${s.id}', '${s.month.replace(/'/g, "\\'")}', '${s.activity.replace(/'/g, "\\'")}', '${s.goal.replace(/'/g, "\\'")}', ${s.order})">수정</button>
              <button class="btn-delete" onclick="deleteItem('schedule', '${s.id}')">삭제</button>
            </td>
          </tr>
        `).join("");
    } catch (error) {
      console.error("Schedule load failed:", error);
      document.getElementById("schedule-list-body").innerHTML = '<tr><td colspan="5" style="text-align:center; color:#ef4444;">데이터를 불러오지 못했습니다.</td></tr>';
    }
  }

  async function renderDemoFiles() {
    try {
      const listBody = document.getElementById("demofile-list-body");
      listBody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
      const data = await ds.getDemoFiles();
      listBody.innerHTML = data.length === 0
        ? '<tr><td colspan="4" style="text-align:center; color:#94a3b8;">등록된 데모파일이 없습니다.</td></tr>'
        : data.map(df => `
          <tr>
            <td><span class="badge">${df.category}</span></td>
            <td><strong>${df.title}</strong></td>
            <td>${df.description}</td>
            <td>
              <button class="btn-delete" style="background:#00000000; margin-right:5px;" onclick="editDemoFile('${df.id}', '${df.title.replace(/'/g, "\\'")}', '${df.category}', \`${df.description.replace(/`/g, "\\`")}\`, '${df.githubUrl || ""}')">수정</button>
              <button class="btn-delete" onclick="deleteItem('demofile', '${df.id}')">삭제</button>
            </td>
          </tr>
        `).join("");
    } catch (error) {
      console.error("Demo files load failed:", error);
      document.getElementById("demofile-list-body").innerHTML = '<tr><td colspan="4" style="text-align:center; color:#ef4444;">데이터를 불러오지 못했습니다.</td></tr>';
    }
  }

  document.getElementById("notice-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const noticeId = document.getElementById("notice-id").value;
    btn.innerText = "저장 중..."; btn.disabled = true;

    try {
      const title = document.getElementById("notice-title").value.trim();
      const content = document.getElementById("notice-content").value.trim();
      if (!title || !content) {
        alert("제목과 내용을 입력해주세요.");
        btn.innerText = "저장"; btn.disabled = false;
        return;
      }

      if (noticeId) {
        await ds.updateNotice(noticeId, { title, content });
        alert("공지사항이 수정되었습니다.");
      } else {
        await ds.addNotice({ title, content });
        alert("공지사항이 저장되었습니다.");
      }

      e.target.reset();
      document.getElementById("notice-id").value = "";
      e.target.style.display = "none";
      renderNotices();
    } catch (error) {
      console.error("Notice save failed:", error);
      alert("저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      btn.innerText = "저장"; btn.disabled = false;
    }
  });

  document.getElementById("work-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const workId = document.getElementById("work-id").value;
    btn.innerText = "저장 중..."; btn.disabled = true;

    try {
      const title = document.getElementById("work-title").value.trim();
      const category = document.getElementById("work-category").value.trim();
      const author = document.getElementById("work-author").value.trim();
      const file = document.getElementById("work-file").files[0];

      if (!title || !category || !author) {
        alert("이미지를 제외한 모든 항목을 입력해주세요.");
        btn.innerText = "저장"; btn.disabled = false;
        return;
      }

      const workData = { title, category, author };

      if (file) {
        workData.imageUrl = await ds.uploadFile(file, "works");
      } else if (!workId) {
        alert("작품 이미지를 업로드하세요.");
        btn.innerText = "저장"; btn.disabled = false;
        return;
      }

      if (workId) {
        await ds.updateWork(workId, workData);
        alert("작품 정보가 수정되었습니다.");
      } else {
        workData.id = Date.now();
        await ds.addWork(workData);
        alert("작품이 저장되었습니다.");
      }

      e.target.reset();
      document.getElementById("work-id").value = "";
      e.target.style.display = "none";
      renderWorks();
    } catch (error) {
      console.error("Work save failed:", error);
      alert("저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      btn.innerText = "저장"; btn.disabled = false;
    }
  });

  document.getElementById("gallery-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const galleryId = document.getElementById("gallery-id").value;
    btn.innerText = "저장 중..."; btn.disabled = true;

    try {
      const type = document.getElementById("gallery-type").value;
      const title = document.getElementById("gallery-title").value.trim();
      const date = document.getElementById("gallery-date").value;
      const file = document.getElementById("gallery-file").files[0];

      if (!type || !title || !date) {
        alert("파일을 제외한 모든 항목을 입력해주세요.");
        btn.innerText = "저장"; btn.disabled = false;
        return;
      }

      const galleryData = { type, title, date };

      if (file) {
        galleryData.fileUrl = await ds.uploadFile(file, "gallery");
      } else if (!galleryId) {
        alert("파일을 업로드하세요.");
        btn.innerText = "저장"; btn.disabled = false;
        return;
      }

      if (galleryId) {
        await ds.updateGalleryItem(galleryId, galleryData);
        alert("갤러리 항목이 수정되었습니다.");
      } else {
        await ds.addGalleryItem(galleryData);
        alert("갤러리 항목이 저장되었습니다.");
      }

      e.target.reset();
      document.getElementById("gallery-id").value = "";
      e.target.style.display = "none";
      renderGallery();
    } catch (error) {
      console.error("Gallery save failed:", error);
      alert("저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      btn.innerText = "저장"; btn.disabled = false;
    }
  });

  document.getElementById("schedule-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const scheduleId = document.getElementById("schedule-id").value;
    btn.innerText = "저장 중..."; btn.disabled = true;

    try {
      const month = document.getElementById("schedule-month").value.trim();
      const activity = document.getElementById("schedule-activity").value.trim();
      const goal = document.getElementById("schedule-goal").value.trim();
      const order = parseInt(document.getElementById("schedule-order").value);

      if (!month || !activity || !goal || !order) {
        alert("모든 항목을 입력해주세요.");
        btn.innerText = "저장"; btn.disabled = false;
        return;
      }

      const scheduleData = { month, activity, goal, order };
      if (scheduleId) {
        await ds.updateSchedule(scheduleId, scheduleData);
        alert("활동 일정이 수정되었습니다.");
      } else {
        await ds.addSchedule(scheduleData);
        alert("활동 일정이 저장되었습니다.");
      }

      e.target.reset();
      document.getElementById("schedule-id").value = "";
      e.target.style.display = "none";
      renderSchedule();
    } catch (error) {
      console.error("Schedule save failed:", error);
      alert("저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      btn.innerText = "저장"; btn.disabled = false;
    }
  });

  document.getElementById("demofile-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const demofileId = document.getElementById("demofile-id").value;
    btn.innerText = "저장 중..."; btn.disabled = true;

    try {
      const title = document.getElementById("demofile-title").value.trim();
      const category = document.getElementById("demofile-category").value;
      const description = document.getElementById("demofile-description").value.trim();
      const githubUrl = document.getElementById("demofile-github").value.trim();
      const file = document.getElementById("demofile-file").files[0];
      const previewFile = document.getElementById("demofile-preview").files[0];

      if (!title || !category || !description) {
        alert("파일을 제외한 모든 항목을 입력해주세요.");
        btn.innerText = "저장"; btn.disabled = false;
        return;
      }

      const demoData = { title, category, description, githubUrl };

      if (previewFile) {
        demoData.previewImageUrl = await ds.uploadFile(previewFile, "demofiles/previews");
      }

      if (file) {
        demoData.fileUrl = await ds.uploadFile(file, "demofiles");
      } else if (!demofileId) {
        alert("파일을 업로드하세요.");
        btn.innerText = "저장"; btn.disabled = false;
        return;
      }

      if (demofileId) {
        await ds.updateDemoFile(demofileId, demoData);
        alert("데모파일 정보가 수정되었습니다.");
      } else {
        await ds.addDemoFile(demoData);
        alert("데모파일이 저장되었습니다.");
      }

      e.target.reset();
      document.getElementById("demofile-id").value = "";
      e.target.style.display = "none";
      renderDemoFiles();
    } catch (error) {
      console.error("Demo file save failed:", error);
      alert("저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      btn.innerText = "저장"; btn.disabled = false;
    }
  });

  window.toggleForm = (id) => {
    const form = document.getElementById(id);
    form.style.display = form.style.display === "none" ? "flex" : "none";
  };

  window.editSchedule = (id, month, activity, goal, order) => {
    document.getElementById("schedule-id").value = id;
    document.getElementById("schedule-month").value = month;
    document.getElementById("schedule-activity").value = activity;
    document.getElementById("schedule-goal").value = goal;
    document.getElementById("schedule-order").value = order;
    document.getElementById("schedule-form").style.display = "flex";
    document.getElementById("schedule-form").querySelector('button[type="submit"]').innerText = "수정하기";
  };

  window.resetScheduleForm = () => {
    document.getElementById("schedule-id").value = "";
    document.getElementById("schedule-form").reset();
    document.getElementById("schedule-form").querySelector('button[type="submit"]').innerText = "저장";
  };

  window.resetNoticeForm = () => {
    document.getElementById("notice-id").value = "";
    document.getElementById("notice-form").reset();
    document.getElementById("notice-preview").innerHTML = "";
    document.getElementById("notice-form").querySelector('button[type="submit"]').innerText = "저장";
  };

  window.resetWorkForm = () => {
    document.getElementById("work-id").value = "";
    document.getElementById("work-form").reset();
    document.getElementById("work-form").querySelector('button[type="submit"]').innerText = "저장";
  };

  window.resetGalleryForm = () => {
    document.getElementById("gallery-id").value = "";
    document.getElementById("gallery-form").reset();
    document.getElementById("gallery-form").querySelector('button[type="submit"]').innerText = "저장";
  };

  window.resetDemoFileForm = () => {
    document.getElementById("demofile-id").value = "";
    document.getElementById("demofile-form").reset();
    document.getElementById("demofile-preview").value = "";
    document.getElementById("demofile-github").value = "";
    document.getElementById("demofile-form").querySelector('button[type="submit"]').innerText = "저장";
  };

  window.editNotice = (id, title, content) => {
    document.getElementById("notice-id").value = id;
    document.getElementById("notice-title").value = title;
    document.getElementById("notice-content").value = content;
    document.getElementById("notice-preview").innerHTML = marked.parse(content || "");
    document.getElementById("notice-form").style.display = "flex";
    document.getElementById("notice-form").querySelector('button[type="submit"]').innerText = "수정하기";
  };

  window.editWork = (id, title, category, author) => {
    document.getElementById("work-id").value = id;
    document.getElementById("work-title").value = title;
    document.getElementById("work-category").value = category;
    document.getElementById("work-author").value = author;
    document.getElementById("work-form").style.display = "flex";
    document.getElementById("work-form").querySelector('button[type="submit"]').innerText = "수정하기";
  };

  window.editGallery = (id, type, title, date) => {
    document.getElementById("gallery-id").value = id;
    document.getElementById("gallery-type").value = type;
    document.getElementById("gallery-title").value = title;
    document.getElementById("gallery-date").value = date;
    document.getElementById("gallery-form").style.display = "flex";
    document.getElementById("gallery-form").querySelector('button[type="submit"]').innerText = "수정하기";
  };

  window.editDemoFile = (id, title, category, description, githubUrl) => {
    document.getElementById("demofile-id").value = id;
    document.getElementById("demofile-title").value = title;
    document.getElementById("demofile-category").value = category;
    document.getElementById("demofile-description").value = description;
    document.getElementById("demofile-github").value = githubUrl || "";
    document.getElementById("demofile-form").style.display = "flex";
    document.getElementById("demofile-form").querySelector('button[type="submit"]').innerText = "수정하기";
  };

  window.deleteItem = async (type, id) => {
    if (!confirm("정말 삭제하시겠습니까? (이 작업은 되돌릴 수 없습니다)")) return;

    try {
      if (type === "notice") await ds.deleteNotice(id);
      if (type === "work") await ds.deleteWork(id);
      if (type === "gallery") await ds.deleteGalleryItem(id);
      if (type === "contact") await ds.deleteContact(id);
      if (type === "schedule") await ds.deleteSchedule(id);
      if (type === "demofile") await ds.deleteDemoFile(id);

      alert("삭제되었습니다.");

      if (currentTarget === "dashboard") loadDashboardData();
      if (type === "notice") renderNotices();
      if (type === "work") renderWorks();
      if (type === "gallery") renderGallery();
      if (type === "contact") renderContacts();
      if (type === "schedule") renderSchedule();
      if (type === "demofile") renderDemoFiles();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };
}
