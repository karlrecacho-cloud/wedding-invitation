/* ==========================================================================
   WEDDING CONFIGURATION & PERSONALIZATION
   ========================================================================== */
const wedding = {
    groomName: "Johnly",
    brideName: "Kaycee",
    weddingDate: "December 5, 2026",
    weddingDateTime: "December 5, 2026 15:30:00",
    timezone: "Asia/Manila",

    ceremony: {
        name: "Our Lady of the Sacred Heart Parish Church",
        time: "3:30 PM",
        mapsUrl: "https://maps.app.goo.gl/gmY83DDrb4QV4JoZ9"
    },

    reception: {
        name: "The Bellevue Manila",
        time: "[RECEPTION TIME TO BE ADDED]",
        mapsUrl: "https://maps.app.goo.gl/9RpUwqLWwcLNA6a88"
    },

    dressCode: "[DRESS CODE TO BE ADDED]",
    rsvpDeadline: "[RSVP DEADLINE TO BE ADDED]"
};

// RSVP Endpoint Configuration
const RSVP_ENDPOINT = "[GOOGLE APPS SCRIPT URL]";

// Maps links
const ceremonyMap = wedding.ceremony.mapsUrl;
const receptionMap = wedding.reception.mapsUrl;

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    initOpeningScreen();
    initNavigation();
    initCountdown();
    initMapButtons();
    initGalleryLightbox();
    initRSVPForm();
    initAccordion();
    initMusicPlayer();
    initScrollAnimations();
});

/* ==========================================================================
   OPENING COVER TRANSITION
   ========================================================================== */
function initOpeningScreen() {
    const openBtn = document.getElementById("open-invitation-btn");
    const openingScreen = document.getElementById("opening-screen");
    const mainContent = document.getElementById("main-content");
    const bgMusic = document.getElementById("bg-music");

    openBtn.addEventListener("click", () => {
        openingScreen.classList.add("opened");
        mainContent.classList.add("visible");

        // Attempt background music on gesture
        if (bgMusic) {
            bgMusic.play().then(() => {
                const musicBtn = document.getElementById("music-toggle");
                if (musicBtn) musicBtn.classList.add("playing");
            }).catch(() => {
                // Autoplay blocked by browser policy
            });
        }

        document.body.style.overflow = "auto";
    });
}

/* ==========================================================================
   NAVIGATION
   ========================================================================== */
function initNavigation() {
    const toggleBtn = document.getElementById("nav-toggle");
    const navMenu = document.getElementById("nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");

    toggleBtn.addEventListener("click", () => {
        navMenu.classList.toggle("active");
    });

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("active");
        });
    });
}

/* ==========================================================================
   COUNTDOWN TIMER (ASIA/MANILA TIMEZONE)
   ========================================================================== */
function initCountdown() {
    const daysEl = document.getElementById("cd-days");
    const hoursEl = document.getElementById("cd-hours");
    const minsEl = document.getElementById("cd-minutes");
    const secsEl = document.getElementById("cd-seconds");
    const container = document.getElementById("countdown");

    function updateTimer() {
        // Parse target time explicitly as Asia/Manila (UTC+8)
        const targetDate = new Date("2026-12-05T15:30:00+08:00").getTime();
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference <= 0) {
            container.innerHTML = `<div class="countdown-message">Today is the day! ❤️</div>`;
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        daysEl.textContent = String(days).padStart(2, "0");
        hoursEl.textContent = String(hours).padStart(2, "0");
        minsEl.textContent = String(minutes).padStart(2, "0");
        secsEl.textContent = String(seconds).padStart(2, "0");
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

/* ==========================================================================
   MAP BUTTONS
   ========================================================================== */
function initMapButtons() {
    const mapButtons = document.querySelectorAll(".map-btn");

    mapButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const type = btn.getAttribute("data-type");
            const targetUrl = type === "ceremony" ? ceremonyMap : receptionMap;
            window.open(targetUrl, "_blank");
        });
    });
}

/* ==========================================================================
   LIGHTBOX
   ========================================================================== */
function initGalleryLightbox() {
    const items = document.querySelectorAll(".gallery-item");
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const closeBtn = document.getElementById("lightbox-close");
    const prevBtn = document.getElementById("lightbox-prev");
    const nextBtn = document.getElementById("lightbox-next");

    let currentIndex = 0;
    const imagesList = Array.from(items).map(item => item.querySelector("img").src);

    function showImage(index) {
        currentIndex = index;
        lightboxImg.src = imagesList[currentIndex];
    }

    items.forEach((item, index) => {
        item.addEventListener("click", () => {
            lightbox.classList.add("active");
            showImage(index);
        });
    });

    closeBtn.addEventListener("click", () => lightbox.classList.remove("active"));

    prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + imagesList.length) % imagesList.length;
        showImage(currentIndex);
    });

    nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % imagesList.length;
        showImage(currentIndex);
    });

    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) lightbox.classList.remove("active");
    });
}

