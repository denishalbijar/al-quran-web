// Variabel global untuk murottal dan current surah
window.murottalAudio = null;
window.murottalAudioUrls = [];
window.murottalCurrentIndex = 0;
window.currentSurahNumber = null;

// Mapping nama surah
const surahNamesID = {
  1: "Al Fatihah", 2: "Al Baqarah", 3: "Ali Imran", 4: "An Nisa", 5: "Al Maidah",
  6: "Al Anam", 7: "Al Araf", 8: "Al Anfal", 9: "At Taubah", 10: "Yunus",
  11: "Hud", 12: "Yusuf", 13: "Ar Rad", 14: "Ibrahim", 15: "Al Hijr",
  16: "An Nahl", 17: "Al Isra", 18: "Al Kahf", 19: "Maryam", 20: "TaHa",
  21: "Al Anbiya", 22: "Al Hajj", 23: "Al Muminun", 24: "An Nur", 25: "Al Furqan",
  26: "Asy Syuara", 27: "An Naml", 28: "Al Qashash", 29: "Al Ankabut", 30: "Ar Rum",
  31: "Luqman", 32: "As Sajdah", 33: "Al Ahzab", 34: "Saba", 35: "Fatir",
  36: "YaSin", 37: "As Saffat", 38: "Sad", 39: "Az Zumar", 40: "Ghafir",
  41: "Fussilat", 42: "Asy Syura", 43: "Az Zukhruf", 44: "Ad Dukhan", 45: "Al Jathiyah",
  46: "Al-Ahqaf", 47: "Muhammad", 48: "Al Fath", 49: "Al Hujurat", 50: "Qaf",
  51: "Adz Dzariyat", 52: "At Tur", 53: "An Najm", 54: "Al Qamar", 55: "Ar Rahman",
  56: "Al Waqiah", 57: "Al Hadid", 58: "Al Mujadilah", 59: "Al Hasyr", 60: "Al Mumtahanah",
  61: "As Saff", 62: "Al Jumuah", 63: "Al Munafiqun", 64: "At Taghabun", 65: "At Talaq",
  66: "At Tahrim", 67: "Al Mulk", 68: "Al Qalam", 69: "Al Haqqah", 70: "Al Maarij",
  71: "Nuh", 72: "Al Jinn", 73: "Al Muzzammil", 74: "Al Muddaththir", 75: "Al Qiyamah",
  76: "Al Insan", 77: "Al Mursalat", 78: "An Naba", 79: "An-Naziat", 80: "Abasa",
  81: "At Takwir", 82: "Al Infitar", 83: "Al Mutaffifin", 84: "Al Insyiqaq", 85: "Al Buruj",
  86: "At Tariq", 87: "Al Ala", 88: "Al Ghasyiyah", 89: "Al Fajr", 90: "Al Balad",
  91: "Ash Shams", 92: "Al Lail", 93: "Ad Dhuha", 94: "Al Insyirah", 95: "At Tin",
  96: "Al Alaq", 97: "Al Qadr", 98: "Al Bayyinah", 99: "Az Zalzalah", 100: "Al Adiyat",
  101: "Al Qariah", 102: "At Takatsur", 103: "Al Asr", 104: "Al Humazah", 105: "Al Fil",
  106: "Al Quraisy", 107: "Al Ma'un", 108: "Al Kausar", 109: "Al Kafirun", 110: "An Nasr",
  111: "Al Lahab", 112: "Al Ikhlas", 113: "Al Falaq", 114: "An Nas"
};

const surahButtonsEl = document.getElementById('surahButtons');
const surahSearchEl = document.getElementById('surahSearch');
const surahDetailEl = document.getElementById('detail');
const backBtn = document.getElementById('backBtn');
let allSurahs = [];

// Bookmark helper functions (menggunakan localStorage)
function getBookmarks() {
  const data = localStorage.getItem('quranBookmarks');
  return data ? JSON.parse(data) : { surahs: [], ayahs: [] };
}
function saveBookmarks(bookmarks) {
  localStorage.setItem('quranBookmarks', JSON.stringify(bookmarks));
}

// Fungsi load daftar surah
function loadSurahList() {
  fetch('https://equran.id/api/v2/surat')
    .then(response => response.json())
    .then(data => {
      allSurahs = data.data;
      renderSurahList(data.data);
      // Tampilkan dashboard bookmark sebagai default
      showDashboard();
    })
    .catch(error => {
      console.error('Error mengambil daftar surah:', error);
      surahButtonsEl.innerHTML = '<p>Gagal memuat data surah.</p>';
    });
}

