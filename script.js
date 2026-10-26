/**
 * Gyan Ranjan Portfolio - Core Engine
 * 
 * Implements:
 * 1. Single Mode Switcher Dropdown (Recruiter, Developer, Know Gyan)
 * 2. Active Section Hover Dropdown (only displays current section name; hover reveals menu; hover off hides)
 * 3. Mode-Specific Navbar Elements (Resume button exclusively in Recruiter mode)
 * 4. Recruiter Background Watermark (Transitions "Gyan Ranjan" into fixed background covering half screen on scroll)
 * 5. Developer Background System (Initial GYAN RANJAN watermark -> Project background with high transparency)
 * 6. Know Gyan Dynamic Background (Active image becomes background until the next image scrolls up)
 * 7. Clean, fluid natural scrolling without pop-in cards or sudden overlays
 * 8. Entry Experience Selector Modal, Theme Toggle, Command Palette (Ctrl+K), Filters & Carousels
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==============================================================
  // 1. DOM REFERENCES & STATE
  // ==============================================================
  const validModes = ['recruiter', 'developer', 'know-gyan'];
  let currentMode = 'recruiter';
  let isPlayingAmbience = false;
  let audioCtx = null;
  let ambientNodes = null;

  const modeViews = {
    'recruiter': document.getElementById('experience-recruiter'),
    'developer': document.getElementById('experience-developer'),
    'know-gyan': document.getElementById('experience-know-gyan')
  };

  // Header and Navigation
  const siteHeader = document.getElementById('main-header');
  const navBrandLogo = document.getElementById('nav-brand-link') || document.getElementById('nav-brand-logo');
  const navResumeBtn = document.getElementById('nav-resume-btn');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');

  // Mode Elements
  const modeCurrentLabel = document.getElementById('mode-current-label');
  const navChangeModeBtn = document.getElementById('nav-change-mode-btn');

  // Section Dropdown elements
  const sectionDropdownWrap = document.getElementById('section-dropdown-wrap');
  const sectionCurrentBtn = document.getElementById('section-current-btn');
  const currentSectionLabel = document.getElementById('current-section-label');
  const sectionDropdownMenu = document.getElementById('section-dropdown-menu');
  let lastActiveSectionId = '';

  // Background Layer elements
  const recruiterWatermarkLayer = document.getElementById('recruiter-bg-watermark-layer');
  const devWatermarkLayer = document.getElementById('dev-bg-watermark-layer');
  const devProjectLayer = document.getElementById('dev-bg-project-layer');
  const knowGyanDynamicBg = document.getElementById('know-gyan-dynamic-bg');
  const kgSlides = {
    'hero': document.getElementById('kg-bg-hero'),
    'origins': document.getElementById('kg-bg-origins'),
    'growth': document.getElementById('kg-bg-growth'),
    'hackathon': document.getElementById('kg-bg-hackathon'),
    'epilogue': document.getElementById('kg-bg-epilogue')
  };

  // Experience Selector Modal elements
  const selectorOverlay = document.getElementById('experience-selector');
  const selectorCards = document.querySelectorAll('.selector-card');
  const selectorSkipBtn = document.getElementById('selector-skip-btn');
  const selectorDefaultBtn = document.getElementById('selector-default-btn');

  // ==============================================================
  // 2. SECTIONS DEFINITIONS PER MODE
  // ==============================================================
  const modeSectionsConfig = {
    'recruiter': [
      { id: 'recruiter-hero', label: 'Overview' },
      { id: 'work', label: 'Selected Work' },
      { id: 'timeline', label: 'Milestones' },
      { id: 'about', label: 'Background' },
      { id: 'contact', label: 'Contact' }
    ],
    'developer': [
      { id: 'dev-hero', label: 'System Overview' },
      { id: 'dev-catalogue-section', label: 'Project Catalogue' },
      { id: 'dev-repomind-deepdive', label: 'RepoMind Architecture' },
      { id: 'dev-doconcall-deepdive', label: 'DocOnCall Architecture' },
      { id: 'dev-ipsahayak-deepdive', label: 'IP-SAKTI Sahayak (SIH)' },
      { id: 'dev-cpsat-deepdive', label: 'Routine Generator CP-SAT' },
      { id: 'dev-anime-deepdive', label: 'Anime Recommender' },
      { id: 'dev-sweetsuite-deepdive', label: 'SweetSuite Platform' },
      { id: 'dev-houseprice-deepdive', label: 'Bengaluru House Price' },
      { id: 'dev-linear-regression-deepdive', label: 'Linear Regression Math' }
    ],
    'know-gyan': [
      { id: 'about-hero', label: 'Profile' },
      { id: 'ch-01', label: '01 Origins' },
      { id: 'ch-02', label: '02 The Journey' },
      { id: 'ch-03', label: '03 Personal Growth' },
      { id: 'ch-04', label: '04 Hackathons' },
      { id: 'ch-05', label: '05 What I Build' },
      { id: 'ch-06', label: '06 Leadership' },
      { id: 'ch-07', label: '07 Beyond Tech' },
      { id: 'ch-08', label: "08 What's Next" }
    ]
  };

  // Direct section mapping to mode for deep URLs
  const sectionToMode = {
    'recruiter-hero': 'recruiter',
    'work': 'recruiter',
    'timeline': 'recruiter',
    'about': 'recruiter',
    'contact': 'recruiter',
    'dev-hero': 'developer',
    'dev-catalogue-section': 'developer',
    'dev-repomind-deepdive': 'developer',
    'dev-doconcall-deepdive': 'developer',
    'dev-ipsahayak-deepdive': 'developer',
    'dev-cpsat-deepdive': 'developer',
    'dev-anime-deepdive': 'developer',
    'dev-sweetsuite-deepdive': 'developer',
    'dev-houseprice-deepdive': 'developer',
    'dev-linear-regression-deepdive': 'developer',
    'about-hero': 'know-gyan',
    'ch-01': 'know-gyan',
    'ch-02': 'know-gyan',
    'ch-03': 'know-gyan',
    'ch-04': 'know-gyan',
    'ch-05': 'know-gyan',
    'ch-06': 'know-gyan',
    'ch-07': 'know-gyan',
    'ch-08': 'know-gyan'
  };

  // ==============================================================
  // 3. RETURN TO HOME (RECRUITER) & BRAND NAVIGATION
  // ==============================================================
  const navBackHomeBtn = document.getElementById('nav-back-home-btn');
  if (navBackHomeBtn) {
    navBackHomeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      switchMode('recruiter', true, true);
    });
  }

  const hudBackHomeBtn = document.getElementById('hud-back-home-btn');
  if (hudBackHomeBtn) {
    hudBackHomeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      switchMode('recruiter', true, true);
    });
  }

  const ghostBackBtn = document.getElementById('ghost-back-btn');
  if (ghostBackBtn) {
    ghostBackBtn.addEventListener('click', (e) => {
      e.preventDefault();
      switchMode('recruiter', true, true);
    });
  }

  if (navBrandLogo) {
    navBrandLogo.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentMode !== 'recruiter') {
        switchMode('recruiter', true, true);
      } else {
        try {
          if (window.history.replaceState) {
            window.history.replaceState(null, null, '#recruiter');
          } else {
            window.location.hash = 'recruiter';
          }
        } catch (err) {
          window.location.hash = 'recruiter';
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // Handle direct clicks on Deep Dive Jump buttons and Mode Switch triggers
  document.addEventListener('click', (e) => {
    // 0. Brand Logo Home Return (Navigates to Recruiter Home if in Dev/Story, smooth scrolls if already in Recruiter)
    const brandLink = e.target.closest('#nav-brand-link, .nav-brand');
    if (brandLink) {
      e.preventDefault();
      if (currentMode !== 'recruiter') {
        switchMode('recruiter', true, true);
      } else {
        try {
          if (window.history.replaceState) {
            window.history.replaceState(null, null, '#recruiter');
          } else {
            window.location.hash = 'recruiter';
          }
        } catch (err) {
          window.location.hash = 'recruiter';
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    // 1. Deep Dive Jump from Recruiter Mode Project Summaries
    const jumpBtn = e.target.closest('.jump-dev-btn[data-jump-dev]');
    if (jumpBtn) {
      e.preventDefault();
      const targetSel = jumpBtn.getAttribute('data-jump-dev');
      switchMode('developer', false, true);
      setTimeout(() => {
        // If jumping to plant card, ensure ML & CV filter pill is active; otherwise ensure 'all' is active so target is visible
        if (targetSel === '#dev-plant-card' || targetSel === '#dev-plant-deepdive') {
          const devMlPill = document.querySelector('.dev-pill[data-dev-filter="ml-cv"]');
          if (devMlPill) devMlPill.click();
        } else {
          const activeDevPill = document.querySelector('.dev-pill.active');
          if (activeDevPill && activeDevPill.getAttribute('data-dev-filter') !== 'all') {
            const allPill = document.querySelector('.dev-pill[data-dev-filter="all"]');
            if (allPill) allPill.click();
          }
        }
        let targetEl = document.querySelector(targetSel);
        if (!targetEl && targetSel === '#dev-plant-deepdive') {
          targetEl = document.querySelector('#dev-plant-card');
        }
        if (targetEl) {
          const headerHeight = siteHeader ? siteHeader.offsetHeight : 64;
          const pos = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
          window.scrollTo({ top: Math.max(0, pos), behavior: 'instant' });
          if (targetSel === '#dev-plant-card' || targetSel === '#dev-plant-deepdive') {
            targetEl.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' });
          }
          try {
            if (window.history.replaceState) {
              window.history.replaceState(null, null, targetSel);
            }
          } catch (err) {}
          targetEl.classList.add('jump-highlight');
          setTimeout(() => targetEl.classList.remove('jump-highlight'), 2200);
        }
      }, 100);
      return;
    }

    // 1b. View More Projects Button (switches to developer mode and scrolls to dev catalogue)
    const viewMoreBtn = e.target.closest('.view-more-dev-btn');
    if (viewMoreBtn) {
      e.preventDefault();
      switchMode('developer', false, true);
      setTimeout(() => {
        const catalogueEl = document.getElementById('dev-catalogue-section') || document.getElementById('dev-hero');
        if (catalogueEl) {
          const headerHeight = siteHeader ? siteHeader.offsetHeight : 64;
          const pos = catalogueEl.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
          window.scrollTo({ top: Math.max(0, pos), behavior: 'instant' });
          try {
            if (window.history.replaceState) {
              window.history.replaceState(null, null, '#dev-catalogue-section');
            }
          } catch (err) {}
        }
      }, 100);
      return;
    }

    // 1c. Floating Ghost Back-to-Home Button
    const ghostBtn = e.target.closest('#ghost-back-btn, .ghost-pill-btn, .btn-micro-recruiter');
    if (ghostBtn) {
      e.preventDefault();
      switchMode('recruiter', true, true);
      return;
    }

    // 2. Direct Mode Switch buttons (e.g. Read About Me, Story invite card)
    const switchBtn = e.target.closest('[data-switch-mode]');
    if (switchBtn && !switchBtn.classList.contains('nav-mode-menu-item')) {
      e.preventDefault();
      const targetMode = switchBtn.getAttribute('data-switch-mode');
      if (targetMode && validModes.includes(targetMode)) {
        switchMode(targetMode, true, true);
      }
    }
  });

  // ==============================================================
  // 4. MODE SWITCHER DROPDOWN & SELECTION REDIRECT
  // ==============================================================
  const modeDropdownWrap = document.getElementById('mode-dropdown-wrap');
  const modeMenuItems = document.querySelectorAll('.nav-mode-menu-item[data-switch-mode]');
  const navOpenSelectorBtn = document.getElementById('nav-open-selector-modal-btn');
  const selectorCloseModalBtn = document.getElementById('selector-close-modal-btn');

  // Toggle dropdown on mode button click
  if (navChangeModeBtn) {
    navChangeModeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (sectionDropdownWrap) sectionDropdownWrap.classList.remove('open');
      if (modeDropdownWrap) {
        modeDropdownWrap.classList.toggle('open');
      }
    });
  }

  // Direct 1-click mode switching from dropdown items
  modeMenuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const targetMode = item.getAttribute('data-switch-mode');
      if (modeDropdownWrap) modeDropdownWrap.classList.remove('open');
      if (targetMode && validModes.includes(targetMode)) {
        localStorage.setItem('gyan_mode_selected', 'true');
        switchMode(targetMode, true, true);
      }
    });
  });

  // Close dropdowns when clicking outside or pressing Escape
  document.addEventListener('click', (e) => {
    if (modeDropdownWrap && modeDropdownWrap.classList.contains('open')) {
      const menu = document.getElementById('mode-dropdown-menu');
      const btn = document.getElementById('nav-change-mode-btn');
      if (menu && btn) {
        if (!menu.contains(e.target) && !btn.contains(e.target)) {
          modeDropdownWrap.classList.remove('open');
        }
      } else if (!modeDropdownWrap.contains(e.target) || e.target === modeDropdownWrap) {
        modeDropdownWrap.classList.remove('open');
      }
    }
    if (sectionDropdownWrap && sectionDropdownWrap.classList.contains('open')) {
      const secMenu = document.getElementById('section-dropdown-menu');
      const secBtn = document.getElementById('section-current-btn');
      if (secMenu && secBtn) {
        if (!secMenu.contains(e.target) && !secBtn.contains(e.target)) {
          sectionDropdownWrap.classList.remove('open');
        }
      } else if (!sectionDropdownWrap.contains(e.target) || e.target === sectionDropdownWrap) {
        sectionDropdownWrap.classList.remove('open');
      }
    }
  });

  // Direct backdrop click & pointerdown listeners on wrappers to guarantee instant hiding on tapping blank space
  if (sectionDropdownWrap) {
    const closeSecIfBackdrop = (e) => {
      if (e.target === sectionDropdownWrap) {
        sectionDropdownWrap.classList.remove('open');
      }
    };
    sectionDropdownWrap.addEventListener('click', closeSecIfBackdrop);
    sectionDropdownWrap.addEventListener('pointerdown', closeSecIfBackdrop);
  }

  if (modeDropdownWrap) {
    const closeModeIfBackdrop = (e) => {
      if (e.target === modeDropdownWrap) {
        modeDropdownWrap.classList.remove('open');
      }
    };
    modeDropdownWrap.addEventListener('click', closeModeIfBackdrop);
    modeDropdownWrap.addEventListener('pointerdown', closeModeIfBackdrop);
  }

  // Keyboard shortcuts (1: Executive, 2: Architect, 3: Story, X: Toggle Exec/Architect)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modeDropdownWrap) modeDropdownWrap.classList.remove('open');
      if (sectionDropdownWrap) sectionDropdownWrap.classList.remove('open');
      if (selectorOverlay && !selectorOverlay.classList.contains('hidden')) {
        closeSelector();
      }
      return;
    }

    // Do not intercept if user is typing in inputs or textareas (CLI, search, etc.)
    const active = document.activeElement;
    if (active && (['input', 'textarea', 'select'].includes(active.tagName.toLowerCase()) || active.isContentEditable)) {
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key === '1') {
      e.preventDefault();
      switchMode('recruiter', true, false);
    } else if (e.key === '2') {
      e.preventDefault();
      switchMode('developer', true, false);
    } else if (e.key === '3') {
      e.preventDefault();
      switchMode('know-gyan', true, false);
    } else if (e.key === 'x' || e.key === 'X') {
      e.preventDefault();
      switchMode(currentMode === 'developer' ? 'recruiter' : 'developer', true, false);
    }
  });

  // Header Segmented Lens Pills
  document.querySelectorAll('.nav-lens-pill[data-nav-lens]').forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      const target = pill.getAttribute('data-nav-lens');
      if (target && validModes.includes(target)) {
        switchMode(target, true, false);
      }
    });
  });

  // Hero Viewfinder Tabs
  document.querySelectorAll('.viewfinder-tab[data-lens-target]').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const target = tab.getAttribute('data-lens-target');
      if (target && validModes.includes(target)) {
        switchMode(target, true, false);
      }
    });
  });

  // Per-Project Bento Lens Tabs (Local Card Overrides)
  document.querySelectorAll('.proj-tab[data-proj-tab]').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = tab.getAttribute('data-proj-tab');
      const card = tab.closest('.case-study');
      if (!card) return;
      card.querySelectorAll('.proj-tab').forEach(t => {
        if (t === tab) {
          t.classList.add('active');
          t.setAttribute('aria-selected', 'true');
        } else {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        }
      });
      card.querySelectorAll('.proj-pane').forEach(pane => {
        if (pane.getAttribute('data-pane-name') === targetTab) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      });
    });
  });

  // Cross-Lens Jump Buttons ([data-switch-mode] + [data-scroll-to])
  document.querySelectorAll('[data-switch-mode]').forEach(btn => {
    // Avoid double-binding if it's the dropdown item or selector card (they have their own handlers)
    if (btn.classList.contains('nav-mode-menu-item') || btn.classList.contains('selector-card') || btn.id === 'selector-skip-btn') return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const mode = btn.getAttribute('data-switch-mode');
      const scrollToId = btn.getAttribute('data-scroll-to');
      if (mode && validModes.includes(mode)) {
        switchMode(mode, true, false);
        if (scrollToId) {
          setTimeout(() => {
            const targetEl = document.getElementById(scrollToId);
            if (targetEl) {
              const headerHeight = siteHeader ? siteHeader.offsetHeight : 60;
              const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight;
              window.scrollTo({ top: targetPos, behavior: 'smooth' });
            }
          }, 60);
        }
      }
    });
  });



  // ==============================================================
  // 5. ACTIVE SECTION HOVER DROPDOWN SYSTEM
  // ==============================================================
  function populateSectionDropdown(mode) {
    if (!sectionDropdownMenu) return;
    sectionDropdownMenu.innerHTML = '';

    const sections = modeSectionsConfig[mode] || [];
    if (sections.length === 0) return;

    // Set default initial label
    if (currentSectionLabel) {
      currentSectionLabel.textContent = sections[0].label;
    }

    sections.forEach((sec, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'nav-section-item' + (idx === 0 ? ' active' : '');
      btn.setAttribute('data-sec-target', sec.id);
      btn.innerHTML = `
        <span class="sec-item-dot"></span>
        <span class="sec-item-label">${sec.label}</span>
      `;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (sectionDropdownWrap) sectionDropdownWrap.classList.remove('open');
        
        const targetEl = document.getElementById(sec.id);
        if (targetEl) {
          const headerHeight = siteHeader ? siteHeader.offsetHeight : 60;
          const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          window.scrollTo({ top: targetPos, behavior: 'smooth' });
        }
        
        if (currentSectionLabel) currentSectionLabel.textContent = sec.label;
        updateActiveSectionItem(sec.id);
      });

      sectionDropdownMenu.appendChild(btn);
    });
  }

  function updateActiveSectionItem(activeId) {
    if (!sectionDropdownMenu) return;
    const items = sectionDropdownMenu.querySelectorAll('.nav-section-item');
    items.forEach(item => {
      if (item.getAttribute('data-sec-target') === activeId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  // Toggle on mobile/touch click for section button
  if (sectionCurrentBtn) {
    sectionCurrentBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (modeDropdownWrap) modeDropdownWrap.classList.remove('open');
      if (sectionDropdownWrap) {
        sectionDropdownWrap.classList.toggle('open');
      }
    });
  }

  // ==============================================================
  // 6. SCROLL & BACKGROUND CONTROLLER (DETERMINISTIC & REAL-TIME)
  // ==============================================================

  function setActiveKgSlide(activeKey) {
    Object.keys(kgSlides).forEach(key => {
      const slide = kgSlides[key];
      if (slide) {
        if (key === activeKey) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
      }
    });
  }

  function updateScrollBackgroundsAndSectionLabel() {
    const scrollY = window.scrollY;

    // 1. Sticky Header shadow
    if (siteHeader) {
      if (scrollY > 20) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }

    // 2. RECRUITER & KNOW GYAN MODES: scroll threshold triggers
    if (currentMode === 'recruiter') {
      if (scrollY > 100) {
        document.body.classList.add('scrolled-past-hero');
      } else {
        document.body.classList.remove('scrolled-past-hero');
      }
    } else if (currentMode === 'know-gyan') {
      if (scrollY > 120) {
        document.body.classList.add('scrolled-past-hero');
      } else {
        document.body.classList.remove('scrolled-past-hero');
      }
    }

    // 3. DEVELOPER MODE: Smoothly dock hero anime image into navbar as it scrolls up
    if (currentMode === 'developer') {
      const devBanner = document.getElementById('dev-artwork-banner');
      const headerDevBg = document.getElementById('site-header-dev-bg');

      if (devBanner && headerDevBg && siteHeader) {
        // Docking only triggers near hero banner (scrollY <= 550)
        if (scrollY <= 550) {
          const headerHeight = siteHeader.offsetHeight || 60;
          const bannerRect = devBanner.getBoundingClientRect();
          const startY = headerHeight + 180;
          const endY = headerHeight;

          let progress = 0;
          if (bannerRect.top <= endY) {
            progress = 1;
          } else if (bannerRect.top < startY) {
            progress = (startY - bannerRect.top) / (startY - endY);
          }

          const easedProgress = Math.min(Math.max(progress, 0), 1);

          if (easedProgress > 0) {
            siteHeader.classList.add('dev-nav-fitted');
            headerDevBg.style.opacity = easedProgress.toFixed(3);
            const translateY = ((1 - easedProgress) * 14).toFixed(1);
            const scale = (1 + (1 - easedProgress) * 0.04).toFixed(3);
            headerDevBg.style.transform = `translateY(${translateY}px) scale(${scale})`;

            devBanner.style.setProperty('--dev-dock-progress', easedProgress.toFixed(3));
            devBanner.classList.add('dev-banner-docking');
          } else {
            siteHeader.classList.remove('dev-nav-fitted');
            headerDevBg.style.opacity = '0';
            headerDevBg.style.transform = 'translateY(14px) scale(1.04)';
            devBanner.classList.remove('dev-banner-docking');
            devBanner.style.removeProperty('--dev-dock-progress');
          }
        }
      }

      // Catalog rail: pure scroll threshold without getBoundingClientRect
      const inProjects = scrollY > 350;
      if (inProjects !== document.body.classList.contains('dev-in-projects')) {
        document.body.classList.toggle('dev-in-projects', inProjects);
      }

      // Developer Reading HUD visibility based on scroll threshold (zero getBoundingClientRect)
      const readingHud = document.getElementById('dev-reading-hud');
      if (readingHud) {
        const showHud = scrollY > 550;
        if (showHud !== readingHud.classList.contains('visible')) {
          readingHud.classList.toggle('visible', showHud);
          readingHud.setAttribute('aria-hidden', showHud ? 'false' : 'true');
        }
      }
    }

    // 4. KNOW GYAN MODE: Active image stays background until next image scrolls up
    if (currentMode === 'know-gyan') {
      const ch08 = document.getElementById('ch-08');
      const ch04 = document.getElementById('ch-04');
      const ch03 = document.getElementById('ch-03');
      const ch01 = document.getElementById('ch-01');

      const triggerThreshold = window.innerHeight * 0.7;

      if (ch08 && ch08.getBoundingClientRect().top <= triggerThreshold) {
        setActiveKgSlide('epilogue');
      } else if (ch04 && ch04.getBoundingClientRect().top <= triggerThreshold) {
        setActiveKgSlide('hackathon');
      } else if (ch03 && ch03.getBoundingClientRect().top <= triggerThreshold) {
        setActiveKgSlide('growth');
      } else if (ch01 && ch01.getBoundingClientRect().top <= triggerThreshold) {
        setActiveKgSlide('origins');
      } else {
        setActiveKgSlide('hero');
      }

      // Update Floating Reading Capsule HUD
      updateKgHudProgress();
    }

    // 5. Update Navbar Active Section Label dynamically on scroll
    const sections = modeSectionsConfig[currentMode] || [];
    if (sections.length > 0) {
      const headerH = siteHeader ? siteHeader.offsetHeight : 60;
      let activeSection = sections[0];

      for (let i = 0; i < sections.length; i++) {
        const el = document.getElementById(sections[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= headerH + 120) {
            activeSection = sections[i];
          }
        }
      }

      if (currentSectionLabel && activeSection && activeSection.id !== lastActiveSectionId) {
        lastActiveSectionId = activeSection.id;
        currentSectionLabel.textContent = activeSection.label;
        updateActiveSectionItem(activeSection.id);
      }
    }
  }

  // Silky smooth scroll listener throttled with requestAnimationFrame
  let isScrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!isScrollTicking) {
      window.requestAnimationFrame(() => {
        updateScrollBackgroundsAndSectionLabel();
        isScrollTicking = false;
      });
      isScrollTicking = true;
    }
  }, { passive: true });

  window.updateScrollBackgroundsAndSectionLabel = updateScrollBackgroundsAndSectionLabel;

  // ==============================================================
  // 7. UNIFIED MODE SWITCHER DISPATCHER
  // ==============================================================
  function switchMode(newMode, updateUrl = true, scrollToTop = true) {
    if (!validModes.includes(newMode)) return;

    // Auto-pause Lo-Fi ambience if navigating away from Know Gyan mode
    if (newMode !== 'know-gyan' && isPlayingAmbience) {
      toggleLoFiAmbience();
    }

    currentMode = newMode;
    localStorage.setItem('gyan_portfolio_mode', newMode);

    // Update body classes
    document.body.classList.remove('mode-recruiter-active', 'mode-developer-active', 'mode-know-gyan-active');
    document.body.classList.add(`mode-${newMode}-active`);

    // Reset mode-specific background trigger classes
    document.body.classList.remove('scrolled-past-hero', 'dev-in-projects');

    // Ensure selector modal is closed and body scroll is unlocked
    if (selectorOverlay) {
      selectorOverlay.classList.add('hidden');
      selectorOverlay.classList.remove('closing');
    }
    if (modeDropdownWrap) modeDropdownWrap.classList.remove('open');
    if (sectionDropdownWrap) sectionDropdownWrap.classList.remove('open');
    document.body.style.overflow = '';

    // Toggle active view container
    Object.keys(modeViews).forEach(modeKey => {
      const el = modeViews[modeKey];
      if (el) {
        if (modeKey === newMode) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      }
    });

    // Update Mode Dropdown Label & Active Item
    const modeDisplayNames = {
      'recruiter': 'Executive',
      'developer': 'Architect',
      'know-gyan': 'Story'
    };
    if (modeCurrentLabel) {
      modeCurrentLabel.textContent = modeDisplayNames[newMode] || 'Executive';
    }

    // Synchronize Header Segmented Lens Pills
    const navLensPills = document.querySelectorAll('.nav-lens-pill[data-nav-lens]');
    navLensPills.forEach(pill => {
      if (pill.getAttribute('data-nav-lens') === newMode) {
        pill.classList.add('active');
        pill.setAttribute('aria-selected', 'true');
      } else {
        pill.classList.remove('active');
        pill.setAttribute('aria-selected', 'false');
      }
    });

    // Synchronize Hero Perspective Viewfinder Tabs
    const viewfinderTabs = document.querySelectorAll('.viewfinder-tab[data-lens-target]');
    viewfinderTabs.forEach(tab => {
      if (tab.getAttribute('data-lens-target') === newMode) {
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
      } else {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
      }
    });

    // Synchronize Dynamic Hero Lens Card Panes
    const lensPanes = document.querySelectorAll('.hero-dynamic-lens-card .lens-pane');
    lensPanes.forEach(pane => {
      if (pane.id === `lens-pane-${newMode}`) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    // Synchronize Project Cards Perspective Tab Inheritance
    const targetProjTab = newMode === 'developer' ? 'architecture' : (newMode === 'know-gyan' ? 'story' : 'overview');
    document.querySelectorAll('.project-lens-tabs').forEach(tabGroup => {
      const tabs = tabGroup.querySelectorAll('.proj-tab');
      tabs.forEach(t => {
        if (t.getAttribute('data-proj-tab') === targetProjTab) {
          t.classList.add('active');
          t.setAttribute('aria-selected', 'true');
        } else {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        }
      });
    });
    document.querySelectorAll('.proj-pane').forEach(pane => {
      if (pane.getAttribute('data-pane-name') === targetProjTab) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    // Synchronize Floating Ghost Safety-Net Pill
    const ghostPill = document.getElementById('ghost-recruiter-pill');
    const ghostLensName = document.getElementById('ghost-lens-name');
    if (ghostPill) {
      if (newMode === 'recruiter') {
        ghostPill.classList.add('hidden');
      } else {
        ghostPill.classList.remove('hidden');
        if (ghostLensName) {
          ghostLensName.textContent = newMode === 'developer' ? 'Architect Lens' : 'Storyteller Lens';
        }
      }
    }

    // Update Mode Menu Items active state
    if (modeMenuItems) {
      modeMenuItems.forEach(item => {
        if (item.getAttribute('data-switch-mode') === newMode) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }

    // Populate Section Hover Dropdown for this mode
    populateSectionDropdown(newMode);

    // Mode-specific actions in Navbar:
    // Home button in Navbar (Hidden in favor of top-left floating Back to Home button)
    const navBackHomeBtn = document.getElementById('nav-back-home-btn');
    if (navBackHomeBtn) {
      navBackHomeBtn.style.display = 'none';
    }
    // Resume button exclusively in Recruiter Mode
    if (navResumeBtn) {
      navResumeBtn.style.display = newMode === 'recruiter' ? 'inline-flex' : 'none';
    }
    // Theme toggle exclusively in Recruiter Mode
    if (themeToggleBtn) {
      themeToggleBtn.style.display = newMode === 'recruiter' ? 'inline-flex' : 'none';
    }

    // Set initial background states
    if (newMode === 'recruiter') {
      document.body.classList.remove('scrolled-past-hero');
    } else if (newMode === 'developer') {
      document.body.classList.remove('dev-in-projects');
    } else if (newMode === 'know-gyan') {
      setActiveKgSlide('hero');
    }

    if (newMode !== 'developer') {
      const headerDevBg = document.getElementById('site-header-dev-bg');
      if (headerDevBg) {
        headerDevBg.style.opacity = '0';
        headerDevBg.style.transform = 'translateY(14px) scale(1.04)';
      }
      if (siteHeader) {
        siteHeader.classList.remove('dev-nav-fitted');
      }
      const devBanner = document.getElementById('dev-artwork-banner');
      if (devBanner) {
        devBanner.classList.remove('dev-banner-docking');
        devBanner.style.removeProperty('--dev-dock-progress');
      }
      const readingHud = document.getElementById('dev-reading-hud');
      if (readingHud) {
        readingHud.classList.remove('visible');
        readingHud.setAttribute('aria-hidden', 'true');
      }
    }

    // Update Document Title
    const titles = {
      'recruiter': 'Gyan Ranjan | AI & Backend Engineer (Recruiter Profile)',
      'developer': 'Gyan Ranjan | Engineering Bench & Systems Architecture',
      'know-gyan': 'Gyan Ranjan | Cinematic Journey & Personal Mindset'
    };
    document.title = titles[newMode] || 'Gyan Ranjan | AI & Backend Engineer';

    // Update URL hash (ensures visible URL redirect to #recruiter, #developer, #know-gyan)
    if (updateUrl) {
      try {
        window.location.hash = newMode;
      } catch (e) {
        try {
          if (window.history.replaceState) {
            window.history.replaceState(null, null, `#${newMode}`);
          }
        } catch (err) {}
      }
    }

    // Reset scroll position on mode switch
    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    // Recalculate states immediately
    updateScrollBackgroundsAndSectionLabel();
    initScrollReveals();
  }

  // Safe helper functions for 3-card experience selector modal
  function openSelector() {
    if (selectorOverlay) {
      selectorOverlay.classList.remove('hidden', 'closing');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeSelector() {
    if (selectorOverlay) {
      selectorOverlay.classList.add('closing');
      setTimeout(() => {
        selectorOverlay.classList.add('hidden');
        selectorOverlay.classList.remove('closing');
        document.body.style.overflow = '';
      }, 200);
    }
  }

  window.switchMode = switchMode;
  window.openSelector = openSelector;
  window.closeSelector = closeSelector;

  // ==============================================================
  // 8. INITIAL ROUTING LOGIC
  // ==============================================================
  function handleInitialRoute() {
    const rawHash = window.location.hash.replace('#', '').trim();

    // Case 1: Direct mode hash (#recruiter, #developer, #know-gyan)
    if (validModes.includes(rawHash)) {
      if (selectorOverlay) selectorOverlay.classList.add('hidden');
      switchMode(rawHash, false, false);
      return;
    }

    // Case 2: Direct deep section link (#work, #ch-01, #dev-catalogue-section, etc.)
    if (rawHash && sectionToMode[rawHash]) {
      const targetMode = sectionToMode[rawHash];
      if (selectorOverlay) selectorOverlay.classList.add('hidden');
      switchMode(targetMode, false, false);
      setTimeout(() => {
        const targetEl = document.getElementById(rawHash);
        if (targetEl) {
          const headerHeight = siteHeader ? siteHeader.offsetHeight : 60;
          const pos = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          window.scrollTo({ top: pos, behavior: 'smooth' });
        }
      }, 120);
      return;
    }

    // Case 3: URL search params (?mode=...)
    const urlParams = new URLSearchParams(window.location.search);
    const paramMode = urlParams.get('mode');
    if (paramMode && validModes.includes(paramMode)) {
      if (selectorOverlay) selectorOverlay.classList.add('hidden');
      switchMode(paramMode, false, false);
      return;
    }

    // Case 4: Default entry path - on / where there is no hash or nothing like #recruiter, go to recruiter mode and add #recruiter
    if (window.location.hash !== '#recruiter') {
      try {
        if (window.history.replaceState) {
          window.history.replaceState(null, null, '#recruiter');
        } else {
          window.location.hash = 'recruiter';
        }
      } catch (e) {
        window.location.hash = 'recruiter';
      }
    }
    switchMode('recruiter', false, true);
  }

  // Handle browser back and forward history
  function handleBrowserNavigation() {
    const rawHash = window.location.hash.replace('#', '').trim();
    if (validModes.includes(rawHash)) {
      switchMode(rawHash, false, false);
    } else if (rawHash && sectionToMode[rawHash]) {
      switchMode(sectionToMode[rawHash], false, false);
      const targetEl = document.getElementById(rawHash);
      if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      if (window.location.hash !== '#recruiter') {
        try {
          if (window.history.replaceState) {
            window.history.replaceState(null, null, '#recruiter');
          } else {
            window.location.hash = 'recruiter';
          }
        } catch (e) {
          window.location.hash = 'recruiter';
        }
      }
      switchMode('recruiter', false, false);
    }
  }

  window.addEventListener('hashchange', handleBrowserNavigation);
  window.addEventListener('popstate', handleBrowserNavigation);

  // ==============================================================
  // 9. RECRUITER THEME MANAGER (LIGHT DEFAULT + DARK TOGGLE)
  // ==============================================================
  const themeIconMoon = document.querySelector('.theme-icon-moon');
  const themeIconSun = document.querySelector('.theme-icon-sun');

  function applyRecruiterTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
      if (themeIconMoon) themeIconMoon.style.display = 'none';
      if (themeIconSun) themeIconSun.style.display = 'block';
    } else {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
      if (themeIconMoon) themeIconMoon.style.display = 'block';
      if (themeIconSun) themeIconSun.style.display = 'none';
    }
  }

  const savedRecruiterTheme = localStorage.getItem('recruiter_theme') || 'light';
  applyRecruiterTheme(savedRecruiterTheme);

  function toggleRecruiterTheme() {
    const isDark = document.body.classList.contains('theme-dark');
    const newTheme = isDark ? 'light' : 'dark';
    localStorage.setItem('recruiter_theme', newTheme);
    applyRecruiterTheme(newTheme);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleRecruiterTheme);
  }

  // ==============================================================
  // 10. DEVELOPER MODE: CATEGORY FILTERING
  // ==============================================================
  const devFilterPills = document.querySelectorAll('.dev-pill');
  const devProjectCards = document.querySelectorAll('.dev-project-card');

  devFilterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      devFilterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filterValue = pill.getAttribute('data-dev-filter');

      devProjectCards.forEach(card => {
        const categories = card.getAttribute('data-category') || '';
        if (filterValue === 'all' || categories.includes(filterValue)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // ==============================================================
  // 11. CAROUSEL SLIDERS (RepoMind & DocOnCall)
  // ==============================================================
  function initCarousel(carouselId) {
    const container = document.getElementById(carouselId);
    if (!container) return;

    const slides = container.querySelectorAll('.carousel-slide');
    const prevBtn = container.querySelector('.carousel-btn-prev');
    const nextBtn = container.querySelector('.carousel-btn-next');
    
    const indicatorWrap = container.nextElementSibling;
    let dots = [];
    if (indicatorWrap && indicatorWrap.classList.contains('carousel-indicators')) {
      dots = indicatorWrap.querySelectorAll('.carousel-dot');
    }

    let currentIndex = 0;
    const total = slides.length;
    if (total === 0) return;

    function showSlide(index) {
      slides[currentIndex].classList.remove('active');
      if (dots[currentIndex]) dots[currentIndex].classList.remove('active');

      currentIndex = (index + total) % total;

      slides[currentIndex].classList.add('active');
      if (dots[currentIndex]) dots[currentIndex].classList.add('active');
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showSlide(currentIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showSlide(currentIndex + 1);
      });
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => showSlide(idx));
    });
  }

  initCarousel('repomind-carousel');
  initCarousel('doconcall-carousel');

  // ==============================================================
  // 11B. KNOW GYAN MOBILE AUTO-SLIDING SCREENSHOT CAROUSELS
  // (Auto-slides exclusively in mobile view <= 640px)
  // ==============================================================
  function initKgMobileCarousels() {
    const carousels = document.querySelectorAll('.kg-screenshots-showcase[data-kg-carousel]');
    if (carousels.length === 0) return;

    carousels.forEach(carousel => {
      const slides = carousel.querySelectorAll('.kg-carousel-slide');
      const dots = carousel.querySelectorAll('.kg-carousel-dot');
      const prevBtn = carousel.querySelector('.kg-carousel-prev');
      const nextBtn = carousel.querySelector('.kg-carousel-next');
      const viewport = carousel.querySelector('.kg-carousel-viewport');

      if (slides.length <= 1) return;

      let currentIndex = 0;
      let autoSlideTimer = null;
      let isPaused = false;

      function goToSlide(index) {
        slides[currentIndex].classList.remove('active');
        if (dots[currentIndex]) dots[currentIndex].classList.remove('active');

        currentIndex = (index + slides.length) % slides.length;

        slides[currentIndex].classList.add('active');
        if (dots[currentIndex]) dots[currentIndex].classList.add('active');
      }

      function nextSlide() {
        goToSlide(currentIndex + 1);
      }

      function prevSlide() {
        goToSlide(currentIndex - 1);
      }

      function startTimer() {
        stopTimer();
        if (window.innerWidth <= 640) {
          autoSlideTimer = setInterval(() => {
            if (!isPaused && currentMode === 'know-gyan') {
              nextSlide();
            }
          }, 3600);
        }
      }

      function stopTimer() {
        if (autoSlideTimer) {
          clearInterval(autoSlideTimer);
          autoSlideTimer = null;
        }
      }

      function resetTimer() {
        startTimer();
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          prevSlide();
          resetTimer();
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          nextSlide();
          resetTimer();
        });
      }

      dots.forEach((dot, idx) => {
        dot.addEventListener('click', (e) => {
          e.preventDefault();
          goToSlide(idx);
          resetTimer();
        });
      });

      if (viewport) {
        viewport.addEventListener('mouseenter', () => { isPaused = true; });
        viewport.addEventListener('mouseleave', () => { isPaused = false; });

        let touchStartX = 0;
        let touchStartY = 0;

        viewport.addEventListener('touchstart', (e) => {
          isPaused = true;
          if (e.touches && e.touches[0]) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
          }
        }, { passive: true });

        viewport.addEventListener('touchend', (e) => {
          isPaused = false;
          if (e.changedTouches && e.changedTouches[0]) {
            const deltaX = e.changedTouches[0].clientX - touchStartX;
            const deltaY = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
              if (deltaX < 0) {
                nextSlide();
              } else {
                prevSlide();
              }
              resetTimer();
            }
          }
        }, { passive: true });
      }

      window.addEventListener('resize', () => {
        if (window.innerWidth <= 640) {
          if (!autoSlideTimer) startTimer();
        } else {
          stopTimer();
        }
      }, { passive: true });

      if (window.innerWidth <= 640) {
        startTimer();
      }
    });
  }

  initKgMobileCarousels();

  // ==============================================================
  // 12. FOOTER YEAR AUTO-UPDATE
  // ==============================================================
  const footerYearEl = document.getElementById('footer-year');
  if (footerYearEl) {
    footerYearEl.textContent = new Date().getFullYear();
  }

  // ==============================================================
  // 13. COMMAND PALETTE (CTRL + K) KEYBOARD SHORTCUTS
  // ==============================================================
  const cmdPalette = document.getElementById('cmd-palette');
  const cmdSearchInput = document.getElementById('cmd-search-input');
  const cmdOptionsList = document.getElementById('cmd-options-list');
  const cmdTriggerBtn = document.getElementById('cmd-trigger-btn');

  const commands = [
    { name: "Switch to Recruiter Mode (Professional Scan)", shortcut: "MR", action: () => switchMode('recruiter') },
    { name: "Switch to Developer Mode (Deep Systems)", shortcut: "MD", action: () => switchMode('developer') },
    { name: "Switch to Know Gyan Mode (Cinematic Story)", shortcut: "MK", action: () => switchMode('know-gyan') },
    { name: "Open Experience Selector (3 Cards Modal)", shortcut: "LS", action: () => openSelector() },
    { name: "Toggle Recruiter Theme (Light / Dark)", shortcut: "TT", action: () => toggleRecruiterTheme() },
    { name: "Download Resume PDF", shortcut: "DR", action: () => window.open('resume.pdf', '_blank') },
    { name: "View RepoMind Live Demo (Vercel)", shortcut: "RM", action: () => window.open('https://repomind-eta.vercel.app/', '_blank') },
    { name: "View DocOnCall Live Demo (Render)", shortcut: "DC", action: () => window.open('https://doconcall-by-devai.onrender.com', '_blank') },
    { name: "Open GitHub Profile", shortcut: "GH", action: () => window.open('https://github.com/Gyan-Ranjan-01', '_blank') },
    { name: "Open LinkedIn Profile", shortcut: "LI", action: () => window.open('https://linkedin.com/in/gyan-ranjan-', '_blank') },
    { name: "Send Email (gyanranjanjee@gmail.com)", shortcut: "EM", action: () => window.location.href = 'mailto:gyanranjanjee@gmail.com' }
  ];

  let activeIndex = 0;
  let filteredCommands = [...commands];

  function renderCommands() {
    if (!cmdOptionsList) return;
    cmdOptionsList.innerHTML = '';

    if (filteredCommands.length === 0) {
      cmdOptionsList.innerHTML = '<div style="padding: 1rem; font-size: 0.8rem; text-align: center; color: var(--text-muted);">No commands matched...</div>';
      return;
    }

    filteredCommands.forEach((cmd, idx) => {
      const item = document.createElement('div');
      item.className = 'cmd-option' + (idx === activeIndex ? ' active' : '');
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', idx === activeIndex ? 'true' : 'false');

      item.innerHTML = `
        <div class="cmd-option-left">
          <svg style="width: 14px; height: 14px; color: var(--accent);" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          <span>${cmd.name}</span>
        </div>
        <span class="cmd-option-shortcut">${cmd.shortcut}</span>
      `;

      item.addEventListener('click', () => {
        closeCmdPalette();
        cmd.action();
      });

      cmdOptionsList.appendChild(item);
    });

    const activeEl = cmdOptionsList.children[activeIndex];
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }

  function openCmdPalette() {
    if (!cmdPalette) return;
    cmdPalette.style.display = 'flex';
    cmdPalette.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    cmdPalette.offsetHeight;
    cmdPalette.classList.add('open');

    if (cmdSearchInput) {
      cmdSearchInput.value = '';
      filteredCommands = [...commands];
      activeIndex = 0;
      renderCommands();
      setTimeout(() => cmdSearchInput.focus(), 60);
    }
  }

  function closeCmdPalette() {
    if (!cmdPalette) return;
    cmdPalette.classList.remove('open');
    cmdPalette.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => {
      cmdPalette.style.display = 'none';
    }, 200);
  }

  if (cmdTriggerBtn) {
    cmdTriggerBtn.addEventListener('click', openCmdPalette);
  }

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (cmdPalette && cmdPalette.classList.contains('open')) {
        closeCmdPalette();
      } else {
        openCmdPalette();
      }
    }
  });

  if (cmdSearchInput) {
    cmdSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      filteredCommands = commands.filter(c => c.name.toLowerCase().includes(q) || c.shortcut.toLowerCase().includes(q));
      activeIndex = 0;
      renderCommands();
    });

    cmdSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (filteredCommands.length > 0) {
          activeIndex = (activeIndex + 1) % filteredCommands.length;
          renderCommands();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (filteredCommands.length > 0) {
          activeIndex = (activeIndex - 1 + filteredCommands.length) % filteredCommands.length;
          renderCommands();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[activeIndex]) {
          closeCmdPalette();
          filteredCommands[activeIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeCmdPalette();
      }
    });
  }

  if (cmdPalette) {
    cmdPalette.addEventListener('click', (e) => {
      if (e.target === cmdPalette) closeCmdPalette();
    });
  }

  // ==============================================================
  // 14. SCROLL REVEAL OBSERVER FOR SUBTLE ENTRANCES
  // ==============================================================
  function initScrollReveals() {
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
      revealElements.forEach(el => el.classList.add('revealed'));
    }
  }

  // ==============================================================
  // 15. RECRUITER MODE: ANIMATED NUMBER COUNTERS
  // ==============================================================
  function initNumberCounters() {
    const counterElements = document.querySelectorAll('[data-counter]');
    if (!counterElements.length) return;

    if (!('IntersectionObserver' in window)) {
      counterElements.forEach(el => {
        const target = el.getAttribute('data-counter');
        const suffix = el.getAttribute('data-suffix') || '';
        el.textContent = target + suffix;
      });
      return;
    }

    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          observer.unobserve(el);

          const target = parseFloat(el.getAttribute('data-counter'));
          const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
          const suffix = el.getAttribute('data-suffix') || '';
          const duration = 1400; // ms
          const startTime = performance.now();

          function updateCounter(currentTime) {
            const elapsed = Math.max(0, currentTime - startTime);
            const progress = Math.min(Math.max(elapsed / duration, 0), 1);
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = (target * easeProgress).toFixed(decimals);
            el.textContent = currentVal + suffix;

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              el.textContent = (target % 1 === 0 && decimals === 0 ? target : target.toFixed(decimals)) + suffix;
            }
          }

          requestAnimationFrame(updateCounter);

          // Hard fallback guarantee so background tabs never get stuck mid-animation
          setTimeout(() => {
            el.textContent = (target % 1 === 0 && decimals === 0 ? target : target.toFixed(decimals)) + suffix;
          }, duration + 60);
        }
      });
    }, { threshold: 0.2 });

    counterElements.forEach(el => counterObserver.observe(el));
  }

  // ==============================================================
  // 16. 1-CLICK EMAIL COPY & GLOBAL TOAST NOTIFICATION
  // ==============================================================
  const globalToast = document.getElementById('global-toast');
  const toastMessage = document.getElementById('toast-message');
  let toastTimer = null;

  function showToast(message) {
    if (!globalToast) return;
    if (toastMessage) toastMessage.textContent = message;
    globalToast.classList.add('show');
    globalToast.setAttribute('aria-hidden', 'false');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      globalToast.classList.remove('show');
      globalToast.setAttribute('aria-hidden', 'true');
    }, 2600);
  }

  function initEmailCopyButtons() {
    function copyEmailAddress(btn, email) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(() => {
          handleCopySuccess(btn, email);
        }).catch(() => {
          fallbackCopy(email, btn);
        });
      } else {
        fallbackCopy(email, btn);
      }
    }

    // Direct event listener for all existing buttons
    const copyBtns = document.querySelectorAll('.copy-email-btn, [data-copy-email]');
    copyBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const email = btn.getAttribute('data-copy-email') || 'gyanranjanjee@gmail.com';
        copyEmailAddress(btn, email);
      });
    });

    // Delegated click listener for dynamic or nested clicks
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.copy-email-btn, [data-copy-email]');
      if (btn) {
        e.preventDefault();
        const email = btn.getAttribute('data-copy-email') || 'gyanranjanjee@gmail.com';
        copyEmailAddress(btn, email);
      }
    });

    function handleCopySuccess(btn, email) {
      btn.classList.add('copied');
      const textSpan = btn.querySelector('.copy-btn-text') || btn.querySelector('span:not(.sr-only)');
      const originalText = textSpan ? textSpan.textContent : '';
      if (textSpan) textSpan.textContent = 'Copied!';

      showToast(`Email copied: ${email}`);

      setTimeout(() => {
        btn.classList.remove('copied');
        if (textSpan) textSpan.textContent = originalText || 'Copy Email';
      }, 2000);
    }

    function fallbackCopy(text, btn) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        handleCopySuccess(btn, text);
      } catch (err) {
        showToast(`Email: ${text}`);
      }
      document.body.removeChild(textarea);
    }
  }

  // ==============================================================
  // 17. RESUME QUICK PREVIEW MODAL
  // ==============================================================
  function initResumeModal() {
    const resumeModal = document.getElementById('resume-preview-modal');
    const resumeBackdrop = document.getElementById('resume-modal-backdrop');
    const resumeCloseBtn = document.getElementById('resume-modal-close-btn');
    const resumeTriggers = document.querySelectorAll('[data-resume-trigger="true"]');

    if (!resumeModal) return;

    function openResumeModal(e) {
      if (e) e.preventDefault();
      resumeModal.classList.add('active');
      resumeModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeResumeModal() {
      resumeModal.classList.remove('active');
      resumeModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    resumeTriggers.forEach(trigger => {
      trigger.addEventListener('click', openResumeModal);
    });

    // Delegated click handler on document to guarantee clicks on SVG, spans, or buttons open the modal
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-resume-trigger="true"]');
      if (trigger) {
        e.preventDefault();
        openResumeModal(e);
      }
    });

    if (resumeBackdrop) resumeBackdrop.addEventListener('click', closeResumeModal);
    if (resumeCloseBtn) resumeCloseBtn.addEventListener('click', closeResumeModal);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && resumeModal.classList.contains('active')) {
        closeResumeModal();
      }
    });
  }

  // ==============================================================
  // 18. RECRUITER MODE: ROLE & DOMAIN PROJECT FILTERING
  // ==============================================================
  function initRecruiterProjectFilter() {
    const filterPills = document.querySelectorAll('.recruiter-filter-pill');
    const flagshipContainer = document.getElementById('recruiter-flagship-case-studies');
    const summaryContainer = document.getElementById('recruiter-category-summary-view');
    const summaryCards = document.querySelectorAll('.category-summary-card');
    const otherProjectsSection = document.getElementById('other-projects');
    const currentlyBuildingSection = document.querySelector('.bg-card:has(.building-card)');

    if (!filterPills.length) return;

    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const filter = pill.getAttribute('data-filter');

        if (filter === 'all') {
          // In "All Projects", keep it as it is: full flagship case studies + full page
          if (flagshipContainer) flagshipContainer.style.display = 'flex';
          if (summaryContainer) summaryContainer.style.display = 'none';
          if (otherProjectsSection) otherProjectsSection.style.display = '';
          if (currentlyBuildingSection) currentlyBuildingSection.style.display = '';

          // Show all flagship case studies within container
          if (flagshipContainer) {
            flagshipContainer.querySelectorAll('.case-study').forEach(cs => cs.classList.remove('is-filtered-out'));
          }
          if (otherProjectsSection) {
            otherProjectsSection.querySelectorAll('.other-project-card').forEach(op => op.classList.remove('is-filtered-out'));
          }
        } else {
          // When exploring specific category: hide full case studies, show concise category summaries
          if (flagshipContainer) flagshipContainer.style.display = 'none';
          if (summaryContainer) summaryContainer.style.display = 'flex';
          if (otherProjectsSection) otherProjectsSection.style.display = 'none';
          if (currentlyBuildingSection) currentlyBuildingSection.style.display = 'none';

          summaryCards.forEach(card => {
            const cat = card.getAttribute('data-category') || '';
            if (cat.includes(filter)) {
              card.style.display = 'block';
            } else {
              card.style.display = 'none';
            }
          });
        }
      });
    });
  }

  // ==============================================================
  // 19. MOUSE SPOTLIGHT CURSOR TRACKER
  // ==============================================================
  function initSpotlightTracker() {
    if (window.matchMedia('(hover: hover)').matches) {
      document.addEventListener('mousemove', (e) => {
        const target = e.target.closest('.has-spotlight');
        if (target) {
          const rect = target.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          target.style.setProperty('--mouse-x', `${x}px`);
          target.style.setProperty('--mouse-y', `${y}px`);
        }
      });
    }
  }

  // ==============================================================
  // 20. KNOW GYAN MODE: READING HUD TRACKER & WEB AUDIO LO-FI
  // ==============================================================
  const kgHudChapterName = document.getElementById('kg-hud-chapter-name');
  const kgHudProgressBar = document.getElementById('kg-hud-progress-bar');
  const kgHudPrev = document.getElementById('kg-hud-prev');
  const kgHudNext = document.getElementById('kg-hud-next');

  const kgChaptersList = [
    { id: 'about-hero', label: 'Prologue · Intro' },
    { id: 'ch-01', label: 'Ch 01 · Origins' },
    { id: 'ch-02', label: 'Ch 02 · The Journey' },
    { id: 'ch-03', label: 'Ch 03 · Personal Growth' },
    { id: 'ch-04', label: 'Ch 04 · Hackathons' },
    { id: 'ch-05', label: 'Ch 05 · What I Build' },
    { id: 'ch-06', label: 'Ch 06 · Leadership' },
    { id: 'ch-07', label: 'Ch 07 · Beyond Tech' },
    { id: 'ch-08', label: "Ch 08 · What's Next" }
  ];

  function updateKgHudProgress() {
    if (currentMode !== 'know-gyan') return;
    const kgContainer = modeViews['know-gyan'];
    if (!kgContainer) return;

    const scrollY = window.scrollY;
    const headerHeight = siteHeader ? siteHeader.offsetHeight : 60;

    let activeIdx = 0;
    for (let i = 0; i < kgChaptersList.length; i++) {
      const el = document.getElementById(kgChaptersList[i].id);
      if (el) {
        const top = el.getBoundingClientRect().top;
        if (top <= headerHeight + 160) {
          activeIdx = i;
        }
      }
    }

    if (kgHudChapterName) {
      kgHudChapterName.textContent = kgChaptersList[activeIdx].label;
    }

    if (kgHudPrev) {
      const prevIdx = Math.max(0, activeIdx - 1);
      kgHudPrev.href = `#${kgChaptersList[prevIdx].id}`;
    }
    if (kgHudNext) {
      const nextIdx = Math.min(kgChaptersList.length - 1, activeIdx + 1);
      kgHudNext.href = `#${kgChaptersList[nextIdx].id}`;
    }

    const totalHeight = kgContainer.offsetHeight - window.innerHeight;
    if (totalHeight > 0) {
      const progress = Math.min(Math.max((scrollY / totalHeight) * 100, 6), 100);
      if (kgHudProgressBar) {
        kgHudProgressBar.style.width = `${progress.toFixed(1)}%`;
      }
    }
  }

  function toggleLoFiAmbience() {
    const soundBtn = document.getElementById('kg-ambient-sound-btn');
    const iconOff = soundBtn ? soundBtn.querySelector('.sound-icon-off') : null;
    const iconOn = soundBtn ? soundBtn.querySelector('.sound-icon-on') : null;

    if (isPlayingAmbience) {
      if (ambientNodes && ambientNodes.masterGain) {
        try {
          ambientNodes.masterGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.6);
        } catch (e) {}
        setTimeout(() => {
          if (ambientNodes) {
            ambientNodes.oscillators.forEach(osc => {
              try { osc.stop(); osc.disconnect(); } catch (err) {}
            });
            ambientNodes = null;
          }
        }, 650);
      }
      isPlayingAmbience = false;
      if (soundBtn) soundBtn.classList.remove('playing');
      if (iconOff) iconOff.style.display = 'inline-block';
      if (iconOn) iconOn.style.display = 'none';
      showToast('Lo-Fi ambience paused');
    } else {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!audioCtx) {
          audioCtx = new AudioContextClass();
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }

        const now = audioCtx.currentTime;
        const masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.0001, now);
        masterGain.gain.linearRampToValueAtTime(0.06, now + 1.2);

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(420, now);
        filter.Q.setValueAtTime(1.5, now);

        const freqs = [174.6, 261.6, 329.6, 440.0];
        const oscillators = [];

        freqs.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq + (idx * 0.4 - 0.6), now);

          const oscGain = audioCtx.createGain();
          oscGain.gain.value = 0.25;

          osc.connect(oscGain);
          oscGain.connect(filter);
          osc.start(now);
          oscillators.push(osc);
        });

        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        lfo.frequency.setValueAtTime(0.12, now);
        lfoGain.gain.setValueAtTime(80, now);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start(now);
        oscillators.push(lfo);

        filter.connect(masterGain);
        masterGain.connect(audioCtx.destination);

        ambientNodes = { masterGain, oscillators };
        isPlayingAmbience = true;

        if (soundBtn) soundBtn.classList.add('playing');
        if (iconOff) iconOff.style.display = 'none';
        if (iconOn) iconOn.style.display = 'inline-block';
        showToast('Lo-Fi ambience playing');
      } catch (err) {
        console.warn('AudioContext playback error:', err);
        showToast('Audio not supported or blocked by browser');
      }
    }
  }

  function initKnowGyanHud() {
    const soundBtn = document.getElementById('kg-ambient-sound-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleLoFiAmbience();
      });
    }

    const prevBtn = document.getElementById('kg-hud-prev');
    const nextBtn = document.getElementById('kg-hud-next');

    [prevBtn, nextBtn].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', (e) => {
          const href = btn.getAttribute('href');
          if (href && href.startsWith('#')) {
            e.preventDefault();
            const targetEl = document.querySelector(href);
            if (targetEl) {
              const headerHeight = siteHeader ? siteHeader.offsetHeight : 60;
              const pos = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight;
              window.scrollTo({ top: pos, behavior: 'smooth' });
            }
          }
        });
      }
    });
  }

  // ==============================================================
  // 21. DEVELOPER MODE: AST & QDRANT VECTOR RETRIEVAL SIMULATOR
  // ==============================================================
  function initDevInteractiveLab() {
    const labChips = document.querySelectorAll('.lab-chip');
    const labInput = document.getElementById('lab-query-input');
    const runBtn = document.getElementById('lab-run-btn');
    const terminalBody = document.getElementById('lab-terminal-body');
    const latencyEl = document.getElementById('lab-telemetry-latency');

    if (!runBtn || !terminalBody || !labInput) return;

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function runSimulator(query) {
      if (!query) query = labInput.value.trim();
      if (!query) return;

      runBtn.disabled = true;
      const playIcon = runBtn.querySelector('.lab-play-icon');
      if (playIcon) playIcon.style.opacity = '0.5';

      terminalBody.innerHTML = `<span class="log-info">[INIT]</span> Ingesting query: "${escapeHtml(query)}"...<br><span class="log-cyan">[STREAM]</span> Parsing abstract syntax tree and calculating vector distances...`;

      setTimeout(() => {
        const latency = Math.floor(Math.random() * 18) + 16;
        if (latencyEl) latencyEl.textContent = `Latency: ${latency}ms`;

        let logLines = [];
        const lower = query.toLowerCase();

        if (lower.includes('async def ') || lower.includes('def ')) {
          const funcNameMatch = query.match(/(?:async\s+)?def\s+([a-zA-Z0-9_]+)/);
          const funcName = funcNameMatch ? funcNameMatch[1] : 'parsed_subroutine';
          const isAsync = lower.includes('async def');
          const nodeType = isAsync ? 'AsyncFunctionDef' : 'FunctionDef';
          const lineNum = Math.floor(Math.random() * 80) + 40;
          const score = (0.94 + Math.random() * 0.05).toFixed(4);

          logLines = [
            `<span class="log-info">[INIT]</span> Initializing AST Recursive Splitter for Python 3.12...`,
            `<span class="log-success">[PARSED]</span> Node: <span class="log-hl">${nodeType}</span>(name='${funcName}', lineno=${lineNum}, col_offset=0)`,
            `<span class="log-info">[CHUNK]</span> Context preservation: Decorators [1], Docstrings [OK], Inner Scope [${Math.floor(Math.random() * 25) + 20} lines]`,
            `<span class="log-info">[EMBED]</span> Generating 768-dim vector via text-embedding-004...`,
            `<span class="log-success">[QDRANT]</span> Cosine Similarity Score: <strong class="log-match">${score}</strong> (Exact Semantic Match in Collection: 'repomind_core')`,
            `<span class="log-cyan">[RETURN]</span> 3 chunks retrieved in ${latency}ms · Zero context severance detected.`
          ];
        } else if (lower.includes('class ')) {
          const classNameMatch = query.match(/class\s+([a-zA-Z0-9_]+)/);
          const className = classNameMatch ? classNameMatch[1] : 'VectorSimilarityRetriever';
          const score = (0.93 + Math.random() * 0.04).toFixed(4);

          logLines = [
            `<span class="log-info">[INIT]</span> Traversing AST Class Hierarchy...`,
            `<span class="log-success">[PARSED]</span> Node: <span class="log-hl">ClassDef</span>(name='${className}', lineno=45, col_offset=0)`,
            `<span class="log-info">[CHUNK]</span> Structure preserved: Enclosing Class Scope, Member Functions [4], Field Signatures [OK]`,
            `<span class="log-info">[QDRANT]</span> Filtering Qdrant payload: <code>{"module": "retrieval", "type": "class_def"}</code>`,
            `<span class="log-success">[QDRANT]</span> Cosine Similarity Score: <strong class="log-match">${score}</strong> (Collection: 'repomind_retrievers')`,
            `<span class="log-cyan">[RETURN]</span> 4 semantic class chunks retrieved in ${latency}ms.`
          ];
        } else if (lower.includes('multi_query') || lower.includes('rag') || lower.includes('prompt')) {
          const score = (0.95 + Math.random() * 0.03).toFixed(4);
          logLines = [
            `<span class="log-info">[INIT]</span> Multi-Query RAG Expansion Pipeline Triggered...`,
            `<span class="log-info">[EXPAND]</span> Generated 3 orthogonal search vectors:`,
            `  • Q1: "Abstract syntax tree function chunking and parsing"`,
            `  • Q2: "Qdrant vector similarity search HNSW cosine metric"`,
            `  • Q3: "Semantic code retrieval with zero context severance"`,
            `<span class="log-success">[FUSION]</span> Reciprocal Rank Fusion (RRF) synthesized 12 candidate vectors`,
            `<span class="log-success">[QDRANT]</span> Best Match Score: <strong class="log-match">${score}</strong> across repomind collections`,
            `<span class="log-cyan">[RETURN]</span> Optimal context injected into prompt in ${latency}ms.`
          ];
        } else if (lower.includes('jwt') || lower.includes('auth') || lower.includes('token')) {
          logLines = [
            `<span class="log-info">[INIT]</span> Security Subsystem AST Verification...`,
            `<span class="log-success">[PARSED]</span> Node: <span class="log-hl">FunctionDef</span>(name='verify_jwt_auth', lineno=188)`,
            `<span class="log-info">[SANITY]</span> Local Regex PII verification: Phone/Email sanitize check passed.`,
            `<span class="log-success">[QDRANT]</span> Cosine Distance: 0.0381 -> Similarity: <strong class="log-match">0.9619</strong>`,
            `<span class="log-cyan">[RETURN]</span> Auth chunk verified in ${latency}ms.`
          ];
        } else {
          const score = (0.91 + Math.random() * 0.06).toFixed(4);
          logLines = [
            `<span class="log-info">[INIT]</span> Processing Semantic Query: "${escapeHtml(query)}"...`,
            `<span class="log-info">[TOKENIZE]</span> Extracted query intent and generated 768-dim embedding`,
            `<span class="log-success">[QDRANT]</span> HNSW vector cluster search executed across 1,480 code vectors`,
            `<span class="log-success">[MATCH]</span> Highest Cosine Similarity: <strong class="log-match">${score}</strong> in 'repomind_core'`,
            `<span class="log-cyan">[RETURN]</span> 3 relevant code blocks retrieved in ${latency}ms.`
          ];
        }

        terminalBody.innerHTML = logLines.join('\n');
        runBtn.disabled = false;
        if (playIcon) playIcon.style.opacity = '1';
        showToast(`Simulator executed in ${latency}ms`);
      }, 260);
    }

    labChips.forEach(chip => {
      chip.addEventListener('click', () => {
        labChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const q = chip.getAttribute('data-query');
        if (q) {
          labInput.value = q;
          runSimulator(q);
        }
      });
    });

    runBtn.addEventListener('click', () => {
      runSimulator(labInput.value.trim());
    });

    labInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        runSimulator(labInput.value.trim());
      }
    });
  }

  // ==============================================================
  // 22. DEVELOPER MODE: COPY CODE SNIPPET BUTTONS
  // ==============================================================
  function initDevCopyCodeButtons() {
    const copyBtns = document.querySelectorAll('.dev-copy-code-btn');
    copyBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = btn.getAttribute('data-code-target');
        const targetEl = document.getElementById(targetId);
        if (!targetEl) return;

        const codeText = targetEl.textContent || targetEl.innerText;

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(codeText).then(() => {
            handleCopyCodeSuccess(btn);
          }).catch(() => {
            fallbackCopy(codeText, btn);
          });
        } else {
          fallbackCopy(codeText, btn);
        }
      });
    });

    function handleCopyCodeSuccess(btn) {
      btn.classList.add('copied');
      const textSpan = btn.querySelector('span');
      const origText = textSpan ? textSpan.textContent : 'Copy Code';
      if (textSpan) textSpan.textContent = 'Copied!';

      showToast('Code snippet copied to clipboard!');

      setTimeout(() => {
        btn.classList.remove('copied');
        if (textSpan) textSpan.textContent = origText;
      }, 2000);
    }

    function fallbackCopy(text, btn) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        handleCopyCodeSuccess(btn);
      } catch (err) {
        showToast('Code copy not supported on this browser');
      }
      document.body.removeChild(textarea);
    }
  }

  // ==============================================================
  // 23. FLOATING DEVELOPER CLI TERMINAL DRAWER & INTERACTIVE SHELL
  // ==============================================================
  function initCliTerminal() {
    const dockBtn = document.getElementById('terminal-dock-btn');
    const drawer = document.getElementById('cli-terminal-drawer');
    const closeBtn = document.getElementById('cli-drawer-close');
    const dotClose = document.getElementById('cli-close-btn');
    const input = document.getElementById('cli-input');
    const output = document.getElementById('cli-output');

    if (!dockBtn || !drawer || !input) return;

    let commandHistory = [];
    let historyIdx = -1;

    const minBtn = document.getElementById('cli-minimize-btn');
    const maxBtn = document.getElementById('cli-maximize-btn');

    function openTerminal() {
      drawer.classList.add('active');
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      setTimeout(() => input.focus(), 80);
    }

    function closeTerminal() {
      drawer.classList.remove('active');
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
    }

    dockBtn.addEventListener('click', () => {
      if (drawer.classList.contains('active') || drawer.classList.contains('open')) {
        closeTerminal();
      } else {
        openTerminal();
      }
    });

    if (closeBtn) closeBtn.addEventListener('click', closeTerminal);
    if (dotClose) dotClose.addEventListener('click', closeTerminal);
    if (minBtn) minBtn.addEventListener('click', closeTerminal);
    if (maxBtn) maxBtn.addEventListener('click', () => drawer.classList.toggle('maximized'));

    // Global toggle key: backtick (`)
    window.addEventListener('keydown', (e) => {
      if (e.key === '`' || e.key === '~') {
        const activeEl = document.activeElement;
        const activeTag = activeEl ? activeEl.tagName.toLowerCase() : '';
        if (activeEl === input || e.target === input || activeTag === 'input' || activeTag === 'textarea') {
          return;
        }
        e.preventDefault();
        if (drawer.classList.contains('open')) {
          closeTerminal();
        } else {
          openTerminal();
        }
      } else if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeTerminal();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const rawCmd = input.value.trim();
        if (!rawCmd) return;

        commandHistory.push(rawCmd);
        historyIdx = commandHistory.length;

        executeTerminalCommand(rawCmd);
        input.value = '';
      } else if (e.key === 'ArrowUp') {
        if (commandHistory.length > 0 && historyIdx > 0) {
          historyIdx--;
          input.value = commandHistory[historyIdx];
        }
      } else if (e.key === 'ArrowDown') {
        if (historyIdx < commandHistory.length - 1) {
          historyIdx++;
          input.value = commandHistory[historyIdx];
        } else {
          historyIdx = commandHistory.length;
          input.value = '';
        }
      }
    });

    // Wire up Quick Command Shortcut Chips
    const cmdChips = drawer.querySelectorAll('.cli-cmd-chip');
    cmdChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        const cmd = chip.getAttribute('data-cmd');
        if (cmd) {
          commandHistory.push(cmd);
          historyIdx = commandHistory.length;
          executeTerminalCommand(cmd);
          input.value = '';
          input.focus();
        }
      });
    });

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function appendOutputLine(htmlContent, isPrompt = false) {
      if (!output) return;
      const line = document.createElement('div');
      line.className = 'cli-line' + (isPrompt ? ' prompt-line' : '');
      line.innerHTML = htmlContent;
      output.appendChild(line);
      const body = document.getElementById('cli-terminal-body');
      if (body) body.scrollTop = body.scrollHeight;
    }

    function executeTerminalCommand(cmdStr) {
      appendOutputLine(`<span class="cli-prompt">gyan@engineer:~$</span> <span class="cli-user-cmd">${escapeHtml(cmdStr)}</span>`, true);

      const parts = cmdStr.split(' ');
      const mainCmd = parts[0].toLowerCase();
      const arg = parts.slice(1).join(' ').toLowerCase();

      switch (mainCmd) {
        case 'help':
          appendOutputLine(`
Available commands:
  <span class="cmd-hl">projects</span>       - View flagship AI &amp; backend engineering projects
  <span class="cmd-hl">skills</span>         - List technical skills, languages &amp; infrastructure
  <span class="cmd-hl">rag</span>            - RepoMind AST &amp; Qdrant vector retrieval architecture
  <span class="cmd-hl">bio</span>            - Candidate summary, education, and credentials
  <span class="cmd-hl">contact</span>        - Direct email, GitHub, and LinkedIn links
  <span class="cmd-hl">mode &lt;lens&gt;</span>     - Switch portfolio mode (<span class="cmd-hl">recruiter</span>, <span class="cmd-hl">developer</span>, <span class="cmd-hl">know-gyan</span>)
  <span class="cmd-hl">clear</span>          - Clear terminal output
  <span class="cmd-hl">exit</span>           - Close terminal drawer
          `);
          break;

        case 'projects':
          appendOutputLine(`
<strong style="color: #60a5fa;">FLAGSHIP REPOSITORIES:</strong>
1. <strong>RepoMind</strong> (Verified Work)
   · Language-Aware Syntax Chunker + Qdrant Cloud Vector Database
   · Live: <a href="https://repomind-eta.vercel.app/" target="_blank" style="color: #38bdf8;">repomind-eta.vercel.app</a>
2. <strong>DocOnCall</strong> (HackSprint Category Winner)
   · 3-Model AI Cooldown Fallback (Gemini 2.5 Flash -&gt; Lite -&gt; Groq LLaMA 3.3 70B)
   · Live: <a href="https://doconcall-by-devai.onrender.com" target="_blank" style="color: #38bdf8;">doconcall-by-devai.onrender.com</a>
3. <strong>Plant Disease Classifier</strong> (Deep Learning · Active Dev)
   · ResNet18 Transfer Learning on PlantVillage (38 crop classes) + Docker
   · Deployment: Containerized Image Classifier
4. <strong>Anime Recommender</strong>
   · Sentence-Transformers + FAISS IndexFlatIP sub-10ms exact search
   · Live: <a href="https://huggingface.co/spaces/gyan-ranjan/anime-recommender" target="_blank" style="color: #38bdf8;">Hugging Face Space</a>
5. <strong>Bengaluru House Price</strong>
   · 1-Std Cross-BHK Anomaly Pruning + Scikit-Learn Pipeline served via Flask
   · Live: <a href="https://bengaluru-house-price-prediction-f976.onrender.com" target="_blank" style="color: #38bdf8;">Render Demo</a>
6. <strong>SweetSuite</strong>
   · MVC Architecture, Joi Schema Validation &amp; Cloudinary CDN transforms
   · Live: <a href="https://sweet-suite.onrender.com/listings" target="_blank" style="color: #38bdf8;">Render Demo</a>
          `);
          break;

        case 'skills':
          appendOutputLine(`
<strong style="color: #10b981;">CORE TECHNICAL STACK:</strong>
• <strong>AI &amp; LLM:</strong> LangChain, Qdrant Cloud, FAISS, Gemini 2.5, Groq LLaMA 3.3, Scikit-Learn, PyTorch
• <strong>Languages:</strong> Python, JavaScript (ES6+), C++, SQL, HTML5 / CSS3
• <strong>Backend &amp; APIs:</strong> FastAPI, Node.js, Express.js, RESTful Architecture, JWT, Passport.js
• <strong>Databases &amp; Storage:</strong> MongoDB, Qdrant Cloud, PostgreSQL, FAISS
• <strong>DevOps &amp; Cloud:</strong> Docker, Git / GitHub Actions, Render, Vercel, Hugging Face Spaces
          `);
          break;

        case 'rag':
        case 'repomind':
          appendOutputLine(`
<strong style="color: #c084fc;">REPOMIND RAG ARCHITECTURE:</strong>
• <strong>Language-Aware Chunker:</strong> LangChain <code style="color: #f59e0b;">RecursiveCharacterTextSplitter.from_language</code> across 15+ extensions preserving function and class boundaries.
• <strong>Dense Vector Index:</strong> Qdrant Cloud HNSW with Cosine Distance metric.
• <strong>Multi-Query Fusion:</strong> Synthesizes 3 orthogonal search queries per user prompt to eliminate colloquial-vs-code keyword gaps.
• <strong>Sub-250ms Vector Retrieval:</strong> Direct vector lookup in Qdrant executes in under 25ms.
          `);
          break;

        case 'bio':
          appendOutputLine(`
<strong>Gyan Ranjan</strong> — Backend &amp; AI/ML Systems Engineer
• <strong>Degree:</strong> B.Tech in Information Technology, IIEST Shibpur (2025–2029)
• <strong>Academic Record:</strong> Current CGPA 9.22 / 10.0
• <strong>Competitive DSA:</strong> 300+ DSA &amp; Codeforces problems solved
• <strong>Awards:</strong> Category Winner: Best 1st-Year Engineering Team at HackSprint 2025 (DocOnCall)
• <strong>Status:</strong> Seeking Summer 2027 Internships
          `);
          break;

        case 'contact':
          appendOutputLine(`
<strong style="color: #38bdf8;">GET IN TOUCH:</strong>
• <strong>Email:</strong> <a href="mailto:gyanranjanjee@gmail.com" style="color: #60a5fa;">gyanranjanjee@gmail.com</a>
• <strong>GitHub:</strong> <a href="https://github.com/Gyan-Ranjan-01" target="_blank" style="color: #60a5fa;">github.com/Gyan-Ranjan-01</a>
• <strong>LinkedIn:</strong> <a href="https://linkedin.com/in/gyan-ranjan-" target="_blank" style="color: #60a5fa;">linkedin.com/in/gyan-ranjan-</a>
          `);
          break;

        case 'mode':
          if (validModes.includes(arg)) {
            switchMode(arg, true, true);
            appendOutputLine(`<span style="color: #10b981;">Switched portfolio lens to "${arg}".</span>`);
          } else {
            appendOutputLine(`<span style="color: #ef4444;">Invalid mode "${arg}". Choose: recruiter, developer, or know-gyan.</span>`);
          }
          break;

        case 'clear':
          output.innerHTML = `
            <div class="cli-line banner">Welcome to Gyan Ranjan's Interactive Systems Terminal [v3.1.0]</div>
            <div class="cli-line banner-sub">Type <span class="cmd-hl">help</span> to view available commands.</div>
          `;
          break;

        case 'exit':
        case 'close':
        case 'quit':
          closeTerminal();
          break;

        default:
          appendOutputLine(`<span style="color: #ef4444;">Command not found: "${escapeHtml(cmdStr)}". Type <span class="cmd-hl">help</span> for a list of available commands.</span>`);
          break;
      }
    }
  }

  // ==============================================================
  // 24. DEVELOPER MODE: DYNAMIC ATMOSPHERE & READING HUD CONTROLLER
  // ==============================================================
  function initDevProjectAtmosphere() {
    const dynamicBg = document.getElementById('dev-dynamic-bg');
    const hud = document.getElementById('dev-reading-hud');
    const hudDot = document.getElementById('hud-pulse-dot');
    const hudStep = document.getElementById('hud-step-counter');
    const hudTitle = document.getElementById('hud-project-title');
    const hudTags = document.getElementById('hud-project-tags');
    const hudProgress = document.getElementById('hud-progress-bar');
    const deepDiveSections = Array.from(document.querySelectorAll('.dev-deepdive-section'));
    const transitionPortals = Array.from(document.querySelectorAll('.dev-transition-portal'));

    if (!dynamicBg || deepDiveSections.length === 0) return;

    const devProjectsMeta = {
      'repomind': {
        num: '[01/08]',
        title: 'RepoMind Architecture',
        tags: 'AST Parsing • Qdrant Cloud • RAG',
        color: '#a855f7',
        progress: '12.5%'
      },
      'doconcall': {
        num: '[02/08]',
        title: 'DocOnCall Telehealth',
        tags: '3-Model Failover • PII Guard • HackSprint Winner',
        color: '#14b8a6',
        progress: '25%'
      },
      'ipsahayak': {
        num: '[03/08]',
        title: 'IP-SAKTI Sahayak',
        tags: 'Statutory AI • NDJSON Stream • Neo4j Graph',
        color: '#008cc1',
        progress: '37.5%'
      },
      'cpsat': {
        num: '[04/08]',
        title: 'Routine Generator CP-SAT',
        tags: 'Google OR-Tools • Hard/Soft CSP • <20s Search',
        color: '#8b5cf6',
        progress: '50%'
      },
      'anime': {
        num: '[05/08]',
        title: 'Anime Recommender',
        tags: 'Sub-10ms FAISS • RapidFuzz • Cosine Sim',
        color: '#f43f5e',
        progress: '62.5%'
      },
      'sweetsuite': {
        num: '[06/08]',
        title: 'SweetSuite Platform',
        tags: 'Full-Stack MVC • Atomic Dates • Concurrency Guard',
        color: '#f59e0b',
        progress: '75%'
      },
      'houseprice': {
        num: '[07/08]',
        title: 'Bengaluru House Price',
        tags: '2-Sigma Cross-BHK Pruning • Sklearn OLS Pipeline',
        color: '#10b981',
        progress: '87.5%'
      },
      'linear-regression': {
        num: '[08/08]',
        title: 'Linear Regression Math',
        tags: 'First-Principles NumPy • Analytical Gradients • OLS',
        color: '#38bdf8',
        progress: '100%'
      }
    };

    let activeTheme = '';
    let currentInViewSection = null;

    function setProjectTheme(themeKey) {
      if (!themeKey || activeTheme === themeKey) return;
      activeTheme = themeKey;

      const meta = devProjectsMeta[themeKey];
      if (!meta) return;

      // Update background aurora theme
      Object.keys(devProjectsMeta).forEach(k => {
        dynamicBg.classList.remove(`theme-${k}`);
      });
      dynamicBg.classList.add(`theme-${themeKey}`);

      // Update Floating Reading HUD
      if (hudTitle) hudTitle.textContent = meta.title;
      if (hudTags) hudTags.textContent = meta.tags;
      if (hudStep) hudStep.textContent = meta.num;
      if (hudProgress) {
        hudProgress.style.width = meta.progress;
        hudProgress.style.background = meta.color;
        hudProgress.style.boxShadow = `0 0 10px ${meta.color}`;
      }
      if (hudDot) {
        hudDot.style.background = meta.color;
        hudDot.style.boxShadow = `0 0 8px ${meta.color}`;
      }
    }

    // Set initial theme to repomind
    setProjectTheme('repomind');

    // Section Intersection Observer with efficient single-element class toggling
    if ('IntersectionObserver' in window) {
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const theme = entry.target.getAttribute('data-project-theme');
            if (theme) setProjectTheme(theme);
            if (currentInViewSection && currentInViewSection !== entry.target) {
              currentInViewSection.classList.remove('is-in-view');
            }
            entry.target.classList.add('is-in-view');
            currentInViewSection = entry.target;
          }
        });
      }, {
        root: null,
        rootMargin: '0px 0px -25% 0px',
        threshold: 0.08
      });

      deepDiveSections.forEach(section => {
        sectionObserver.observe(section);
      });

      // Efficient Transition Portals Observer
      const portalObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          } else {
            entry.target.classList.remove('in-view');
          }
        });
      }, {
        root: null,
        rootMargin: '0px 0px -15% 0px',
        threshold: 0.15
      });

      transitionPortals.forEach(portal => {
        portalObserver.observe(portal);
      });
    }
  }

  // ==============================================================
  // 24. RECRUITER CATEGORY SUMMARY ACCORDIONS (RESPONSIVE TOGGLE)
  // ==============================================================
  function initCategorySummaryAccordions() {
    const isDesktop = window.innerWidth > 768;
    document.querySelectorAll('.cat-card-callout-accordion').forEach(acc => {
      acc.open = isDesktop;
      acc.addEventListener('toggle', () => {
        if (acc.open) acc.dataset.userOpened = 'true';
      });
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const desktop = window.innerWidth > 768;
        document.querySelectorAll('.cat-card-callout-accordion').forEach(acc => {
          if (!desktop && acc.dataset.userOpened !== 'true') {
            acc.open = false;
          } else if (desktop) {
            acc.open = true;
          }
        });
      }, 150);
    });
  }

  // ==============================================================
  // INITIALIZE EVERYTHING
  // ==============================================================
  initScrollReveals();
  initNumberCounters();
  initEmailCopyButtons();
  initResumeModal();
  initRecruiterProjectFilter();
  initCategorySummaryAccordions();
  initSpotlightTracker();
  initDevInteractiveLab();
  initDevCopyCodeButtons();
  initKnowGyanHud();
  initCliTerminal();
  initDevProjectAtmosphere();
  handleInitialRoute();

});
