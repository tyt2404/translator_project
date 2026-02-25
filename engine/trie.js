class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
    this.value = null;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word, value) {
    let node = this.root;
    for (let char of word) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEnd = true;
    node.value = value;
  }

  searchLongest(text, start) {
    let node = this.root;
    let longest = null;
    let index = start;

    while (index < text.length) {
      const char = text[index];
      if (!node.children[char]) break;

      node = node.children[char];
      if (node.isEnd) {
        longest = {
          value: node.value,
          length: index - start + 1
        };
      }
      index++;
    }

    return longest;
  }
}

module.exports = Trie;