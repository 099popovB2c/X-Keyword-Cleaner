(() => {
  if (window.__xKeywordCleanerLoaded) return;
  window.__xKeywordCleanerLoaded = true;

  const DEFAULTS = {
    enabled: true,
    blockedKeywords: [],
    blockedAccounts: [],
    blockedHashtags: [],
    hidePromoted: true,
    hideReplies: false,
    hideQuotePosts: false,
    showPlaceholder: true,
    caseSensitive: false
  };

  let settings = { ...DEFAULTS };
  let filteredCount = 0;
  let mutationTimer = null;

  function normalize(value) {
    const text = String(value || "").normalize("NFKC").replace(/\s+/g, " ").trim();
    return settings.caseSensitive ? text : text.toLocaleLowerCase();
  }

  function list(value) {
    return Array.isArray(value)
      ? value.map(normalize).filter(Boolean)
      : [];
  }

  function tweetText(article) {
    const nodes = article.querySelectorAll('[data-testid="tweetText"]');
    return [...nodes]
      .map(node => node.innerText || node.textContent || "")
      .join(" ")
      .trim();
  }

  function accountCandidates(article) {
    const set = new Set();

    for (const link of article.querySelectorAll('a[href^="/"]')) {
      const href = link.getAttribute("href") || "";
      const match = href.match(/^\/([A-Za-z0-9_]{1,15})(?:\/|$)/);
      if (match) {
        set.add(match[1]);
        set.add(`@${match[1]}`);
      }
    }

    const userNameBlock = article.querySelector('[data-testid="User-Name"]');
    const visible = (userNameBlock?.innerText || "").split("\n");

    for (const part of visible) {
      const cleaned = part.trim();
      if (cleaned) set.add(cleaned);
    }

    return [...set].map(normalize);
  }

  function hashtagCandidates(text) {
    const matches = String(text || "").match(/#[\p{L}\p{N}_]+/gu) || [];
    return matches.map(normalize);
  }

  function isPromoted(article) {
    const text = normalize(article.innerText || "");
    const promotedWords = [
      "promoted",
      "gesponsert",
      "sponsorisé",
      "sponsored",
      "promocionado",
      "reklam"
    ];

    if (promotedWords.some(word => text.includes(normalize(word)))) {
      const socialContext = article.querySelector('[data-testid="socialContext"]');
      const socialText = normalize(socialContext?.innerText || socialContext?.textContent || "");
      if (promotedWords.some(word => socialText.includes(normalize(word)))) return true;
    }

    return Boolean(article.querySelector('[data-testid="placementTracking"]'));
  }

  function isReply(article) {
    const text = normalize(article.innerText || "");
    return (
      text.includes(normalize("replying to")) ||
      text.includes(normalize("yanıt olarak")) ||
      text.includes(normalize("en réponse à")) ||
      text.includes(normalize("antwort an"))
    );
  }

  function hasQuotePost(article) {
    const quoted = article.querySelector(
      '[data-testid="tweet"] [role="link"] [data-testid="tweetText"], ' +
      '[data-testid="card.wrapper"]'
    );

    if (quoted) return true;

    const tweetLinks = [
      ...article.querySelectorAll('a[href*="/status/"]')
    ];

    return tweetLinks.length >= 2;
  }

  function reasonFor(article) {
    if (!settings.enabled) return null;

    if (settings.hidePromoted && isPromoted(article)) {
      return "Promoted post";
    }

    if (settings.hideReplies && isReply(article)) {
      return "Reply";
    }

    if (settings.hideQuotePosts && hasQuotePost(article)) {
      return "Quote post";
    }

    const text = tweetText(article);
    const normalizedText = normalize(text);

    const keywords = list(settings.blockedKeywords);
    if (keywords.some(keyword => normalizedText.includes(keyword))) {
      return "Blocked keyword";
    }

    const accounts = list(settings.blockedAccounts);
    const candidates = accountCandidates(article);

    if (accounts.some(account =>
      candidates.some(candidate =>
        candidate === account ||
        candidate === account.replace(/^@/, "") ||
        `@${candidate}` === account
      )
    )) {
      return "Blocked account";
    }

    const hashtags = list(settings.blockedHashtags).map(tag =>
      tag.startsWith("#") ? tag : `#${tag}`
    );
    const foundTags = hashtagCandidates(text);

    if (hashtags.some(tag => foundTags.includes(tag))) {
      return "Blocked hashtag";
    }

    return null;
  }

  function restore(article) {
    if (!article.dataset.xkcFiltered) return;

    article.classList.remove("xkc-hidden-post");
    delete article.dataset.xkcFiltered;
    article.querySelector(":scope > .xkc-placeholder")?.remove();
  }

  function filterArticle(article) {
    restore(article);

    const reason = reasonFor(article);
    if (!reason) return false;

    article.dataset.xkcFiltered = reason;
    article.classList.add("xkc-hidden-post");

    if (settings.showPlaceholder) {
      const placeholder = document.createElement("button");
      placeholder.type = "button";
      placeholder.className = "xkc-placeholder";
      placeholder.textContent = `Post hidden — ${reason}. Click to show.`;

      placeholder.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        article.classList.remove("xkc-hidden-post");
        placeholder.remove();
      });

      article.prepend(placeholder);
    }

    return true;
  }

  function updateCounter() {
    let badge = document.getElementById("xkc-counter");

    if (!badge) {
      badge = document.createElement("div");
      badge.id = "xkc-counter";
      document.documentElement.appendChild(badge);
    }

    badge.textContent = settings.enabled
      ? `X Cleaner: ${filteredCount} hidden`
      : "X Cleaner: Off";
  }

  function applyFilters() {
    filteredCount = 0;

    for (const article of document.querySelectorAll('article[data-testid="tweet"]')) {
      if (filterArticle(article)) filteredCount += 1;
    }

    updateCounter();
  }

  async function loadSettings() {
    const stored = await chrome.storage.sync.get(DEFAULTS);
    settings = { ...DEFAULTS, ...stored };
    applyFilters();
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;

    for (const [key, change] of Object.entries(changes)) {
      settings[key] = change.newValue;
    }

    applyFilters();
  });

  const observer = new MutationObserver(() => {
    clearTimeout(mutationTimer);
    mutationTimer = setTimeout(applyFilters, 120);
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true
  });

  window.addEventListener("popstate", () => {
    setTimeout(applyFilters, 250);
  });

  loadSettings().catch(() => {});
})();
