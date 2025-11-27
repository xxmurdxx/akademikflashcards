let words = [];
let currentIndex = 0;
let recentCards = []; // Son gosterilen kartlari takip et
let displayMode = 'mixed'; // 'mixed', 'english', 'turkish', 'hard'
let currentQueue = []; // Guncel kart kuyrugu
let allWords = []; // Tum kelimeler (filtreleme icin)

// localStorage Yonetimi
const STORAGE_KEYS = {
    WORD_PROGRESS: 'wordProgress',
    DAILY_STATS: 'dailyStats',
    SETTINGS: 'settings'
};

// localStorage'dan veri oku
function getFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('localStorage okuma hatasi:', error);
        return null;
    }
}

// localStorage'a veri yaz
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('localStorage yazma hatasi:', error);
        return false;
    }
}

// Kelime ilerlemesini getir veya yeni olustur
function getWordProgress(englishWord) {
    const allProgress = getFromStorage(STORAGE_KEYS.WORD_PROGRESS) || {};

    if (!allProgress[englishWord]) {
        // Ilk kez gorulen kelime
        allProgress[englishWord] = {
            lastReview: null,
            nextReview: getTodayDate(),
            difficulty: 'new',
            reviewCount: 0,
            correctStreak: 0,
            status: 'new',
            totalCorrect: 0,
            totalIncorrect: 0,
            createdAt: getTodayDate()
        };
        saveToStorage(STORAGE_KEYS.WORD_PROGRESS, allProgress);
    }

    return allProgress[englishWord];
}

// Kelime ilerlemesini guncelle
function updateWordProgress(englishWord, updates) {
    const allProgress = getFromStorage(STORAGE_KEYS.WORD_PROGRESS) || {};

    if (!allProgress[englishWord]) {
        allProgress[englishWord] = getWordProgress(englishWord);
    }

    allProgress[englishWord] = { ...allProgress[englishWord], ...updates };
    saveToStorage(STORAGE_KEYS.WORD_PROGRESS, allProgress);
}

