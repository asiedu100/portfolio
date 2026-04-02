(() => {
  try {
    document.body.classList.add("js-ready");

    const header = document.querySelector("[data-header]");
    const nav = document.querySelector("[data-nav]");
    const toggle = document.querySelector("[data-nav-toggle]");
    const navLinks = Array.from(document.querySelectorAll(".nav-link"));
    const revealItems = Array.from(document.querySelectorAll(".section, .site-footer"));
    const reelOpenBtn = document.querySelector("[data-reel-open]");
    const modal = document.querySelector("[data-modal]");
    const modalPanel = document.querySelector("[data-modal-panel]");
    const modalCloseEls = Array.from(document.querySelectorAll("[data-modal-close]"));
    const modalVideo = modal ? modal.querySelector("video") : null;
    let lastFocus = null;

    // Creative Reels (separate lightbox)
    const reelsModal = document.querySelector("[data-reels-modal]");
    const reelsModalPanel = document.querySelector("[data-reels-modal-panel]");
    const reelsModalTitleEl = document.querySelector("[data-reels-modal-title]");
    const reelsModalVideo = reelsModal ? reelsModal.querySelector("[data-reels-video]") : null;
    const reelsCloseEls = Array.from(document.querySelectorAll("[data-reels-modal-close]"));
    const reelCards = Array.from(document.querySelectorAll("[data-reel-card]"));
    let lastReelsFocus = null;

    const setNavOpen = (open) => {
      if (!nav || !toggle) return;
      nav.classList.toggle("is-open", open);
      if (header) header.setAttribute("data-nav-open", String(open));
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute(
        "aria-label",
        open ? "Close navigation menu" : "Open navigation menu",
      );
    };

    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        setNavOpen(!isOpen);
      });

    nav.addEventListener("click", (e) => {
      const target = e.target;
      if (target instanceof HTMLElement && target.matches("a[href^='#']")) {
        setNavOpen(false);
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setNavOpen(false);
    });

    document.addEventListener("click", (e) => {
      if (window.innerWidth >= 768) return;
      const target = e.target;
      if (!(target instanceof Node)) return;
      const clickedToggle = toggle.contains(target);
      const clickedNav = nav.contains(target);
      if (!clickedToggle && !clickedNav) setNavOpen(false);
    });
  }

    const updateScrolledHeader = () => {
      if (!header) return;
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };

    updateScrolledHeader();
    window.addEventListener("scroll", updateScrolledHeader, { passive: true });

    for (const link of navLinks) {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (!href || !href.startsWith("#")) return;
        const target = document.querySelector(href);
        if (!(target instanceof HTMLElement)) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", href);
        setNavOpen(false);
      });
    }

    if ("IntersectionObserver" in window && revealItems.length) {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        },
        {
          threshold: 0.16,
          rootMargin: "0px 0px -12% 0px",
        },
      );

      for (const item of revealItems) revealObserver.observe(item);
    } else {
      for (const item of revealItems) item.classList.add("is-visible");
    }

    // Interactive Projects background
    const projectsSection = document.querySelector(".projects-section");
    if (projectsSection && "IntersectionObserver" in window) {
      const obs = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) projectsSection.classList.add("is-visible");
          }
        },
        { threshold: 0.15 },
      );
      obs.observe(projectsSection);
    }

    if (projectsSection) {
      const setProjectsVars = (clientX, clientY) => {
        const rect = projectsSection.getBoundingClientRect();
        const x = (clientX - rect.left) / rect.width;
        const y = (clientY - rect.top) / rect.height;
        const clampedX = Math.min(1, Math.max(0, x));
        const clampedY = Math.min(1, Math.max(0, y));
        projectsSection.style.setProperty("--mx", String(clampedX));
        projectsSection.style.setProperty("--my", String(clampedY));
      };

      const resetProjectsVars = () => {
        projectsSection.style.setProperty("--mx", "0.5");
        projectsSection.style.setProperty("--my", "0.5");
      };

      resetProjectsVars();
      projectsSection.addEventListener("pointermove", (e) => {
        setProjectsVars(e.clientX, e.clientY);
      });
      projectsSection.addEventListener("pointerleave", resetProjectsVars);
    }

    const setReelsModalOpen = (open, { videoSrc, title } = {}) => {
      if (!reelsModal) return;
      reelsModal.classList.toggle("is-open", open);
      reelsModal.setAttribute("aria-hidden", String(!open));
      document.documentElement.style.overflow = open ? "hidden" : "";

      if (open) {
        lastReelsFocus =
          document.activeElement instanceof HTMLElement ? document.activeElement : null;
        if (reelsModalPanel instanceof HTMLElement) reelsModalPanel.focus();
        if (reelsModalTitleEl) reelsModalTitleEl.textContent = title || "Reel";

        if (reelsModalVideo instanceof HTMLVideoElement && videoSrc) {
          reelsModalVideo.pause();
          // Use encodeURI so filenames with spaces resolve correctly.
          reelsModalVideo.src = encodeURI(videoSrc);
          reelsModalVideo.load();
          reelsModalVideo.play().catch(() => {});
        }
      } else {
        if (reelsModalVideo instanceof HTMLVideoElement) {
          reelsModalVideo.pause();
          reelsModalVideo.removeAttribute("src");
          reelsModalVideo.load();
        }
        if (lastReelsFocus) lastReelsFocus.focus();
      }
    };

    if (reelCards.length && reelsModal) {
      for (const card of reelCards) {
        card.addEventListener("click", () => {
          const videoSrc = card.getAttribute("data-reel-video") || "";
          const title = card.getAttribute("data-reel-title") || "Reel";
          setReelsModalOpen(true, { videoSrc, title });
        });
      }
    }

    for (const el of reelsCloseEls) {
      el.addEventListener("click", () => setReelsModalOpen(false));
    }

    const setModalOpen = (open) => {
      if (!modal) return;
      modal.classList.toggle("is-open", open);
      modal.setAttribute("aria-hidden", String(!open));
      document.documentElement.style.overflow = open ? "hidden" : "";

      if (open) {
        lastFocus =
          document.activeElement instanceof HTMLElement ? document.activeElement : null;
        if (modalPanel instanceof HTMLElement) modalPanel.focus();
        if (modalVideo instanceof HTMLVideoElement) {
          // Autoplay may be blocked; ignore errors.
          modalVideo.currentTime = 0;
          modalVideo.play().catch(() => {});
        }
      } else {
        if (modalVideo instanceof HTMLVideoElement) {
          modalVideo.pause();
        }
        if (lastFocus) lastFocus.focus();
      }
    };

    if (reelOpenBtn) {
      reelOpenBtn.addEventListener("click", () => setModalOpen(true));
    }

    for (const el of modalCloseEls) {
      el.addEventListener("click", () => setModalOpen(false));
    }

    // Scrollspy: highlight active section link
    if ("IntersectionObserver" in window && navLinks.length) {
      const linkById = new Map();
      for (const link of navLinks) {
        const hash = link.getAttribute("href");
        if (!hash || !hash.startsWith("#")) continue;
        const id = hash.slice(1);
        if (!id) continue;
        linkById.set(id, link);
      }

      const sections = Array.from(linkById.keys())
        .map((id) => document.getElementById(id))
        .filter(Boolean);

      const setActive = (activeId) => {
        for (const [id, link] of linkById.entries()) {
          link.classList.toggle("is-active", id === activeId);
        }
      };

      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];

          if (visible && visible.target && visible.target.id) {
            setActive(visible.target.id);
          }
        },
        {
          root: null,
          threshold: [0.2, 0.4, 0.65],
          rootMargin: "-22% 0px -55% 0px",
        },
      );

      for (const section of sections) observer.observe(section);

      // Default active state near top
      setActive(sections[0]?.id || "");
    }

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 768) setNavOpen(false);
    });

    // Contact form: mailto fallback (no backend)
    const form = document.getElementById("contact-form");
    const hint = document.querySelector("[data-form-hint]");
    if (form instanceof HTMLFormElement) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const name = String(fd.get("name") || "").trim();
        const email = String(fd.get("email") || "").trim();
        const message = String(fd.get("message") || "").trim();

        const subject = encodeURIComponent(`Portfolio inquiry${name ? ` — ${name}` : ""}`);
        const body = encodeURIComponent(
          `${message || "(No message)"}\n\n---\nFrom: ${name || "(no name)"}\nEmail: ${
            email || "(no email)"
          }\n`,
        );

        const to = "yamoahkwasi150@gmail.com";
        window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
        if (hint) hint.textContent = "Opening your email client…";
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        setModalOpen(false);
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (reelsModal && reelsModal.classList.contains("is-open")) setReelsModalOpen(false);
      }
    });
  } catch (error) {
    document.body.classList.remove("js-ready");
    for (const item of document.querySelectorAll(".section, .site-footer")) {
      item.classList.add("is-visible");
    }
    // eslint-disable-next-line no-console
    console.error("Portfolio init failed; falling back to static render", error);
  }
})();