function renderSurahList(surahs) {
  surahButtonsEl.innerHTML = '';
  surahs.forEach(surah => {
    const btn = document.createElement('button');
    btn.className = 'surah-button';
    btn.textContent = `${surah.nomor}. ${surahNamesID[surah.nomor] || surah.nama}`;
    btn.addEventListener('click', () => {
      loadSurahDetail(surah.nomor);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    surahButtonsEl.appendChild(btn);
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

// Tampilkan dashboard bookmark sebagai tampilan default
function showDashboard() {
  backBtn.style.display = 'none';
  let bookmarks = getBookmarks();
  let html = `<h2>Daftar Bookmark</h2>`;
  if (!bookmarks.surahs.length && !bookmarks.ayahs.length) {
    html += `<p>Tidak ada bookmark.</p>`;
  } else {
    if (bookmarks.surahs.length) {
      html += `<div class="dashboard-section"><h3>Bookmark Surah</h3><ul>`;
      bookmarks.surahs.forEach(b => {
        html += `<li><a href="#" class="dashboard-surah" data-surah="${b.surah}">${b.title} (Surah ${b.surah})</a></li>`;
      });
      html += `</ul></div>`;
    }
    if (bookmarks.ayahs.length) {
      html += `<div class="dashboard-section"><h3>Bookmark Ayat</h3><ul>`;
      bookmarks.ayahs.forEach(b => {
        html += `<li><a href="#" class="dashboard-ayah" data-surah="${b.surah}" data-ayah="${b.ayah}">Surah ${b.surah} Ayat ${parseInt(b.ayah)+1}</a></li>`;
      });
      html += `</ul></div>`;
    }
  }
  surahDetailEl.innerHTML = html;
  // Event listener untuk link dashboard
  document.querySelectorAll('.dashboard-surah').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const surah = this.getAttribute('data-surah');
      loadSurahDetail(surah);
    });
  });
  document.querySelectorAll('.dashboard-ayah').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const surah = this.getAttribute('data-surah');
      const ayah = parseInt(this.getAttribute('data-ayah'));
      loadSurahDetail(surah, ayah);
    });
  });
}

// Fungsi load detail surah, mendukung parameter opsional scrollToAyah
function loadSurahDetail(nomor, scrollToAyah) {
  backBtn.style.display = 'inline-block';
  surahDetailEl.innerHTML = '<p>Memuat detail surah...</p>';
  fetch(`https://quran-api.santrikoding.com/api/surah/${nomor}`)
    .then(response => response.json())
    .then(data => {
      currentSurahNumber = parseInt(nomor);
      renderSurahDetail(data);
      loadTranslation(nomor);
      if (scrollToAyah !== undefined) {
        setTimeout(() => {
          const ayahEl = document.getElementById(`ayah-${scrollToAyah}`);
          if (ayahEl) { ayahEl.scrollIntoView({ behavior: 'smooth' }); }
        }, 500);
      }
    })
    .catch(error => {
      console.error('Error mengambil detail surah:', error);
      surahDetailEl.innerHTML = '<p>Gagal memuat detail surah.</p>';
    });
}