// Bugunun tarihini al (YYYY-MM-DD formatinda)
function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Gelecek tarih hesapla
function addDaysToDate(dateStr, days) {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

// Gunluk istatistikleri getir
function getDailyStats(date = getTodayDate()) {
    const allStats = getFromStorage(STORAGE_KEYS.DAILY_STATS) || {};

    if (!allStats[date]) {
        allStats[date] = {
            newWordsLearned: 0,
            reviewsCompleted: 0,
            totalStudyTime: 0,
            date: date
        };
        saveToStorage(STORAGE_KEYS.DAILY_STATS, allStats);
    }

    return allStats[date];
}

// Gunluk istatistikleri guncelle
function updateDailyStats(updates) {
    const today = getTodayDate();
    const allStats = getFromStorage(STORAGE_KEYS.DAILY_STATS) || {};

    if (!allStats[today]) {
        allStats[today] = getDailyStats(today);
    }

    allStats[today] = { ...allStats[today], ...updates };
    saveToStorage(STORAGE_KEYS.DAILY_STATS, allStats);
}

// Ayarlari getir
function getSettings() {
    const defaultSettings = {
        dailyNewWordGoal: 20,
        dailyReviewGoal: 50,
        showDashboard: true
    };

    return getFromStorage(STORAGE_KEYS.SETTINGS) || defaultSettings;
}

// Diziyi karistir (Fisher-Yates algoritmasi)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Zor kelimeleri filtrele
function getHardWords() {
    const allProgress = getFromStorage(STORAGE_KEYS.WORD_PROGRESS) || {};
    const hardWords = [];

    allWords.forEach(word => {
        const progress = allProgress[word.english];

        if (!progress) return; // Hic gorunmemis kelimeler dahil degil

        // Zor kelime kriterleri
        const isHard = progress.difficulty === 'hard';
        const lowStreak = (progress.correctStreak || 0) < 2;
        const lowSuccessRate = progress.reviewCount > 0 &&
            (progress.totalIncorrect || 0) / progress.reviewCount > 0.4;

        if (isHard || lowStreak || lowSuccessRate) {
            hardWords.push(word);
        }
    });

    // Zor kelimeleri zorluklarına gore sirala
    hardWords.sort((a, b) => {
        const progressA = allProgress[a.english] || {};
        const progressB = allProgress[b.english] || {};

        const scoreA = (progressA.totalIncorrect || 0) - (progressA.totalCorrect || 0);
        const scoreB = (progressB.totalIncorrect || 0) - (progressB.totalCorrect || 0);

        return scoreB - scoreA; // En zor olanlar once
    });

    return hardWords;
}

// Akilli kuyruk olustur (Spaced Repetition'a gore sirala)
function buildSmartQueue() {
    const today = getTodayDate();
    const allProgress = getFromStorage(STORAGE_KEYS.WORD_PROGRESS) || {};
    const settings = getSettings();

    // Eger "Zor Kelimeler" modu aktifse
    if (displayMode === 'hard') {
        const hardWords = getHardWords();
        return hardWords.length > 0 ? hardWords : allWords.slice(0, 10);
    }

    // Normal mod - Tum kelimeleri kategorize et
    const overdueWords = []; // Vadesi gecmis
    const dueToday = []; // Bugun tekrar edilmesi gereken
    const newWords = []; // Yeni kelimeler
    const futureWords = []; // Gelecek gun tekrar edilecekler

    allWords.forEach(word => {
        const progress = allProgress[word.english];

        if (!progress || progress.status === 'new') {
            // Yeni kelime
            newWords.push(word);
        } else if (progress.status === 'mastered') {
            // Ogrenilmis kelimeler - atla (gunluk goal'a ekleyelim isteye bagli)
            if (progress.nextReview && progress.nextReview <= today) {
                dueToday.push(word);
            }
        } else {
            // Learning veya diger statusler
            if (progress.nextReview < today) {
                overdueWords.push(word);
            } else if (progress.nextReview === today) {
                dueToday.push(word);
            } else {
                futureWords.push(word);
            }
        }
    });

    // Zor kelimeleri once getir
    const sortByDifficulty = (a, b) => {
        const progressA = allProgress[a.english] || {};
        const progressB = allProgress[b.english] || {};

        const difficultyScore = { hard: 3, medium: 2, easy: 1, new: 0 };
        return (difficultyScore[progressB.difficulty] || 0) - (difficultyScore[progressA.difficulty] || 0);
    };

    overdueWords.sort(sortByDifficulty);
    dueToday.sort(sortByDifficulty);

    // Kuyrugu olustur
    const queue = [
        ...overdueWords,
        ...dueToday,
        ...newWords.slice(0, settings.dailyNewWordGoal), // Gunluk yeni kelime limiti
        ...futureWords.slice(0, 10) // Bos vakte ek 10 kelime
    ];

    return queue.length > 0 ? queue : allWords;
}

// words.json dosyasini yukle
async function loadWords() {
    try {
        const response = await fetch('words.json');
        allWords = await response.json(); // Tum kelimeleri sakla

        // Akilli kuyruk olustur
        currentQueue = buildSmartQueue();

        // Eger kuyruk bossa normal siralama
        if (currentQueue.length === 0) {
            currentQueue = shuffleArray([...allWords]);
        }

        // currentQueue'yu words yerine kullanacagiz
        words = currentQueue;
        currentIndex = 0; // Index'i sifirla

        displayCard();
        updateCounter();
        updateDashboard(); // Dashboard'u guncelle
    } catch (error) {
        console.error('Kelimeler yuklenemedi:', error);
    }
}

// Karti goster
function displayCard() {
    if (words.length === 0) return;

    const card = document.getElementById('flashcard');
    const englishWord = document.getElementById('english-word');
    const turkishWord = document.getElementById('turkish-word');
    const exampleSentence = document.getElementById('example-sentence');
    const exampleTr = document.getElementById('example-tr');
    const synonymsEl = document.getElementById('synonyms');
    const antonymsEl = document.getElementById('antonyms');

    const currentWord = words[currentIndex];

    // Animasyonu gecici olarak kapat
    card.style.transition = 'none';

    // Mod'a gore hangi yuzle baslayacagini belirle
    let showFrontFirst;
    if (displayMode === 'mixed') {
        showFrontFirst = Math.random() > 0.5;
    } else if (displayMode === 'english') {
        showFrontFirst = true; // Her zaman Ingilizce
    } else { // turkish
        showFrontFirst = false; // Her zaman Turkce
    }

    // Hangi yuzle baslayacagini belirle
    if (showFrontFirst) {
        card.classList.remove('flipped');
    } else {
        card.classList.add('flipped');
    }

    // Icerik her zaman ayni: on yuz Ingilizce, arka yuz Turkce
    englishWord.textContent = currentWord.english;
    exampleSentence.textContent = currentWord.example;
    turkishWord.textContent = currentWord.turkish;
    exampleTr.textContent = currentWord.exampleTr || '';
    synonymsEl.textContent = currentWord.synonyms || '-';
    antonymsEl.textContent = currentWord.antonyms || '-';

    // Animasyonu tekrar ac (bir sonraki frame'de)
    requestAnimationFrame(() => {
        card.style.transition = 'transform 0.6s';
    });
}

// Sayaci guncelle
function updateCounter() {
    const counter = document.getElementById('counter');
    counter.textContent = `${currentIndex + 1} / ${words.length}`;
}

// Karti cevir
function flipCard() {
    const card = document.getElementById('flashcard');
    card.classList.toggle('flipped');
}

// Onceki kart
function prevCard() {
    if (currentIndex > 0) {
        currentIndex--;
    } else {
        // Basa donunce sona git
        currentIndex = words.length - 1;
    }
    displayCard();
    updateCounter();
}

// Sonraki kart
function nextCard() {
    if (currentIndex < words.length - 1) {
        currentIndex++;
    } else {
        // Sona gelince akilli kuyrugu yeniden olustur
        currentQueue = buildSmartQueue();

        if (currentQueue.length === 0) {
            // Hic kelime kalmadiysa tum kelimeleri karistir
            currentQueue = shuffleArray([...allWords]);
        }

        words = currentQueue;
        currentIndex = 0;

        // Dashboard'u guncelle
        updateDashboard();
    }
    displayCard();
    updateCounter();
}

// Mod degistirme fonksiyonu
function changeMode(mode) {
    displayMode = mode;

    // Butenlari guncelle
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`mode-${mode}`).classList.add('active');

    // Eger "Zor Kelimeler" moduna gecilirse kuyrugu yeniden olustur
    if (mode === 'hard') {
        currentQueue = buildSmartQueue();
        words = currentQueue.length > 0 ? currentQueue : allWords.slice(0, 10);
        currentIndex = 0;
        updateCounter();
    }

    // Karti yeniden goster
    displayCard();
}

