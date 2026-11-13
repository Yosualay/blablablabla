// Ubah semua detail personal dari sini agar teks dan tautan tetap konsisten.
const config = {
  recipientName: "Davina Nazwa Puspita",
  senderName: "Nama Kamu",
  whatsappNumber: "6281234567890", // Ganti dengan nomor WA tanpa tanda + atau spasi.
  whatsappMessage: "Aku udah jawab IYA di website kamu 😘",
  musicPath: "music.mp3", // Letakkan file musik pilihanmu di folder yang sama.
  story: [
    "Jadi gini, Vin...",
    "Sebenarnya udah lama aku mau ngomong ini.",
    "Tiap kamu bales chat aku, hari aku langsung naik level 📈",
    "Tapi aku grogi kalau ngomong langsung, makanya bikin website 😅",
  ],
  reasons: [
    "Senyum kamu bikin bug di hatiku auto fix 🐛",
    "Kamu lebih bikin nagih daripada kopi ☕",
    "Chat dari kamu = notifikasi favoritku 📱",
  ],
  noButtonTexts: [
    "Yakin?",
    "Coba pikir lagi",
    "Aku bakal sedih lho 🥲",
    "Please...",
    "Kamu kejam 😭",
    "Eh salah pencet ya?",
    "Tombol ini rusak kok",
  ],
  noAttemptsBeforeAnswer: 8,
};

const screens = [...document.querySelectorAll(".screen")];
const storyLine = document.querySelector("#story-line");
const storyDots = document.querySelector("#story-dots");
const storyNext = document.querySelector("#story-next");
const reasonList = document.querySelector("#reason-list");
const reasonsNext = document.querySelector("#reasons-next");
const answerArea = document.querySelector("#answer-area");
const yesButton = document.querySelector("#yes-button");
const noButton = document.querySelector("#no-button");
const questionNote = document.querySelector("#question-note");
const canvas = document.querySelector("#celebration-canvas");
const context = canvas.getContext("2d");
const music = document.querySelector("#background-music");
const musicToggle = document.querySelector("#music-toggle");
const musicStatus = document.querySelector("#music-status");

document.querySelectorAll("[data-recipient-name]").forEach((element) => {
  element.textContent = config.recipientName;
});
document.querySelectorAll("[data-sender-name]").forEach((element) => {
  element.textContent = config.senderName;
});

const phoneNumber = config.whatsappNumber.replace(/\D/g, "");
const whatsappUrl = new URL(`https://wa.me/${phoneNumber}`);
whatsappUrl.searchParams.set("text", config.whatsappMessage);
document.querySelector("#whatsapp-button").href = whatsappUrl.toString();
music.src = config.musicPath;

let storyIndex = 0;
let typingTimer;
let noAttempts = 0;
let noIsAnswerable = false;
let yesScale = 1;
let confettiParticles = [];
let animationFrame;

function showScreen(screenId) {
  screens.forEach((screen) => {
    const isActive = screen.id === screenId;
    screen.classList.toggle("is-active", isActive);
    screen.setAttribute("aria-hidden", String(!isActive));
  });
  const activeScreen = document.querySelector(`#${screenId}`);
  activeScreen?.querySelector("button, a")?.focus({ preventScroll: true });
}

document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", () => {
    showScreen(button.dataset.go);
    startStory();
  });
});

function renderStoryDots() {
  storyDots.replaceChildren(
    ...config.story.map((_, index) => {
      const dot = document.createElement("span");
      dot.className = `story-dot${index === storyIndex ? " is-current" : ""}`;
      return dot;
    }),
  );
}

function typeCurrentStory() {
  window.clearInterval(typingTimer);
  const sentence = config.story[storyIndex] ?? "";
  let characterIndex = 0;
  storyLine.textContent = "";
  storyNext.disabled = true;
  document.querySelector(".typing-cursor").classList.remove("is-done");
  renderStoryDots();

  typingTimer = window.setInterval(() => {
    storyLine.textContent += sentence.charAt(characterIndex);
    characterIndex += 1;

    if (characterIndex >= sentence.length) {
      window.clearInterval(typingTimer);
      document.querySelector(".typing-cursor").classList.add("is-done");
      window.setTimeout(() => {
        storyNext.disabled = false;
      }, 450);
    }
  }, 42);
}

function startStory() {
  storyIndex = 0;
  typeCurrentStory();
}

storyNext.addEventListener("click", () => {
  if (storyIndex < config.story.length - 1) {
    storyIndex += 1;
    typeCurrentStory();
    return;
  }

  showScreen("reasons-screen");
  revealReasons();
});

function revealReasons() {
  reasonList.replaceChildren();
  reasonsNext.disabled = true;

  config.reasons.forEach((reason, index) => {
    const card = document.createElement("div");
    card.className = "reason-card";
    card.style.animationDelay = `${index * 420}ms`;
    card.textContent = reason;
    reasonList.append(card);
  });

  window.setTimeout(() => {
    reasonsNext.disabled = false;
  }, config.reasons.length * 420 + 450);
}

reasonsNext.addEventListener("click", () => {
  showScreen("question-screen");
});

