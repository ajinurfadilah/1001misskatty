

  
let cardsData = [];   // data kartu aktif  
let renderIndex = 0;  
let activeCards = [];  
let animating = false;  
  
const deck = document.getElementById('deck');  
const nextBtn = document.getElementById('nextBtn');  
const categoryBtns = document.querySelectorAll('.categoryBtn');  
const backBtn = document.getElementById('backBtn');  
backBtn.addEventListener('click', resetDeck);  
const soundLevel = new Audio('menu.mp3');
const soundBerikutnya = new Audio('2.berikutnya.mp3');
const soundChange = new Audio('2.change.mp3')
const soundMode = new Audio('2.mode.mp3')
const soundNextAndPrevious = new Audio('2.nextandprevious.mp3')
const soundPlay = new Audio('2.play.mp3')
const soundSkip = new Audio('2.skip.mp3')


function resetDeck() {  
  // hapus semua kartu dari DOM  
  activeCards.forEach(c => c.remove());  
  activeCards = [];  
  cardsData = [];  
  renderIndex = 0;  
  animating = false;  
  nextBtn.disabled = false;  
  skipBtn.disabled = false;
  
  document.getElementById('categoryInfo').classList.remove('show');
  deck.style.display = 'none';  
  nextBtn.style.display = 'none';  
  backBtn.style.display = 'none';  
  skipBtn.style.display = 'none';
  document.getElementById('categoryPanel').style.display = 'flex';  
  document.getElementById('categoryTitle').style.display = 'none';
  document.getElementById('switch1').style.display = 'flex';
  document.getElementById('cardCount').style.display = 'none';
}  
  
// Pilih kategori  
categoryBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    
    const cat = btn.dataset.cat;
    cardsData = [...categories[cat]];
    shuffle(cardsData);
    
    
    soundPlay.currentTime = 0; // reset suara biar bisa diputar lagi
    soundPlay.play();
    document.getElementById('categoryPanel').style.display = 'none';
    deck.style.display = 'block';
    backBtn.style.display = 'inline-block';
    skipBtn.style.display = 'inline-block';
    nextBtn.style.display = 'inline-block';
    document.getElementById('switch1').style.display = 'none';
    
    document.getElementById('categoryInfo').classList.add('show');

    // tampilkan judul kategori
    const titleEl = document.getElementById('categoryTitle');
    titleEl.textContent = cat.toUpperCase(); // bisa pakai capital atau kata lain
    titleEl.style.display = 'block';
    document.getElementById('cardCount').style.display = 'block';
     
     const countNumber = document.getElementById('countNumber');
countNumber.textContent = cardsData.length;
     
    nextBtn.classList.add("hidden");
    backBtn.classList.add("hidden");
    skipBtn.classList.add("hidden");
    renderIndex = 0;
    activeCards = [];
    initDeck();
  });
});
  
// fungsi shuffle  
function shuffle(array) {  
  for (let i = array.length -1; i > 0; i--) {  
    const j = Math.floor(Math.random() * (i+1));  
    [array[i], array[j]] = [array[j], array[i]];  
  }  
}  
  
// fungsi createCard & initDeck sama seperti kode kamu  
function createCard(item) {
  const card = document.createElement('div');
  card.className = "card";
  card.style.zIndex = 100 - renderIndex;

  const inner = document.createElement('div');
  inner.className = "card-inner";

  const front = document.createElement('div');
  front.className = "card-face card-front";

  // Tambahkan tombol play untuk listening mode
  if (currentMode === "Listening") {
    const playBtn = document.createElement('button');
    playBtn.textContent = "▶️";
    playBtn.style.marginLeft = "10px";

    playBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // jangan flip kartu

      const utterance = new SpeechSynthesisUtterance(item.question);
      utterance.lang = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(item.question) ? "ko-KR" : "en-US";

      // disable tombol saat berbicara
      playBtn.disabled = true;

      utterance.onend = () => {
        playBtn.disabled = false; // enable lagi setelah selesai
      };

      speechSynthesis.speak(utterance);
    });

    front.appendChild(playBtn);

    // jika pertanyaan Hangul, sembunyikan teks
    if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(item.question)) {
      // do nothing, hanya tombol play tampil
    } else {
      front.textContent = item.question; // non-Hangul tetap tampil
    }

  } else {
    // mode selain Listening → tampil normal
    if (item.image) {
      const img = document.createElement('img');
      img.src = item.image;
      img.style.maxWidth = "90%";
      img.style.maxHeight = "90%";
      img.style.borderRadius = "10px";
      front.appendChild(img);
    } else {
      front.textContent = item.question;
    }
  }

  const back = document.createElement('div');
  back.className = "card-face card-back";
  back.textContent = item.answer;

  inner.appendChild(front);
  inner.appendChild(back);
  card.appendChild(inner);

  card.addEventListener('click', () => {
  if (!card.classList.contains('active') || animating) return;
  animating = true;

  // disable dulu
  nextBtn.disabled = true;
  skipBtn.disabled = true;

  card.classList.toggle('flipped');

  setTimeout(() => {
  animating = false;

  // hanya enable tombol kalau bukan kartu Terima Kasih
  if (!card.classList.contains('thank-you') && card.classList.contains('flipped')) {
    nextBtn.disabled = false;
    skipBtn.disabled = false;
  }
}, 600);
});
  return card;
}
  
