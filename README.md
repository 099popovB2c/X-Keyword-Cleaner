# X Keyword Cleaner

A privacy-first Chrome extension that locally hides unwanted posts on X based on keywords, hashtags, accounts and simple feed rules.

It does **not** unfollow, follow, like, repost, block, report, delete or otherwise automate account actions.

## Features

- Block posts containing custom keywords or phrases.
- Block posts from selected account handles.
- Block selected hashtags.
- Hide obvious promoted/sponsored posts.
- Optionally hide replies.
- Optionally hide quote posts.
- Optional case-sensitive matching.
- Optional placeholder for each hidden post, allowing one-click reveal.
- Small on-page counter showing how many posts are hidden.
- Clean Feed preset.
- No X API.
- No external server.
- No account credentials required.

## Privacy

All rules are stored in Chrome extension sync storage.

The extension does not send:

- post text;
- usernames;
- browsing history;
- cookies;
- authentication tokens;
- passwords

to any external service.

## How it works

The content script watches X's dynamically loaded feed with a `MutationObserver`.

For each visible tweet article, it can evaluate:

- post text;
- visible author/account links;
- hashtags;
- promoted-post indicators;
- reply context;
- quoted-post structure.

Matching posts are hidden only in your local browser.

## Install

1. Download or clone this repository.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select this extension folder.
6. Open X.
7. Add keywords/accounts/hashtags from the popup.

## Limitations

X frequently changes its DOM structure and localized interface text, so some selectors or promoted/reply detection may need maintenance in later versions.

Account matching uses visible handles/links from the page. It does not call X APIs.

## Policy / account safety

This project is a local content-display filter. It intentionally does not automate follows, unfollows, likes, reposts, replies, DMs, blocking or reporting.

## Disclaimer

This project is not affiliated with or endorsed by X Corp.
