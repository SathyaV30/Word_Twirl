// generateLevels.js
const fs = require('fs');

// Define the structure of your level data
function createLevelData(levelNumber) {
    // Replace this object with whatever data a level should contain
    return {
        level: levelNumber,
        // other properties like "difficulty", "enemies", etc. could be added here
    };
}

// Create 30 level files
for (let i = 1; i <= 30; i++) {
    // Create level data for the current level
    const levelData = createLevelData(i);

    // Convert the level data to JSON format
    const jsonContent = JSON.stringify(levelData, null, 2); // The "2" here is for pretty-printing with 2 spaces

    // Define the filename for the current level
    const filename = `level${i}.json`;

    // Write the JSON content to the file
    fs.writeFile(filename, jsonContent, 'utf8', function (err) {
        if (err) {
            console.log("An error occurred while writing JSON Object to File.");
            return console.log(err);
        }

        console.log(`JSON file for level ${i} has been saved.`);
    });
}
