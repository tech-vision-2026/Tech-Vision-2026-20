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
  <div class="modern-card in-view" style="--accent: ${themeColor}; opacity: 1 !important; transform: none !important;">
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
  // SCROLL RIGHT ARROW LOGIC
  // ==========================================
  const slideBtn = document.getElementById('slide-right-btn');

  if (eventsGrid && slideBtn) {
    // 1. Click to scroll horizontally
    slideBtn.addEventListener('click', () => {
      // Scrolls right by the width of one card (~320px) + gap
      eventsGrid.scrollBy({ left: 340, behavior: 'smooth' });
    });

    // 2. Hide button when scrolled to the end
    eventsGrid.addEventListener('scroll', () => {
      // Check if the scroll position + visible width equals the total scrollable width
      if (eventsGrid.scrollLeft + eventsGrid.clientWidth >= eventsGrid.scrollWidth - 20) {
        slideBtn.classList.add('hidden'); // Hide arrow
      } else {
        slideBtn.classList.remove('hidden'); // Show arrow
      }
    });
  }

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

  // 6. Mobile Nav Toggle - Simple and Bulletproof
  const navToggle = document.getElementById('nav-toggle');
  const navLinksWrap = document.getElementById('nav-links');
  
  // Create backdrop overlay if it doesn't exist
  let navBackdrop = document.querySelector('.nav-backdrop');
  if (!navBackdrop) {
    navBackdrop = document.createElement('div');
    navBackdrop.className = 'nav-backdrop';
    document.body.appendChild(navBackdrop);
  }
  
  function closeMenu() {
    if (navLinksWrap) navLinksWrap.classList.remove('open');
    if (navToggle) navToggle.classList.remove('open');
    if (navBackdrop) navBackdrop.classList.remove('show');
    document.body.style.overflow = '';
  }
  
  function openMenu() {
    if (navLinksWrap) navLinksWrap.classList.add('open');
    if (navToggle) navToggle.classList.add('open');
    if (navBackdrop) navBackdrop.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  
  if (navToggle && navLinksWrap) {
    // Toggle menu on button click
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (navLinksWrap.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });
    
    // Close menu when backdrop is clicked
    if (navBackdrop) {
      navBackdrop.addEventListener('click', closeMenu);
    }
    
    // Close menu when a link is clicked
    navLinksWrap.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
    
    // Close menu with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    });
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
    
    // SAFE RESTART: Wait for the camera to shut off before making a new one
    if (html5QrcodeScanner) {
      html5QrcodeScanner.clear().then(() => {
        startNewScanner();
      }).catch(err => {
        console.error("Camera clear error: ", err);
        startNewScanner();
      });
    } else {
      startNewScanner();
    }
  }

  function startNewScanner() {
    // ULTRA-SAFE SETTINGS: Drop the box size to 250 to guarantee it fits every screen
    html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader", 
      { fps: 10, qrbox: 250 }, 
      false
    );
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
  
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
      
      // Show a loading message while we ask Google Sheets for the live status
      checkinContainer.innerHTML = '<h5 style="color:var(--cyan); margin-bottom:5px; font-family:\'Orbitron\', sans-serif;">EVENT CHECK-IN</h5><p style="color:#a0a0a0; font-size:12px; margin-bottom: 10px;">Checking live status...</p>';
      
      // Fetch live status from backend
      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        redirect: 'follow', 
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'get_status',
          name: data.name,
          phone: data.phone
        })
      })
      .then(res => res.json())
      .then(resData => {
        checkinContainer.innerHTML = '<h5 style="color:var(--cyan); margin-bottom:10px; font-family:\'Orbitron\', sans-serif;">EVENT CHECK-IN</h5>';
        
        const liveStatus = resData.status || "";

        eventsArray.forEach(ev => {
          if (!ev) return;
          
          // Check if this specific event is inside the liveStatus string
          const isAlreadyCheckedIn = liveStatus.includes(ev);
          
          const btn = document.createElement('button');
          btn.className = 'btn-detail';
          btn.style.width = '100%';
          btn.style.justifyContent = 'space-between';
          
          if (isAlreadyCheckedIn) {
            // Already checked in previously! Lock it.
            btn.innerHTML = `<span>${ev}</span> <span>[ VERIFIED ✅ ]</span>`;
            btn.style.borderColor = '#4deeea';
            btn.style.color = '#4deeea';
            btn.disabled = true; 
          } else {
            // Not checked in yet. Show normal button.
            btn.innerHTML = `<span>${ev}</span> <span>[ CHECK IN ]</span>`;
            btn.addEventListener('click', () => {
              
              btn.innerHTML = `<span>${ev}</span> <span>[ SYNCING... ]</span>`;
              btn.style.opacity = '0.6';
              btn.disabled = true;
              
              fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                redirect: 'follow', 
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'checkin', name: data.name, phone: data.phone, event: ev })
              })
              .then(res => res.json())
              .then(checkinData => {
                if (checkinData.result === 'success') {
                  btn.innerHTML = `<span>${ev}</span> <span>[ VERIFIED ✅ ]</span>`;
                  btn.style.borderColor = '#4deeea';
                  btn.style.color = '#4deeea';
                  btn.style.opacity = '1';
                } else {
                  btn.innerHTML = `<span>${ev}</span> <span>[ ERROR ]</span>`;
                  btn.style.borderColor = '#ff2b6d';
                  btn.style.color = '#ff2b6d';
                  btn.disabled = false;
                  alert(checkinData.error);
                }
              })
              .catch(err => {
                btn.innerHTML = `<span>${ev}</span> <span>[ NETWORK ERROR ]</span>`;
                btn.disabled = false;
              });
            });
          }
          
          checkinContainer.appendChild(btn);
        });
      })
      .catch(err => {
        checkinContainer.innerHTML += '<p style="color:#ff2b6d; font-size:12px;">Failed to connect to server. Check internet & try scanning again.</p>';
      });
    } catch (err) {
      console.log("Error scanning QR:", err);
    }
  }

  function onScanFailure(error) {
    console.warn("QR scan failed:", error);
  }
});

