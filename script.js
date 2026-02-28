/* ===================================================
   BIẾN TOÀN CỤC
=================================================== */

let projectDict = {};
let generalDict = {};
let totalDict = {};
let compoundDict = {};

/* ===================================================
   SAFE FETCH
=================================================== */

async function safeFetch(url, options = {}) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const text = await response.text();
      console.error("Server error:", url, text);
      return { error: text || "Server error" };
    }

    return await response.json();

  } catch (error) {
    console.error("Fetch lỗi:", url, error);
    return { error: "Không thể kết nối server" };
  }
}

/* ===================================================
   LOAD DICTIONARIES (chỉ để thống kê)
=================================================== */

async function loadDictionaries() {

  const [project, general, total, compound] = await Promise.all([
    safeFetch("/dict/project"),
    safeFetch("/dict/general"),
    safeFetch("/dict/total"),
    safeFetch("/dict/compound")
  ]);

  projectDict = project || {};
  generalDict = general || {};
  totalDict = total || {};
  compoundDict = compound || {};

  updateStats();
}

loadDictionaries();

/* ===================================================
   CẬP NHẬT THỐNG KÊ
=================================================== */

function updateStats() {

  const setCount = (id, data) => {
    const el = document.getElementById(id);
    if (el) el.textContent = Object.keys(data || {}).length;
  };

  setCount("projectCount", projectDict);
  setCount("generalCount", generalDict);
  setCount("totalCount", totalDict);
  setCount("compoundCount", compoundDict);

  // update cache count as well
  fetch('/cache/size')
    .then(r => r.json())
    .then(j => {
      const el = document.getElementById('cacheCount');
      if (el) el.textContent = j.count;
    })
    .catch(()=>{});
}

/* ===================================================
   DỊCH VĂN BẢN
=================================================== */

async function dichVanBan() {

  const inputEl = document.getElementById("chineseText");
  const outputEl = document.getElementById("vietnameseText");
  const statusEl = document.getElementById("status");
  const progressBar = document.getElementById("progressBar");
  const profileSelect = document.getElementById("profileSelect");

  if (!inputEl || !outputEl || !statusEl) return;

  const text = inputEl.value.trim();
  const profile = profileSelect?.value || "mac_dinh";

  if (!text) {
    alert("Vui lòng nhập văn bản Tiếng Trung");
    return;
  }

  /* Reset UI */
  statusEl.textContent = "⏳ Đang dịch...";
  outputEl.innerHTML = "";
  progressBar.style.width = "10%";

  /* Gửi request */
  const result = await safeFetch("/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      profile
    })
  });

  progressBar.style.width = "70%";

  if (result.error) {
    statusEl.textContent = "❌ " + result.error;
    progressBar.style.width = "0%";
    return;
  }

  /* Hiển thị kết quả (HTML vì có highlight) */
  outputEl.innerHTML = result.result || "";

  progressBar.style.width = "100%";
  statusEl.textContent = "✅ Đã dịch xong!";

  /* Reset progress */
  setTimeout(() => {
    progressBar.style.width = "0%";
  }, 800);
}

/* ===================================================
   COPY KẾT QUẢ
=================================================== */

document.getElementById("copyBtn")
  ?.addEventListener("click", () => {

    const outputEl = document.getElementById("vietnameseText");

    if (!outputEl) return;

    /* Lấy text từ innerText (tự động xử lý <br> → newline) */
    let textToCopy = outputEl.innerText;

    /* Nếu innerText không xử lý được, thay <br> bằng newline */
    if (!textToCopy.includes("\n") && outputEl.innerHTML.includes("<br>")) {
      textToCopy = outputEl.innerHTML
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .trim();
    }

    navigator.clipboard.writeText(textToCopy)
      .then(() => alert("✅ Đã copy!"))
      .catch(() => alert("❌ Không thể copy"));
  });

/* ===================================================
   CLICK ĐỂ TỰ HỌC TỪ CHƯA BIẾT
=================================================== */

document.getElementById("vietnameseText")
  ?.addEventListener("click", async (e) => {
    const target = e.target;
    if (target.classList.contains("highlight-unknown")) {
      const chi = target.textContent;
      const vn = prompt(`Nhập nghĩa tiếng Việt cho "${chi}":`);
      if (!vn) return;

      const outputEl = document.getElementById("vietnameseText");
      const result = await addWord(chi, vn);
      if (result.error) {
        alert("❌ " + result.error);
      } else {
        alert("✅ Đã thêm từ! Đổi hiển thị...");
        // thay tất cả span tương ứng bằng nghĩa
        const regex = new RegExp(`<span class="highlight-unknown">${chi}</span>`, "g");
        outputEl.innerHTML = outputEl.innerHTML.replace(regex, vn);
        await loadDictionaries();
      }
    }
  });

/* ===================================================
   NÚT DỊCH
=================================================== */

document.getElementById("translateBtn")
  ?.addEventListener("click", dichVanBan);

/* (Removed "Add word" UI handlers per request) */

// clear cache
const clearCacheBtn = document.getElementById('clearCacheBtn');
if (clearCacheBtn) {
  clearCacheBtn.addEventListener('click', async () => {
    if (!confirm('Xóa toàn bộ cache dịch?')) return;
    const res = await safeFetch('/cache/clear', { method: 'POST' });
    if (!res.error) {
      alert('✅ Đã xóa cache');
      updateStats();
    } else {
      alert('❌ ' + res.error);
    }
  });
}

/* ===================================================
   CTRL + ENTER ĐỂ DỊCH
=================================================== */

document.getElementById("chineseText")
  ?.addEventListener("keydown", function (e) {
    if (e.ctrlKey && e.key === "Enter") {
      dichVanBan();
    }
  });