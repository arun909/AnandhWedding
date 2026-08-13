(() => {
  "use strict";

  /* ---------- Loader ---------- */
  window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    setTimeout(() => loader.classList.add("hidden"), 400);
  });

  /* ---------- Countdown ---------- */
  const WEDDING_DATE = new Date("2026-08-23T10:00:00+05:30").getTime();

  function updateCountdown() {
    const now = Date.now();
    const diff = Math.max(0, WEDDING_DATE - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    const pad = (n) => String(n).padStart(2, "0");
    document.getElementById("cd-days").textContent = pad(days);
    document.getElementById("cd-hours").textContent = pad(hours);
    document.getElementById("cd-mins").textContent = pad(mins);
    document.getElementById("cd-secs").textContent = pad(secs);
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ---------- Section nav active state ---------- */
  const navLinks = document.querySelectorAll(".section-nav a, .hero-topnav-links a");
  const sections = ["hero", "story", "details"].map((id) => document.getElementById(id));

  function setActiveNav() {
    let current = sections[0];
    const scrollPos = window.scrollY + window.innerHeight / 2;
    sections.forEach((sec) => {
      if (sec && sec.offsetTop <= scrollPos) current = sec;
    });
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${current.id}`);
    });
  }
  window.addEventListener("scroll", setActiveNav, { passive: true });
  setActiveNav();

  /* ---------- GSAP scroll reveals ---------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!reduceMotion) {
      // Hero entrance
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from(".hero-eyebrow", { opacity: 0, y: 16, duration: 0.7 }, 0.15)
        .from(".hero-names", { opacity: 0, y: 18, duration: 0.7 }, 0.35)
        .from(".hero-date-row, .hero-sub, .hero-cta", { opacity: 0, y: 12, duration: 0.6, stagger: 0.1 }, 0.6)
        .from(".hero-portrait-track", { opacity: 0, scale: 0.96, duration: 1, ease: "power2.out" }, 0.35);

      // Slow parallax on hero portrait (kept off the .hero-portrait img itself
      // so the CSS hover-zoom on that element is never fought by an inline transform)
      gsap.to(".hero-portrait-track", {
        yPercent: 8,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
      });

      // Generic reveal-on-scroll for elements with .reveal
      document.querySelectorAll(".reveal").forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });

      // Story cards subtle stagger + vertical drift on scroll
      gsap.utils.toArray(".story-card").forEach((card) => {
        const speed = parseFloat(card.dataset.speed) || 1;
        gsap.to(card.querySelector("img"), {
          yPercent: 8 * speed,
          ease: "none",
          scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      // Our Story: photos + path draw in one by one, hearts blink.
      // GSAP only ever touches .story-photo-inner (opacity/scale/y) — the outer
      // .story-photo figure is left alone so its CSS hover-zoom always works.
      const storyPath = document.querySelector(".story-path");
      const revealPath = document.getElementById("storyPathReveal");
      if (storyPath) {
        const photos = gsap.utils.toArray(".story-photo-inner");
        const hearts = gsap.utils.toArray(".path-heart");
        const pathLength = revealPath ? revealPath.getTotalLength() : 0;

        if (revealPath) {
          gsap.set(revealPath, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
        }
        gsap.set(photos, { opacity: 0, scale: 0.88, y: 30 });
        gsap.set(hearts, { opacity: 0, scale: 0 });

        const blink = (heart) => {
          gsap.to(heart, {
            opacity: 0.4,
            scale: 0.88,
            duration: 1.1,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        };

        const tl = gsap.timeline({
          scrollTrigger: { trigger: storyPath, start: "top 85%" },
          defaults: { ease: "power3.out" },
        });

        photos.forEach((photo, i) => {
          const figure = photo.closest(".story-photo");
          tl.to(photo, { opacity: 1, scale: 1, y: 0, duration: 0.9 }, i === 0 ? 0 : "-=0.35");

          if (hearts[i] && revealPath) {
            tl.to(revealPath, { strokeDashoffset: pathLength * (1 - (i + 1) / photos.length), duration: 1.1, ease: "power2.inOut" }, "-=0.55")
              .to(hearts[i], { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.6)" }, "-=0.4")
              .call(() => {
                blink(hearts[i]);
                if (figure) figure.classList.add("is-visible");
              });
          } else if (figure) {
            tl.call(() => figure.classList.add("is-visible"));
          }
        });
      }

      // Countdown numbers gentle pop when in view
      gsap.from(".hero-countdown-item", {
        opacity: 0,
        y: 16,
        stagger: 0.1,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: { trigger: ".hero-countdown-wrap", start: "top 90%" },
      });
    } else {
      document.querySelectorAll(".reveal").forEach((el) => {
        el.style.opacity = 1;
        el.style.transform = "none";
      });
    }
  }

})();