/* ==========================================================================
   RSVP HANDLER
   ========================================================================== */
function initRSVPForm() {
    const form = document.getElementById("rsvp-form");
    const conditionalBlock = document.getElementById("conditional-rsvp");
    const radioButtons = document.querySelectorAll('input[name="attendance"]');
    const statusContainer = document.getElementById("rsvp-status");
    const spinner = document.getElementById("rsvp-spinner");
    const responseMsg = document.getElementById("rsvp-response-message");

    radioButtons.forEach(radio => {
        radio.addEventListener("change", (e) => {
            if (e.target.value === "Joyfully Accept") {
                conditionalBlock.classList.remove("hidden");
            } else {
                conditionalBlock.classList.add("hidden");
            }
        });
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        form.style.display = "none";
        statusContainer.classList.remove("hidden");
        spinner.style.display = "block";
        responseMsg.innerHTML = "";

        const attendanceVal = document.querySelector('input[name="attendance"]:checked').value;

        // Check if endpoint is still placeholder
        if (RSVP_ENDPOINT === "[GOOGLE APPS SCRIPT URL]" || !RSVP_ENDPOINT.startsWith("http")) {
            setTimeout(() => {
                spinner.style.display = "none";
                responseMsg.innerHTML = `
                    <h3>Configuration Notice</h3>
                    <p>RSVP system endpoint is currently being configured. Please connect your Google Apps Script URL in <code>script.js</code>.</p>
                `;
            }, 1000);
            return;
        }

        const formData = new FormData(form);
        const payload = {
            timestamp: new Date().toISOString(),
            fullName: formData.get("fullName"),
            email: formData.get("email"),
            mobile: formData.get("mobile"),
            attendance: attendanceVal,
            numGuests: attendanceVal === "Joyfully Accept" ? formData.get("numGuests") : "0",
            guestNames: attendanceVal === "Joyfully Accept" ? formData.get("guestNames") : "N/A",
            mealPreference: attendanceVal === "Joyfully Accept" ? formData.get("mealPreference") : "N/A",
            dietary: attendanceVal === "Joyfully Accept" ? formData.get("dietary") : "N/A",
            message: formData.get("message")
        };

        try {
            await fetch(RSVP_ENDPOINT, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            spinner.style.display = "none";

            if (attendanceVal === "Joyfully Accept") {
                responseMsg.innerHTML = `
                    <h3>Thank You! ❤️</h3>
                    <p>We're so happy you'll be celebrating with us.</p>
                    <p style="margin-top:0.5rem; font-family: var(--font-serif); font-size:1.2rem;">Johnly & Kaycee</p>
                `;
            } else {
                responseMsg.innerHTML = `
                    <h3>Thank You for Letting Us Know</h3>
                    <p>We're sorry we won't be celebrating together, but we truly appreciate you letting us know.</p>
                `;
            }

        } catch (error) {
            spinner.style.display = "none";
            responseMsg.innerHTML = `
                <h3 style="color:var(--color-error)">Submission Error</h3>
                <p>An unexpected error occurred. Please try submitting again later.</p>
            `;
        }
    });
}

/* ==========================================================================
   FAQ ACCORDION
   ========================================================================== */
function initAccordion() {
    const headers = document.querySelectorAll(".accordion-header");

    headers.forEach(header => {
        header.addEventListener("click", () => {
            const item = header.parentElement;
            const isOpen = item.classList.contains("active");

            document.querySelectorAll(".accordion-item").forEach(el => el.classList.remove("active"));

            if (!isOpen) {
                item.classList.add("active");
            }
        });
    });
}

/* ==========================================================================
   MUSIC PLAYER CONTROLS
   ========================================================================== */
function initMusicPlayer() {
    const btn = document.getElementById("music-toggle");
    const audio = document.getElementById("bg-music");

    if (!btn || !audio) return;

    btn.addEventListener("click", () => {
        if (audio.paused) {
            audio.play();
            btn.classList.add("playing");
        } else {
            audio.pause();
            btn.classList.remove("playing");
        }
    });
}

/* ==========================================================================
   ANIMATIONS
   ========================================================================== */
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll(".story-card, .venue-card, .registry-card, .gallery-item").forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        el.style.transition = "opacity 0.8s ease, transform 0.8s ease";
        observer.observe(el);
    });
}