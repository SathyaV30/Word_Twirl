//Backtracking function with trie to find all possible words from the board
export function findWords(board, trieInstance) {
    const rows = board.length;
    const cols = board[0].length;
    let result = new Set();
  
    function backtrack(row, col, currentPrefix, visited, path) {
        if (row < 0 || col < 0 || row >= rows || col >= cols || visited[row][col] || board[row][col] == '') return;
  
        currentPrefix += board[row][col];
        path.push([row, col]);
  
        //invalid prefix
        if (!trieInstance.startsWith(currentPrefix.toLowerCase())) {
            path.pop(); 
            return;
        }
  
        //valid word
        if (trieInstance.search(currentPrefix.toLowerCase())) {
            result.add({ word: currentPrefix.toLowerCase(), path: [...path] });
        }
  
        visited[row][col] = true;
  
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
        for (let [dx, dy] of directions) {
            backtrack(row + dx, col + dy, currentPrefix, visited, path);
        }
  
        visited[row][col] = false;
        path.pop();  // backtrack on the path as well
    }
  
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let visited = Array.from({ length: rows }, () => Array(cols).fill(false));
            backtrack(i, j, '', visited, []);
        }
    }
  
    return Array.from(result);
  }

    //Generate letters based on boggle dice. Source: https://boardgamegeek.com/thread/300883/letter-distribution
export function getRandomLetter(size) {
        let frequencyDist;
      
        if (size === 4) { // 4x4 Boggle
          frequencyDist = 
            'E'.repeat(12) + 
            'T'.repeat(6) + 
            'A'.repeat(6) + 'O'.repeat(6) + 'I'.repeat(6) + 
            'N'.repeat(6) + 'S'.repeat(6) + 'H'.repeat(6) + 'R'.repeat(6) + 
            'D'.repeat(4) + 
            'L'.repeat(4) + 'U'.repeat(4) + 
            'C'.repeat(3) + 
            'M'.repeat(3) + 
            'W'.repeat(2) + 
            'F'.repeat(2) + 'G'.repeat(2) + 
            'Y'.repeat(2) + 
            'P'.repeat(2) + 
            'B' + 'V' + 'K' + 'J' + 'X' + 'Q' + 'Z';
        } else if (size === 5) { // 5x5 Big Boggle
          frequencyDist = 
            'A'.repeat(9) + 
            'E'.repeat(9) + 
            'I'.repeat(6) + 
            'O'.repeat(6) + 'N'.repeat(6) + 
            'T'.repeat(5) + 
            'R'.repeat(4) + 
            'S'.repeat(4) + 
            'L'.repeat(4) + 'U'.repeat(4) + 
            'D'.repeat(3) + 
            'G'.repeat(2) + 
            'P'.repeat(2) + 'M'.repeat(2) + 
            'H'.repeat(2) + 'C'.repeat(2) + 
            'B' + 'Y' + 'F' + 'W' + 'K' + 'V' + 'X' + 'J' + 'Q' + 'Z';
        } else if (size === 6) { // 6x6 Super Big Boggle
          frequencyDist = 
            'E'.repeat(19) + 
            'T'.repeat(13) + 
            'A'.repeat(12) + 'R'.repeat(12) + 
            'I'.repeat(11) + 'N'.repeat(11) + 'O'.repeat(11) + 
            'S'.repeat(9) + 
            'D'.repeat(6) + 
            'C'.repeat(5) + 'H'.repeat(5) + 'L'.repeat(5) + 
            'F'.repeat(4) + 'M'.repeat(4) + 'P'.repeat(4) + 'U'.repeat(4) + 
            'G'.repeat(3) + 'Y'.repeat(3) + 
            'W'.repeat(2) + 
            'B' + 'J' + 'K' + 'Q' + 'V' + 'X' + 'Z';
        } else {
          throw new Error('Unsupported grid size');
        }
      
        return frequencyDist[Math.floor(Math.random() * frequencyDist.length)];
      }



export const calcScore = (word) => {
    if  (!word || word.length == 0) {
      return 0;
    }
    return word.length ** 2;
  }
  
  //generate letters for specified board
export const generateLetters = (rows, cols, selectedMapIndex) => {
    let generatedLetters = [];

    for (let i = 0; i < rows; i++) {
      let row = [];

      for (let j = 0; j < cols; j++) {
        let letter = getRandomLetter(rows);
        switch (selectedMapIndex) {
          case 2:
            if ((i === 0 || i === 4) && (j === 0 || j === 4) || (i === 2 && j === 2)) {
              letter = '';
            }
            break;
          case 3:
            if ((i + j) % 2 !== 0) {
              letter = '';
            }
            break;
          case 5: 
          if ((i === 0 || i === 5) && (j === 0 || j === 5) || 
          (i === 2 && (j === 2 || j === 3)) || 
          (i === 3 && (j === 2 || j === 3))) {
          letter = '';
      }
      
          break;
          case 6:
            if ((i + j) % 2 !== 0) {
              letter = '';
            }

          default:
            break;
        }

        row.push(letter);
      }

      generatedLetters.push(row);
    }

    return generatedLetters;
  };