function initDeck() {  
  const MAX_RENDER = 5;  
  const end = Math.min(cardsData.length, MAX_RENDER);  
    
  const rotations = [0, 10, 12, 14, 16]; // akhir rotasi  
  for (let i = 0; i < end; i++) {  
    const card = createCard(cardsData[i]);  
      
    // tambahkan animasi shuffle  
    card.style.setProperty('--final-rot', rotations[i % rotations.length] + 'deg');  
    card.classList.add('shuffle');  
      
    deck.appendChild(card);  
    activeCards.push(card);  
    renderIndex++;  
  
    // hapus class shuffle setelah animasi, aktifkan kartu depan  
    card.addEventListener('animationend', () => {  
      card.classList.remove('shuffle');  
      if (i === 0) {  
        card.classList.add('active'); // kartu depan aktif  

        // ✅ disable tombol sampai user flip dulu  
        nextBtn.disabled = true;  
        skipBtn.disabled = true;  
      }  

      nextBtn.classList.remove("hidden");  
      backBtn.classList.remove("hidden");  
      skipBtn.classList.remove("hidden");  
    }, { once: true });  
  }  
}
  
// tombol berikutnya  
nextBtn.addEventListener('click', () => {  
  if (animating || activeCards.length === 0) return;  
  
   if (activeCards[0].classList.contains('thank-you')) {
    nextBtn.disabled = true;
    skipBtn.disabled = true;
    return; // hentikan fungsi
  }

  const current = activeCards[0];  
  const nextCard = activeCards[1];  
  
  soundBerikutnya.currentTime = 0; // reset suara biar bisa diputar lagi
    soundBerikutnya.play();
  animating = true;  
  nextBtn.disabled = true;  
  skipBtn.disabled = true;

  if (nextCard) nextCard.classList.add('active');  
  current.classList.add('out');  
  current.classList.remove('active');  

  current.addEventListener('transitionend', function onEnd(e) {  
    if (e.propertyName !== 'transform') return;  
    current.removeEventListener('transitionend', onEnd);  
    current.remove();  
    activeCards.shift();  

    // update jumlah kartu sisa
    const countNumber = document.getElementById('countNumber');
    const remaining = (cardsData.length - renderIndex) + activeCards.length;
    countNumber.textContent = remaining;

    // animasi -1
    const minusAnim = document.getElementById('minusAnim');
    minusAnim.classList.add('show');
    setTimeout(() => minusAnim.classList.remove('show'), 600);

    // render kartu baru
    if (renderIndex < cardsData.length) {  
      const newCard = createCard(cardsData[renderIndex]);  
      deck.appendChild(newCard);  
      activeCards.push(newCard);  
      renderIndex++;  
    }  

    animating = false;  
    nextBtn.disabled = true;  
    skipBtn.disabled = true;

    // jika habis
    if (activeCards.length === 0) {  
  nextBtn.disabled = true;  
  skipBtn.disabled = true;

  const thankYouCard = createCard({ question: "🎉 Terima Kasih 🎉", answer: "Selesai!" });  
  thankYouCard.classList.add('thank-you'); // tanda khusus
  deck.appendChild(thankYouCard);  
  activeCards.push(thankYouCard);  

  setTimeout(() => {  
    thankYouCard.classList.add('show');  
    thankYouCard.classList.add('active');  

    // disable tombol ketika kartu Terima Kasih tampil
    nextBtn.disabled = true;
    skipBtn.disabled = true;
  }, 50);  
}
  });  
});

const modeSwitch = document.getElementById("modeSwitch");
const labelText = document.querySelector(".label-text");

// default ke belajar mode
document.body.classList.add("relax-mode");
labelText.textContent = "relax";

