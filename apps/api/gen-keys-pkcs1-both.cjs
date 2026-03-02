const crypto = require('crypto');
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    // CHANGE PUBLIC KEY TO PKCS1 AS WELL
    publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
});

const b64Priv = Buffer.from(privateKey).toString('base64');
const b64Pub = Buffer.from(publicKey).toString('base64');

console.log('---PRIVATE---');
console.log(b64Priv);

console.log('---PUBLIC---');
console.log(b64Pub);

console.log('---TESTING---');
const fastifyJwt = require('@fastify/jwt')
const Fastify = require('fastify')

const priv = Buffer.from(b64Priv, 'base64').toString('utf8')
const pub = Buffer.from(b64Pub, 'base64').toString('utf8')

const app = Fastify()
app.register(fastifyJwt, {
    secret: { private: priv, public: pub },
    sign: { algorithm: 'RS256' }
}).ready((err) => {
    if (err) {
        console.error('FASTIFY JWT BOOT ERROR:', err)
        process.exit(1)
    } else {
        console.log('FASTIFY JWT PERFECTLY LOADED WITH PKCS1!')
        process.exit(0)
    }
})
