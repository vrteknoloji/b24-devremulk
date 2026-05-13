const HTML = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8"/>
  <title>Devremülk — Kurulum</title>
  <script src="//api.bitrix24.com/api/v1/" type="text/javascript"><\/script>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;min-height:100vh}
    .box{background:#fff;border-radius:12px;padding:32px;max-width:520px;width:100%;box-shadow:0 2px 8px rgba(0,0,0,.12);text-align:center}
    h2{margin-bottom:8px;color:#1e293b;font-size:18px}
    p{color:#64748b;margin-bottom:20px;font-size:13px;line-height:1.5}
    .btn{padding:11px 28px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:background .15s;margin:4px}
    .btn:hover{background:#1d4ed8}
    .btn:disabled{background:#94a3b8;cursor:not-allowed}
    .btn-red{background:#dc2626}.btn-red:hover{background:#b91c1c}
    .log{text-align:left;margin-top:16px;background:#0f172a;border-radius:8px;padding:12px;font-size:12px;font-family:monospace;max-height:240px;overflow-y:auto;color:#e2e8f0}
    .ok{color:#4ade80}.err{color:#f87171}.info{color:#94a3b8}.warn{color:#fbbf24}
    .step{color:#60a5fa}
    #status-icon{font-size:48px;margin-bottom:12px}
  </style>
</head>
<body>
<div class="box">
  <div id="status-icon">🏖️</div>
  <h2 id="title">Devremülk Yönetimi</h2>
  <p id="subtitle">Deal sayfasına sekme olarak eklemek için aşağıdaki butona tıklayın.</p>
  <button class="btn" id="installBtn" onclick="kurulum()">⚙️ Kurulumu Başlat</button>
  <button class="btn btn-red" id="removeBtn" onclick="kaldir()" style="display:none">🗑️ Kaydı Sil</button>
  <br/><br/>
  <a id="admin-link" href="#" onclick="adminAc()" style="font-size:13px;color:#2563eb;text-decoration:none">🔑 Yönetici Paneli (Tesis Yönetimi)</a>
  <div class="log" id="log"></div>
</div>
<script>
var HANDLER_BASE = '';
function log(msg, cls) {
  var el = document.getElementById('log');
  var d = document.createElement('div');
  d.className = cls || 'info';
  d.textContent = (new Date().toLocaleTimeString('tr-TR')) + ' › ' + msg;
  el.appendChild(d);
  el.scrollTop = el.scrollHeight;
}
function setStatus(icon, title, sub) {
  document.getElementById('status-icon').textContent = icon;
  document.getElementById('title').textContent = title;
  if(sub) document.getElementById('subtitle').textContent = sub;
}
BX24.init(function() {
  log('BX24 SDK başlatıldı ✓', 'ok');
  var base = window.location.href.split('/install.html')[0];
  if (base === window.location.href) base = window.location.origin;
  HANDLER_BASE = base;
  log('Handler base: ' + base, 'step');
  BX24.callMethod('placement.get', { PLACEMENT: 'CRM_DEAL_DETAIL_TAB' }, function(r) {
    if (!r.error()) {
      var list = r.data();
      log('Kayıtlı placement: ' + list.length, 'info');
      if (list.length > 0) {
        list.forEach(function(p) { log('  Kayıtlı: ' + p.handler, 'warn'); });
        document.getElementById('removeBtn').style.display = 'inline-block';
      }
    } else {
      log('placement.get hatası: ' + r.error_description(), 'warn');
    }
  });
});
window.adminAc = function() {
  window.open(HANDLER_BASE + '/admin.html', '_blank');
};
window.kurulum = function() {
  var btn = document.getElementById('installBtn');
  btn.disabled = true;
  btn.textContent = '⏳ Kaydediliyor...';
  var handlerUrl = HANDLER_BASE + '/index.html';
  log('HANDLER: ' + handlerUrl, 'info');
  BX24.callMethod('placement.bind', {
    PLACEMENT: 'CRM_DEAL_DETAIL_TAB',
    HANDLER: handlerUrl,
    TITLE: '🏖️ Devremülk',
    DESCRIPTION: 'Devremülk satış yönetimi'
  }, function(res) {
    if (res.error()) {
      log('HATA: ' + (res.error_description ? res.error_description() : res.error()), 'err');
      btn.disabled = false;
      btn.textContent = '🔄 Tekrar Dene';
    } else {
      log('placement.bind BAŞARILI ✓', 'ok');
      BX24.installFinish();
      log('✅ Kurulum tamamlandı!', 'ok');
      setStatus('✅', 'Kurulum Tamamlandı!', 'Deal sayfalarını yenileyin.');
      btn.textContent = '✅ Tamamlandı';
      document.getElementById('removeBtn').style.display = 'inline-block';
    }
  });
};
window.kaldir = function() {
  if (!confirm('Placement kaydını silmek istediğinizden emin misiniz?')) return;
  BX24.callMethod('placement.unbind', {
    PLACEMENT: 'CRM_DEAL_DETAIL_TAB',
    HANDLER: HANDLER_BASE + '/index.html'
  }, function(res) {
    if (res.error()) {
      log('unbind HATA: ' + res.error_description(), 'err');
    } else {
      log('Kayıt silindi.', 'warn');
      document.getElementById('installBtn').disabled = false;
      document.getElementById('installBtn').textContent = '⚙️ Kurulumu Başlat';
      document.getElementById('removeBtn').style.display = 'none';
    }
  });
};
<\/script>
</body>
</html>`;

exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body: HTML
  };
};

