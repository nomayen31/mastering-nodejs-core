const crypto = require("crypto");


const algorithom = 'aes-256-cbc'

const key = crypto.randomBytes(32)
const iv = crypto.randomBytes(16)   

const encryptor = crypto.createCipheriv(algorithom, key, iv)
const decryptor = crypto.createDecipheriv(algorithom, key, iv)

let encryptedData = encryptor.update('Hello, World!', 'utf-8', 'hex')
encryptedData += encryptor.final('hex')

let decryptedData = decryptor.update(encryptedData, 'hex', 'utf-8')
decryptedData += decryptor.final('utf-8')

console.log('Encrypted Data:', encryptedData)
console.log('Decrypted Data:', decryptedData)   