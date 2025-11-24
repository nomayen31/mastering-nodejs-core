const fs = require('fs');
const path = require('path');

try {
  console.log("Starting file read...");
  const filePath = path.join('../data/dairy.txt');
  const data = fs.readFileSync(filePath, 'utf8');
  console.log(data);

} catch (error) {
  console.error("Error reading file:", error.message);
}
