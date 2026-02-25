const Trie = require("./trie");

function taoTrieTuDien(tuDien) {
  const trie = new Trie();

  for (const key in tuDien) {
    trie.insert(key, tuDien[key]);
  }

  return trie;
}

function ghepCumTrie(text, tuDien) {

  const trie = taoTrieTuDien(tuDien);
  const tokens = [];
  let i = 0;

  while (i < text.length) {

    if (!/[\u4E00-\u9FFF]/.test(text[i])) {

      let buffer = text[i];
      i++;

      while (i < text.length && !/[\u4E00-\u9FFF]/.test(text[i])) {
        buffer += text[i];
        i++;
      }

      tokens.push(buffer.trim());
      continue;
    }

    const match = trie.searchLongest(text, i);

    if (match) {
      tokens.push(match.value);
      i += match.length;
    } else {
      tokens.push(text[i]);
      i++;
    }
  }

  return tokens.filter(t => t && t.length > 0);
}

module.exports = { ghepCumTrie };

