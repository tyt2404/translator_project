const express = require("express");
const fs = require("fs");
const path = require("path");
const { dichVanBan } = require("./engine/dichChinh");
const { taoTrieTuDien } = require("./engine/ghepCumTrie");

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
const COMPOUND_DICT = "dict_compound.json";const CACHE_FILE = "translation_cache.json"; // persistent cache of previous translations
/* =========================
   CACHE RAM
========================= */
let projectDict = {};
let generalDict = {};
let totalDict = {};
let compoundDict = {};
let mergedDict = {};
let cachedTrie = null;
let translationCache = {};

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

async function writeDictFileAsync(filename, data) {
  const filePath = path.join(__dirname, filename);
  try {
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("💥 Lỗi ghi file async:", filename, error.message);
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

  // Build cached Trie for faster tokenization
  try {
    cachedTrie = taoTrieTuDien(mergedDict);
  } catch (e) {
    console.error('💥 Lỗi build trie:', e.message);
    cachedTrie = null;
  }

  console.log("✅ Đã load từ điển vào RAM");
}

/* Load khi server start */
loadAllDictionaries();
loadCache(); // load translation cache from disk

/* =========================
   Load/Save cache
======================== */
function loadCache() {
  const filePath = path.join(__dirname, CACHE_FILE);
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      translationCache = content ? JSON.parse(content) : {};
    }
  } catch (e) {
    console.error('💥 Lỗi đọc cache:', e.message);
    translationCache = {};
  }
}

async function saveCacheAsync() {
  const filePath = path.join(__dirname, CACHE_FILE);
  try {
    await fs.promises.writeFile(filePath, JSON.stringify(translationCache, null, 2), 'utf8');
  } catch (e) {
    console.error('💥 Lỗi ghi cache:', e.message);
  }
}


/* =========================
   API GET Dictionaries
========================= */
app.get("/dict/project", (req, res) => res.json(projectDict));
app.get("/dict/general", (req, res) => res.json(generalDict));
app.get("/dict/total", (req, res) => res.json(totalDict));
app.get("/dict/compound", (req, res) => res.json(compoundDict));
/* =========================
   CACHE MANAGEMENT API
======================== */
app.get("/cache/size", (req, res) => {
  const count = Object.keys(translationCache).length;
  res.json({ count });
});

app.post("/cache/clear", async (req, res) => {
  translationCache = {};
  await saveCacheAsync();
  res.json({ message: "Đã xóa cache" });
});
/* =========================
   API POST - Add Word
========================= */
app.post("/dict", async (req, res) => {
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

  const success = await writeDictFileAsync(TOTAL_DICT, totalDict);
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
  console.log('>> /translate body', req.body);
  const { text, profile } = req.body;

  if (!text) {
    console.log('no text');
    return res.status(400).json({ error: "Thiếu text" });
  }

  const key = `${profile||'mac_dinh'}||${text}`;
  if (translationCache[key]) {
    console.log('cache hit', key);
    return res.json({ result: translationCache[key] });
  }

  try {
    const ketQua = dichVanBan(
      text,
      cachedTrie || mergedDict,
      profile || "mac_dinh"
    );

    /* Thay \n bằng <br> để xuống dòng trong HTML */
    const ketQuaHtml = ketQua.replace(/\n/g, "<br>");

    console.log('<< /translate result', ketQua);
    translationCache[key] = ketQuaHtml;
    saveCacheAsync();
    res.json({ result: ketQuaHtml });

  } catch (error) {
  console.error("💥 Lỗi dịch FULL:", error);
  try {
    fs.appendFileSync(path.join(__dirname, 'error.log'), `[${new Date().toISOString()}] ${error.stack || error}\n\n`, 'utf8');
  } catch (e) {
    console.error('Không thể ghi error.log:', e.message);
  }
  res.status(500).json({ 
    error: error.message || "Lỗi xử lý dịch"
  });
  }
});

/* =========================
   Global Error Handler
========================= */
app.use((err, req, res, next) => {
  console.error("💥 Server error:", err.stack);
  try {
    fs.appendFileSync(path.join(__dirname, 'error.log'), `[${new Date().toISOString()}] GLOBAL ERROR: ${err.stack || err}\n\n`, 'utf8');
  } catch (e) {
    console.error('Không thể ghi error.log:', e.message);
  }
  res.status(500).json({ error: "Internal Server Error" });
});

/* =========================
   Start Server
========================= */
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});