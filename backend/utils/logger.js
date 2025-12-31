import fs from "fs";
import path from "path";

const logDir = path.join(process.cwd(), "logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFile = path.join(logDir, "app.log");

export const logger = {
  info: (message) => {
    fs.appendFileSync(logFile, `[INFO] ${new Date().toISOString()} - ${message}\n`);
  },
  warn: (message) => {
    fs.appendFileSync(logFile, `[WARN] ${new Date().toISOString()} - ${message}\n`);
  },
  error: (message) => {
    fs.appendFileSync(logFile, `[ERROR] ${new Date().toISOString()} - ${message}\n`);
  }
};