function setNoButtonPosition() {
  const areaBounds = answerArea.getBoundingClientRect();
  const buttonBounds = noButton.getBoundingClientRect();
  const padding = 4;
  const maxX = Math.max(padding, areaBounds.width - buttonBounds.width - padding);
  const maxY = Math.max(padding, areaBounds.height - buttonBounds.height - padding);
  const left = padding + Math.random() * Math.max(0, maxX - padding);
  const top = padding + Math.random() * Math.max(0, maxY - padding);

  noButton.style.left = `${left}px`;
  noButton.style.top = `${top}px`;
}

function dodgeNoButton() {
  if (noIsAnswerable) return;

  noAttempts += 1;
  yesScale = Math.min(1 + noAttempts * 0.1, 1.8);
  yesButton.style.transform = `scale(${yesScale})`;

  if (noAttempts >= config.noAttemptsBeforeAnswer) {
    noIsAnswerable = true;
    noButton.classList.remove("is-dodging");
    noButton.classList.add("is-answerable");
    noButton.style.left = "";
    noButton.style.top = "";
    noButton.textContent = "Nggak dulu, ya 🤍";
    questionNote.textContent = "Santai aja, jawaban apa pun tetap aku hargai 🤍";
    return;
  }

  noButton.classList.add("is-dodging");
  noButton.textContent =
    config.noButtonTexts[(noAttempts - 1) % config.noButtonTexts.length];
  setNoButtonPosition();
}

noButton.addEventListener("pointerenter", (event) => {
  if (event.pointerType === "mouse" && !noIsAnswerable) dodgeNoButton();
});

noButton.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "touch" || event.pointerType === "pen") {
    if (noIsAnswerable) return;
    event.preventDefault();
    dodgeNoButton();
  }
});

noButton.addEventListener("click", (event) => {
  if (noIsAnswerable) {
    showScreen("no-screen");
    return;
  }

  if (event.detail === 0 || event.pointerType === "mouse") {
    dodgeNoButton();
  }
});

yesButton.addEventListener("click", () => {
  window.clearInterval(typingTimer);
  showScreen("yes-screen");
  startCelebration();
});

document.querySelector("#back-to-question").addEventListener("click", () => {
  showScreen("question-screen");
});

musicToggle.addEventListener("click", async () => {
  if (music.paused) {
    try {
      await music.play();
      musicToggle.textContent = "Musik: nyala ♫";
      musicToggle.setAttribute("aria-label", "Matikan musik latar");
      musicToggle.setAttribute("aria-pressed", "true");
      musicStatus.textContent = "Musik latar dinyalakan.";
    } catch (error) {
      musicStatus.textContent =
        "Musik belum bisa diputar. Pastikan file music.mp3 tersedia di folder website.";
      console.error("Musik latar gagal diputar:", error);
    }
    return;
  }

  music.pause();
  musicToggle.textContent = "Musik: mati ♫";
  musicToggle.setAttribute("aria-label", "Nyalakan musik latar");
  musicToggle.setAttribute("aria-pressed", "false");
  musicStatus.textContent = "Musik latar dimatikan.";
});

function resizeCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * pixelRatio);
  canvas.height = Math.floor(window.innerHeight * pixelRatio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function createCelebrationParticles() {
  const colors = ["#f27baa", "#b395e6", "#ffd166", "#74c69d", "#ff8fab"];
  const symbols = ["heart", "confetti", "confetti", "confetti"];
  const count = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 35 : 120;

  return Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: -Math.random() * window.innerHeight,
    size: 5 + Math.random() * 10,
    speed: 1.1 + Math.random() * 2.8,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 0.015 + Math.random() * 0.04,
    rotation: Math.random() * Math.PI,
    rotationSpeed: (Math.random() - 0.5) * 0.08,
    color: colors[Math.floor(Math.random() * colors.length)],
    symbol: symbols[Math.floor(Math.random() * symbols.length)],
  }));
}

function drawHeart(particle) {
  const size = particle.size;
  context.beginPath();
  context.moveTo(particle.x, particle.y + size * 0.32);
  context.bezierCurveTo(
    particle.x - size * 0.55,
    particle.y - size * 0.05,
    particle.x - size * 0.35,
    particle.y - size * 0.55,
    particle.x,
    particle.y - size * 0.2,
  );
  context.bezierCurveTo(
    particle.x + size * 0.35,
    particle.y - size * 0.55,
    particle.x + size * 0.55,
    particle.y - size * 0.05,
    particle.x,
    particle.y + size * 0.32,
  );
  context.fill();
}

function animateCelebration() {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);

  confettiParticles.forEach((particle) => {
    particle.y += particle.speed;
    particle.sway += particle.swaySpeed;
    particle.rotation += particle.rotationSpeed;
    particle.x += Math.sin(particle.sway) * 0.8;

    context.save();
    context.translate(particle.x, particle.y);
    context.rotate(particle.rotation);
    context.fillStyle = particle.color;

    if (particle.symbol === "heart") {
      drawHeart({ ...particle, x: 0, y: 0 });
    } else {
      context.fillRect(-particle.size / 2, -particle.size / 3, particle.size, particle.size * 0.65);
    }

    context.restore();

    if (particle.y > window.innerHeight + particle.size) {
      particle.y = -particle.size;
      particle.x = Math.random() * window.innerWidth;
    }
  });

  animationFrame = window.requestAnimationFrame(animateCelebration);
}

function startCelebration() {
  window.cancelAnimationFrame(animationFrame);
  resizeCanvas();
  confettiParticles = createCelebrationParticles();
  animateCelebration();
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