modeSwitch.addEventListener("change", () => {
  if (modeSwitch.checked) {
    document.body.classList.remove("learn-mode");
    document.body.classList.add("relax-mode");
    labelText.textContent = "relax";
  } else {
    document.body.classList.remove("relax-mode");
    document.body.classList.add("learn-mode");
    labelText.textContent = "learn";
  }
});


const skipBtn = document.getElementById('skipBtn');

skipBtn.addEventListener('click', () => {
  
  setTimeout(() => {
        soundSkip.currentTime = 0; // reset suara biar bisa diputar lagi
    soundSkip.play();
      }, 900);
  
  if (animating || activeCards.length === 0) return;
  
   if (activeCards[0].classList.contains('thank-you')) {
    nextBtn.disabled = true;
    skipBtn.disabled = true;
    return; // hentikan fungsi
  }

  const current = activeCards[0];
  const currentIndex = renderIndex - activeCards.length; // index asli kartu di cardsData

  // fungsi animasi skip
  const runSkipAnimation = () => {
    const nextCard = activeCards[1];
    animating = true;
    skipBtn.disabled = true;
    nextBtn.disabled = true;

    if (nextCard) nextCard.classList.add('active');
    current.classList.add('outSkip');
    current.style.zIndex = '100';
    current.classList.remove('active');

    const rotations = [0, 10, 12, 14, 16];
    const finalRot = rotations[Math.min(activeCards.length - 1, rotations.length - 1)];

    setTimeout(() => {
      current.style.setProperty('--final-rot', finalRot + 'deg');
      current.classList.add('outSkip2');
      current.style.zIndex = '0';
    }, 500);

    current.addEventListener('transitionend', function onEnd(e) {
      if (e.propertyName !== 'transform') return;
      current.removeEventListener('transitionend', onEnd);
      current.remove();
      activeCards.shift();

      // ambil data asli dari array, bukan DOM
      const skippedItem = cardsData[currentIndex];
      cardsData.push(skippedItem);

      // render kartu baru jika perlu
      if (renderIndex < cardsData.length) {
        const newCard = createCard(cardsData[renderIndex]);
        deck.appendChild(newCard);
        activeCards.push(newCard);
        renderIndex++;

        if (activeCards.length === 1) activeCards[0].classList.add('active');
      }

      animating = false;
      skipBtn.disabled = true;
      nextBtn.disabled = true;
    });
  };

  // kalau kartu lagi flipped → balikkan dulu baru skip
  if (current.classList.contains('flipped')) {
    current.classList.remove('flipped');
    current.addEventListener('transitionend', function onFlipEnd(e) {
      if (e.propertyName !== 'transform') return;
      current.removeEventListener('transitionend', onFlipEnd);
      runSkipAnimation();
    });
  } else {
    runSkipAnimation();
  }
});

//----
const allBabBtns = Array.from(document.querySelectorAll(".btnGroupKelola .categoryBtn"));
const levelMenu = document.getElementById("levelMenu");

// Hapus levelBtn yang ada di HTML dulu (jika ada)
levelMenu.querySelectorAll(".levelBtn").forEach(btn => btn.remove());

// hitung jumlah level otomatis
const perLevel = 10;
const totalBabs = allBabBtns.length;
const totalLevels = Math.ceil(totalBabs / perLevel);

// buat tombol level otomatis
for (let i = 1; i <= totalLevels; i++) {
  const btn = document.createElement("button");
  btn.className = "levelBtn";
  if (i === 1) btn.classList.add("active"); // default Level 1 aktif
  btn.dataset.level = i;
  btn.textContent = "Level " + i;
  levelMenu.insertBefore(btn, document.getElementById("modeBtn")); // sisipkan sebelum tombol mode
}

// update levelButtons setelah dibuat
const levelButtons = document.querySelectorAll(".levelBtn");

// fungsi showLevel otomatis
function showLevel(level) {
  const start = (level - 1) * perLevel;
  const end = level * perLevel;

  allBabBtns.forEach((btn, index) => {
    if (index >= start && index < end) {
      btn.style.display = "inline-block";
      btn.style.opacity = 0;
      btn.style.transform = "translateX(-50px)";
      setTimeout(() => {
        btn.style.opacity = 1;
        btn.style.transform = "translateX(0)";
      }, 50);
    } else {
      btn.style.display = "none";
    }
  });

  // aktifkan tombol level
  levelButtons.forEach(btn => btn.classList.remove("active"));
  document.querySelector(`.levelBtn[data-level="${level}"]`).classList.add("active");

  // inisialisasi singleBab
  initSingleBab(level);
}



// jalankan default Level 1


// klik tombol level