/* =========================================================
   GLOBAL 3D TILT HOVER EFFECT (DYNAMIC)
========================================================= */
document.addEventListener('mouseover', (e) => {
  // 1. Check if the mouse is hovering over any of our target cards
  const card = e.target.closest('.hero-glass-card, .about-glass-card, .modern-card, .day-card, .committee-card, .reg-ticket, .detail-container');
  
  // If we aren't on a card, or if the 3D effect is already active on it, do nothing
  if (!card || card.dataset.tiltActive) return;
  
  // Mark the card as active
  card.dataset.tiltActive = "true";

  // 2. Mouse Move: Calculate the exact 3D tilt
  card.addEventListener('mousemove', (moveEvent) => {
    const rect = card.getBoundingClientRect();
    const x = moveEvent.clientX - rect.left;
    const y = moveEvent.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Tilt intensity (12 degrees max)
    const rotateX = ((y - centerY) / centerY) * -12; 
    const rotateY = ((x - centerX) / centerX) * 12;

    card.style.transition = 'none';
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
  });

  // 3. Mouse Leave: Smoothly snap the card back to flat
  card.addEventListener('mouseleave', () => {
    card.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    
    // Reset the state so it can be triggered again perfectly
    setTimeout(() => { card.dataset.tiltActive = "false"; }, 600);
  });
});

