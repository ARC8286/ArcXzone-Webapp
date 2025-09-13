const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const rfs = require('rotating-file-stream');

const logDirectory = path.join(__dirname, '../../logs');

// Ensure log directory exists
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// Create a rotating write stream for access logs
const accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  path: logDirectory
});

const devFormat = ':method :url :status :response-time ms - :res[content-length]';
const prodFormat = 'combined'; // standard Apache combined log format

const logger = morgan(process.env.NODE_ENV === 'production' ? prodFormat : devFormat, {
  stream: process.env.NODE_ENV === 'production' ? accessLogStream : process.stdout
});

module.exports = logger;