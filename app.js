/* =============================================
   DEVREMÜLK BİTRİX24 APP - JavaScript
   ============================================= */

// ── Uygulama durumu ──────────────────────────────────────────────
const STATE = {
  dealId: null,
  deal: null,
  contact: null,
  user: null,
};

// ── BX24 başlangıç ───────────────────────────────────────────────
BX24.init(function () {
  BX24.fitWindow();

  // Deal ID'yi URL parametresinden ya da placement'tan al
  const placement = BX24.placement.info();
  STATE.dealId = placement?.options?.ID || getUrlParam('DEAL_ID') || getUrlParam('ID');

  if (!STATE.dealId) {
    showError('Deal ID bulunamadı. Lütfen uygulamayı bir Deal üzerinden açın.');
    return;
  }

  yukle();
});

// ── Ana yükleme akışı ────────────────────────────────────────────
async function yukle() {
  try {
    await Promise.all([fetchDeal(), fetchCurrentUser()]);
    renderApp();
    belgeleriYukle();
    goster('main-panel');
    gizle('loading');
    BX24.fitWindow();
  } catch (e) {
    showError('Veriler yüklenirken hata oluştu: ' + e.message);
  }
}

// ── CRM Deal getir ───────────────────────────────────────────────
function fetchDeal() {
  return new Promise((resolve, reject) => {
    BX24.callMethod('crm.deal.get', { id: STATE.dealId }, function (res) {
      if (res.error()) {
        reject(new Error(res.error_description()));
        return;
      }
      STATE.deal = res.data();

      // Contact bilgisi de getir (varsa)
      if (STATE.deal.CONTACT_ID) {
        BX24.callMethod('crm.contact.get', { id: STATE.deal.CONTACT_ID }, function (r) {
          if (!r.error()) {
            STATE.contact = r.data();
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  });
}

// ── Giriş yapan kullanıcı ────────────────────────────────────────
function fetchCurrentUser() {
  return new Promise((resolve) => {
    BX24.callMethod('user.current', {}, function (res) {
      if (!res.error()) STATE.user = res.data();
      resolve();
    });
  });
}

// ── Arayüzü doldur ───────────────────────────────────────────────
function renderApp() {
  const d = STATE.deal;
  const c = STATE.contact;

  // Deal bilgileri (readonly)
  set('field-deal-id', d.ID);
  set('field-opportunity', formatPara(d.OPPORTUNITY, d.CURRENCY_ID));
  set('deal-name', d.TITLE || `Deal #${d.ID}`);

  // Sorumlu kişi
  if (d.ASSIGNED_BY_ID) {
    BX24.callMethod('user.get', { ID: d.ASSIGNED_BY_ID }, function (r) {
      if (!r.error()) {
        const u = r.data()[0];
        set('field-assigned', `${u.NAME} ${u.LAST_NAME}`);
      }
    });
  }

  // Müşteri adı
  if (c) {
    set('field-contact-name', `${c.NAME || ''} ${c.LAST_NAME || ''}`.trim());
  } else if (d.COMPANY_ID) {
    BX24.callMethod('crm.company.get', { id: d.COMPANY_ID }, function (r) {
      if (!r.error()) set('field-contact-name', r.data().TITLE);
    });
  }

  // Deal aşaması → badge
  const badge = document.getElementById('status-badge');
  const stage = d.STAGE_ID || '';
  badge.textContent = stage;
  if (stage.includes('WON'))        badge.className = 'badge success';
  else if (stage.includes('LOSE'))  badge.className = 'badge danger';
  else                              badge.className = 'badge';

  // Özel alanlarda kayıtlı veri varsa doldur
  loadCustomFields(d);
}

// ── Özel alan mapping ────────────────────────────────────────────
// Bitrix24'te kendi UF_ alanlarını oluşturup buraya map'leyin.
// Yoksa localStorage ile demo amaçlı tutulur.
const FIELD_MAP = {
  'field-tesis':       'UF_CRM_TESIS_ADI',
  'field-unite':       'UF_CRM_UNITE_NO',
  'field-hafta':       'UF_CRM_HAFTA_NO',
  'field-oda-tipi':    'UF_CRM_ODA_TIPI',
  'field-sehir':       'UF_CRM_SEHIR',
  'field-yildiz':      'UF_CRM_YILDIZ',
  'field-mulk-tipi':   'UF_CRM_MULK_TIPI',
  'field-sezon':       'UF_CRM_SEZON',
  'field-notlar':      'UF_CRM_NOTLAR',
  'field-satis-fiyati':'UF_CRM_SATIS_FIYATI',
  'field-pesinat':     'UF_CRM_PESINAT',
  'field-taksit':      'UF_CRM_TAKSIT',
  'field-faiz':        'UF_CRM_FAIZ',
  'field-sozlesme-no': 'UF_CRM_SOZLESME_NO',
  'field-tapu-tarihi': 'UF_CRM_TAPU_TARIHI',
  'field-tapu-durum':  'UF_CRM_TAPU_DURUM',
};

const CHECKBOX_MAP = {
  'f-deniz':    'UF_CRM_OZ_DENIZ',
  'f-havuz':    'UF_CRM_OZ_HAVUZ',
  'f-spa':      'UF_CRM_OZ_SPA',
  'f-cocuk':    'UF_CRM_OZ_COCUK',
  'f-restoran': 'UF_CRM_OZ_RESTORAN',
  'f-otopark':  'UF_CRM_OZ_OTOPARK',
  'f-wifi':     'UF_CRM_OZ_WIFI',
  'f-klima':    'UF_CRM_OZ_KLIMA',
};

function loadCustomFields(d) {
  Object.entries(FIELD_MAP).forEach(([elId, bxField]) => {
    const val = d[bxField];
    if (val !== undefined && val !== null) {
      const el = document.getElementById(elId);
      if (el) el.value = val;
    }
  });

  Object.entries(CHECKBOX_MAP).forEach(([elId, bxField]) => {
    const val = d[bxField];
    const el = document.getElementById(elId);
    if (el && val) el.checked = (val === '1' || val === true || val === 'Y');
  });
}

// ── Kaydet ───────────────────────────────────────────────────────
function kaydet() {
  const fields = {};

  Object.entries(FIELD_MAP).forEach(([elId, bxField]) => {
    const el = document.getElementById(elId);
    if (el) fields[bxField] = el.value;
  });

  Object.entries(CHECKBOX_MAP).forEach(([elId, bxField]) => {
    const el = document.getElementById(elId);
    if (el) fields[bxField] = el.checked ? 'Y' : 'N';
  });

  setSaveStatus('Kaydediliyor...');

  BX24.callMethod('crm.deal.update', {
    id: STATE.dealId,
    fields: fields,
  }, function (res) {
    if (res.error()) {
      setSaveStatus('');
      showToast('❌ Kayıt hatası: ' + res.error_description(), 'error');
    } else {
      setSaveStatus('✅ Kaydedildi');
      showToast('✅ Bilgiler başarıyla kaydedildi!', 'success');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  });
}

// ── Yenile ───────────────────────────────────────────────────────
function yenile() {
  gizle('main-panel');
  goster('loading');
  yukle();
}

// ── Ödeme hesapla ────────────────────────────────────────────────
function hesaplaOdeme() {
  const satisFiyati = parseFloat(document.getElementById('field-satis-fiyati').value) || 0;
  const pesinat     = parseFloat(document.getElementById('field-pesinat').value) || 0;
  const taksitSayisi= parseInt(document.getElementById('field-taksit').value) || 0;
  const faiz        = parseFloat(document.getElementById('field-faiz').value) || 0;

  if (!satisFiyati) { showToast('Lütfen satış fiyatını girin.', 'error'); return; }

  const kalan = satisFiyati - pesinat;

  let aylikTaksit = 0;
  let toplamOdenecek = satisFiyati;

  if (taksitSayisi > 0 && kalan > 0) {
    if (faiz > 0) {
      const aylikFaiz = faiz / 100 / 12;
      aylikTaksit = kalan * (aylikFaiz * Math.pow(1 + aylikFaiz, taksitSayisi))
                          / (Math.pow(1 + aylikFaiz, taksitSayisi) - 1);
    } else {
      aylikTaksit = kalan / taksitSayisi;
    }
    toplamOdenecek = pesinat + (aylikTaksit * taksitSayisi);
  }

  document.getElementById('sonuc-pesinat').textContent  = formatPara(pesinat, 'TRY');
  document.getElementById('sonuc-kalan').textContent    = formatPara(kalan, 'TRY');
  document.getElementById('sonuc-taksit').textContent   = taksitSayisi > 0 ? formatPara(aylikTaksit, 'TRY') : 'Peşin';
  document.getElementById('sonuc-toplam').textContent   = formatPara(toplamOdenecek, 'TRY');

  goster('odeme-sonuc');
  odemeTakvimiOlustur(pesinat, aylikTaksit, taksitSayisi, faiz);
}

function odemeTakvimiOlustur(pesinat, aylikTaksit, taksitSayisi, faiz) {
  const container = document.getElementById('odeme-takvim-container');

  if (taksitSayisi === 0) {
    container.innerHTML = '<p class="empty-state">Peşin ödeme seçildi.</p>';
    return;
  }

  const bugun = new Date();
  let html = `
    <div style="max-height:260px;overflow-y:auto">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Tarih</th>
          <th>Taksit Tutarı</th>
          <th>Durum</th>
        </tr>
      </thead>
      <tbody>
  `;

  for (let i = 1; i <= taksitSayisi; i++) {
    const tarih = new Date(bugun.getFullYear(), bugun.getMonth() + i, 1);
    const gecti = tarih < bugun;
    html += `
      <tr>
        <td>${i}</td>
        <td>${tarih.toLocaleDateString('tr-TR', { year:'numeric', month:'long' })}</td>
        <td>${formatPara(aylikTaksit, 'TRY')}</td>
        <td><span style="font-size:11px;padding:2px 7px;border-radius:10px;background:${gecti?'#dcfce7':'#fef3c7'};color:${gecti?'#16a34a':'#d97706'};font-weight:600">${gecti?'Ödendi':'Bekliyor'}</span></td>
      </tr>
    `;
  }

  html += '</tbody></table></div>';
  container.innerHTML = html;
}

// ── Belgeler ─────────────────────────────────────────────────────
const BELGELER = [
  { id: 'b1', ad: 'Kimlik Fotokopisi',          zorunlu: true },
  { id: 'b2', ad: 'Gelir Belgesi / Maaş Pusulası', zorunlu: true },
  { id: 'b3', ad: 'İkametgah Belgesi',           zorunlu: true },
  { id: 'b4', ad: 'Satış Sözleşmesi',            zorunlu: true },
  { id: 'b5', ad: 'Ön Bilgilendirme Formu',      zorunlu: true },
  { id: 'b6', ad: 'Tapu / Kat Mülkiyeti Belgesi',zorunlu: false },
  { id: 'b7', ad: 'Cayma Hakkı Belgesi',         zorunlu: false },
  { id: 'b8', ad: 'Vekaletname (varsa)',          zorunlu: false },
];

function belgeleriYukle() {
  const container = document.getElementById('belge-list');
  container.innerHTML = BELGELER.map(b => `
    <div class="belge-item" id="belge-${b.id}">
      <input type="checkbox" id="${b.id}" onchange="belgeToggle('${b.id}')" />
      <label for="${b.id}">${b.ad}</label>
      <span class="belge-badge" id="badge-${b.id}">${b.zorunlu ? 'Zorunlu' : 'İsteğe Bağlı'}</span>
    </div>
  `).join('');
}

function belgeToggle(id) {
  const cb   = document.getElementById(id);
  const item = document.getElementById('belge-' + id);
  if (cb.checked) item.classList.add('tamamlandi');
  else            item.classList.remove('tamamlandi');
}

// ── Tab yönetimi ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const tab = this.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      this.classList.add('active');
      document.getElementById('tab-' + tab).classList.remove('hidden');
      BX24.fitWindow();
    });
  });
});

// ── Yardımcı fonksiyonlar ─────────────────────────────────────────
function set(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val ?? '';
}

function goster(id) { document.getElementById(id)?.classList.remove('hidden'); }
function gizle(id)  { document.getElementById(id)?.classList.add('hidden'); }

function setSaveStatus(msg) {
  const el = document.getElementById('save-status');
  if (el) el.textContent = msg;
}

function formatPara(sayi, para) {
  if (!sayi && sayi !== 0) return '—';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: para || 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parseFloat(sayi));
}

function getUrlParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

let toastTimer = null;
function showToast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3500);
}

function showError(msg) {
  gizle('loading');
  document.getElementById('app').innerHTML = `
    <div style="padding:32px;text-align:center;color:#dc2626">
      <p style="font-size:28px;margin-bottom:12px">⚠️</p>
      <p style="font-weight:600">${msg}</p>
    </div>`;
}
