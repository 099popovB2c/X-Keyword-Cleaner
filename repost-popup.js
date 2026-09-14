(() => {
  const input = document.getElementById("hideReposts");
  if (!input) return;
  chrome.storage.sync.get({ hideReposts: false }).then(settings => {
    input.checked = Boolean(settings.hideReposts);
  }).catch(() => {});
  input.addEventListener("change", () => {
    chrome.storage.sync.set({ hideReposts: input.checked }).catch(() => {});
  });
})();
