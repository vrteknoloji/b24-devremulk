const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  let html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
  // Cache buster: her istekte dinamik timestamp inject et
  const ts = Date.now();
  html = html.replace('</title>', '</title><meta name="build-ts" content="' + ts + '">');
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Surrogate-Control': 'no-store',
      'Expires': '0'
    },
    body: html
  };
};
