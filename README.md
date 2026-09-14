# X Keyword Cleaner

A privacy-first Chrome extension that locally hides unwanted posts on X based on keywords, hashtags, accounts and feed rules.

## v1.1.0

- Added optional **repost / retweet filtering** using X social-context labels.
- Existing keyword, hashtag, account, promoted-post, reply and quote-post filters remain available.
- The extension still performs no follow, unfollow, like, repost, block, report, delete or other account automation.

## Features

- Block posts containing custom keywords or phrases.
- Block posts from selected account handles.
- Block selected hashtags.
- Hide obvious promoted/sponsored posts.
- Optionally hide replies.
- Optionally hide quote posts.
- Optionally hide reposts/retweets.
- Optional case-sensitive matching.
- Optional placeholder for each hidden post, allowing one-click reveal.
- Small on-page counter showing how many posts are hidden.
- Clean Feed preset.
- No X API.
- No external server.
- No account credentials required.

## Privacy

All rules are stored in Chrome extension storage. The extension does not send post text, usernames, browsing history, cookies, authentication tokens or passwords to any external service.

## How it works

The content script watches X's dynamically loaded feed and locally evaluates post text, visible author/account links, hashtags, promoted indicators, reply context, quoted-post structure and repost context.

Matching posts are hidden only in your browser.

## Install

1. Download or clone this repository.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select this extension folder.
6. Open X.
7. Add keywords/accounts/hashtags from the popup.

## Policy / account safety

This project is a local content-display filter. It intentionally does not automate follows, unfollows, likes, reposts, replies, DMs, blocking or reporting.

## Disclaimer

This project is not affiliated with or endorsed by X Corp.
