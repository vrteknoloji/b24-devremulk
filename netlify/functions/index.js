const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  // Netlify Functions'da process.cwd() proje kökünü verir
  let html;
  const possiblePaths = [
    path.join(process.cwd(), 'index.html'),
    path.join(__dirname, '..', '..', 'index.html'),
    '/var/task/index.html'
  ];
  for (const p of possiblePaths) {
    try { html = fs.readFileSync(p, 'utf8'); break; } catch(e) {}
  }
  if (!html) return { statusCode: 500, body: 'index.html bulunamadı: ' + possiblePaths.join(', ') };
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body: html
  };
};
