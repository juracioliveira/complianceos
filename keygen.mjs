import fs from 'fs';
import crypto from 'crypto';

console.log("Generating RSA keypair...");
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

const privateB64 = Buffer.from(privateKey).toString('base64');
const publicB64 = Buffer.from(publicKey).toString('base64');

let content = fs.readFileSync('.env.local', 'utf-8');
content = content.replace('JWT_PRIVATE_KEY_BASE64=STUB_DEV_JWT_PRIVATE', `JWT_PRIVATE_KEY_BASE64=${privateB64}`);
content = content.replace('JWT_PUBLIC_KEY_BASE64=STUB_DEV_JWT_PUBLIC', `JWT_PUBLIC_KEY_BASE64=${publicB64}`);
fs.writeFileSync('.env.local', content);
console.log("Updated .env.local with new keys.");
