// Variabel global untuk murottal
window.murottalAudio = null;
window.murottalAudioUrls = [];
window.murottalCurrentIndex = 0;

// Toggle sidebar untuk responsive
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('hidden');
}

// Mapping nama surah
const surahNamesID = {
  1: "Al-Fatihah", 2: "Al-Baqarah", 3: "Ali 'Imran", 4: "An-Nisa", 5: "Al-Ma'idah",
  6: "Al-An'am", 7: "Al-A'raf", 8: "Al-Anfal", 9: "At-Taubah", 10: "Yunus",
  11: "Hud", 12: "Yusuf", 13: "Ar-Ra'd", 14: "Ibrahim", 15: "Al-Hijr",
  16: "An-Nahl", 17: "Al-Isra", 18: "Al-Kahf", 19: "Maryam", 20: "Ta-Ha",
  21: "Al-Anbiya", 22: "Al-Hajj", 23: "Al-Mu'minun", 24: "An-Nur", 25: "Al-Furqan",
  26: "Asy-Syu'ara", 27: "An-Naml", 28: "Al-Qashash", 29: "Al-Ankabut", 30: "Ar-Rum",
  31: "Luqman", 32: "As-Sajdah", 33: "Al-Ahzab", 34: "Saba", 35: "Fatir",
  36: "Ya-Sin", 37: "As-Saffat", 38: "Sad", 39: "Az-Zumar", 40: "Ghafir",
  41: "Fussilat", 42: "Asy-Syura", 43: "Az-Zukhruf", 44: "Ad-Dukhan", 45: "Al-Jathiyah",
  46: "Al-Ahqaf", 47: "Muhammad", 48: "Al-Fath", 49: "Al-Hujurat", 50: "Qaf",
  51: "Adz-Dzariyat", 52: "At-Tur", 53: "An-Najm", 54: "Al-Qamar", 55: "Ar-Rahman",
  56: "Al-Waqi'ah", 57: "Al-Hadid", 58: "Al-Mujadilah", 59: "Al-Hasyr", 60: "Al-Mumtahanah",
  61: "As-Saff", 62: "Al-Jumu'ah", 63: "Al-Munafiqun", 64: "At-Taghabun", 65: "At-Talaq",
  66: "At-Tahrim", 67: "Al-Mulk", 68: "Al-Qalam", 69: "Al-Haqqah", 70: "Al-Ma'arij",
  71: "Nuh", 72: "Al-Jinn", 73: "Al-Muzzammil", 74: "Al-Muddaththir", 75: "Al-Qiyamah",
  76: "Al-Insan", 77: "Al-Mursalat", 78: "An-Naba", 79: "An-Nazi'at", 80: "Abasa",
  81: "At-Takwir", 82: "Al-Infitar", 83: "Al-Mutaffifin", 84: "Al-Insyiqaq", 85: "Al-Buruj",
  86: "At-Tariq", 87: "Al-A'la", 88: "Al-Ghasyiyah", 89: "Al-Fajr", 90: "Al-Balad",
  91: "Ash-Shams", 92: "Al-Lail", 93: "Ad-Dhuha", 94: "Al-Insyirah", 95: "At-Tin",
  96: "Al-Alaq", 97: "Al-Qadr", 98: "Al-Bayyinah", 99: "Az-Zalzalah", 100: "Al-Adiyat",
  101: "Al-Qari'ah", 102: "At-Takatsur", 103: "Al-Asr", 104: "Al-Humazah", 105: "Al-Fil",
  106: "Quraisy", 107: "Al-Ma'un", 108: "Al-Kausar", 109: "Al-Kafirun", 110: "An-Nasr",
  111: "Al-Lahab", 112: "Al-Ikhlas", 113: "Al-Falaq", 114: "An-Nas"
};

const surahListEl = document.getElementById('surahList');
const surahSearchEl = document.getElementById('surahSearch');
const surahDetailEl = document.getElementById('detail');
let allSurahs = [];

// Fungsi load daftar surah
function loadSurahList() {
  fetch('https://equran.id/api/v2/surat')
    .then(response => response.json())
    .then(data => {
      allSurahs = data.data;
      renderSurahList(data.data);
    })
    .catch(error => {
      console.error('Error mengambil daftar surah:', error);
      surahListEl.innerHTML = '<p>Gagal memuat data surah.</p>';
    });
}

function renderSurahList(surahs) {
  surahListEl.innerHTML = '';
  surahs.forEach(surah => {
    const item = document.createElement('div');
    item.className = 'surah-item';
    item.textContent = `${surah.nomor}. ${surahNamesID[surah.nomor] || surah.nama}`;
    item.addEventListener('click', () => {
      loadSurahDetail(surah.nomor);
      if(window.innerWidth <= 768){ toggleSidebar(); }
    });
    surahListEl.appendChild(item);
  });
}

