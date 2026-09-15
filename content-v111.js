(() => {
  if (window.__xKeywordCleaner111Loaded) return;
  window.__xKeywordCleaner111Loaded = true;

  const DEFAULTS = {
    enabled: true,
    blockedKeywords: [],
    blockedAccounts: [],
    blockedHashtags: [],
    hidePromoted: true,
    hideReplies: false,
    hideQuotePosts: false,
    hideReposts: false,
    showPlaceholder: true,
    caseSensitive: false
  };

  const REPOST_WORDS = [
    "reposted", "repost", "retweeted", "retweet",
    "yeniden gönderdi", "yeniden paylaştı", "a reposté", "hat repostet"
  ];

  let settings = { ...DEFAULTS };
  let mutationTimer = null;

  function normalize(value) {
    const text = String(value || "").normalize("NFKC").replace(/\s+/g, " ").trim();
    return settings.caseSensitive ? text : text.toLocaleLowerCase();
  }

  function list(value) {
    return Array.isArray(value) ? value.map(normalize).filter(Boolean) : [];
  }

  function visibleArticles() {
    return [...document.querySelectorAll('article[data-testid="tweet"]')].filter(article => article.isConnected);
  }

  function articleKey(article) {
    const href = [...article.querySelectorAll('a[href*="/status/"]')]
      .map(link => link.getAttribute("href") || "")
      .find(value => /\/status\/\d+/.test(value));
    return href?.match(/\/status\/(\d+)/)?.[1] || "";
  }

  function primaryTweetText(article) {
    const node = article.querySelector('[data-testid="tweetText"]');
    return String(node?.innerText || node?.textContent || "").trim();
  }

  function primaryAccountCandidates(article) {
    const set = new Set();
    const userName = article.querySelector('[data-testid="User-Name"]');
    if (userName) {
      for (const link of userName.querySelectorAll('a[href^="/"]')) {
        const href = link.getAttribute("href") || "";
        const match = href.match(/^\/([A-Za-z0-9_]{1,15})(?:\/|$)/);
        if (match) { set.add(match[1]); set.add(`@${match[1]}`); }
      }
      for (const part of String(userName.innerText || "").split("\n")) {
        const cleaned = part.trim(); if (cleaned) set.add(cleaned);
      }
    }
    return [...set].map(normalize);
  }

  function hashtags(text) {
    const matches = String(text || "").match(/#[\p{L}\p{N}_]+/gu) || [];
    return matches.map(normalize);
  }

  function socialContextText(article) {
    const context = article.querySelector('[data-testid="socialContext"]');
    return normalize(context?.innerText || context?.textContent || "");
  }

  function isRepost(article) {
    const text = socialContextText(article);
    return !!text && REPOST_WORDS.some(word => text.includes(normalize(word)));
  }

  function isPromoted(article) {
    const context = socialContextText(article);
    const words = ["promoted", "sponsored", "gesponsert", "sponsorisé", "promocionado", "reklam"];
    if (words.some(word => context.includes(normalize(word)))) return true;
    return Boolean(article.querySelector('[data-testid="placementTracking"]'));
  }

  function isReply(article) {
    const text = normalize(article.innerText || article.textContent || "");
    return ["replying to", "yanıt olarak", "yanit olarak", "en réponse à", "antwort an", "respondiendo a"]
      .some(word => text.includes(normalize(word)));
  }

  function hasQuotePost(article) {
    const statusLinks = [...article.querySelectorAll('a[href*="/status/"]')]
      .map(link => link.getAttribute("href") || "")
      .filter(href => /\/status\/\d+/.test(href));
    if (new Set(statusLinks).size >= 2) return true;
    return Boolean(article.querySelector('[data-testid="card.wrapper"]'));
  }

  function reasonFor(article) {
    if (!settings.enabled) return null;
    if (settings.hidePromoted && isPromoted(article)) return "Promoted post";
    if (settings.hideReposts && isRepost(article)) return "Repost";
    if (settings.hideReplies && isReply(article)) return "Reply";
    if (settings.hideQuotePosts && hasQuotePost(article)) return "Quote post";

    const text = primaryTweetText(article);
    const normalizedText = normalize(text);
    const keywords = list(settings.blockedKeywords);
    if (keywords.some(keyword => normalizedText.includes(keyword))) return "Blocked keyword";

    const accounts = list(settings.blockedAccounts);
    const candidates = primaryAccountCandidates(article);
    if (accounts.some(account => candidates.some(candidate =>
      candidate === account || candidate === account.replace(/^@/, "") || `@${candidate}` === account
    ))) return "Blocked account";

    const blockedTags = list(settings.blockedHashtags).map(tag => tag.startsWith("#") ? tag : `#${tag}`);
    const foundTags = hashtags(text);
    if (blockedTags.some(tag => foundTags.includes(tag))) return "Blocked hashtag";
    return null;
  }

  function removePlaceholder(article) {
    article.querySelector(":scope > .xkc-placeholder")?.remove();
  }

  function clearFilter(article, keepReveal = false) {
    article.classList.remove("xkc-hidden-post");
    delete article.dataset.xkcFiltered;
    removePlaceholder(article);
    if (!keepReveal) delete article.dataset.xkcRevealed;
  }

  function ensureArticleIdentity(article) {
    const key = articleKey(article);
    const previous = article.dataset.xkcArticleKey || "";
    if (key && previous && key !== previous) clearFilter(article);
    if (key) article.dataset.xkcArticleKey = key;
  }

  function addPlaceholder(article, reason) {
    if (article.querySelector(":scope > .xkc-placeholder")) return;
    const placeholder = document.createElement("button");
    placeholder.type = "button";
    placeholder.className = "xkc-placeholder";
    placeholder.textContent = `Post hidden — ${reason}. Click to show.`;
    placeholder.addEventListener("click", event => {
      event.preventDefault(); event.stopPropagation();
      article.dataset.xkcRevealed = "1";
      clearFilter(article, true);
      updateCounter();
    });
    article.prepend(placeholder);
  }

  function filterArticle(article) {
    ensureArticleIdentity(article);
    const reason = reasonFor(article);
    if (!reason) { clearFilter(article); return false; }
    if (article.dataset.xkcRevealed === "1") { clearFilter(article, true); return false; }
    if (article.dataset.xkcFiltered === reason && article.classList.contains("xkc-hidden-post")) {
      if (settings.showPlaceholder && !article.querySelector(":scope > .xkc-placeholder")) addPlaceholder(article, reason);
      else if (!settings.showPlaceholder) removePlaceholder(article);
      return true;
    }
    clearFilter(article);
    article.dataset.xkcFiltered = reason;
    article.classList.add("xkc-hidden-post");
    if (settings.showPlaceholder) addPlaceholder(article, reason);
    return true;
  }

  function updateCounter() {
    const count = visibleArticles().filter(article => article.classList.contains("xkc-hidden-post")).length;
    let badge = document.getElementById("xkc-counter");
    if (!badge) { badge = document.createElement("div"); badge.id = "xkc-counter"; document.documentElement.appendChild(badge); }
    badge.textContent = settings.enabled ? `X Cleaner: ${count} hidden` : "X Cleaner: Off";
  }

  function applyFilters() {
    for (const article of visibleArticles()) filterArticle(article);
    updateCounter();
  }

  async function loadSettings() {
    const stored = await chrome.storage.sync.get(DEFAULTS);
    settings = { ...DEFAULTS, ...stored };
    applyFilters();
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    for (const [key, change] of Object.entries(changes)) settings[key] = change.newValue;
    for (const article of visibleArticles()) delete article.dataset.xkcRevealed;
    applyFilters();
  });

  new MutationObserver(mutations => {
    const onlyOwnPlaceholderChanges = mutations.every(mutation =>
      [...mutation.addedNodes, ...mutation.removedNodes].every(node =>
        node.nodeType !== Node.ELEMENT_NODE || node.classList?.contains("xkc-placeholder") || node.id === "xkc-counter"
      )
    );
    if (onlyOwnPlaceholderChanges) return;
    clearTimeout(mutationTimer);
    mutationTimer = setTimeout(applyFilters, 160);
  }).observe(document.documentElement, { subtree: true, childList: true });

  const originalPushState = history.pushState;
  history.pushState = function(...args) { const result = originalPushState.apply(this, args); setTimeout(applyFilters, 120); return result; };
  const originalReplaceState = history.replaceState;
  history.replaceState = function(...args) { const result = originalReplaceState.apply(this, args); setTimeout(applyFilters, 120); return result; };
  window.addEventListener("popstate", () => setTimeout(applyFilters, 120));

  loadSettings().catch(() => {});
})();
