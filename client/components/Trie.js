//Trie class for efficient searching of words
class TrieNode {
    constructor() {
        this.children = {};
        this.isEndOfWord = false;
    }
}

  class Trie {
      constructor() {
          this.root = new TrieNode();
      }

      insert(word) {
          let node = this.root;
          for (let char of word) {
              if (!node.children[char]) {
                  node.children[char] = new TrieNode();
              }
              node = node.children[char];
          }
          node.isEndOfWord = true;
      }

      searchPrefix(prefix) {
          let node = this.root;
          for (let char of prefix) {
              if (!node.children[char]) return null;
              node = node.children[char];
          }
          return node;
      }

      search(word) {
          const node = this.searchPrefix(word);
          return node !== null && node.isEndOfWord;
      }

      startsWith(prefix) {
          return this.searchPrefix(prefix) !== null;
      }
  }
  export default Trie;