const fs = require('fs');
const path = require('path');

try {
  console.log("Starting file read...");
  const filePath = path.join('../data/dairy.txt');
  fs.readFile(filePath, 'utf- 8', (err, data) => {
    if (err) {
      console.error("Error reading file:", err.message);
    } else {
      console.log(data);
    }
  });
} catch (error) {
  console.error("Error reading file:", error.message);
}