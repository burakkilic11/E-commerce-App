const winston = require('winston');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const logDir = process.env.LOG_DIR || path.resolve(__dirname, '../../logs');
const logLevel = process.env.NODE_ENV === 'development' ? 'debug' : 'info';

// Log klasörü yoksa oluştur
const fs = require('fs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logger = winston.createLogger({
    level: logLevel,
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }), // Hata stack'lerini logla
        winston.format.splat(),
        winston.format.json() // Logları JSON formatında tut
    ),
    defaultMeta: { service: 'user-service' }, // Tüm loglara eklenecek varsayılan metadata
    transports: [
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        // - Write all logs with importance level of `info` or less to `combined.log`
        //
        new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(logDir, 'combined.log') }),
    ],
});

//
// Eğer üretimde değilsek, konsola da log basalım.
// Formatı daha okunabilir yapalım (simple format).
//
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        ),
    }));
}

module.exports = logger;