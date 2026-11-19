/* ==========================================================================
   Portfolio Interactions — Dionisius Abimata Baswara
   ========================================================================== */

/**
 * Image fallback helper:
 * 1) Tries local assets/images/*.jpg first (never expires).
 * 2) Falls back to LinkedIn CDN URL if local file hasn't been added yet.
 * 3) Hides broken img cleanly to reveal the styled monogram / certificate placeholder.
 */
function handleImageFallback(img) {
  const fallback = img.dataset.fallback;
  if (fallback && !img.dataset.triedFallback) {
    img.dataset.triedFallback = "true";
    img.src = fallback;
    return;
  }
  img.style.display = "none";
}

function handleCertFallback(img) {
  const fallback = img.dataset.fallback;
  if (fallback && !img.dataset.triedFallback) {
    img.dataset.triedFallback = "true";
    img.src = fallback;
    return;
  }
  img.style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  // 1. Dynamic footer year
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // 2. Mobile navigation drawer
  const menuToggle = document.getElementById("menu-toggle");
  const siteNav = document.getElementById("site-nav");

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        siteNav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // 3. Active navigation highlight on scroll
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".site-nav .nav-link");

  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute("id");
          navLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
          });
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );

    sections.forEach((section) => navObserver.observe(section));
  }

  // 4. Scroll reveal animations
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // 5. Experience category filter
  const filterBtns = document.querySelectorAll(".filter-btn");
  const timelineItems = document.querySelectorAll(".timeline-item");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach((b) => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", String(b === btn));
      });

      timelineItems.forEach((item) => {
        const match = filter === "all" || item.dataset.category === filter;
        item.classList.toggle("is-hidden", !match);
      });
    });
  });

  // 5b. Project Card Multi-Photo Switcher
  document.querySelectorAll("[data-project-gallery]").forEach((gallery) => {
    const coverBtn = gallery.querySelector(".project-cover-btn");
    const coverImg = coverBtn ? coverBtn.querySelector("img") : null;
    const countBadge = gallery.querySelector(".project-count-badge");
    const thumbs = Array.from(gallery.querySelectorAll(".project-thumb-item"));
    if (!coverBtn || !coverImg || !thumbs.length) return;

    thumbs.forEach((thumb, idx) => {
      thumb.addEventListener("click", () => {
        const tImg = thumb.querySelector("img");
        if (!tImg) return;
        coverImg.style.display = "";
        coverImg.src = tImg.currentSrc || tImg.src;
        coverImg.alt = tImg.alt || "";
        coverBtn.dataset.title = thumb.dataset.title || "";
        coverBtn.dataset.subtitle = thumb.dataset.subtitle || "";
        coverBtn.dataset.activeIndex = String(idx);
        if (countBadge) countBadge.textContent = `${idx + 1} / ${thumbs.length}`;
        thumbs.forEach((t, i) => t.classList.toggle("is-active", i === idx));
      });
    });
  });

  // 6. Gallery Lightbox Modal (with Prev/Next + Arrow key navigation)
  const modal = document.getElementById("cert-modal");
  const modalImg = document.getElementById("modal-img");
  const modalTitle = document.getElementById("modal-title");
  const modalSubtitle = document.getElementById("modal-subtitle");
  const modalClose = document.getElementById("modal-close");
  const modalPrev = document.getElementById("modal-prev");
  const modalNext = document.getElementById("modal-next");

  let activeGallery = [];
  let activeIndex = 0;

  function renderModalItem(index) {
    if (!activeGallery.length || !modalImg) return;
    activeIndex = (index + activeGallery.length) % activeGallery.length;
    const btn = activeGallery[activeIndex];
    const img = btn.querySelector("img");
    if (!img) return;
    modalImg.src = img.currentSrc || img.src;
    modalImg.alt = btn.dataset.title || "Preview";
    if (modalTitle) modalTitle.textContent = btn.dataset.title || "Preview";
    if (modalSubtitle) {
      const counter = activeGallery.length > 1 ? ` (${activeIndex + 1} / ${activeGallery.length})` : "";
      modalSubtitle.textContent = (btn.dataset.subtitle || "") + counter;
    }
    const showNav = activeGallery.length > 1;
    if (modalPrev) modalPrev.hidden = !showNav;
    if (modalNext) modalNext.hidden = !showNav;
  }

  function openModalForButton(btn) {
    if (!modal) return;
    const projectGallery = btn.closest("[data-project-gallery]");
    if (projectGallery) {
      const thumbs = Array.from(projectGallery.querySelectorAll(".project-thumb-item"));
      if (thumbs.length > 1) {
        activeGallery = thumbs;
        const startIdx = parseInt(btn.dataset.activeIndex || "0", 10) || 0;
        renderModalItem(startIdx);
        modal.hidden = false;
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        return;
      }
    }
    const group = btn.closest(".media-strip, .project-gallery-4");
    activeGallery = group
      ? Array.from(group.querySelectorAll(".lightbox-trigger"))
      : [btn];
    const idx = activeGallery.indexOf(btn);
    renderModalItem(idx >= 0 ? idx : 0);
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".lightbox-trigger").forEach((btn) => {
    btn.addEventListener("click", () => {
      const img = btn.querySelector("img");
      if (!img || img.style.display === "none") return;
      openModalForButton(btn);
    });
  });

  if (modalPrev) modalPrev.addEventListener("click", () => renderModalItem(activeIndex - 1));
  if (modalNext) modalNext.addEventListener("click", () => renderModalItem(activeIndex + 1));
  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (!modal || modal.hidden) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft" && activeGallery.length > 1) renderModalItem(activeIndex - 1);
    if (e.key === "ArrowRight" && activeGallery.length > 1) renderModalItem(activeIndex + 1);
  });

  // 7. Copy email button
  const copyBtn = document.getElementById("copy-email-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const text = copyBtn.dataset.copy || "";
      try {
        await navigator.clipboard.writeText(text);
        const orig = copyBtn.textContent;
        copyBtn.textContent = "Copied!";
        setTimeout(() => {
          copyBtn.textContent = orig;
        }, 1800);
      } catch {
        window.location.href = `mailto:${text}`;
      }
    });
  }

  // 8. Interactive Contact Form (client-side validation + pre-filled mailto)
  // Tip: To send emails directly without opening a mail app, you can connect
  // this form to Formspree (https://formspree.io) or Web3Forms.
  const contactForm = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");

  if (contactForm && formStatus) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = contactForm.querySelector("#sender-name").value.trim();
      const email = contactForm.querySelector("#sender-email").value.trim();
      const subject = contactForm.querySelector("#sender-subject").value.trim();
      const message = contactForm.querySelector("#sender-message").value.trim();

      if (!name || !email || !subject || !message) {
        formStatus.textContent = "Please fill in all fields before sending.";
        formStatus.className = "form-note is-error";
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        formStatus.textContent = "Please enter a valid email address.";
        formStatus.className = "form-note is-error";
        return;
      }

      const body = `Hi Dionisius,\n\n${message}\n\nBest regards,\n${name}\n(${email})`;
      const mailtoUrl = `mailto:dionisiusabimata@gmail.com?subject=${encodeURIComponent(
        `[Portfolio] ${subject}`
      )}&body=${encodeURIComponent(body)}`;

      window.location.href = mailtoUrl;
      formStatus.textContent = "Opening your email client with your message pre-filled!";
      formStatus.className = "form-note is-success";
      contactForm.reset();
    });
  }
});
