document.addEventListener('DOMContentLoaded', () => {
  const clickOverlay = document.getElementById('click-overlay');
  const introWrapper = document.getElementById('intro-wrapper');
  
  let animationStarted = false;

  // FIX: Check if loader was already played in this session
  const introPlayed = sessionStorage.getItem('tv_intro_played');

  if (introPlayed === 'true') {
    // Skip animation if already visited
    if (clickOverlay) clickOverlay.style.display = 'none';
    if (introWrapper) introWrapper.style.display = 'none';
    animationStarted = true;
  } else {
    // Play animation on first visit
    window.addEventListener('click', () => {
      if (animationStarted) return;
      animationStarted = true;
      sessionStorage.setItem('tv_intro_played', 'true'); // Save to session

      clickOverlay.style.opacity = '0';
      clickOverlay.style.pointerEvents = 'none';
      introWrapper.classList.add('play-anim');

      setTimeout(() => { introWrapper.classList.add('show-diagonal'); }, 2600);
      setTimeout(() => { introWrapper.classList.add('diagonal-active'); }, 2800);
      setTimeout(() => { introWrapper.style.display = 'none'; }, 4000);
    });
  }

  // FIX: Ensure profile tab shows on main index.html if user is registered
  const navProfileTab = document.getElementById('nav-profile-tab');
  if (navProfileTab && localStorage.getItem('techvision_user_profile')) {
    navProfileTab.classList.remove('hidden');
  }
});