surahSearchEl.addEventListener('input', function () {
  const query = this.value.toLowerCase();
  const filtered = allSurahs.filter(surah =>
    (surahNamesID[surah.nomor] || surah.nama).toLowerCase().includes(query) ||
    surah.nomor.toString().includes(query)
  );
  renderSurahList(filtered);
});

function loadSurahDetail(nomor) {
  surahDetailEl.innerHTML = '<p>Memuat detail surah...</p>';
  fetch(`https://quran-api.santrikoding.com/api/surah/${nomor}`)
    .then(response => response.json())
    .then(data => {
      renderSurahDetail(data);
      loadTranslation(nomor);
    })
    .catch(error => {
      console.error('Error mengambil detail surah:', error);
      surahDetailEl.innerHTML = '<p>Gagal memuat detail surah.</p>';
    });
}

function renderSurahDetail(data) {
  let html = `<h2>${data.nama} (${data.nomor})</h2>`;
  if (parseInt(data.nomor) !== 1 && parseInt(data.nomor) !== 9) {
    html += `<div class="bismillah">بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ</div>`;
  }
  // Kontrol murottal seperti music player
  html += `<div id="murottal-container">
             <button id="murottal-btn">Play Murottal</button>
             <div id="murottal-player"></div>
           </div>`;
  // Buat select dropdown untuk pilih ayat (akan diisi secara dinamis)
  html += `<select id="ayahDropdown"></select>`;
  
  data.ayat.forEach((ayat, index) => {
    const nomorAyat = ayat.nomor || (index + 1);
    html += `
      <div class="ayah-container" id="ayah-${index}">
        <div class="ayah-number">Ayat ke-${nomorAyat}</div>
        <p class="arabic">${ayat.ar}</p>
        <p class="latin">${ayat.tr || ''}</p>
        ${ayat.audio ? `<audio controls src="${ayat.audio}" style="display:none;"></audio>` : ''}
        <p class="translation" id="translation-${index}">Memuat terjemahan...</p>
        <div class="controls">
          <button class="copy-btn" data-arabic="${ayat.ar}" data-latin="${ayat.tr || ''}" data-translation="">Copy Ayat</button>
          <div class="share-dropdown">
            <button class="share-btn">Share</button>
            <div class="share-options">
              <button class="share-option" data-platform="wa" data-text="${ayat.ar} | ${ayat.tr || ''}">WhatsApp</button>
              <button class="share-option" data-platform="fb" data-text="${ayat.ar} | ${ayat.tr || ''}">Facebook</button>
              <button class="share-option" data-platform="tw" data-text="${ayat.ar} | ${ayat.tr || ''}">Twitter</button>
              <button class="share-option" data-platform="email" data-text="${ayat.ar} | ${ayat.tr || ''}">Email</button>
              <button class="share-option" data-platform="others" data-text="${ayat.ar} | ${ayat.tr || ''}">Lainnya</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  surahDetailEl.innerHTML = html;

  // Populasi dropdown "Pilih Ayat" secara dinamis
  let dropdownHTML = '<option value="">Pilih Ayat</option>';
  data.ayat.forEach((ayat, index) => {
    const nomorAyat = ayat.nomor || (index + 1);
    dropdownHTML += `<option value="${index}">Ayat ke-${nomorAyat}</option>`;
  });
  document.getElementById('ayahDropdown').innerHTML = dropdownHTML;

  const ayahDropdownEl = document.getElementById('ayahDropdown');
  ayahDropdownEl.addEventListener('change', function () {
    const idx = this.value;
    if (idx !== '') {
      const ayahEl = document.getElementById(`ayah-${idx}`);
      if (ayahEl) { ayahEl.scrollIntoView({ behavior: 'smooth' }); }
    }
  });

  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const arabic = this.getAttribute('data-arabic');
      const latin = this.getAttribute('data-latin');
      const translation = this.getAttribute('data-translation');
      const text = `${arabic}\n${latin}\n${translation}`;
      navigator.clipboard.writeText(text)
        .then(() => { alert('Ayat berhasil dicopy!'); })
        .catch(err => { console.error('Gagal copy:', err); });
    });
  });

  document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', function (event) {
      event.stopPropagation();
      const shareOptions = this.nextElementSibling;
      if (shareOptions.style.display === 'block') { shareOptions.style.display = 'none'; }
      else {
        document.querySelectorAll('.share-options').forEach(opt => opt.style.display = 'none');
        shareOptions.style.display = 'block';
      }
    });
  });

  document.querySelectorAll('.share-option').forEach(btn => {
    btn.addEventListener('click', function (event) {
      event.stopPropagation();
      const platform = this.getAttribute('data-platform');
      const text = this.getAttribute('data-text');
      if (platform === 'wa') {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      } else if (platform === 'fb') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`, '_blank');
      // Bagian share option untuk Twitter
      }else if (platform === 'tw') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
      } else if (platform === 'email') {
        window.location.href = `mailto:?subject=Ayat Quran&body=${encodeURIComponent(text + '\n' + window.location.href)}`;
      } else if (platform === 'others') {
        if (navigator.share) {
          navigator.share({ title: 'Baca Al-Quran', text: text, url: window.location.href })
            .catch(error => console.error('Error sharing:', error));
        } else { alert('Fitur share tidak didukung di browser Anda.'); }
      }
      this.parentElement.style.display = 'none';
    });
  });

  document.addEventListener('click', function () {
    document.querySelectorAll('.share-options').forEach(opt => opt.style.display = 'none');
  });

  // Fitur Murottal: kontrol seperti music player
  const murottalBtn = document.getElementById('murottal-btn');
  murottalBtn.addEventListener('click', function() {
    if (!window.murottalAudio) {
      fetch(`https://api.alquran.cloud/v1/surah/${data.nomor}/editions/ar.alafasy`)
        .then(res => res.json())
        .then(responseData => {
          const editionData = responseData.data[0];
          const audioUrls = editionData.ayahs.map(ayah => ayah.audio).filter(url => url);
          if (audioUrls.length > 0) {
            window.murottalAudioUrls = audioUrls;
            window.murottalCurrentIndex = 0;
            window.murottalAudio = new Audio(audioUrls[0]);
            setupMurottalPlayer();
            window.murottalAudio.play();
            murottalBtn.textContent = "Stop Murottal";
          } else { alert("Tidak ada audio murottal untuk surah ini."); }
        })
        .catch(err => {
          console.error(err);
          alert("Terjadi kesalahan saat mengambil audio murottal.");
        });
    } else {
      window.murottalAudio.pause();
      window.murottalAudio = null;
      window.murottalAudioUrls = [];
      window.murottalCurrentIndex = 0;
      document.getElementById('murottal-player').classList.remove('open');
      murottalBtn.textContent = "Play Murottal";
    }
  });
}

