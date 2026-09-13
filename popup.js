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

const CLEAN_PRESET = {
  enabled: true,
  blockedKeywords: [
    "giveaway",
    "dm me",
    "guaranteed profit",
    "telegram",
    "whatsapp"
  ],
  blockedAccounts: [],
  blockedHashtags: [],
  hidePromoted: true,
  hideReplies: false,
  hideQuotePosts: false,
  showPlaceholder: true,
  caseSensitive: false
};

const $ = id => document.getElementById(id);

function toLines(value) {
  return Array.isArray(value) ? value.join("\n") : "";
}

function fromLines(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map(v => v.trim())
    .filter(Boolean);
}

async function render() {
  const s = await chrome.storage.sync.get(DEFAULTS);

  $("enabled").checked = Boolean(s.enabled);
  $("blockedKeywords").value = toLines(s.blockedKeywords);
  $("blockedAccounts").value = toLines(s.blockedAccounts);
  $("blockedHashtags").value = toLines(s.blockedHashtags);
  $("hidePromoted").checked = Boolean(s.hidePromoted);
  $("hideReplies").checked = Boolean(s.hideReplies);
  $("hideQuotePosts").checked = Boolean(s.hideQuotePosts);
  $("showPlaceholder").checked = Boolean(s.showPlaceholder);
  $("caseSensitive").checked = Boolean(s.caseSensitive);
}

function flash(text = "Saved.") {
  $("status").textContent = text;
  setTimeout(() => {
    $("status").textContent = "Settings save automatically.";
  }, 1000);
}

let timer = null;

async function save() {
  await chrome.storage.sync.set({
    enabled: $("enabled").checked,
    blockedKeywords: fromLines($("blockedKeywords").value),
    blockedAccounts: fromLines($("blockedAccounts").value),
    blockedHashtags: fromLines($("blockedHashtags").value),
    hidePromoted: $("hidePromoted").checked,
    hideReplies: $("hideReplies").checked,
    hideQuotePosts: $("hideQuotePosts").checked,
    showPlaceholder: $("showPlaceholder").checked,
    caseSensitive: $("caseSensitive").checked
  });

  flash();
}

function queueSave() {
  clearTimeout(timer);
  timer = setTimeout(() => save().catch(() => {}), 250);
}

for (const id of [
  "enabled",
  "hidePromoted",
  "hideReplies",
  "hideQuotePosts",
  "showPlaceholder",
  "caseSensitive"
]) {
  $(id).addEventListener("change", queueSave);
}

for (const id of [
  "blockedKeywords",
  "blockedAccounts",
  "blockedHashtags"
]) {
  $(id).addEventListener("input", queueSave);
}

$("cleanPreset").addEventListener("click", async () => {
  await chrome.storage.sync.set(CLEAN_PRESET);
  await render();
  flash("Clean feed preset applied.");
});

$("reset").addEventListener("click", async () => {
  await chrome.storage.sync.set(DEFAULTS);
  await render();
  flash("Default settings restored.");
});

render().catch(() => {});
