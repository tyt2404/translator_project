let projectDict = {};
let generalDict = {};
let totalDict = {};

// Load từng loại từ điển
Promise.all([
  fetch("/dict/project").then(res => res.json()),
  fetch("/dict/general").then(res => res.json()),
  fetch("/dict/total").then(res => res.json())
])
.then(([projectData, generalData, totalData]) => {
  projectDict = projectData;
  generalDict = generalData;
  totalDict = totalData;
  updateStats();
})
.catch(err => {
  console.error("Lỗi load từ điển:", err);
  document.getElementById("status").textContent = "Lỗi load từ điển!";
});

// Hàm dịch (tra trong tổng hợp)
document.getElementById("translateBtn").addEventListener("click", () => {
  const chineseText = document.getElementById("chineseText").value.trim();

  if (!chineseText) {
    alert("Vui lòng nhập văn bản Tiếng Trung");
    return;
  }

  if (totalDict[chineseText]) {
    document.getElementById("vietnameseText").value = totalDict[chineseText];
    document.getElementById("status").textContent = "Đã dịch xong!";
  } else {
    document.getElementById("vietnameseText").value = "Chưa có nghĩa trong từ điển";
    document.getElementById("status").textContent = "Không tìm thấy!";
  }
});

// Hàm cập nhật thống kê
function updateStats() {
  document.getElementById("projectCount").textContent = Object.keys(projectDict).length;
  document.getElementById("generalCount").textContent = Object.keys(generalDict).length;
  document.getElementById("totalCount").textContent = Object.keys(totalDict).length;
}

// Hàm thêm từ mới
async function addWord(chinese, vietnamese) {
  try {
    const response = await fetch("/dict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ chinese, vietnamese })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Lỗi không xác định");
    }

    const result = await response.json();
    
    // Cập nhật local dictionary
    totalDict[chinese] = vietnamese;
    updateStats();
    
    return result;
  } catch (err) {
    console.error("Lỗi khi thêm từ:", err);
    throw err;
  }
}

// Event Listener: Nút "Thêm từ"
document.getElementById("addWordBtn")?.addEventListener("click", async () => {
  const chineseWord = document.getElementById("chineseWord").value.trim();
  const vietnameseWord = document.getElementById("vietnameseWord").value.trim();

  if (!chineseWord || !vietnameseWord) {
    alert("Vui lòng nhập đầy đủ từ Tiếng Trung và Tiếng Việt");
    return;
  }

  try {
    await addWord(chineseWord, vietnameseWord);
    alert("Đã thêm từ thành công!");
    
    // Clear inputs
    document.getElementById("chineseWord").value = "";
    document.getElementById("vietnameseWord").value = "";
    
    document.getElementById("status").textContent = "Đã thêm từ mới!";
  } catch (err) {
    alert("Lỗi: " + err.message);
    document.getElementById("status").textContent = "Lỗi thêm từ!";
  }
});

// Event Listener: Nút "Dịch từ Clipboard"
document.getElementById("clipboardBtn")?.addEventListener("click", async () => {
  try {
    const clipboardText = await navigator.clipboard.readText();
    
    if (!clipboardText) {
      alert("Clipboard trống!");
      return;
    }

    document.getElementById("chineseText").value = clipboardText;
    document.getElementById("status").textContent = "Đã dán từ clipboard";

    // Tự động dịch sau khi dán
    const chineseText = clipboardText.trim();
    if (totalDict[chineseText]) {
      document.getElementById("vietnameseText").value = totalDict[chineseText];
      document.getElementById("status").textContent = "Đã dịch xong!";
    } else {
      document.getElementById("vietnameseText").value = "Chưa có nghĩa trong từ điển";
      document.getElementById("status").textContent = "Không tìm thấy!";
    }
  } catch (err) {
    console.error("Lỗi đọc clipboard:", err);
    alert("Không thể đọc clipboard. Vui lòng cấp quyền!");
  }
});

// Event Listener: Nút "Copy kết quả"
document.getElementById("copyBtn")?.addEventListener("click", async () => {
  const vietnameseText = document.getElementById("vietnameseText").value;

  if (!vietnameseText) {
    alert("Không có gì để copy!");
    return;
  }

  try {
    await navigator.clipboard.writeText(vietnameseText);
    document.getElementById("status").textContent = "Đã copy vào clipboard!";
  } catch (err) {
    console.error("Lỗi copy:", err);
    alert("Không thể copy. Vui lòng thử lại!");
  }
});

// Event Listener: Nút "Quản lý Từ điển"
document.getElementById("manageDictBtn")?.addEventListener("click", () => {
  const dictManager = document.querySelector(".dict-manager");
  if (dictManager) {
    if (dictManager.style.display === "none") {
      dictManager.style.display = "block";
      document.getElementById("status").textContent = "Đã mở quản lý từ điển";
    } else {
      dictManager.style.display = "none";
      document.getElementById("status").textContent = "Đã đóng quản lý từ điển";
    }
  }
});

// Khởi tạo: Ẩn phần quản lý từ điển ban đầu
document.addEventListener("DOMContentLoaded", () => {
  const dictManager = document.querySelector(".dict-manager");
  if (dictManager) {
    dictManager.style.display = "none";
  }
});