// Event listener'lari ekle
document.getElementById('flashcard').addEventListener('click', flipCard);
document.getElementById('prev-btn').addEventListener('click', prevCard);
document.getElementById('next-btn').addEventListener('click', nextCard);

// Mod butonlari
document.getElementById('mode-mixed').addEventListener('click', () => changeMode('mixed'));
document.getElementById('mode-english').addEventListener('click', () => changeMode('english'));
document.getElementById('mode-turkish').addEventListener('click', () => changeMode('turkish'));
document.getElementById('mode-hard').addEventListener('click', () => changeMode('hard'));

// Rating butonlari
document.getElementById('rating-wrong').addEventListener('click', () => rateCard('wrong'));
document.getElementById('rating-unsure').addEventListener('click', () => rateCard('unsure'));
document.getElementById('rating-correct').addEventListener('click', () => rateCard('correct'));

// Sifirla butonu
document.getElementById('reset-btn').addEventListener('click', resetProgress);

// Klavye kontrolleri
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevCard();
    if (e.key === 'ArrowRight') nextCard();
    if (e.key === ' ') {
        e.preventDefault();
        flipCard();
    }
    // Rating kisayollari
    if (e.key === '1') rateCard('wrong');
    if (e.key === '2') rateCard('unsure');
    if (e.key === '3') rateCard('correct');
});

// Dashboard'u guncelle
function updateDashboard() {
    const today = getTodayDate();
    const stats = getDailyStats();
    const settings = getSettings();
    const allProgress = getFromStorage(STORAGE_KEYS.WORD_PROGRESS) || {};

    // Yeni kelime sayisi
    const newWordsToday = stats.newWordsLearned || 0;
    const newWordGoal = settings.dailyNewWordGoal || 20;
    const newWordsEl = document.getElementById('dash-new-words');
    newWordsEl.textContent = `${newWordsToday} / ${newWordGoal}`;

    // Renk ayarlari
    if (newWordsToday >= newWordGoal) {
        newWordsEl.className = 'dashboard-value success';
    } else if (newWordsToday >= newWordGoal * 0.8) {
        newWordsEl.className = 'dashboard-value warning';
    } else {
        newWordsEl.className = 'dashboard-value';
    }

    // Bugun tekrar edilmesi gereken kelime sayisi
    let dueTodayCount = 0;
    Object.values(allProgress).forEach(progress => {
        if (progress.nextReview && progress.nextReview <= today) {
            dueTodayCount++;
        }
    });
    document.getElementById('dash-due-today').textContent = dueTodayCount;

    // Tamamlanan tekrar sayisi
    const reviewsToday = stats.reviewsCompleted || 0;
    document.getElementById('dash-reviews').textContent = reviewsToday;

    // Ogrenilmis kelime sayisi
    const masteredCount = Object.values(allProgress).filter(p => p.status === 'mastered').length;
    document.getElementById('dash-mastered').textContent = masteredCount;
}

