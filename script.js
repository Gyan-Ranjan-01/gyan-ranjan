document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. THEME MANAGER (DARK / LIGHT MODE)
  // ==========================================
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeToggleMobileBtn = document.getElementById('theme-toggle-mobile');
  
  const themeIconDark = document.getElementById('theme-icon-dark');
  const themeIconLight = document.getElementById('theme-icon-light');
  const themeIconDarkM = document.querySelector('.theme-icon-dark-m');
  const themeIconLightM = document.querySelector('.theme-icon-light-m');

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      if (themeIconDark) themeIconDark.style.display = 'none';
      if (themeIconLight) themeIconLight.style.display = 'block';
      if (themeIconDarkM) themeIconDarkM.style.display = 'none';
      if (themeIconLightM) themeIconLightM.style.display = 'block';
    } else {
      document.documentElement.classList.remove('dark');
      if (themeIconDark) themeIconDark.style.display = 'block';
      if (themeIconLight) themeIconLight.style.display = 'none';
      if (themeIconDarkM) themeIconDarkM.style.display = 'block';
      if (themeIconLightM) themeIconLightM.style.display = 'none';
    }
  }

  // Initial Theme Check (Local storage preference or system preference)
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  applyTheme(initialTheme);

  function toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  }

  if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
  if (themeToggleMobileBtn) themeToggleMobileBtn.addEventListener('click', toggleTheme);


  // ==========================================
  // 2. STICKY HEADER & ACTIVE SECTION LINKS
  // ==========================================
  const header = document.querySelector('header');
  const scrollThreshold = 20;

  window.addEventListener('scroll', () => {
    if (window.scrollY > scrollThreshold) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });


  // ==========================================
  // 3. MOBILE MENU TOGGLE
  // ==========================================
  const burgerBtn = document.getElementById('burger-btn');
  const mobileNavPanel = document.getElementById('mobile-nav-panel');
  const burgerIcon = document.getElementById('burger-icon');
  const closeIcon = document.getElementById('close-icon');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  function toggleMobileMenu() {
    const isOpen = mobileNavPanel.classList.contains('open');
    if (isOpen) {
      mobileNavPanel.classList.remove('open');
      burgerIcon.style.display = 'block';
      closeIcon.style.display = 'none';
      document.body.style.overflow = '';
    } else {
      mobileNavPanel.classList.add('open');
      burgerIcon.style.display = 'none';
      closeIcon.style.display = 'block';
      document.body.style.overflow = 'hidden';
    }
  }

  if (burgerBtn) {
    burgerBtn.addEventListener('click', toggleMobileMenu);
  }

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileNavPanel.classList.remove('open');
      burgerIcon.style.display = 'block';
      closeIcon.style.display = 'none';
      document.body.style.overflow = '';
    });
  });


  // ==========================================
  // 4. PHOTO CAROUSEL / SLIDERS
  // ==========================================
  function setupCarousel(carouselId) {
    const container = document.getElementById(carouselId);
    if (!container) return;

    const slides = container.querySelectorAll('.carousel-slide');
    const prevBtn = container.querySelector('.carousel-btn-prev');
    const nextBtn = container.querySelector('.carousel-btn-next');
    
    // Find sibling indicators block
    const indicatorsBlock = container.nextElementSibling;
    let dots = [];
    if (indicatorsBlock && indicatorsBlock.classList.contains('carousel-indicators')) {
      dots = indicatorsBlock.querySelectorAll('.carousel-dot');
    }

    let currentIndex = 0;
    const totalSlides = slides.length;

    function goToSlide(index) {
      slides[currentIndex].classList.remove('active');
      if (dots.length > 0) dots[currentIndex].classList.remove('active');
      
      currentIndex = (index + totalSlides) % totalSlides;
      
      slides[currentIndex].classList.add('active');
      if (dots.length > 0) dots[currentIndex].classList.add('active');
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => goToSlide(idx));
    });
  }

  setupCarousel('repomind-carousel');
  setupCarousel('doconcall-carousel');


  // ==========================================
  // 5. ACCORDION HEIGHT ANIMATIONS
  // ==========================================
  document.querySelectorAll('.accordion-item').forEach(el => {
    const summary = el.querySelector('.accordion-header');
    const content = el.querySelector('.accordion-content');
    
    if (!summary || !content) return;

    summary.addEventListener('click', (e) => {
      e.preventDefault();
      
      if (el.hasAttribute('open')) {
        // Collapsing
        content.style.height = `${content.offsetHeight}px`;
        content.offsetHeight; // Trigger reflow
        content.style.height = '0px';
        content.style.opacity = '0';
        content.style.paddingTop = '0px';
        content.style.paddingBottom = '0px';
        
        setTimeout(() => {
          el.removeAttribute('open');
          content.style.height = '';
          content.style.opacity = '';
          content.style.paddingTop = '';
          content.style.paddingBottom = '';
        }, 200);
      } else {
        // Expanding — measure natural height BEFORE zeroing
        el.setAttribute('open', '');
        const naturalHeight = content.scrollHeight;

        content.style.height = '0px';
        content.style.opacity = '0';
        content.style.overflow = 'hidden';
        content.offsetHeight; // Force reflow

        content.style.transition = 'height 0.2s ease, opacity 0.2s ease';
        content.style.height = `${naturalHeight}px`;
        content.style.opacity = '1';

        setTimeout(() => {
          content.style.height = '';
          content.style.overflow = '';
          content.style.transition = '';
        }, 220);
      }
    });
  });


  // ==========================================
  // 6. SCROLL REVEAL OBSERVER
  // ==========================================
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback if browser doesn't support IntersectionObserver
    revealElements.forEach(el => el.classList.add('revealed'));
  }


  // ==========================================
  // 7. FOOTER AUTO-UPDATE YEAR
  // ==========================================
  const footerYear = document.getElementById('footer-year');
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }


  // ==========================================
  // 8. COMMAND PALETTE (CTRL/CMD + K)
  // ==========================================
  const cmdPalette = document.getElementById('cmd-palette');
  const cmdSearchInput = document.getElementById('cmd-search-input');
  const cmdOptionsList = document.getElementById('cmd-options-list');

  const commands = [
    { name: "Go to Selected Work / Case Studies", shortcut: "GP", action: () => scrollToSection("#work") },
    { name: "Go to Engineering Journey / Timeline", shortcut: "GJ", action: () => scrollToSection("#timeline") },
    { name: "Go to About Me", shortcut: "GA", action: () => scrollToSection("#about") },
    { name: "Go to Contact Details", shortcut: "GC", action: () => scrollToSection("#contact") },
    { name: "Download Resume PDF", shortcut: "DR", action: () => window.open("resume.pdf", "_blank") },
    { name: "Open GitHub Profile", shortcut: "OG", action: () => window.open("https://github.com/Gyan-Ranjan-01", "_blank") },
    { name: "Open LinkedIn Profile", shortcut: "OL", action: () => window.open("https://linkedin.com/in/gyan-ranjan", "_blank") }
  ];

  let activeIndex = 0;
  let filteredCommands = [...commands];

  function scrollToSection(selector) {
    const target = document.querySelector(selector);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function renderCommands() {
    cmdOptionsList.innerHTML = '';
    if (filteredCommands.length === 0) {
      cmdOptionsList.innerHTML = `<div style="padding: 1rem; font-size: 0.75rem; text-align: center; color: var(--secondary);">No results found...</div>`;
      return;
    }

    filteredCommands.forEach((cmd, idx) => {
      const option = document.createElement('div');
      option.className = `cmd-option ${idx === activeIndex ? 'active' : ''}`;
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', idx === activeIndex ? 'true' : 'false');
      
      option.innerHTML = `
        <div class="cmd-option-left">
          <svg style="width: 14px; height: 14px; color: var(--secondary);" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          <span>${cmd.name}</span>
        </div>
        <span class="cmd-option-shortcut">${cmd.shortcut}</span>
      `;
      
      option.addEventListener('click', () => {
        executeCommand(cmd);
      });

      cmdOptionsList.appendChild(option);
    });

    // Ensure active element remains visible in scroll area
    const activeEl = cmdOptionsList.children[activeIndex];
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }

  function executeCommand(cmd) {
    closeCommandPalette();
    cmd.action();
  }

  function openCommandPalette() {
    cmdPalette.style.display = 'flex';
    cmdPalette.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Reflow to ensure displaying sets off transition opacity
    cmdPalette.offsetHeight;
    cmdPalette.classList.add('open');
    
    cmdSearchInput.value = '';
    filteredCommands = [...commands];
    activeIndex = 0;
    renderCommands();
    setTimeout(() => cmdSearchInput.focus(), 50);
  }

  function closeCommandPalette() {
    cmdPalette.classList.remove('open');
    cmdPalette.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => {
      cmdPalette.style.display = 'none';
    }, 250);
  }

  // Event Listeners for shortcut trigger
  window.addEventListener('keydown', (e) => {
    // Intercept Ctrl+K or Cmd+K
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (cmdPalette.classList.contains('open')) {
        closeCommandPalette();
      } else {
        openCommandPalette();
      }
    }
  });

  // Modal navigation inputs
  cmdSearchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    filteredCommands = commands.filter(cmd => cmd.name.toLowerCase().includes(query) || cmd.shortcut.toLowerCase().includes(query));
    activeIndex = 0;
    renderCommands();
  });

  cmdSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % filteredCommands.length;
      renderCommands();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + filteredCommands.length) % filteredCommands.length;
      renderCommands();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[activeIndex]) {
        executeCommand(filteredCommands[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeCommandPalette();
    } else if (e.key === 'Tab') {
      e.preventDefault();
    }
  });

  // Close when clicking backdrop
  cmdPalette.addEventListener('click', (e) => {
    if (e.target === cmdPalette) {
      closeCommandPalette();
    }
  });

});
