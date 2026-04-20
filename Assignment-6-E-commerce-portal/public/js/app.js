const rootElement = document.documentElement;
const toggleButton = document.querySelector("[data-theme-toggle]");
const navToggleButton = document.querySelector("[data-nav-toggle]");
const navPanel = document.querySelector("[data-nav-panel]");
const savedTheme = localStorage.getItem("resellr-theme");

if (savedTheme) {
  rootElement.setAttribute("data-theme", savedTheme);
}

const updateThemeButtonText = () => {
  if (!toggleButton) return;
  const isLight = rootElement.getAttribute("data-theme") !== "dark";
  toggleButton.textContent = isLight ? "Dark mode" : "Light mode";
};

updateThemeButtonText();

if (toggleButton) {
  toggleButton.addEventListener("click", () => {
    const nextTheme = rootElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    rootElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("resellr-theme", nextTheme);
    updateThemeButtonText();
  });
}

if (navToggleButton && navPanel) {
  navToggleButton.addEventListener("click", () => {
    const expanded = navPanel.classList.toggle("open");
    navToggleButton.setAttribute("aria-expanded", String(expanded));
  });
}

document.querySelectorAll("[data-search-input]").forEach((input) => {
  const panel = input.parentElement.querySelector("[data-search-suggestions]");
  if (!panel) return;

  const hideSuggestions = () => {
    panel.classList.remove("visible");
    panel.innerHTML = "";
  };

  input.addEventListener("input", async () => {
    const query = input.value.trim();
    if (query.length < 2) {
      hideSuggestions();
      return;
    }

    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      panel.innerHTML = (data.suggestions || [])
        .map((item) => `<a href="/listings/${item.slug}">${item.title} <small>${item.category}</small></a>`)
        .join("");
      panel.classList.toggle("visible", Boolean(panel.innerHTML));
    } catch (error) {
      hideSuggestions();
    }
  });

  document.addEventListener("click", (event) => {
    if (!input.contains(event.target) && !panel.contains(event.target)) {
      hideSuggestions();
    }
  });
});

const suggestionButton = document.querySelector("[data-price-suggestion]");
if (suggestionButton) {
  suggestionButton.addEventListener("click", () => {
    const form = suggestionButton.closest("form");
    const output = form.querySelector("[data-price-suggestion-output]");
    const category = form.querySelector('[name="category"]').value;
    const condition = form.querySelector('[name="condition"]').value;
    const year = Number(form.querySelector('[name="year"]').value) || new Date().getFullYear();
    const featured = form.querySelector('[name="featured"]').checked;
    const baseByCategory = { Cars: 450000, Bikes: 70000, Electronics: 25000, Furniture: 12000, Others: 15000 };
    const multiplierByCondition = { New: 1, "Like New": 0.88, Used: 0.72 };
    const age = Math.max(0, new Date().getFullYear() - year);
    const freshnessFactor = Math.max(0.45, 1 - age * 0.06);
    const estimated = Math.round((baseByCategory[category] || 15000) * (multiplierByCondition[condition] || 0.75) * freshnessFactor * (featured ? 1.08 : 1));
    output.textContent = `Suggested price: ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(estimated)}`;
  });
}

const detailImage = document.querySelector("[data-detail-image]");
document.querySelectorAll("[data-detail-thumb]").forEach((thumb) => {
  thumb.addEventListener("click", () => {
    if (!detailImage) return;
    detailImage.src = thumb.src;
  });
});

const chatPanel = document.querySelector("[data-chat-panel]");
if (chatPanel && chatPanel.dataset.roomId) {
  const socket = io();
  const roomId = chatPanel.dataset.roomId;
  const listingId = chatPanel.dataset.listingId;
  const receiverId = chatPanel.dataset.receiverId;
  const form = chatPanel.querySelector("[data-chat-form]");
  const messageList = chatPanel.querySelector("[data-chat-messages]");

  socket.emit("chat:join", roomId);

  socket.on("chat:message", (message) => {
    if (!messageList) return;
    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.innerHTML = `<strong>${message.sender?.name || "User"}</strong><p>${message.content}</p>`;
    messageList.appendChild(bubble);
    messageList.scrollTop = messageList.scrollHeight;
  });

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const textarea = form.querySelector('textarea[name="content"]');
      const content = textarea.value.trim();
      if (!content) return;

      await fetch("/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, listingId, receiverId, content })
      });

      textarea.value = "";
    });
  }
}