// Setup custom murottal player (seperti music player)
function setupMurottalPlayer() {
  let playerDiv = document.getElementById('murottal-player');
  if (!playerDiv.innerHTML.trim()) {
    playerDiv.innerHTML = `
      <button id="murottal-playpause">Pause</button>
      <button id="murottal-rewind">Rewind 10s</button>
      <button id="murottal-forward">Forward 10s</button>
      <input type="range" id="murottal-progress" min="0" max="100" value="0">
      <span id="murottal-time">0:00 / 0:00</span>
    `;
  }
  playerDiv.classList.add('open');
  const playPauseBtn = document.getElementById('murottal-playpause');
  const rewindBtn = document.getElementById('murottal-rewind');
  const forwardBtn = document.getElementById('murottal-forward');
  const progressBar = document.getElementById('murottal-progress');
  const timeDisplay = document.getElementById('murottal-time');

  playPauseBtn.addEventListener('click', function() {
    if (window.murottalAudio.paused) {
      window.murottalAudio.play();
      playPauseBtn.textContent = "Pause";
    } else {
      window.murottalAudio.pause();
      playPauseBtn.textContent = "Play";
    }
  });
  rewindBtn.addEventListener('click', function() {
    window.murottalAudio.currentTime = Math.max(0, window.murottalAudio.currentTime - 10);
  });
  forwardBtn.addEventListener('click', function() {
    window.murottalAudio.currentTime = Math.min(window.murottalAudio.duration, window.murottalAudio.currentTime + 10);
  });
  progressBar.addEventListener('input', function() {
    if (window.murottalAudio.duration) {
      window.murottalAudio.currentTime = (progressBar.value / 100) * window.murottalAudio.duration;
    }
  });
  window.murottalAudio.addEventListener('timeupdate', function() {
    if (window.murottalAudio.duration) {
      const percent = (window.murottalAudio.currentTime / window.murottalAudio.duration) * 100;
      progressBar.value = percent;
      timeDisplay.textContent = formatTime(window.murottalAudio.currentTime) + " / " + formatTime(window.murottalAudio.duration);
    }
  });
  window.murottalAudio.addEventListener('ended', function() {
    window.murottalCurrentIndex++;
    if (window.murottalCurrentIndex < window.murottalAudioUrls.length) {
      window.murottalAudio.src = window.murottalAudioUrls[window.murottalCurrentIndex];
      window.murottalAudio.play();
    } else {
      playPauseBtn.textContent = "Play";
      document.getElementById('murottal-btn').textContent = "Play Murottal";
      window.murottalAudio = null;
      playerDiv.classList.remove('open');
    }
  });
}

