const fs = require("fs");

const filePath = "../output/AsyncFile/test-delete-file.txt";

// Step 1: Create file
fs.writeFileSync(filePath, "This file will be deleted.");
console.log("File created successfully.");

// Step 2: Check and delete file
if (fs.existsSync(filePath)) {
    console.log("File exists.");
    fs.unlinkSync(filePath);
    console.log("File deleted successfully!");
}

// Step 3: Try deleting again (will fail)
try {
    console.log("Attempting to delete the file again...");
    fs.unlinkSync(filePath);
    console.log("File deleted again (unexpected).");
} catch (error) {
    console.log("Error while deleting again:", error.message);

    // Step 4: Create the file again inside catch block
    try {
        fs.writeFileSync(filePath, "Recreated file after deletion error.");
        console.log("File recreated successfully!");
    } catch (createError) {
        console.log("Failed to recreate file:", createError.message);
    }
}

// Step 5: Bottom try/catch as requested
try {
    console.log("Trying to delete the recreated file...");
    fs.unlinkSync(filePath);
    console.log("Recreated file deleted successfully!");
} catch (finalError) {
    console.log("Final error occurred:", finalError.message);
}
