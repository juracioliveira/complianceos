import unzipper from 'unzipper';
import iconv from 'iconv-lite';
import fs from 'fs';
import { logger } from '../utils/logger.js';
import { Transform } from 'stream';

export function createCleanCsvTransform() {
    let leftover = '';

    return new Transform({
        transform(chunk, encoding, callback) {
            const text = leftover + chunk.toString('utf8');
            const lines = text.split('\n');
            leftover = lines.pop() || ''; // keep the last incomplete line for the next chunk

            for (const line of lines) {
                if (!line.trim()) continue;

                // Very basic clean up: replace multiple occurrences of empty fields that may break Postgres
                const cleaned = line.replace(/;{2,}/g, (match) => ';'.repeat(match.length));
                this.push(cleaned + '\n');
            }
            callback();
        },
        flush(callback) {
            if (leftover.trim()) {
                this.push(leftover + '\n');
            }
            callback();
        }
    });
}

// Extracts a ZIP and returns the specific readable stream of the inner CSV already converted from latin1 to utf8
export async function getExtractedStream(zipFilePath: string): Promise<{ stream: NodeJS.ReadableStream, filename: string } | null> {
    const directory = await unzipper.Open.file(zipFilePath);

    if (directory.files.length === 0) {
        logger.warn(`ZIP file ${zipFilePath} is empty.`);
        return null;
    }

    const file = directory.files[0];
    if (!file) return null;

    logger.info(`Found internal file: ${file.path} inside ${zipFilePath}`);

    // Create stream pipeline: ZIP -> Latin1 Decode -> UTF8 Encode -> Clean string
    const rawStream = file.stream();

    const utf8Stream = rawStream
        .pipe(iconv.decodeStream('latin1'))
        .pipe(iconv.encodeStream('utf8'))
        .pipe(createCleanCsvTransform());

    return {
        stream: utf8Stream,
        filename: file.path,
    };
}
