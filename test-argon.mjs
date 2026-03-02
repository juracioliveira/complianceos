import { hash, verify } from '@node-rs/argon2'

async function test() {
    const password = 'Senha@Compliance2026'
    const passwordHash = await hash(password, {
        algorithm: 1, // Argon2id
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
    })

    console.log('Hash:', passwordHash)

    const isValid = await verify(passwordHash, password)
    console.log('Is valid:', isValid)
}

test()