/* =========================================================
   3D WEBGL PARTICLE FIELD & SCROLL-FLY CAMERA
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('#webgl-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // 1. Setup Scene, Camera, and Renderer
  const scene = new THREE.Scene();
  // Add a subtle dark fog to blend distant particles into the shadows
  scene.fog = new THREE.FogExp2(0x0a050f, 0.015); 

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 10; // Starting position

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 2. Generate Cyberpunk Neon Dust
  const geometry = new THREE.BufferGeometry();
  const particleCount = 3000;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const colorCyan = new THREE.Color('#4deeea');
  const colorMagenta = new THREE.Color('#ff2b6d');

  for(let i = 0; i < particleCount * 3; i += 3) {
    // Spread particles across a wide 3D space
    positions[i] = (Math.random() - 0.5) * 80;     // X axis (Left/Right)
    positions[i+1] = (Math.random() - 0.5) * 80;   // Y axis (Up/Down)
    positions[i+2] = (Math.random() - 0.5) * 100;  // Z axis (Depth)

    // Randomly mix Cyan and Magenta for each particle
    const mixedColor = colorCyan.clone().lerp(colorMagenta, Math.random());
    colors[i] = mixedColor.r;
    colors[i+1] = mixedColor.g;
    colors[i+2] = mixedColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Particle Material styling (Glowing effect using Additive Blending)
  const material = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // 3. Interactive Mouse/Touch & Ambient Animation Loop
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  // Track desktop mouse movement
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2);
    mouseY = (e.clientY - window.innerHeight / 2);
  });
  
  // Track mobile touch swiping
  window.addEventListener('touchmove', (e) => {
    mouseX = (e.touches[0].clientX - window.innerWidth / 2);
    mouseY = (e.touches[0].clientY - window.innerHeight / 2);
  }, { passive: true });

  const clock = new THREE.Clock();
  
  function animate() {
    const elapsedTime = clock.getElapsedTime();
    
    // Calculate the target positions based on where the user is pointing
    targetX = mouseX * 0.0015;
    targetY = mouseY * 0.0015;
    
    // Smoothly interpolate the particle rotation (creates the heavy, fluid 3D feel)
    // We add +0.001 to the Y rotation so it keeps a slow, ambient spin even if they stop moving
    particles.rotation.y += 0.05 * (targetX - particles.rotation.y) + 0.001; 
    particles.rotation.x += 0.05 * (targetY - particles.rotation.x);
    particles.rotation.z = elapsedTime * 0.01; // Keep the ambient depth spin
    
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  // 4. GSAP ScrollTrigger: Fly the camera forward as the user scrolls
  gsap.registerPlugin(ScrollTrigger);
  
  gsap.to(camera.position, {
    z: -40, // How far forward the camera flies into the screen
    ease: "none",
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.5 // Smooths out the scroll (1.5 seconds of momentum)
    }
  });

  // 5. Handle Window Resizing smoothly
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});

/* =========================================================
   MOBILE HARDWARE MAGIC & CRT TRANSITIONS
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  
  // ---------------------------------------------------
  // 1. CRT TV PAGE TRANSITIONS
  // ---------------------------------------------------
  // Inject the CRT layer into the DOM
  const crtLayer = document.createElement('div');
  crtLayer.id = 'crt-transition-layer';
  document.body.appendChild(crtLayer);

  // Play "Turn On" animation when the page first loads
  setTimeout(() => {
    crtLayer.classList.add('crt-on');
  }, 50);

  // Intercept all clicks on links to play the "Turn Off" animation
  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetUrl = link.getAttribute('href');
      
      // Ignore empty links, anchor links (#), or links opening in a new tab
      if (!targetUrl || targetUrl.startsWith('#') || link.getAttribute('target') === '_blank') return;

      e.preventDefault(); // Stop the browser from instantly changing pages

      // Play the CRT Turn Off animation
      crtLayer.classList.remove('crt-on');
      crtLayer.classList.add('crt-off');

      // Wait exactly 450ms for the animation to finish, then actually change the page
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 450);
    });
  });


  // ---------------------------------------------------
  // 2. HOLOGRAPHIC FOIL (GYROSCOPE TILT)
  // ---------------------------------------------------
  // Target the registration ticket (adjust class/ID if necessary)
  const ticket = document.querySelector('.reg-ticket') || document.querySelector('#user-profile-section');
  
  if (ticket) {
    // Inject the holographic layer into the ticket
    const holo = document.createElement('div');
    holo.className = 'holo-glare';
    ticket.appendChild(holo);

    // MOBILE SENSOR: Connect the foil to the phone's physical gyroscope
    window.addEventListener('deviceorientation', (e) => {
      if (!e.beta || !e.gamma) return; // Ignore if on a device without a gyro
      
      // Calculate how far the phone is tilted
      const tx = Math.max(-50, Math.min(50, e.gamma * 1.5)); // Left/Right tilt
      const ty = Math.max(-50, Math.min(50, (e.beta - 45) * 1.5)); // Up/Down tilt (assuming phone is held at 45 degree angle)
      
      // Move the gradient foil
      ticket.style.setProperty('--tx', `${tx}%`);
      ticket.style.setProperty('--ty', `${ty}%`);
    });

    // DESKTOP FALLBACK: Connect the foil to the mouse pointer
    ticket.addEventListener('mousemove', (e) => {
      const rect = ticket.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      ticket.style.setProperty('--tx', `${(x - 0.5) * 100}%`);
      ticket.style.setProperty('--ty', `${(y - 0.5) * 100}%`);
    });
  }
});

/* =========================================================
   HIGH-PERFORMANCE 3D MOBILE SCROLL
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  // Make sure GSAP and ScrollTrigger are available
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // Select all the cards we want to animate on scroll
  const scrollCards = gsap.utils.toArray('.modern-card, .day-card, .about-glass-card');

  scrollCards.forEach(card => {
    gsap.fromTo(card, 
      {
        // STARTING STATE: Pushed back in Z-space, rotated back 45 degrees, and faded out
        opacity: 0,
        rotationX: -45,
        z: -150,
        scale: 0.85
      },
      {
        // ENDING STATE: Flat, full size, fully visible
        opacity: 1,
        rotationX: 0,
        z: 0,
        scale: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: card,
          // Animation starts when the top of the card hits 95% of the viewport (bottom of screen)
          start: "top 95%", 
          // Animation finishes when the top of the card hits 65% of the viewport (middle of screen)
          end: "top 65%",   
          // 'scrub: 1' means the animation smoothly catches up to the scrollbar over 1 second
          scrub: 1,         
          // Optional: Reverses the 3D effect if they scroll back up!
          toggleActions: "play reverse play reverse" 
        }
      }
    );
  });
});