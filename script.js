let projectDict = {};
let generalDict = {};
let totalDict = {};

/* =========================
   Safe Fetch
========================= */
async function safeFetch(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      console.error("Server error:", url, text);
      return {};
    }

    return await response.json();

  } catch (error) {
    console.error("Fetch lỗi:", url, error);
    return {};
  }
}

/* =========================
   Load Dictionaries
========================= */
async function loadDictionaries() {
  projectDict = await safeFetch("/dict/project");
  generalDict = await safeFetch("/dict/general");
  const additionalDict = await safeFetch("/dict/total");

  // Gộp tất cả 3 từ điển lại
  totalDict = { ...projectDict, ...generalDict, ...additionalDict };

  updateStats();
}

loadDictionaries();

/* =========================
   Translate
========================= */
document.getElementById("translateBtn")?.addEventListener("click", () => {
  const chineseText = document
    .getElementById("chineseText")
    .value
    .trim();

  const statusEl = document.getElementById("status");

  if (!chineseText) {
    alert("Vui lòng nhập văn bản Tiếng Trung");
    return;
  }

  // Hiển thị trạng thái đang xử lý
  statusEl.textContent = "Đang tìm kiếm...";

  // Simulate async lookup (có thể thêm debounce/delay nếu cần)
  setTimeout(() => {
    if (totalDict[chineseText]) {
      document.getElementById("vietnameseText").value =
        totalDict[chineseText];
      statusEl.textContent = "Đã dịch xong!";
    } else {
      document.getElementById("vietnameseText").value =
        "Chưa có nghĩa trong từ điển";
      statusEl.textContent = "Không tìm thấy!";
    }
  }, 300);
});

/* =========================
   Update Stats
========================= */
function updateStats() {
  document.getElementById("projectCount").textContent =
    Object.keys(projectDict).length;

  document.getElementById("generalCount").textContent =
    Object.keys(generalDict).length;

  document.getElementById("totalCount").textContent =
    Object.keys(totalDict).length;
}

/* =========================
   Add Word
========================= */
async function addWord(chinese, vietnamese) {
  const response = await fetch("/dict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ chinese, vietnamese })
  });

  const result = await response.json();

  if (!response.ok) {
    // Tạo error message chi tiết từ response
    const errorMsg = result.error || "Lỗi không xác định";
    throw new Error(errorMsg);
  }

  // Cập nhật totalDict cuc bộ
  totalDict[result.chinese] = result.vietnamese;
  updateStats();

  return result;
}

document.getElementById("addWordBtn")?.addEventListener("click", async () => {
  const chineseWord =
    document.getElementById("chineseWord").value.trim();

  const vietnameseWord =
    document.getElementById("vietnameseWord").value.trim();

  const addBtn = document.getElementById("addWordBtn");

  if (!chineseWord || !vietnameseWord) {
    alert("Vui lòng nhập đầy đủ");
    return;
  }

  // Kiểm tra độ dài
  if (chineseWord.length > 100) {
    alert("Tiếng Trung tối đa 100 ký tự");
    return;
  }

  if (vietnameseWord.length > 200) {
    alert("Tiếng Việt tối đa 200 ký tự");
    return;
  }

  try {
    // Hiển thị loading state
    const originalText = addBtn.textContent;
    addBtn.textContent = "Đang thêm...";
    addBtn.disabled = true;

    await addWord(chineseWord, vietnameseWord);
    alert("Đã thêm thành công!");

    document.getElementById("chineseWord").value = "";
    document.getElementById("vietnameseWord").value = "";

  } catch (err) {
    const errorMsg = err.message;
    
    // Xử lý các lỗi đặc biệt
    if (errorMsg.includes("trùng")) {
      alert("⚠️ Từ này đã có trong từ điển rồi!");
    } else if (errorMsg.includes("quá dài")) {
      alert("⚠️ " + errorMsg);
    } else if (errorMsg.includes("trống")) {
      alert("⚠️ " + errorMsg);
    } else {
      alert("❌ Lỗi: " + errorMsg);
    }
  } finally {
    // Khôi phục trạng thái button
    addBtn.textContent = originalText;
    addBtn.disabled = false;
  }
});