// ---- Script Navigasi Bab Satu per Satu ----
const prevBabBtn = document.getElementById("prevBabBtn");
const nextBabBtn = document.getElementById("nextBabBtn");

const singleBabNav = document.getElementById("singleBabNav");

let singleBabIndex = 0; // index bab di level saat ini
let currentLevelBabs = []; // array bab saat ini

function initSingleBab(level) {
  const start = (level - 1) * 10;
  const end = level * 10;

  // ambil bab untuk level ini
  currentLevelBabs = Array.from(allBabBtns).slice(start, end);
  singleBabIndex = 0;

  updateSingleBabView();
  singleBabNav.style.display = "flex";
}

// update tampilan bab tunggal
function updateSingleBabView() {
  currentLevelBabs.forEach((btn, i) => {
    btn.style.display = (i === singleBabIndex) ? "inline-block" : "none";
  });

  

  prevBabBtn.disabled = (singleBabIndex === 0);
  nextBabBtn.disabled = (singleBabIndex === currentLevelBabs.length - 1);
}

// tombol navigasi
prevBabBtn.addEventListener("click", () => {
  soundNextAndPrevious.currentTime = 0; // reset suara biar bisa diputar lagi
    soundNextAndPrevious.play();
  if (singleBabIndex > 0) {
    singleBabIndex--;
    updateSingleBabView();
  }
});

nextBabBtn.addEventListener("click", () => {
  soundNextAndPrevious.currentTime = 0; // reset suara biar bisa diputar lagi
    soundNextAndPrevious.play();
  if (singleBabIndex < currentLevelBabs.length - 1) {
    singleBabIndex++;
    updateSingleBabView();
  }
});

// integrasi dengan showLevel
levelButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    soundLevel.currentTime = 0; // reset suara biar bisa diputar lagi
    soundLevel.volume = 0.6;
    soundLevel.play();
    const level = parseInt(btn.dataset.level);
    showLevel(level); // tetap menampilkan 10 bab
    
    if (!showAll) {
      initSingleBab(level); // hanya jika mode 1 per 1 aktif
      singleBabNav.style.display = "flex";
    } else {
      // show all mode → tampilkan semua bab
      const start = (level - 1) * 10;
      const end = level * 10;
      currentLevelBabs = Array.from(allBabBtns).slice(start, end);
      currentLevelBabs.forEach(btn => btn.style.display = "inline-block");
      singleBabNav.style.display = "none";
    }
  });
});
showLevel(1);
// jalankan default
initSingleBab(1);

const showAllBtn = document.getElementById("showAllBtn");
let showAll = false; // state toggle

showAllBtn.addEventListener("click", () => {
  showAll = !showAll;

  if (showAll) {
    // tampilkan semua bab di level saat ini
    currentLevelBabs.forEach(btn => {
      btn.style.display = "inline-block";
    });
    // sembunyikan tombol navigasi
    document.getElementById('btnGroupKelolaDua').classList.add('show');
    document.getElementById('btnGroupKelolaDua').classList.remove('show2');
    singleBabNav.style.display = "none";
    showAllBtn.textContent = "Satu per Satu";
  } else {
    document.getElementById('btnGroupKelolaDua').classList.remove('show');
    document.getElementById('btnGroupKelolaDua').classList.add('show2');
    // kembali ke satu per satu
    updateSingleBabView();
    singleBabNav.style.display = "flex";
    showAllBtn.textContent = "Show All";
  }
});

let modes = ["Reading", "Listening", "Image"];
let currentMode = localStorage.getItem("mode") || "Reading"; // default Reading

const modeBtn = document.getElementById("modeBtn");
const modeModal = document.getElementById("modeModal");
const closeModal = document.getElementById("closeModal");
const modeOptions = document.querySelectorAll(".modeOption");
const currentModeLabel = document.getElementById("currentModeLabel");