/* =========================================================
   MAIN SITE — events render (Cyberpunk Trading Cards)
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const EVENTS = window.TV_EVENTS;
  const eventsGrid = document.getElementById('events-grid-container');

  // 1. Generate the Modern Glass Cards
  if (eventsGrid && EVENTS) {
    let html = '';
    // Modern, vibrant tech accents
    const accentColors = ['#4deeea', '#ff2b6d', '#bf00ff', '#ff6b00']; 
    
    EVENTS.forEach((ev, index) => {
      const themeColor = accentColors[index % accentColors.length];
      const imagePath = `images/${ev.key}.jpg`; 
      
      html += `
        <div class="modern-card reveal" style="--accent: ${themeColor};">
          <div class="mc-image-wrap">
            <img src="${imagePath}" alt="${ev.title}" onerror="this.onerror=null; this.src='https://placehold.co/400x300/1a1a1a/fff?text=TBA'">
            <div class="mc-badges">
              <span class="mc-day">${ev.day}</span>
              <span class="mc-fee">₹${ev.fee}</span>
            </div>
          </div>
          
          <div class="mc-content">
            <h3 class="mc-title">${ev.title}</h3>
            <p class="mc-desc">"${ev.tagline}"</p>
            
            <div class="mc-stats">
              <div class="mc-stat"><i>⏱️</i> ${ev.stats.duration}</div>
              <div class="mc-stat"><i>👥</i> ${ev.stats.team}</div>
              <div class="mc-stat"><i>🏆</i> ${ev.stats.podium}</div>
            </div>
          </div>
          
          <div class="mc-actions">
            <a href="event-detail.html?event=${encodeURIComponent(ev.key)}" class="mc-btn-secondary">View Detail</a>
            <a href="register.html?event=${encodeURIComponent(ev.title)}" class="mc-btn-primary">Register</a>
          </div>
        </div>
      `;
    });
    eventsGrid.innerHTML = html;

    // ==========================================
    // NEW: MOBILE AUTO-CENTER GLOW TRACKER
    // ==========================================
    const allCards = eventsGrid.querySelectorAll('.modern-card');
    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // If 60% or more of the card is visible on screen, light it up!
        if (entry.isIntersecting) {
          entry.target.classList.add('mobile-glow');
        } else {
          entry.target.classList.remove('mobile-glow');
        }
      });
    }, {
      root: eventsGrid, // Watch the scrolling grid
      threshold: 0.6    // 60% visibility trigger
    });

    allCards.forEach(card => scrollObserver.observe(card));
    // ==========================================
  }

  // 2. Scroll Reveal Observer (Untouched)
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('in-view');
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  // 3. Progress Bar (Untouched)
  const progressBar = document.getElementById('progress-bar');
  function updateProgress() {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    if (progressBar) progressBar.style.width = scrolled + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });

  // 4. Site Nav (Untouched)
  const siteNav = document.getElementById('site-nav');
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const cur = window.scrollY;
    if (siteNav) {
      siteNav.classList.toggle('scrolled', cur > 40);
      if (cur > lastScroll && cur > 200) siteNav.classList.add('nav-hidden');
      else siteNav.classList.remove('nav-hidden');
    }
    lastScroll = cur;
  }, { passive: true });

  // 5. Nav Link Observer (Untouched)
  const navLinkEls = document.querySelectorAll('.nav-links a[data-nav]');
  const sectionsForNav = ['about', 'events', 'schedule', 'contact'].map(id => document.getElementById(id)).filter(Boolean);
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinkEls.forEach(a => a.classList.toggle('active', a.dataset.nav === id));
      }
    });
  }, { threshold: 0.4 });
  sectionsForNav.forEach(sec => navObserver.observe(sec));

  // 6. Mobile Nav Toggle (Untouched)
  const navToggle = document.getElementById('nav-toggle');
  const navLinksWrap = document.getElementById('nav-links');
  if (navToggle && navLinksWrap) {
    navToggle.addEventListener('click', () => navLinksWrap.classList.toggle('open'));
    navLinksWrap.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinksWrap.classList.remove('open')));
  }

  // 7. Smooth Scroll Links (Untouched)
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
/* =========================================================
   SECRET ADMIN PANEL & QR SCANNER (BULLETPROOF VERSION)
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const adminOverlay = document.getElementById('admin-overlay');
  
  // -- 1. THE TRIPLE CLICK FIX --
  let clickCount = 0;
  let clickTimer;
  
  document.querySelectorAll('.nav-logo').forEach(logo => {
    logo.addEventListener('click', (e) => {
      // If the admin HTML doesn't exist on this page, act like a normal link
      if (!adminOverlay) return; 

      e.preventDefault(); // Stop the screen from jumping while we count clicks!
      clickCount++;
      clearTimeout(clickTimer);
      
      clickTimer = setTimeout(() => { 
        // If they didn't reach 3 clicks, trigger the normal link navigation
        if (clickCount < 3 && logo.tagName === 'A') {
          window.location.href = logo.href;
        }
        clickCount = 0; 
      }, 400); // 400ms window for rapid clicks
      
      if (clickCount === 3) {
        clickCount = 0;
        askForPassword();
      }
    });
  });

  // -- 2. KEYBOARD SHORTCUT BACKUP (Ctrl + Shift + X) --
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'x') {
      if (adminOverlay) askForPassword();
    }
  });

  function askForPassword() {
    const password = prompt("SYS:// ENTER ADMIN OVERRIDE CODE:");
    if (password === "admin2026") {
      openAdminPanel();
    } else if (password) {
      alert("ACCESS DENIED.");
    }
  }

  // -- 3. ADMIN PANEL LOGIC --
  const closeBtn = document.getElementById('close-admin');
  const refreshStats = document.getElementById('refresh-stats');
  const liveCount = document.getElementById('live-count');
  
  // Your active Google Web App URL
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzLYsoed2iICO8wBnIKKMugk86nV5ZaTusxBNhBfQb9Jl_qCuyWmmzdyWrcAeMwpjaeFQ/exec';
  let html5QrcodeScanner;

  function openAdminPanel() {
    adminOverlay.classList.remove('hidden');
    fetchStats();
    
    // Force the browser to load the camera library if it hasn't already
    if (typeof Html5QrcodeScanner === 'undefined') {
      console.log("Loading camera library...");
      const script = document.createElement('script');
      script.src = "https://unpkg.com/html5-qrcode";
      script.onload = () => { initScanner(); }; // Calls the function once loaded
      document.body.appendChild(script);
    } else {
      initScanner(); // Calls the function immediately if already loaded
    }
  }

  function initScanner() {
    const qrReader = document.getElementById('qr-reader');
    const qrResult = document.getElementById('qr-result');
    if (!qrReader || !qrResult) return;

    // Un-hide the containers first
    qrResult.classList.add('hidden');
    qrReader.classList.remove('hidden');
    
    // PREVENT DOUBLE-OPEN CRASH: Wipe the old scanner if it exists before making a new one
    if (html5QrcodeScanner) {
      try {
        html5QrcodeScanner.clear();
      } catch(e) { console.log("Scanner clear error ignored."); }
    }
    
    // Dynamically calculate the box size so it perfectly fits mobile phones
    const qrboxFunction = function(viewfinderWidth, viewfinderHeight) {
      let minEdgePercentage = 0.70; // 70% of the screen width
      let minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
      let qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
      return { width: qrboxSize, height: qrboxSize };
    };
    
    html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader", 
      { 
        fps: 15, 
        qrbox: qrboxFunction,
        aspectRatio: 1.0, 
        disableFlip: false 
      }, 
      false
    );
    
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
  }

  function fetchStats() {
    if (!liveCount) return;
    liveCount.textContent = "WAIT...";
    fetch(GOOGLE_SCRIPT_URL)
      .then(res => res.json())
      .then(data => { liveCount.textContent = data.count; })
      .catch(err => { liveCount.textContent = "ERR"; console.error(err); });
  }
  
  if (refreshStats) refreshStats.addEventListener('click', fetchStats);

  // -- 4. SCANNER LOGIC --
  function initScanner() {
    const qrReader = document.getElementById('qr-reader');
    const qrResult = document.getElementById('qr-result');
    if (!qrReader || !qrResult) return;

    qrResult.classList.add('hidden');
    qrReader.classList.remove('hidden');
    
    // 1. PREVENT DOUBLE-OPEN CRASH: Wipe the old scanner if it exists before making a new one
    if (html5QrcodeScanner) {
      try {
        html5QrcodeScanner.clear();
      } catch(e) { console.log("Scanner clear error ignored."); }
    }
    
    // 2. ULTRA-SAFE SETTINGS: Drop the box size to 200 to guarantee it fits every screen
    html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader", 
      { fps: 10, qrbox: 200 }, 
      false
    );
    
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
  }

  function onScanSuccess(decodedText) {
    try {
      const data = JSON.parse(decodedText);
      
      html5QrcodeScanner.clear();
      document.getElementById('qr-reader').classList.add('hidden');
      document.getElementById('qr-result').classList.remove('hidden');
      
      document.getElementById('res-name').textContent = data.name || "N/A";
      document.getElementById('res-phone').textContent = data.phone || "N/A";
      document.getElementById('res-college').textContent = data.college || "N/A";
      
      let eventsArray = [];
      if (Array.isArray(data.events)) {
        eventsArray = data.events;
      } else if (data.events) {
        eventsArray = data.events.split(',').map(e => e.trim());
      }
      
      document.getElementById('res-events').textContent = eventsArray.join(", ") || "None";
      document.getElementById('res-fee').textContent = data.fee || "0";

      // --- GENERATE DYNAMIC CHECK-IN BUTTONS ---
      const checkinContainer = document.getElementById('checkin-container');
      checkinContainer.innerHTML = '<h5 style="color:var(--cyan); margin-bottom:5px; font-family:\'Orbitron\', sans-serif;">EVENT CHECK-IN</h5>';
      
      eventsArray.forEach(ev => {
        if (!ev) return;
        
        const btn = document.createElement('button');
        btn.className = 'btn-detail';
        btn.style.width = '100%';
        btn.style.justifyContent = 'space-between';
        btn.innerHTML = `<span>${ev}</span> <span>[ CHECK IN ]</span>`;
        
        btn.addEventListener('click', () => {
          // Visual loading state
          btn.innerHTML = `<span>${ev}</span> <span>[ SYNCING... ]</span>`;
          btn.style.opacity = '0.6';
          btn.disabled = true;
          
          fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            redirect: 'follow', 
            headers: {
              'Content-Type': 'text/plain;charset=utf-8', 
            },
            body: JSON.stringify({
              action: 'checkin',
              name: data.name, // <--- ADD THIS LINE
              phone: data.phone, 
              event: ev
            })
          })
          .then(res => res.json())
          .then(resData => {
            if (resData.result === 'success') {
              btn.innerHTML = `<span>${ev}</span> <span>[ VERIFIED ✅ ]</span>`;
              btn.style.borderColor = '#4deeea';
              btn.style.color = '#4deeea';
              btn.style.opacity = '1';
            } else {
              btn.innerHTML = `<span>${ev}</span> <span>[ ERROR ]</span>`;
              btn.style.borderColor = '#ff2b6d';
              btn.style.color = '#ff2b6d';
              btn.disabled = false;
              alert(resData.error);
            }
          })
          .catch(err => {
            btn.innerHTML = `<span>${ev}</span> <span>[ NETWORK ERROR ]</span>`;
            btn.disabled = false;
          });
        });
        
        checkinContainer.appendChild(btn);
      });
      
    } catch (e) {
      console.error(e);
      alert("Scanner read the code, but the data is broken!");
    }
  }
  function onScanFailure(error) { /* Background scanning process */ }

  const scanAgainBtn = document.getElementById('scan-again');
  if (scanAgainBtn) {
    scanAgainBtn.addEventListener('click', () => { initScanner(); });
  }
})