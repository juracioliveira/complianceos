import AWS from 'aws-sdk'

const endpoint = process.env['MINIO_SERVER_URL']
const accessKeyId = process.env['MINIO_ROOT_USER']
const secretAccessKey = process.env['MINIO_ROOT_PASSWORD']

if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error('Variáveis de ambiente obrigatórias ausentes: MINIO_SERVER_URL, MINIO_ROOT_USER, MINIO_ROOT_PASSWORD')
}

const region = process.env['MINIO_REGION'] || 'us-east-1'

const s3 = new AWS.S3({
    endpoint,
    accessKeyId,
    secretAccessKey,
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
    region,
})

export const storage = {
    async getPresignedDownloadUrl(bucket: string, key: string, expiresSeconds = 900): Promise<string> {
        return s3.getSignedUrlPromise('getObject', {
            Bucket: bucket,
            Key: key,
            Expires: expiresSeconds,
        })
    },

    async getPresignedUploadUrl(bucket: string, key: string, expiresSeconds = 900): Promise<string> {
        return s3.getSignedUrlPromise('putObject', {
            Bucket: bucket,
            Key: key,
            Expires: expiresSeconds,
        })
    },

    async deleteObject(bucket: string, key: string): Promise<void> {
        await s3.deleteObject({
            Bucket: bucket,
            Key: key,
        }).promise()
    },

    async checkBucket(bucket: string): Promise<boolean> {
        try {
            await s3.headBucket({ Bucket: bucket }).promise()
            return true
        } catch (err: any) {
            if (err.statusCode === 404) {
                return false
            }
            throw err
        }
    },

    async createBucket(bucket: string): Promise<void> {
        await s3.createBucket({ Bucket: bucket }).promise()
    }
}
