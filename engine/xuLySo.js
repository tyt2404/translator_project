function xuLyNam(text) {
  return text.replace(/(\d+)年/g, "năm $1");
}

function xuLyTien(text) {
  return text.replace(/(\d+)元/g, "$1 tệ");
}

function xuLyThangNgay(text) {
  text = text.replace(/(\d+)月/g, "tháng $1");
  text = text.replace(/(\d+)日/g, "ngày $1");
  return text;
}

function xuLySo(text) {
  text = xuLyNam(text);
  text = xuLyTien(text);
  text = xuLyThangNgay(text);
  return text;
}

module.exports = { xuLySo };