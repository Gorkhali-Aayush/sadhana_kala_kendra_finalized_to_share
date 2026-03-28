import fs from "fs";
import path from "path";
import { promises as fsPromises } from "fs";

const logDir = path.join(process.cwd(), "logs");

// Ensure logs directory exists synchronously on startup
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, "app.log");

/**
 * Format log message with timestamp and level
 * @param {string} level - Log level (INFO, WARN, ERROR)
 * @param {string} message - Log message
 * @returns {string} - Formatted log entry
 */
const formatLogMessage = (level, message) => {
  return `[${level}] ${new Date().toISOString()} - ${message}\n`;
};

/**
 * Write log asynchronously to prevent event loop blocking
 * Falls back to console if file write fails
 * @param {string} message - Formatted log message
 */
const writeLogAsync = async (message) => {
  try {
    await fsPromises.appendFile(logFile, message);
  } catch (err) {
    // Fallback: log to console if file write fails
    console.error("Failed to write to log file:", err.message);
    console.log(message);
  }
};

export const logger = {
  info: (message) => {
    const formattedMessage = formatLogMessage("INFO", message);
    writeLogAsync(formattedMessage).catch((err) => {
      console.error("Async logging error:", err);
    });
  },
  warn: (message) => {
    const formattedMessage = formatLogMessage("WARN", message);
    writeLogAsync(formattedMessage).catch((err) => {
      console.error("Async logging error:", err);
    });
  },
  error: (message, stack = null) => {
    const fullMessage = stack ? `${message}\nStack: ${stack}` : message;
    const formattedMessage = formatLogMessage("ERROR", fullMessage);
    writeLogAsync(formattedMessage).catch((err) => {
      console.error("Async logging error:", err);
    });
  },
};
