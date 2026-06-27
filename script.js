document.addEventListener("DOMContentLoaded", () => {
  // 1. Sticky Header
  const header = document.querySelector("header");
  
  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };
  
  window.addEventListener("scroll", handleScroll);
  handleScroll(); // Trigger initial scroll check

  // 2. Mobile Menu Toggle
  const burgerBtn = document.getElementById("burger-btn");
  const mobileNav = document.getElementById("mobile-nav-panel");
  const burgerIcon = document.getElementById("burger-icon");
  const closeIcon = document.getElementById("close-icon");

  if (burgerBtn && mobileNav) {
    burgerBtn.addEventListener("click", () => {
      const isOpen = mobileNav.classList.contains("open");
      if (isOpen) {
        mobileNav.classList.remove("open");
        burgerIcon.style.display = "block";
        closeIcon.style.display = "none";
        document.body.style.overflow = ""; // restore scrolling
      } else {
        mobileNav.classList.add("open");
        burgerIcon.style.display = "none";
        closeIcon.style.display = "block";
        document.body.style.overflow = "hidden"; // lock scrolling
      }
    });

    // Close menu when clicking links
    const mobileLinks = mobileNav.querySelectorAll("a");
    mobileLinks.forEach(link => {
      link.addEventListener("click", () => {
        mobileNav.classList.remove("open");
        burgerIcon.style.display = "block";
        closeIcon.style.display = "none";
        document.body.style.overflow = "";
      });
    });
  }

  // 3. Image Slider/Carousel
  const setupCarousel = (projectId) => {
    const container = document.getElementById(`${projectId}-carousel`);
    if (!container) return;

    const slides = container.querySelectorAll(".carousel-slide");
    const dots = container.querySelectorAll(".carousel-dot");
    const prevBtn = container.querySelector(".carousel-btn-prev");
    const nextBtn = container.querySelector(".carousel-btn-next");

    let currentIndex = 0;
    const totalSlides = slides.length;

    if (totalSlides === 0) return;

    const showSlide = (index) => {
      // Loop indexing limits
      if (index >= totalSlides) currentIndex = 0;
      else if (index < 0) currentIndex = totalSlides - 1;
      else currentIndex = index;

      slides.forEach((slide, idx) => {
        if (idx === currentIndex) {
          slide.classList.add("active");
        } else {
          slide.classList.remove("active");
        }
      });

      dots.forEach((dot, idx) => {
        if (idx === currentIndex) {
          dot.classList.add("active");
        } else {
          dot.classList.remove("active");
        }
      });
    };

    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        showSlide(currentIndex - 1);
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        showSlide(currentIndex + 1);
      });
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener("click", (e) => {
        e.preventDefault();
        showSlide(idx);
      });
    });

    showSlide(0); // Initialize first slide
  };

  setupCarousel("repomind");
  setupCarousel("doconcall");

  // 4. Scroll Reveal Observer (Framer-Motion replacement)
  const revealElements = document.querySelectorAll(".reveal-on-scroll");
  
  if (revealElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target); // Reveal once
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: "0px 0px -40px 0px"
    });

    revealElements.forEach(el => {
      observer.observe(el);
    });
  }
});
