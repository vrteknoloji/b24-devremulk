const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body: html
  };
};
