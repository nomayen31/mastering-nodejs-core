const fs = require('fs');

const content1 = 
`This file was generated to demonstrate synchronous file writing in Node.js.

Node.js is a powerful, event-driven, non-blocking runtime environment that allows developers to build scalable server-side applications with JavaScript.
`;

try {
    fs.writeFileSync("../output/AsyncFile/test-write-file.txt", content1);
    console.log("File written successfully.");
} catch (e) {
    console.log("Failed to write file:", e.message);
}


const content2 = 
`This file was created as part of a demonstration on synchronous file writing in Node.js.

Node.js is a high-performance, event-driven, and non-blocking JavaScript runtime built on the V8 engine. 
It enables developers to build fast, scalable, and efficient server-side applications using JavaScript. 

This example showcases how to write text content to a file using the fs.writeFileSync() method.
`;


try {
    fs.writeFileSync("../output/AsyncFile/test-write-Async_file.txt", content2);
    console.log("File written successfully.");
} catch (e) {
    console.log("Failed to write file:", e.message);
}
