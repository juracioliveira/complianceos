import pLimit from 'p-limit';
import path from 'path';
import fs from 'fs';
import { pipeline } from 'stream/promises';
import { logger } from '../utils/logger.js';

// Dynamic import for got since it's ESM only and we might be compiling differently,
// but we set "type":"module" in package.json, so direct import works.
import got from 'got';

export async function downloadFile(url: string, destFolder: string, fileName: string): Promise<string> {
    const destPath = path.join(destFolder, fileName);

    if (!fs.existsSync(destFolder)) {
        fs.mkdirSync(destFolder, { recursive: true });
    }

    // Resume capability
    let startByte = 0;
    if (fs.existsSync(destPath)) {
        const stat = fs.statSync(destPath);
        startByte = stat.size;
        // Simple check: if file is reasonably large, we might consider it done if no content-length check.
        // Real implementation would HEAD the URL and check content-length matching stat.size.
    }

    logger.info({ url, fileName, startByte }, 'Starting download...');

    const downloadStream = got.stream(url, {
        headers: startByte > 0 ? { Range: `bytes=${startByte}-` } : {},
        retry: {
            limit: Number(process.env.RFB_DOWNLOAD_RETRIES || 5),
        },
    });

    downloadStream.on('response', (res) => {
        if (res.statusCode === 206) {
            logger.info(`Resuming download ${fileName} from ${startByte} bytes`);
        } else if (res.statusCode === 200) {
            if (startByte > 0) {
                logger.info(`Server did not support resume for ${fileName}, restarting from 0.`);
                startByte = 0; // The stream will overwrite since we use createWriteStream without flags 'a' if not 206. But actually pipeline overwrites by default unless flags:'a'
            }
        }
    });

    const fileWriteStream = fs.createWriteStream(destPath, { flags: startByte > 0 ? 'a' : 'w' });

    try {
        await pipeline(downloadStream, fileWriteStream);
        logger.info(`Download completed: ${fileName}`);
        return destPath;
    } catch (error) {
        logger.error({ url, fileName, error }, 'Error downloading file');
        throw error;
    }
}