function renderSurahDetail(data) {
  let html = `<h2>${data.nama} (${data.nomor})</h2>`;
  // Top navigasi surah dan bookmark surah
  html += `<div class="surah-navigation-bottom">
            <button id="prevSurah" ${data.nomor == 1 ? 'disabled' : ''}>Surah Sebelumnya</button>
            <button id="bookmarkSurah">Bookmark Surah</button>
            <button id="nextSurah" ${data.nomor == 114 ? 'disabled' : ''}>Surah Selanjutnya</button>
          </div>`;
  // Tampilkan bismillah jika bukan surah 1 atau 9
  if (parseInt(data.nomor) !== 1 && parseInt(data.nomor) !== 9) {
    html += `<div class="bismillah">
               <span>بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ</span>
             </div>`;
  }
  // Kontrol murottal
  html += `<div id="murottal-container">
             <button id="murottal-btn">Play Murottal</button>
             <div id="murottal-player"></div>
           </div>`;
  // Dropdown Pilih Ayat
  html += `<select id="ayahDropdown"></select>`;
  
  // Loop untuk setiap ayat
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
          <button class="bookmark-ayah" data-surah="${data.nomor}" data-ayah="${index}" data-arabic="${ayat.ar}">Bookmark Ayat</button>
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

  // Navigasi surah tambahan di bagian bawah
  html += `<div class="surah-navigation-bottom">
             <button id="prevSurahBottom" ${data.nomor == 1 ? 'disabled' : ''}>Surah Sebelumnya</button>
             <button id="nextSurahBottom" ${data.nomor == 114 ? 'disabled' : ''}>Surah Selanjutnya</button>
           </div>`;

  surahDetailEl.innerHTML = html;

  // Event listener untuk dropdown "Pilih Ayat"
  let dropdownHTML = '<option value="">Pilih Ayat</option>';
  data.ayat.forEach((ayat, index) => {
    const nomorAyat = ayat.nomor || (index + 1);
    dropdownHTML += `<option value="${index}">Ayat ke-${nomorAyat}</option>`;
  });
  document.getElementById('ayahDropdown').innerHTML = dropdownHTML;
  document.getElementById('ayahDropdown').addEventListener('change', function () {
    const idx = this.value;
    if (idx !== '') {
      const ayahEl = document.getElementById(`ayah-${idx}`);
      if (ayahEl) { ayahEl.scrollIntoView({ behavior: 'smooth' }); }
    }
  });

  // Navigasi tombol di bagian atas
  document.getElementById('prevSurah').addEventListener('click', function(){
    if(data.nomor > 1) {
      loadSurahDetail(data.nomor - 1);
    }
  });
  document.getElementById('nextSurah').addEventListener('click', function(){
    if(data.nomor < 114) {
      loadSurahDetail(parseInt(data.nomor) + 1);
    }
  });
  // Navigasi tombol di bagian bawah
  document.getElementById('prevSurahBottom').addEventListener('click', function(){
    if(data.nomor > 1) {
      loadSurahDetail(data.nomor - 1);
    }
  });
  document.getElementById('nextSurahBottom').addEventListener('click', function(){
    if(data.nomor < 114) {
      loadSurahDetail(parseInt(data.nomor) + 1);
    }
  });

  // Toggle Bookmark Surah
  document.getElementById('bookmarkSurah').addEventListener('click', function(){
    const bookmarks = getBookmarks();
    const index = bookmarks.surahs.findIndex(b => b.surah == data.nomor);
    if(index === -1) {
      bookmarks.surahs.push({ surah: data.nomor, title: data.nama });
      saveBookmarks(bookmarks);
      alert('Surah dibookmark');
    } else {
      bookmarks.surahs.splice(index, 1);
      saveBookmarks(bookmarks);
      alert('Bookmark surah dihapus');
    }
  });

  // Tombol copy & toggle Bookmark Ayat
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
  document.querySelectorAll('.bookmark-ayah').forEach(btn => {
    btn.addEventListener('click', function () {
      const surah = this.getAttribute('data-surah');
      const ayah = this.getAttribute('data-ayah');
      const arabic = this.getAttribute('data-arabic');
      const bookmarks = getBookmarks();
      const index = bookmarks.ayahs.findIndex(b => b.surah == surah && b.ayah == ayah);
      if(index === -1) {
        bookmarks.ayahs.push({ surah, ayah, arabic });
        saveBookmarks(bookmarks);
        alert('Ayat dibookmark');
      } else {
        bookmarks.ayahs.splice(index, 1);
        saveBookmarks(bookmarks);
        alert('Bookmark ayat dihapus');
      }
    });
  });
  // Share dropdown
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
      } else if (platform === 'tw') {
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

  // Fitur Murottal
  const murottalBtn = document.getElementById('murottal-btn');
  murottalBtn.addEventListener('click', function() {
    if (!window.murottalAudio) {
      fetch(`https://api.alquran.cloud/v1/surah/${data.nomor}/editions/ar.alafasy`)
        .then(res => res.json())
        .then(responseData => {
          const editionData = responseData.data[0];
          let audioUrls = editionData.ayahs.map(ayah => ayah.audio).filter(url => url);
          if (parseInt(data.nomor) !== 1 && parseInt(data.nomor) !== 9) {
            const bismillahAudioUrl = "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3";
            audioUrls.unshift(bismillahAudioUrl);
          }
          if (audioUrls.length > 0) {
            window.murottalAudioUrls = audioUrls;
            window.murottalCurrentIndex = 0;
            window.murottalAudio = new Audio(audioUrls[0]);
            setupMurottalPlayer();
            window.murottalAudio.play();
            murottalBtn.textContent = "Stop Murottal";
          } else { 
            alert("Tidak ada audio murottal untuk surah ini."); 
          }
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

// Setup custom murottal player
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

// Fungsi loadTranslation: update terjemahan, transliterasi, dan custom audio player per ayat
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
      // Buat custom audio player per ayat (tanpa tombol forward & rewind)
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
            
            // Tombol Play/Pause saja
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

// Event listener tombol back di header untuk kembali ke dashboard
backBtn.addEventListener('click', showDashboard);

loadSurahList();