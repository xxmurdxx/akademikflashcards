let words = [];
let currentIndex = 0;
let recentCards = []; // Son gosterilen kartlari takip et
let displayMode = 'mixed'; // 'mixed', 'english', 'turkish'

// Diziyi karistir (Fisher-Yates algoritmasi)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// words.json dosyasini yukle
async function loadWords() {
    try {
        const response = await fetch('words.json');
        words = await response.json();
        words = shuffleArray([...words]); // Kelimeleri karistir (kopya uzerinde)
        displayCard();
        updateCounter();
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
        // Sona gelince yeniden karistir ve basa don
        // Son 3 karti hatirla
        const lastCards = words.slice(-3);
        words = shuffleArray([...words]);

        // Eger yeni sirada ilk 3 kart son 3 kartta varsa tekrar karistir
        let attempts = 0;
        while (attempts < 10 && lastCards.some(card =>
            words.slice(0, 3).includes(card))) {
            words = shuffleArray([...words]);
            attempts++;
        }

        currentIndex = 0;
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

// Klavye kontrolleri
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevCard();
    if (e.key === 'ArrowRight') nextCard();
    if (e.key === ' ') {
        e.preventDefault();
        flipCard();
    }
});

// Sayfa yuklendiginde kelimeleri yukle
loadWords();
