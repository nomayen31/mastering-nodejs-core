const fs = require("fs");

fs.writeFileSync("../output/AsyncFile/test-delete-file.txt", "This file will be deleted.");
console.log("File created successfully.");

if (fs.existsSync("../output/AsyncFile/test-delete-file.txt")) {
    console.log("File exisist");
    fs.unlinkSync("../output/AsyncFile/test-delete-file.txt");
    console.log("File deleted Successfully!!!");
    
}