// fungsi update category + label
function updateCategoryMode() {
  const allBabBtns = document.querySelectorAll(".btnGroupKelola .categoryBtn");
  allBabBtns.forEach(btn => {
    let baseCat = btn.dataset.cat.replace(/listening|image/i, "");
    if (currentMode === "Listening") {
      btn.dataset.cat = baseCat + "listening";
    } else if (currentMode === "Image") {
      btn.dataset.cat = baseCat + "image";
    } else {
      btn.dataset.cat = baseCat;
    }
  });

  // highlight tombol yang aktif di modal
  modeOptions.forEach(btn => {
    if (btn.dataset.mode === currentMode) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // update judul di bawah tombol Change
 // currentModeLabel.textContent = "Mode Aktif: " + currentMode;
  currentModeLabel.textContent = currentMode;
}

const mainContent = document.getElementById("categoryPanel");

function openModal() {
  modeModal.classList.add("show");
  mainContent.classList.add("blur-bg");
  soundChange.currentTime = 0; // reset suara biar bisa diputar lagi
    soundChange.play();
}

function closeModalWithBlur() {
  modeModal.classList.remove("show");

  // Tambahkan class fade-out untuk animasi blur
  mainContent.classList.add("fade-out");
  soundChange.currentTime = 0; // reset suara biar bisa diputar lagi
    soundChange.play();
  // Setelah animasi selesai, hapus class blur
  setTimeout(() => {
    mainContent.classList.remove("blur-bg", "fade-out");
  }, 300); // durasi harus sama dengan transition filter
}

// Event
modeBtn.addEventListener("click", openModal);
closeModal.addEventListener("click", closeModalWithBlur);

// pilih mode
modeOptions.forEach(btn => {
  btn.addEventListener("click", () => {
    soundMode.currentTime = 0; // reset suara biar bisa diputar lagi
    soundMode.volume = 0.5;
    soundMode.play();
    currentMode = btn.dataset.mode;
    localStorage.setItem("mode", currentMode);
    updateCategoryMode();
  });
});

// jalankan saat awal
updateCategoryMode();


const careBtnJiCare = document.getElementById("careBtnJiCare");
  const articleJiCare = document.getElementById("articleJiCare");
  const countdownJiCare = document.getElementById("countdownJiCare");
  const overlayJiCare = document.getElementById("overlayJiCare");

  let careActiveJiCare = false;
  let timerJiCare = null;
  let timeLeftJiCare = 5;
  let hiddenTimerJiCare = null;
  let readyToStartJiCare = false;

  function startCountdownJiCare() {
  clearInterval(timerJiCare);
  timeLeftJiCare = 600; // 10 menit
  updateCountdownTime(timeLeftJiCare);
  timerJiCare = setInterval(() => {
    timeLeftJiCare--;
    updateCountdownTime(timeLeftJiCare);
    if (timeLeftJiCare <= 0) {
      clearInterval(timerJiCare);
      hideBodyJiCare();
    }
  }, 1000);
}

function updateCountdownTime(seconds) {
  let minutes = Math.floor(seconds / 60);
  let secs = seconds % 60;
  let formatted = 
    String(minutes).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
  countdownJiCare.textContent = "Web akan terkunci dalam " + formatted;
}

  function hideBodyJiCare() {
  overlayJiCare.style.display = "flex";
  let hTimeJiCare = 300; // 5 menit
  updateOverlayTime(hTimeJiCare);

  hiddenTimerJiCare = setInterval(() => {
    hTimeJiCare--;
    updateOverlayTime(hTimeJiCare);
    if (hTimeJiCare <= 0) {
      clearInterval(hiddenTimerJiCare);
      showBodyJiCare();
    }
  }, 1000);
}

function updateOverlayTime(seconds) {
  // Format ke MM:SS
  let minutes = Math.floor(seconds / 60);
  let secs = seconds % 60;
  let formatted = 
    String(minutes).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
  overlayJiCare.textContent = "Istirahat Dulu, sayangi mata dan otak, kembali lagi dalam " + formatted;
}

  function showBodyJiCare() {
    overlayJiCare.style.display = "none";
    countdownJiCare.textContent = "Menunggu aktivitas untuk mulai hitung mundur...";
    readyToStartJiCare = true; // tunggu respon user sekali
  }

  function resetCountdownJiCare() {
    if (!careActiveJiCare) return;
    if (readyToStartJiCare && overlayJiCare.style.display === "none") {
      // trigger sekali setelah body kembali
      readyToStartJiCare = false;
      startCountdownJiCare();
    }
  }

  careBtnJiCare.addEventListener("click", () => {
    careActiveJiCare = !careActiveJiCare;
    if (careActiveJiCare) {
      careBtnJiCare.textContent = "Care: ON";
      careBtnJiCare.classList.remove("offJiCare");
      startCountdownJiCare();
    } else {
      careBtnJiCare.textContent = "Care: OFF";
      careBtnJiCare.classList.add("offJiCare");
      clearInterval(timerJiCare);
      clearInterval(hiddenTimerJiCare);
      countdownJiCare.textContent = "";
      overlayJiCare.style.display = "none";
      readyToStartJiCare = false;
    }
  });

  document.addEventListener("mousemove", resetCountdownJiCare);
  document.addEventListener("click", resetCountdownJiCare);
  document.addEventListener("touchstart", resetCountdownJiCare);