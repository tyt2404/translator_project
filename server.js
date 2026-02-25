const express = require("express");
const fs = require("fs");
const path = require("path");
const { dichVanBan } = require("./engine/dichChinh");

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================
   Middleware
========================= */
app.use(express.json());
app.use(express.static(path.join(__dirname)));

/* =========================
   File Paths
========================= */
const PROJECT_DICT = "dict_project.json";
const GENERAL_DICT = "dict_general.json";
const TOTAL_DICT = "dict_total.json";
const COMPOUND_DICT = "dict_compound.json";

/* =========================
   CACHE RAM
========================= */
let projectDict = {};
let generalDict = {};
let totalDict = {};
let compoundDict = {};
let mergedDict = {};

/* =========================
   Helper: Read JSON safely
========================= */
function readDictFile(filename) {
  const filePath = path.join(__dirname, filename);

  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "{}", "utf8");
      return {};
    }

    const content = fs.readFileSync(filePath, "utf8");
    if (!content || !content.trim()) {
      fs.writeFileSync(filePath, "{}", "utf8");
      return {};
    }

    return JSON.parse(content);

  } catch (error) {
    console.error("💥 Lỗi đọc JSON:", filename, error.message);
    return {};
  }
}

/* =========================
   Helper: Write JSON safely
========================= */
function writeDictFile(filename, data) {
  const filePath = path.join(__dirname, filename);

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("💥 Lỗi ghi file:", filename, error.message);
    return false;
  }
}

/* =========================
   Load Dictionaries vào RAM
========================= */
function loadAllDictionaries() {
  projectDict = readDictFile(PROJECT_DICT);
  generalDict = readDictFile(GENERAL_DICT);
  totalDict = readDictFile(TOTAL_DICT);
  compoundDict = readDictFile(COMPOUND_DICT);

  // Ưu tiên: general < project < total < compound
  mergedDict = {
    ...generalDict,
    ...projectDict,
    ...totalDict,
    ...compoundDict
  };

  console.log("✅ Đã load từ điển vào RAM");
}

/* Load khi server start */
loadAllDictionaries();

/* =========================
   API GET Dictionaries
========================= */
app.get("/dict/project", (req, res) => res.json(projectDict));
app.get("/dict/general", (req, res) => res.json(generalDict));
app.get("/dict/total", (req, res) => res.json(totalDict));
app.get("/dict/compound", (req, res) => res.json(compoundDict));

/* =========================
   API POST - Add Word
========================= */
app.post("/dict", (req, res) => {
  const { chinese, vietnamese } = req.body;

  if (!chinese || !vietnamese) {
    return res.status(400).json({ error: "Thiếu dữ liệu" });
  }

  const chineseTrimmed = chinese.trim();
  const vietnameseTrimmed = vietnamese.trim();

  if (!chineseTrimmed || !vietnameseTrimmed) {
    return res.status(400).json({ error: "Không được để trống" });
  }

  if (chineseTrimmed.length > 100 || vietnameseTrimmed.length > 200) {
    return res.status(400).json({ error: "Chuỗi quá dài" });
  }

  if (totalDict[chineseTrimmed]) {
    return res.status(409).json({
      error: "Từ này đã tồn tại!",
      existingValue: totalDict[chineseTrimmed]
    });
  }

  totalDict[chineseTrimmed] = vietnameseTrimmed;

  const success = writeDictFile(TOTAL_DICT, totalDict);
  if (!success) {
    return res.status(500).json({ error: "Lỗi ghi file" });
  }

  /* Reload lại RAM */
  loadAllDictionaries();

  res.status(201).json({
    message: "Đã thêm từ mới!",
    chinese: chineseTrimmed,
    vietnamese: vietnameseTrimmed
  });
});

/* =========================
   API TRANSLATE
========================= */
app.post("/translate", (req, res) => {
  const { text, profile } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Thiếu text" });
  }

  try {
    const ketQua = dichVanBan(
      text,
      mergedDict,
      profile || "mac_dinh"
    );

    res.json({ result: ketQua });

  } catch (error) {
    console.error("💥 Lỗi dịch:", error.message);
    res.status(500).json({ error: "Lỗi xử lý dịch" });
  }
});

/* =========================
   Global Error Handler
========================= */
app.use((err, req, res, next) => {
  console.error("💥 Server error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

/* =========================
   Start Server
========================= */
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});