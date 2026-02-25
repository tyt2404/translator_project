const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(".")); // phục vụ file frontend

// Hàm đọc file JSON an toàn
function readDictFile(filename) {
  const filePath = path.join(__dirname, filename);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  }
  return {};
}

// Hàm ghi file JSON an toàn
function writeDictFile(filename, data) {
  const filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// API lấy từ điển dự án
app.get("/dict/project", (req, res) => {
  const dict = readDictFile("dict_project.json");
  res.json(dict);
});

// API lấy từ điển chung
app.get("/dict/general", (req, res) => {
  const dict = readDictFile("dict_general.json");
  res.json(dict);
});

// API lấy từ điển tổng hợp
app.get("/dict/total", (req, res) => {
  const dict = readDictFile("dict_total.json");
  res.json(dict);
});

// API thêm từ mới vào từ điển tổng hợp
app.post("/dict", (req, res) => {
  const { chinese, vietnamese } = req.body;

  // Validation
  if (!chinese || !vietnamese) {
    return res.status(400).json({ error: "Thiếu dữ liệu: cần có chinese và vietnamese" });
  }

  if (typeof chinese !== "string" || typeof vietnamese !== "string") {
    return res.status(400).json({ error: "Dữ liệu không hợp lệ: chinese và vietnamese phải là chuỗi" });
  }

  // Đọc và cập nhật từ điển tổng hợp
  const totalDict = readDictFile("dict_total.json");
  totalDict[chinese] = vietnamese;
  writeDictFile("dict_total.json", totalDict);

  res.json({ message: "Đã thêm từ mới!", chinese, vietnamese });
});

// API cập nhật từ điển dự án
app.post("/dict/project", (req, res) => {
  const { chinese, vietnamese } = req.body;

  if (!chinese || !vietnamese) {
    return res.status(400).json({ error: "Thiếu dữ liệu" });
  }

  const projectDict = readDictFile("dict_project.json");
  projectDict[chinese] = vietnamese;
  writeDictFile("dict_project.json", projectDict);

  res.json({ message: "Đã thêm từ vào từ điển dự án!" });
});

// API cập nhật từ điển chung
app.post("/dict/general", (req, res) => {
  const { chinese, vietnamese } = req.body;

  if (!chinese || !vietnamese) {
    return res.status(400).json({ error: "Thiếu dữ liệu" });
  }

  const generalDict = readDictFile("dict_general.json");
  generalDict[chinese] = vietnamese;
  writeDictFile("dict_general.json", generalDict);

  res.json({ message: "Đã thêm từ vào từ điển chung!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));