// Helper: format waktu mm:ss
function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return min + ":" + (sec < 10 ? "0" + sec : sec);
}

// Fungsi loadTranslation: update teks dan buat custom audio player per ayat
function loadTranslation(nomor) {
  fetch(`https://api.alquran.cloud/v1/surah/${nomor}/editions/quran-uthmani,id.indonesian,ar.alafasy,en.transliteration`)
    .then(response => response.json())
    .then(data => {
      const indoData = data.data[1];
      const audioData = data.data[2];
      const transliterationData = data.data[3];
      // Update terjemahan dan transliterasi
      indoData.ayahs.forEach((ayah, index) => {
        const translationEl = document.getElementById(`translation-${index}`);
        if (translationEl) {
          translationEl.textContent = `Terjemahan: ${ayah.text}`;
          const copyBtn = document.querySelector(`#ayah-${index} .copy-btn`);
          if (copyBtn) {
            copyBtn.setAttribute('data-translation', `Terjemahan: ${ayah.text}`);
          }
        }
      });
      transliterationData.ayahs.forEach((ayah, index) => {
        const latinEl = document.querySelector(`#ayah-${index} .latin`);
        if (latinEl) {
          latinEl.textContent = ayah.text;
          const copyBtn = document.querySelector(`#ayah-${index} .copy-btn`);
          if (copyBtn) {
            copyBtn.setAttribute('data-latin', ayah.text);
          }
        }
      });
      // Buat custom audio player per ayat
      audioData.ayahs.forEach((ayah, index) => {
        const ayahContainer = document.getElementById(`ayah-${index}`);
        if (ayahContainer && ayah.audio) {
          if (!ayahContainer.querySelector('.audio-player')) {
            const audioPlayer = document.createElement('div');
            audioPlayer.className = 'audio-player';
            audioPlayer.setAttribute('data-audio-url', ayah.audio);
            
            const audioObj = new Audio(ayah.audio);
            audioObj.preload = 'auto';
            audioPlayer.audioObj = audioObj;
            
            // Tombol Play/Pause
            const playPauseBtn = document.createElement('button');
            playPauseBtn.textContent = 'Play';
            playPauseBtn.addEventListener('click', function () {
              if (audioObj.paused) {
                audioObj.play();
                playPauseBtn.textContent = 'Pause';
              } else {
                audioObj.pause();
                playPauseBtn.textContent = 'Play';
              }
            });
            // Tombol Rewind 10 detik
            const rewindBtn = document.createElement('button');
            rewindBtn.textContent = 'Rewind 10s';
            rewindBtn.addEventListener('click', function () {
              audioObj.currentTime = Math.max(0, audioObj.currentTime - 10);
            });
            // Tombol Forward 10 detik
            const forwardBtn = document.createElement('button');
            forwardBtn.textContent = 'Forward 10s';
            forwardBtn.addEventListener('click', function () {
              audioObj.currentTime = Math.min(audioObj.duration, audioObj.currentTime + 10);
            });
            // Progress bar
            const progressBar = document.createElement('input');
            progressBar.type = 'range';
            progressBar.min = '0';
            progressBar.max = '100';
            progressBar.value = '0';
            progressBar.style.flex = '1';
            progressBar.style.margin = '0 8px';
            // Tampilan waktu
            const timeDisplay = document.createElement('span');
            timeDisplay.textContent = '0:00 / 0:00';
            
            audioObj.addEventListener('timeupdate', function() {
              if (audioObj.duration) {
                const percent = (audioObj.currentTime / audioObj.duration) * 100;
                progressBar.value = percent;
                timeDisplay.textContent = formatTime(audioObj.currentTime) + " / " + formatTime(audioObj.duration);
              }
            });
            progressBar.addEventListener('input', function() {
              if (audioObj.duration) {
                audioObj.currentTime = (progressBar.value / 100) * audioObj.duration;
              }
            });
            
            audioPlayer.appendChild(playPauseBtn);
            audioPlayer.appendChild(rewindBtn);
            audioPlayer.appendChild(forwardBtn);
            audioPlayer.appendChild(progressBar);
            audioPlayer.appendChild(timeDisplay);
            
            ayahContainer.insertBefore(audioPlayer, ayahContainer.querySelector('.controls'));
          }
        }
      });
    })
    .catch(error => {
      console.error('Error mengambil terjemahan:', error);
    });
}

loadSurahList();