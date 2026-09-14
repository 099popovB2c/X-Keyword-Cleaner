(() => {
  if (window.__xkcRepostFilterLoaded) return;
  window.__xkcRepostFilterLoaded = true;

  let enabled = false;
  let timer = null;

  const WORDS = [
    "reposted",
    "repost",
    "retweeted",
    "retweet",
    "yeniden gönderdi",
    "yeniden paylaştı",
    "a reposté",
    "hat repostet"
  ];

  function normalize(value) {
    return String(value || "")
      .normalize("NFKC")
      .toLocaleLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function isRepost(article) {
    const context = article.querySelector('[data-testid="socialContext"]');
    const text = normalize(context?.innerText || context?.textContent || "");
    if (!text) return false;
    return WORDS.some(word => text.includes(normalize(word)));
  }

  function apply() {
    for (const article of document.querySelectorAll('article[data-testid="tweet"]')) {
      article.classList.toggle("xkc-repost-hidden", enabled && isRepost(article));
    }
  }

  async function load() {
    const settings = await chrome.storage.sync.get({ hideReposts: false });
    enabled = Boolean(settings.hideReposts);
    apply();
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync" || !changes.hideReposts) return;
    enabled = Boolean(changes.hideReposts.newValue);
    apply();
  });

  new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(apply, 140);
  }).observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener("popstate", () => setTimeout(apply, 200));
  load().catch(() => {});
})();
