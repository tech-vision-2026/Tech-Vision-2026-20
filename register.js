document.addEventListener('DOMContentLoaded', () => {

  const EVENTS = window.TV_EVENTS || [];

  // Enhanced Mobile Nav Toggle with Backdrop
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

  const params = new URLSearchParams(window.location.search);
  const preselect = params.get('event');

  const dayMap = { 
    '1': EVENTS.filter(e => {
      const d = String(e.day || '').toUpperCase();
      return d.includes('10') || d.includes('DAY 1');
    }), 
    '2': EVENTS.filter(e => {
      const d = String(e.day || '').toUpperCase();
      return d.includes('11') || d.includes('DAY 2');
    }) 
  };

  document.querySelectorAll('.event-checks').forEach(container => {
    const day = container.dataset.day;
    const currentEvents = dayMap[day] || [];
    
    currentEvents.forEach(ev => {
      const feeNum = typeof ev.fee === 'number' ? ev.fee : parseInt(String(ev.fee), 10) || 0;
      const label = document.createElement('label');
      label.className = 'event-check';
      label.innerHTML = `
        <input type="checkbox" name="events" value="${ev.title}" data-fee="${feeNum}" ${preselect === ev.title ? 'checked' : ''}>
        <span class="check-box"></span>
        <span class="check-info">
          <span class="check-title">${ev.title}</span>
          <span class="check-fee">&#8377;${ev.fee}</span>
        </span>`;
      container.appendChild(label);
    });
  });

  const totalAmountEl = document.getElementById('total-amount');
  const totalSubEl = document.getElementById('total-events-sub');
  function recalcTotal() {
    const checked = Array.from(document.querySelectorAll('input[name="events"]:checked'));
    const total = checked.reduce((sum, c) => sum + (parseInt(c.dataset.fee, 10) || 0), 0);
    if (totalAmountEl) totalAmountEl.textContent = '\u20B9' + total;
    if (totalSubEl) {
      totalSubEl.textContent = checked.length
        ? checked.length + ' event' + (checked.length > 1 ? 's' : '') + ' selected'
        : 'No events selected yet';
    }
  }
  document.addEventListener('change', (e) => {
    if (e.target.name === 'events') recalcTotal();
  });
  recalcTotal();

  /* ---------- UPDATE FILE NAME WHEN UPLOADED ---------- */
  const paymentInput = document.getElementById('payment-proof');
  const paymentText = document.getElementById('payment-file-text');

  if (paymentInput && paymentText) {
    paymentInput.addEventListener('change', function() {
      if (this.files && this.files.length > 0) {
        paymentText.textContent = this.files[0].name;
        paymentText.style.color = '#4deeea';
      } else {
        paymentText.textContent = 'No file chosen';
        paymentText.style.color = '#94a3b8';
      }
    });
  }

  /* ---------- PROFILE, ID CARD & QR CODE LOGIC ---------- */
  const form = document.getElementById('reg-form');
  const profileSection = document.getElementById('user-profile-section');
  const navProfileTab = document.getElementById('nav-profile-tab');
  const heroSection = document.getElementById('hero-section');
  const clearProfileBtn = document.getElementById('clear-profile-btn');

  function openProfileView() {
    if (form) form.classList.add('hidden');
    if (heroSection) heroSection.style.display = 'none';
    if (profileSection) {
      profileSection.classList.remove('hidden');
      profileSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (navProfileTab) navProfileTab.classList.remove('hidden');
  }

  function renderProfileCard(profile) {
    document.getElementById('profile-name').textContent = (profile.name || 'UNKNOWN').toUpperCase();
    document.getElementById('prof-contact').textContent = (profile.phone || '') + '  \u00B7  ' + (profile.email || '');
    document.getElementById('prof-college').textContent = (profile.college || '').toUpperCase();
    document.getElementById('prof-events').textContent = Array.isArray(profile.events) ? profile.events.join(', ') : (profile.events || 'None');
    document.getElementById('prof-fee').textContent = '\u20B9' + (profile.totalFee || 0);

    const profileImgEl = document.getElementById('profile-display-img');
    if (profileImgEl && profile.profilePic && profile.profilePic.base64) {
      profileImgEl.src = `data:${profile.profilePic.mimeType};base64,${profile.profilePic.base64}`;
      profileImgEl.style.display = 'inline-block';
    } else if (profileImgEl) {
      profileImgEl.style.display = 'none'; 
    }

    const qrPayload = JSON.stringify({
      name: profile.name,
      phone: profile.phone,
      email: profile.email,
      college: profile.college,
      events: profile.events,
      fee: profile.totalFee
    });
    
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=png&data=${encodeURIComponent(qrPayload)}`;
    const qrCodeImg = document.getElementById('profile-qr-code');
    if (qrCodeImg) qrCodeImg.src = qrUrl;
  }

  const savedProfile = localStorage.getItem('techvision_user_profile');
  if (savedProfile) {
    try {
      const profile = JSON.parse(savedProfile);
      renderProfileCard(profile);
      openProfileView();
    } catch (e) {
      console.error("Corrupted profile data:", e);
      localStorage.removeItem('techvision_user_profile');
    }
  } else {
    if (navProfileTab) navProfileTab.classList.add('hidden');
  }

  if (navProfileTab) {
    navProfileTab.addEventListener('click', (e) => {
      e.preventDefault();
      openProfileView();
      if (navLinksWrap && navLinksWrap.classList.contains('open')) {
        navLinksWrap.classList.remove('open');
        if (navToggle) navToggle.classList.remove('open');
      }
    });
  }

  if (clearProfileBtn) {
    clearProfileBtn.addEventListener('click', () => {
      localStorage.removeItem('techvision_user_profile');
      if (profileSection) profileSection.classList.add('hidden');
      if (heroSection) heroSection.style.display = 'block';
      if (navProfileTab) navProfileTab.classList.add('hidden');
      if (form) {
        form.classList.remove('hidden');
        form.reset();
      }
      recalcTotal();
    });
  }

  /* ---------- FORM SUBMIT WITH MULTIPLE FILES ---------- */
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const checked = Array.from(document.querySelectorAll('input[name="events"]:checked'));
      const requiredInputs = form.querySelectorAll('input[required]');
      let isFormValid = true;

      requiredInputs.forEach(input => {
        if (!input.value.trim()) {
          isFormValid = false;
          input.style.borderColor = '#ff2b6d';
        } else {
          input.style.borderColor = ''; 
        }
      });

      const profilePicInput = form.querySelector('input[name="profilepic"]');
      const idFileInput = form.querySelector('input[name="idfile"]');
      const paymentInput = document.getElementById('payment-proof');
      
      const profilePicFile = profilePicInput ? profilePicInput.files[0] : null;
      const idFile = idFileInput ? idFileInput.files[0] : null;
      const paymentFile = paymentInput ? paymentInput.files[0] : null;

      if (!isFormValid || checked.length === 0 || !paymentFile || !profilePicFile || !idFile) {
        alert("Registration failed! Please fill all required fields, pick at least one event, and upload all 3 required files.");
        form.reportValidity(); 
        return;
      }

      const submitBtn = form.querySelector('.confirm-btn');
      let loadingInterval;

      if (submitBtn) {
        submitBtn.disabled = true;
        
        const loadMessages = [
          "UPLOADING FILES...", 
          "PLEASE WAIT WHILE ID IS GETTING READY...", 
          "MAKING QR CODE...", 
          "VERIFYING DATA...",
          "ALMOST THERE..."
        ];
        
        let msgIndex = 0;
        submitBtn.innerHTML = `<span>${loadMessages[0]}</span>`;
        
        loadingInterval = setInterval(() => {
          msgIndex++;
          submitBtn.innerHTML = `<span>${loadMessages[msgIndex % loadMessages.length]}</span>`;
        }, 1500);
      }

      const getBase64 = (file) => new Promise((resolve, reject) => {
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve({ 
            base64: reader.result.split(',')[1], 
            mimeType: file.type, 
            fileName: file.name 
        });
        reader.onerror = error => reject(error);
      });

      Promise.all([
        getBase64(profilePicFile),
        getBase64(idFile),
        getBase64(paymentFile)
      ]).then(([profileData, idData, paymentData]) => {
        
        const formData = {
          name: form.name.value.trim(),
          phone: form.phone.value.trim(),
          email: form.email.value.trim(),
          college: form.college.value.trim(),
          events: checked.map(c => c.value),
          team: "", 
          totalFee: checked.reduce((sum, c) => sum + (parseInt(c.dataset.fee, 10) || 0), 0),
          profilePic: profileData,
          idFile: idData,
          paymentProof: paymentData
        };

        try {
          localStorage.setItem('techvision_user_profile', JSON.stringify(formData));
        } catch (storageError) {
          console.warn("Images are too large for browser storage. Saving lite profile instead.");
          const liteData = { ...formData, profilePic: null, idFile: null, paymentProof: null };
          localStorage.setItem('techvision_user_profile', JSON.stringify(liteData));
        }
        if (loadingInterval) clearInterval(loadingInterval);
        renderProfileCard(formData);
        openProfileView();

        fetch('https://script.google.com/macros/s/AKfycbzLYsoed2iICO8wBnIKKMugk86nV5ZaTusxBNhBfQb9Jl_qCuyWmmzdyWrcAeMwpjaeFQ/exec', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(formData)
        })
        .then(res => res.json())
        .then(data => console.log('Google Script Sync Success:', data))
        .catch(err => console.error('Background sync failed:', err));
        
      }).catch(err => {
          console.error("File reading error:", err);
          alert("Error processing files. Please try again.");
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Confirm Registration</span>';
          }
      });
    });
  }
});

// Apply 3D Tilt to the Registration Ticket[cite: 5]
document.addEventListener('DOMContentLoaded', () => {
  const ticket = document.getElementById('user-profile-section');
  
  if (ticket) {
    ticket.addEventListener('mousemove', (e) => {
      const rect = ticket.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -10; 
      const rotateY = ((x - centerX) / centerX) * 10;

      ticket.style.transition = 'none';
      ticket.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    ticket.addEventListener('mouseleave', () => {
      ticket.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
      ticket.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  }
});