
const crypto = require("crypto");

console.log("\n=== Hashing Example ===\n");
const md5Hash = crypto.createHash("md5").update("ohin123").digest("hex");
console.log("MD5 Hash:", md5Hash);  



const SHA256hASH = crypto.createHash('SHA256').update('ohin123').digest('hex');
console.log("SHA256 Hash:", SHA256hASH);



const SHA512hASH = crypto.createHash('SHA512').update('ohin123').digest('hex');
console.log("SHA512 Hash:", SHA512hASH);