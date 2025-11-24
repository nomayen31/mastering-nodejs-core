const path = require("path");

// Current file information
console.log("Current File Info:\n");
console.log("File Name:", __filename);
console.log("Directory Name:", __dirname);

console.log("\n" + "=".repeat(50));
console.log("------------- Path Analysis -------------");
console.log("=".repeat(50) + "\n");

// Path to analyze
const filePath = "/ohin/documents/nextlevel.pdf";

console.log("Analyzing Path:", filePath, "\n");

// Extract useful path details
console.log("Base Name:", path.basename(filePath));
console.log("Directory:", path.dirname(filePath));
console.log("Extension:", path.extname(filePath));
console.log("Parsed Object:", path.parse(filePath));
console.log("Normalized Path:", path.normalize(filePath));
console.log("Is Absolute:", path.isAbsolute(filePath));
