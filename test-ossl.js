const crypto = require('crypto');
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
});

const pubB64 = Buffer.from(publicKey).toString('base64');
const privB64 = Buffer.from(privateKey).toString('base64');

const cleanB64 = (val) => val ? val.replace(/["'\s]/g, '') : ''

const decodedPriv = Buffer.from(cleanB64(privB64), 'base64').toString('utf8');
console.log('DECODED PKCS1:');
console.log(decodedPriv);

try {
    crypto.createPrivateKey(decodedPriv);
    console.log('PKCS1 createPrivateKey SUCCESS!');
} catch (e) {
    console.error('PKCS1 FAILED:', e);
}

const { privateKey: priv8 } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});
const priv8B64 = Buffer.from(priv8).toString('base64');
const decodedPriv8 = Buffer.from(cleanB64(priv8B64), 'base64').toString('utf8');
console.log('\DECODED PKCS8:');
console.log(decodedPriv8);
try {
    crypto.createPrivateKey(decodedPriv8);
    console.log('PKCS8 createPrivateKey SUCCESS!');
} catch (e) {
    console.error('PKCS8 FAILED:', e);
}
