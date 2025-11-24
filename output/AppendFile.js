const fs = require(fs)

fs.writeFileSync("../output/app.log","Application started \n");
console.log("File created successfully");

const logEntry1 = `${new Date().toDateString()} user logged in \n`;
