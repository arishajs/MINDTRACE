
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

const modal = document.getElementById("caseModal");
const modalTitle = document.getElementById("modalTitle");
const modalTag = document.getElementById("modalTag");
const modalStory = document.getElementById("modalStory");
const modalClue = document.getElementById("modalClue");
const answerInput = document.getElementById("answerInput");
const submitAnswer = document.getElementById("submitAnswer");
const gameFeedback = document.getElementById("gameFeedback");
const hintButton = document.getElementById("hintButton");
const hintText = document.getElementById("hintText");

let currentCase = null;
let solvedCases = new Set();

const cases = {
  lastcall: {
    title: "THE LAST CALL",
    story: "Detective, a witness disappeared at midnight. Before vanishing, they left one final message: 'I speak without a mouth, and answer without a voice. Find me where silence breaks.'",
    clue: "You hear your own voice return when you shout inside an empty tunnel.",
    answer: ["echo", "an echo"],
    hint: "Think about a sound that comes back to you."
  },

  redroom: {
    title: "THE RED ROOM",
    story: "A locked room contains a note: 'I have keys but no locks. I have space but no room. You can enter, but cannot walk inside.' What is the object?",
    clue: "The object is used almost every day to type messages.",
    answer: ["keyboard", "a keyboard"],
    hint: "Look at your computer desk."
  },

  ghost: {
    title: "GHOST PROTOCOL",
    story: "An anonymous message says: 'The more you take, the more you leave behind.' The evidence points to something every investigator creates while moving.",
    clue: "Look at the ground behind someone who has been walking.",
    answer: ["footsteps", "footprints", "steps", "footstep", "footprint"],
    hint: "Think about what your shoes leave behind."
  }
};

// Mobile navigation
menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.textContent = isOpen ? "×" : "☰";
});

navLinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  });
});

// Open an investigation
document.querySelectorAll("[data-case]").forEach(button => {
  button.addEventListener("click", () => {
    openCase(button.dataset.case);
  });
});

function openCase(caseId) {
  currentCase = cases[caseId];

  if (!currentCase) return;

  modalTitle.textContent = currentCase.title;
  modalTag.textContent = `CLASSIFIED CASE FILE / ${caseId.toUpperCase()}`;
  modalStory.textContent = currentCase.story;
  modalClue.textContent = currentCase.clue;

  answerInput.value = "";
  gameFeedback.textContent = "";
  hintText.textContent = "";
  submitAnswer.disabled = false;

  if (solvedCases.has(caseId)) {
    gameFeedback.textContent = "CASE ALREADY SOLVED. OPEN ANOTHER FILE.";
    gameFeedback.style.color = "#55e6a5";
    submitAnswer.disabled = true;
  } else {
    gameFeedback.style.color = "#ff1838";
  }

  modal.dataset.caseId = caseId;
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  setTimeout(() => answerInput.focus(), 100);
}

// Close the modal
function closeModal() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.getElementById("modalClose").addEventListener("click", closeModal);

modal.addEventListener("click", event => {
  if (event.target === modal) closeModal();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

// Check the detective's answer
function checkAnswer() {
  if (!currentCase || submitAnswer.disabled) return;

  const answer = answerInput.value
    .trim()
    .toLowerCase()
    .replace(/[.!?]/g, "")
    .replace(/\s+/g, " ");

  if (!answer) {
    gameFeedback.textContent = "DETECTIVE, ENTER YOUR DEDUCTION FIRST.";
    gameFeedback.style.color = "#ffb84d";
    answerInput.focus();
    return;
  }

  if (currentCase.answer.includes(answer)) {
    const caseId = modal.dataset.caseId;
    solvedCases.add(caseId);

    gameFeedback.textContent = "✓ CASE SOLVED. YOUR INSTINCTS DIDN'T FAIL YOU.";
    gameFeedback.style.color = "#55e6a5";
    submitAnswer.disabled = true;

    updateStats();
    saveProgress();
  } else {
    gameFeedback.textContent = "INCORRECT DEDUCTION. EXAMINE THE EVIDENCE AGAIN.";
    gameFeedback.style.color = "#ff1838";
  }
}

submitAnswer.addEventListener("click", checkAnswer);

answerInput.addEventListener("keydown", event => {
  if (event.key === "Enter") checkAnswer();
});

// Reveal a hint
hintButton.addEventListener("click", () => {
  if (!currentCase) return;
  hintText.textContent = "HINT: " + currentCase.hint;
});

// Save progress in this browser
function saveProgress() {
  try {
    localStorage.setItem(
      "mindtrace-solved-cases",
      JSON.stringify([...solvedCases])
    );
  } catch (error) {
    console.warn("Progress could not be saved.", error);
  }
}

function loadProgress() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("mindtrace-solved-cases") || "[]"
    );

    if (Array.isArray(saved)) {
      saved.forEach(id => {
        if (Object.prototype.hasOwnProperty.call(cases, id)) {
          solvedCases.add(id);
        }
      });
    }
  } catch (error) {
    console.warn("Saved progress could not be loaded.", error);
  }

  updateStats();
}

function updateStats() {
  const stat = document.querySelector(".hero-stats div:first-child strong");
  if (stat) {
    stat.textContent = String(3 - solvedCases.size).padStart(2, "0");
  }
}

loadProgress();

// Reveal elements when they enter the viewport
const revealElements = document.querySelectorAll(
  ".intro-content, .evidence-card, .feature-card, .case-card, .section-heading"
);

revealElements.forEach(element => element.classList.add("reveal"));

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach(element => observer.observe(element));
} else {
  revealElements.forEach(element => element.classList.add("visible"));
}

// Highlight the current navigation section
const sections = document.querySelectorAll("main section[id]");

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      navLinks.querySelectorAll("a").forEach(link => {
        link.classList.toggle(
          "active",
          link.getAttribute("href") === `#${entry.target.id}`
        );
      });
    });
  }, { rootMargin: "-25% 0px -60% 0px" });

  sections.forEach(section => sectionObserver.observe(section));
}

// Subtle pointer glow on desktop
const cursorGlow = document.querySelector(".cursor-glow");

if (window.matchMedia("(pointer: fine)").matches) {
  document.addEventListener("pointermove", event => {
    cursorGlow.style.left = event.clientX + "px";
    cursorGlow.style.top = event.clientY + "px";
    cursorGlow.style.opacity = "1";
  });
}
