# X Keyword Cleaner

A privacy-first Chrome extension that locally hides unwanted posts on X based on keywords, hashtags, accounts and feed rules.

## v1.1.1

- Reworked filtering for X's SPA/virtualized feed so the extension no longer tears down and rebuilds its own placeholder on every mutation.
- Merged repost filtering into the main runtime to avoid competing MutationObservers.
- Ignores the extension's own placeholder/counter mutations, reducing filter loops and UI churn.
- Uses the primary `User-Name` block for account matching instead of every profile link inside a tweet, reducing false matches from quoted posts/cards.
- Uses the primary tweet text for keyword/hashtag rules, reducing accidental matches from embedded quote content.
- Remembers a manually revealed hidden post until its article identity or settings change.
- Adds SPA navigation hooks for pushState/replaceState/popstate.

## Features

- Block posts containing custom keywords or phrases.
- Block posts from selected account handles.
- Block selected hashtags.
- Hide promoted/sponsored posts.
- Optionally hide replies.
- Optionally hide quote posts.
- Optionally hide reposts/retweets.
- Optional case-sensitive matching.
- Optional revealable placeholder for hidden posts.
- Local hidden-post counter.
- Clean Feed preset.
- No X API, backend, password, cookie or token collection.

## Privacy

All rules are stored in Chrome extension storage. Post text, usernames, browsing history, cookies, authentication tokens and passwords are not sent to an external service.

## Install

1. Download or clone this repository.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the extension folder.
6. Open or reload X and configure filters from the popup.

## Notes

X frequently changes its DOM and single-page application behavior. v1.1.1 is designed to avoid self-triggering MutationObserver loops and to keep filtering stable when X recycles tweet elements, but future X markup changes can still require maintenance.

This extension changes only what is displayed in your browser. It does not automate follows, unfollows, likes, reposts, replies, DMs, blocks, reports or deletions.

## Disclaimer

This project is not affiliated with or endorsed by X Corp.
