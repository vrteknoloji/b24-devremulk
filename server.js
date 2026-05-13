const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3456;
const DIR = __dirname;

// CORS + parse body
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Bitrix24 POST isteklerini de kabul et — aynı HTML'i döndür
app.all('/:file', (req, res) => {
  const file = req.params.file;
  const filePath = path.join(DIR, file);
  if (fs.existsSync(filePath)) {
    console.log(`[${req.method}] /${file}`);
    res.sendFile(filePath);
  } else {
    res.status(404).send('Not found');
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server çalışıyor: http://localhost:${PORT}`);
  console.log(`📁 Dizin: ${DIR}`);
});
