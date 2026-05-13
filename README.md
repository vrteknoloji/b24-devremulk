# 🏖️ Devremülk Yönetimi — Bitrix24 Local App

## Dosya Yapısı
```
b24 devremülk/
├── index.html       ← Ana uygulama (Bitrix24'e bu dosya yüklenir)
├── style.css        ← Stil dosyası
├── app.js           ← BX24 JS SDK + uygulama mantığı
└── manifest.json    ← Uygulama meta bilgisi (referans)
```

---

## Bitrix24'e Yükleme Adımları

### 1. Local App Ekle
`Bitrix24 → Uygulamalar → Geliştirici Kaynakları → Yerel Uygulama Ekle`

### 2. Uygulama Ayarları
| Alan | Değer |
|------|-------|
| Uygulama Adı | Devremülk Yönetimi |
| Placement | `CRM_DEAL_DETAIL_TAB` |
| Tab Başlığı | 🏖️ Devremülk |
| Handler URL | `https://SUNUCU_URL/index.html` |

### 3. İzinler (Scope)
- `crm` — Deal okuma/yazma
- `user` — Kullanıcı bilgisi

---

## Özel Alanlar (UF_ Fields)

Deal üzerinde şu özel alanları oluşturmanız gerekir (`CRM → Ayarlar → Deal Alanları`):

| Alan Adı | Tür | Label |
|----------|-----|-------|
| `UF_CRM_TESIS_ADI` | String | Tesis Adı |
| `UF_CRM_UNITE_NO` | String | Ünite No |
| `UF_CRM_HAFTA_NO` | String | Hafta No |
| `UF_CRM_ODA_TIPI` | String | Oda Tipi |
| `UF_CRM_SEHIR` | String | Şehir |
| `UF_CRM_YILDIZ` | String | Yıldız |
| `UF_CRM_MULK_TIPI` | String | Mülk Tipi |
| `UF_CRM_SEZON` | String | Sezon |
| `UF_CRM_NOTLAR` | Text | Notlar |
| `UF_CRM_SATIS_FIYATI` | Double | Satış Fiyatı |
| `UF_CRM_PESINAT` | Double | Peşinat |
| `UF_CRM_TAKSIT` | Integer | Taksit Sayısı |
| `UF_CRM_FAIZ` | Double | Faiz Oranı |
| `UF_CRM_SOZLESME_NO` | String | Sözleşme No |
| `UF_CRM_TAPU_TARIHI` | Date | Tapu Tarihi |
| `UF_CRM_TAPU_DURUM` | String | Tapu Durumu |
| `UF_CRM_OZ_DENIZ` | Boolean | Denize Sıfır |
| `UF_CRM_OZ_HAVUZ` | Boolean | Havuz |
| `UF_CRM_OZ_SPA` | Boolean | SPA |
| `UF_CRM_OZ_COCUK` | Boolean | Çocuk Kulübü |
| `UF_CRM_OZ_RESTORAN` | Boolean | Restoran |
| `UF_CRM_OZ_OTOPARK` | Boolean | Otopark |
| `UF_CRM_OZ_WIFI` | Boolean | Wi-Fi |
| `UF_CRM_OZ_KLIMA` | Boolean | Klima |

---

## Test (Lokal)
Dosyaları bir web sunucusu ile servis edin (örn. ngrok + http-server):
```bash
npx http-server . -p 3000
ngrok http 3000
# Çıkan URL'yi Bitrix24 handler URL'si olarak girin
```
