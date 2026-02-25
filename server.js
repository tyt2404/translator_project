const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================
   Middleware
========================= */
app.use(express.json());
app.use(express.static(".")); // phục vụ frontend

/* =========================
   Helper: Đọc file JSON an toàn
========================= */
function readDictFile(filename) {
  const filePath = path.join(__dirname, filename);

  console.log("------");
  console.log("Đang đọc file:", filePath);

  try {
    if (!fs.existsSync(filePath)) {
      console.log("File không tồn tại → tạo mới");
      fs.writeFileSync(filePath, "{}", "utf8");
      return {};
    }

    const content = fs.readFileSync(filePath, "utf8");

    console.log("Nội dung thật sự trong file:");
    console.log(">>>" + content + "<<<");

    if (!content || !content.trim()) {
      console.log("File rỗng → reset lại {}");
      fs.writeFileSync(filePath, "{}", "utf8");
      return {};
    }

    return JSON.parse(content);

  } catch (error) {
    console.error("💥 LỖI PARSE JSON:", error.message);
    return {};
  }
}

/* =========================
   Helper: Ghi file JSON an toàn
========================= */
function writeDictFile(filename, data) {
  const filePath = path.join(__dirname, filename);

  try {
    fs.writeFileSync(
      filePath,
      JSON.stringify(data, null, 2),
      "utf8"
    );
    return true;
  } catch (error) {
    console.error("Lỗi ghi file:", filename);
    console.error(error.message);
    return false;
  }
}

/* =========================
   API GET
========================= */
app.get("/dict/project", (req, res) => {
  res.json(readDictFile("dict_project.json"));
});

app.get("/dict/general", (req, res) => {
  res.json(readDictFile("dict_general.json"));
});

app.get("/dict/total", (req, res) => {
  res.json(readDictFile("dict_total.json"));
});

/* =========================
   API POST - Thêm từ tổng hợp
========================= */
app.post("/dict", (req, res) => {
  const { chinese, vietnamese } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!chinese || !vietnamese) {
    return res.status(400).json({
      error: "Thiếu dữ liệu: cần chinese và vietnamese"
    });
  }

  if (typeof chinese !== "string" || typeof vietnamese !== "string") {
    return res.status(400).json({
      error: "Dữ liệu phải là chuỗi"
    });
  }

  const chineseTrimmed = chinese.trim();
  const vietnameseTrimmed = vietnamese.trim();

  // Validate độ dài chuỗi
  if (chineseTrimmed.length > 100 || vietnameseTrimmed.length > 200) {
    return res.status(400).json({
      error: "Chuỗi quá dài: Tiếng Trung tối đa 100 ký tự, Tiếng Việt tối đa 200 ký tự"
    });
  }

  if (chineseTrimmed.length === 0 || vietnameseTrimmed.length === 0) {
    return res.status(400).json({
      error: "Không được để trống"
    });
  }

  // Đọc từ điển hiện tại
  const totalDict = readDictFile("dict_total.json");

  // Kiểm tra từ trùng
  if (totalDict[chineseTrimmed]) {
    return res.status(409).json({
      error: "Từ này đã tồn tại!",
      existingValue: totalDict[chineseTrimmed],
      chinese: chineseTrimmed,
      vietnamese: vietnameseTrimmed
    });
  }

  // Thêm từ mới
  totalDict[chineseTrimmed] = vietnameseTrimmed;
  const writeSuccess = writeDictFile("dict_total.json", totalDict);

  if (!writeSuccess) {
    return res.status(500).json({
      error: "Lỗi ghi file từ điển. Vui lòng thử lại!"
    });
  }

  res.status(201).json({
    message: "Đã thêm từ mới!",
    chinese: chineseTrimmed,
    vietnamese: vietnameseTrimmed
  });
});

/* =========================
   Error Handler toàn cục
========================= */
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

/* =========================
   Start Server
========================= */
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});