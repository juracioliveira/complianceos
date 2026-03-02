import pino from 'pino';
import dotenv from 'dotenv';
dotenv.config();

export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    ...(process.env.NODE_ENV !== 'production' ? {
        transport: {
            target: 'pino-pretty',
        }
    } : {})
});
