const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  // Netlify functions dizini: netlify/functions/install.js
  // install.html: proje kökünde
  const htmlPath = path.join(__dirname, '..', '..', 'install.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body: html
  };
};