// Rating fonksiyonu - Spaced Repetition algoritmasi
function rateCard(rating) {
    if (words.length === 0) return;

    const currentWord = words[currentIndex];
    const progress = getWordProgress(currentWord.english);
    const today = getTodayDate();

    // Temel bilgileri guncelle
    progress.lastReview = today;
    progress.reviewCount = (progress.reviewCount || 0) + 1;

    // Rating'e gore guncelleme
    let nextDays = 0;

    if (rating === 'wrong') {
        // Bilmiyorum
        progress.totalIncorrect = (progress.totalIncorrect || 0) + 1;
        progress.correctStreak = 0;
        progress.difficulty = 'hard';
        progress.status = 'learning';
        nextDays = 0; // Ayni gun tekrar
    } else if (rating === 'unsure') {
        // Kararsizim
        progress.totalIncorrect = (progress.totalIncorrect || 0) + 1;
        progress.correctStreak = 0;
        progress.difficulty = 'medium';
        progress.status = 'learning';
        nextDays = 1; // Yarin tekrar
    } else if (rating === 'correct') {
        // Biliyorum
        progress.totalCorrect = (progress.totalCorrect || 0) + 1;
        progress.correctStreak = (progress.correctStreak || 0) + 1;

        // Zorluk seviyesine gore gun hesapla
        if (progress.difficulty === 'hard' || progress.difficulty === 'new') {
            nextDays = 1;
            progress.difficulty = 'medium';
        } else if (progress.difficulty === 'medium') {
            nextDays = 3;
            progress.difficulty = 'easy';
        } else {
            nextDays = 7;
        }

        // Eger 3 kez ust uste dogru ve 7+ gun sonraya ertelenmisse -> Ogrenildi
        if (progress.correctStreak >= 3 && nextDays >= 7) {
            progress.status = 'mastered';
            nextDays = 14;
        } else {
            progress.status = 'learning';
        }
    }

    progress.nextReview = addDaysToDate(today, nextDays);
    updateWordProgress(currentWord.english, progress);

    // Gunluk istatistikleri guncelle
    const stats = getDailyStats();

    if (progress.reviewCount === 1) {
        // Yeni kelime
        stats.newWordsLearned = (stats.newWordsLearned || 0) + 1;
    } else {
        // Tekrar
        stats.reviewsCompleted = (stats.reviewsCompleted || 0) + 1;
    }

    updateDailyStats(stats);

    // Dashboard'u guncelle
    updateDashboard();

    // Sonraki karta gec
    nextCard();
}

// Ilerlemeyi sifirla
function resetProgress() {
    const confirmation = confirm(
        '⚠️ UYARI ⚠️\n\n' +
        'Tüm ilerlemeniz silinecek:\n' +
        '- Kelime ilerlemesi\n' +
        '- Günlük istatistikler\n' +
        '- Tüm kayıtlar\n\n' +
        'Bu işlem GERİ ALINAMAZ!\n\n' +
        'Devam etmek istiyor musunuz?'
    );

    if (!confirmation) {
        return;
    }

    // Ikinci onay
    const secondConfirmation = confirm(
        '🚨 SON ONAY 🚨\n\n' +
        'Gerçekten TÜM verilerinizi silmek istediğinize emin misiniz?\n\n' +
        'Bu işlem GERİ ALINAMAZ!'
    );

    if (!secondConfirmation) {
        return;
    }

    // LocalStorage'i temizle
    localStorage.removeItem(STORAGE_KEYS.WORD_PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.DAILY_STATS);

    console.log('✅ Tüm ilerleme başarıyla silindi!');
    alert('✅ Tüm ilerleme silindi!\n\nSayfa yeniden yüklenecek.');

    // Sayfayi yenile
    location.reload();
}

// Debug fonksiyonu (konsola yazarak test etmek icin)
function debugStats() {
    const allProgress = getFromStorage(STORAGE_KEYS.WORD_PROGRESS) || {};
    const stats = getDailyStats();

    console.log('=== KELIME ISTATISTIKLERI ===');
    console.log('Bugun ogrenilen yeni kelime:', stats.newWordsLearned || 0);
    console.log('Bugun yapilan tekrar:', stats.reviewsCompleted || 0);
    console.log('Toplam kelime sayisi:', allWords.length);
    console.log('Kayitli kelime:', Object.keys(allProgress).length);

    const statusCount = {
        new: 0,
        learning: 0,
        mastered: 0
    };

    Object.values(allProgress).forEach(p => {
        statusCount[p.status] = (statusCount[p.status] || 0) + 1;
    });

    console.log('Yeni kelime:', statusCount.new);
    console.log('Ogreniliyor:', statusCount.learning);
    console.log('Ogrenildi:', statusCount.mastered);
    console.log('Zor kelime sayisi:', getHardWords().length);
}

// Global window objesine ekle (konsol'dan cagirabilesin)
window.debugStats = debugStats;
window.resetProgress = resetProgress;

// Sayfa yuklendiginde kelimeleri yukle
loadWords();
