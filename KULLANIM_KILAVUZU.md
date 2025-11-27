# 📚 Kelime Kartları - Kullanım Kılavuzu

## 🎯 Yeni Özellikler

### 1. ✅ Biliyorum/Bilmiyorum/Kararsızım Sistemi
Her kartı gördükten sonra 3 butondan biriyle kelimeyi değerlendirin:
- **❌ Bilmiyorum (1)**: Kelime aynı gün içinde tekrar gösterilecek
- **⚠️ Kararsızım (2)**: Kelime yarın tekrar gösterilecek
- **✅ Biliyorum (3)**: Kelime 3-7-14 gün sonra tekrar gösterilecek

**Klavye Kısayolları:**
- `1` tuşu: Bilmiyorum
- `2` tuşu: Kararsızım
- `3` tuşu: Biliyorum

### 2. 📊 Günlük Dashboard
Sayfanın üstünde 4 önemli istatistiği görebilirsiniz:
- **Yeni Kelime**: Bugün kaç yeni kelime öğrendiniz / Günlük hedef (20)
- **Bugün Tekrar**: Bugün tekrar edilmesi gereken kelime sayısı
- **Tamamlanan**: Bugün kaç tekrar yaptınız
- **Öğrenilen**: Toplam kaç kelimeyi tamamen öğrendiniz

### 3. 🧠 Spaced Repetition (Aralıklı Tekrar)
Sistem artık kelimeleri öğrenme durumunuza göre akıllıca sıralar:
- Bilmediğiniz kelimeler sık sık gösterilir
- Bildiğiniz kelimeler giderek seyrekleşir
- 3 kez üst üste "Biliyorum" diyip 14+ gün sonraya ertelenen kelimeler "Öğrenildi" statüsüne geçer

**Zorluk Seviyeleri:**
- **Zor (Kırmızı)**: Aynı gün içinde tekrar gösterilir
- **Orta (Sarı)**: 1-3 gün sonra gösterilir
- **Kolay (Yeşil)**: 7-14 gün sonra gösterilir

### 4. 🔥 Zor Kelimeler Modu
Mod seçim butonlarında "🔥 Zor Kelimeler" butonuna tıklayın:
- Sadece zorlandığınız kelimeler gösterilir
- Başarı oranı %40'ın altında olan kelimeler
- 2 kez üst üste doğru bilmediğiniz kelimeler
- "Zor" olarak işaretli kelimeler

**Kullanım Önerisi**: Sınavdan 5-10 gün önce bu modu kullanarak zayıf noktalarınızı pekiştirin.

## 🎮 Klavye Kontrolleri

| Tuş | İşlev |
|-----|-------|
| `←` (Sol Ok) | Önceki kart |
| `→` (Sağ Ok) | Sonraki kart |
| `Space` (Boşluk) | Kartı çevir |
| `1` | Bilmiyorum |
| `2` | Kararsızım |
| `3` | Biliyorum |

## 📈 İlerleme Takibi

### localStorage Kullanımı
Tüm verileriniz tarayıcınızın localStorage'ında güvenle saklanır:
- Kelime ilerlemeniz
- Günlük istatistikleriniz
- Tekrar tarihleri

**Önemli**: Tarayıcınızın önbelleğini temizlerseniz verileriniz silinir. Dikkatli olun!

### Veri Sıfırlama (İhtiyaç Halinde)
Tarayıcı konsoluna şunu yazın:
```javascript
localStorage.clear()
location.reload()
```

## 🔍 Debug Fonksiyonu

Tarayıcı konsolunu açın (F12) ve şunu yazın:
```javascript
debugStats()
```

Bu size detaylı istatistikler gösterecek:
- Bugün öğrenilen yeni kelime sayısı
- Bugün yapılan tekrar sayısı
- Toplam kelime sayısı
- Yeni/Öğreniliyor/Öğrenildi kelime dağılımı
- Zor kelime sayısı

## 🔄 İlerlemeyi Sıfırlama

### Buton ile Sıfırlama (Önerilen)
Sayfanın alt kısmında "🔄 İlerlemeyi Sıfırla" butonuna tıklayın:
- 2 kez onay isteyecek (kazara silmeyi önlemek için)
- Tüm kelime ilerlemesi silinir
- Tüm günlük istatistikler silinir
- Sayfa otomatik yeniden yüklenir
- **GERİ ALINAMAZ!**

### Konsol ile Sıfırlama (Gelişmiş)
Tarayıcı konsoluna (F12) şunu yazın:
```javascript
resetProgress()
```

veya sadece localStorage'ı temizlemek için:
```javascript
localStorage.clear()
location.reload()
```

**Ne Zaman Kullanmalı:**
- Test yaparken
- Yanlışlıkla tüm kelimelere "Biliyorum" dediyseniz
- Baştan başlamak istiyorsanız
- Sistemi sıfırdan öğrenmek istiyorsanız

## 💡 Kullanım Önerileri

### Günlük Rutin (25 Gün Plan)
1. **Sabah (30 dk)**: 20 yeni kelime + bugünün tekrarları
2. **Akşam (20 dk)**: Zor kelimeleri tekrar et
3. **Yatmadan önce (10 dk)**: Zor kelimeler modu

### Etkili Öğrenme
- Kartı çevirmeden önce 2-3 saniye düşünün
- Örnek cümleyi mutlaka okuyun
- Eş anlamlıları ve zıt anlamlıları not alın
- Dürüst olun: Emin değilseniz "Kararsızım" deyin

### Hedefler
- **Günlük**: 20 yeni kelime
- **Haftalık**: 140 yeni kelime
- **25 günde**: 500 kelime
- **e-YDS Hedefi**: Minimum 60 puan

## 🐛 Sorun Giderme

### Kartlar gösterilmiyor
- Sayfayı yenileyin (F5)
- words.json dosyasının aynı klasörde olduğundan emin olun
- Tarayıcı konsoluna bakın (F12)

### Dashboard güncellenmiyor
- Tarayıcıyı yenileyin
- localStorage'ın aktif olduğundan emin olun
- Gizli mod kullanmıyorsunuz değil mi kontrol edin

### Klavye kısayolları çalışmıyor
- Tarayıcı konsoluna odaklanmadığınızdan emin olun
- Sayfayı yenileyin

## 📝 Günlük Hedef Değiştirme

Varsayılan günlük hedef 20 kelime. Bunu değiştirmek için tarayıcı konsoluna:
```javascript
const settings = { dailyNewWordGoal: 30, dailyReviewGoal: 50, showDashboard: true }
localStorage.setItem('settings', JSON.stringify(settings))
location.reload()
```

## 🚀 GitHub Pages'e Yükleme

1. Tüm dosyaları GitHub reposuna yükleyin
2. Settings → Pages → Source: main branch
3. Birkaç dakika sonra siteniz yayında olacak!

---

**Not**: Bu sistem tamamen offline çalışır. İnternet bağlantısına ihtiyaç yoktur (sadece ilk açılışta words.json yüklemek için).

**İyi çalışmalar! 💪 e-YDS'de başarılar! 🎓**
