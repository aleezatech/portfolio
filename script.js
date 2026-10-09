document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- YOUR LINKS: edit only this list ---------- */
// Leave a link empty ("") and its button hides itself.
const LINKS = {
  email:    "",
  linkedin: "https://pk.linkedin.com/in/aleeza-b-531543361",
  fiverr:   "https://www.fiverr.com/s/DmmwYXV",
  // second Fiverr link you sent: https://www.fiverr.com/s/X0072lm
  upwork:   "",
  github:   "https://github.com/aleezatech"
};

// Puts each link into every button that has a matching data-link name
document.querySelectorAll("[data-link]").forEach((a) => {
  const value = LINKS[a.dataset.link];
  const item = a.closest("li") || a;

  if (!value) {
    item.hidden = true; // no link yet, so hide the button
    return;
  }

  if (a.dataset.link === "email") {
    a.href = "mailto:" + value;
    a.textContent = value;
  } else {
    a.href = value;
  }
});

/* ---------- Sound (clicks, hover ticks, mute button) ---------- */
setupSound(document.getElementById("soundBtn"));

/* ---------- Dark / Light mode ---------- */
const themeBtn = document.getElementById("themeBtn");

function applyTheme(mode) {
  const isDark = mode === "dark";
  document.body.classList.toggle("dark", isDark);
  themeBtn.textContent = isDark ? "Light mode" : "Dark mode";
}

let savedTheme = null;
try {
  savedTheme = localStorage.getItem("theme");
} catch (err) {
  // Storage can be blocked; the site still works without it
}
const deviceIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
applyTheme(savedTheme || "dark"); // dark mode first, because neon looks best on dark

themeBtn.addEventListener("click", () => {
  const next = document.body.classList.contains("dark") ? "light" : "dark";
  applyTheme(next);
  Sound.pop();
  try {
    localStorage.setItem("theme", next);
  } catch (err) {}
});

/* ---------- Text that writes itself when the page opens ---------- */
const typedEl = document.getElementById("typed");
const caretEl = document.querySelector(".caret");
const writeEls = document.querySelectorAll(".write");
const phrases = [
  "responsive websites.",
  "Android apps.",
  "restaurant sites.",
  "AI-powered projects."
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// After the intro, the last words keep changing: type, wait, delete, repeat
function startPhrases() {
  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function step() {
    const word = phrases[phraseIndex];
    typedEl.textContent = word.slice(0, charIndex);

    let delay = deleting ? 35 : 75;

    if (!deleting && charIndex === word.length) {
      deleting = true;
      delay = 1600; // pause when the word is complete
    } else if (deleting && charIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = 350;
    }

    charIndex += deleting ? -1 : 1;
    setTimeout(step, delay);
  }
  step();
}

// Writes one element letter by letter
async function writeText(el, speed, moveCaret) {
  const text = el.dataset.text;
  el.textContent = "";
  el.style.visibility = "visible";
  if (moveCaret) el.after(caretEl);
  for (let i = 1; i <= text.length; i++) {
    el.textContent = text.slice(0, i);
    await sleep(speed);
  }
}

async function intro() {
  // Remember each text, then clear it (and keep its height so the page does not jump)
  writeEls.forEach((el) => {
    el.dataset.text = el.textContent.replace(/\s+/g, " ").trimStart();
    el.style.minHeight = el.offsetHeight + "px";
    el.textContent = "";
  });

  await sleep(350);
  await writeText(document.getElementById("line1"), 70, true);
  await sleep(150);
  await writeText(document.getElementById("line2"), 55, true);
  typedEl.after(caretEl);
  startPhrases();
  writeText(document.getElementById("lead"), 12, false); // runs at the same time
}

if (reduceMotion) {
  writeEls.forEach((el) => (el.style.visibility = "visible"));
  typedEl.textContent = phrases[0];
} else {
  intro();
}

/* ---------- Scroll progress bar ---------- */
const progress = document.getElementById("progress");

function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? window.scrollY / max : 0;
  progress.style.transform = "scaleX(" + ratio + ")";
}
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

/* ---------- Scroll reveal ---------- */
const reveals = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  reveals.forEach((el, i) => {
    el.style.transitionDelay = (i % 3) * 90 + "ms";
    revealObserver.observe(el);
  });
} else {
  reveals.forEach((el) => el.classList.add("in"));
}

/* ---------- Highlight the current section in the menu ---------- */
const navLinks = document.querySelectorAll("#mainNav a");
const sections = [...navLinks]
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
          });
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((section) => navObserver.observe(section));
}

/* ---------- Card glow that follows the mouse ---------- */
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", e.clientX - rect.left + "px");
    card.style.setProperty("--my", e.clientY - rect.top + "px");
  });
});

/* ---------- Button ripple ---------- */
document.addEventListener("pointerdown", (e) => {
  const btn = e.target.closest(".btn");
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  ripple.style.width = ripple.style.height = size + "px";
  ripple.style.left = e.clientX - rect.left - size / 2 + "px";
  ripple.style.top = e.clientY - rect.top - size / 2 + "px";
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
});

/* ---------- Hero preview: Desktop / Phone ---------- */
const frame = document.getElementById("frame");
const sizeButtons = document.querySelectorAll(".seg");

sizeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    frame.dataset.size = btn.dataset.size;
    sizeButtons.forEach((b) => {
      b.setAttribute("aria-pressed", b === btn ? "true" : "false");
    });
    Sound.pop();
  });
});

/* ---------- Contact form validation ---------- */
const form = document.getElementById("contactForm");
const formMsg = document.getElementById("formMsg");

function showMessage(text, type) {
  formMsg.textContent = text;
  formMsg.className = type;

  if (type === "error") {
    Sound.error();
    form.classList.remove("shake");
    void form.offsetWidth; // restarts the shake animation
    form.classList.add("shake");
  } else {
    Sound.success();
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  if (name === "" || email === "" || message === "") {
    showMessage("Please fill in your name, email and message.", "error");
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    showMessage("Please enter a valid email, like name@example.com.", "error");
    return;
  }

  if (message.length < 10) {
    showMessage("Please write at least 10 characters in your message.", "error");
    return;
  }

  // Note: this only checks the form. To receive messages by email,
  // connect the form to a service like Formspree later.
  showMessage("Thank you! Your message is ready to send.", "success");
  form.reset();
});
