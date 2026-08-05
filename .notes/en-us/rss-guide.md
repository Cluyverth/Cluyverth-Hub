---
title: How to use the site RSS
date: 2026-08-05
lang: en
translation: rss-guide
author: Cluyverth Pereira
status: public
category: Guides
notebook: Guides
tags: [rss, guide]
description: Subscribe to the vault with any RSS reader, no account needed.
---

The site publishes an RSS feed of every public note, so you can follow the vault from any RSS reader without an account.

## The feed URL

```
https://cluyverth.com/rss.xml
```

There is also an RSS button in the footer of every page.

## How to subscribe

1. Copy the feed URL.
2. Open your RSS reader.
3. Add the URL as a new feed.
4. New public notes appear automatically.

## Apps to read feeds

Any RSS reader works. A few good options:

- **NetNewsWire** (macOS, iOS): free, fast, no account
- **Feedly** (web, mobile): simple and widely used
- **Reeder** (Apple platforms): polished reader
- **Readwise Reader** (web, mobile): reading queue with highlighting
- **Miniflux** (self-hosted): minimal and fast
- **News** (Android): built into many Android devices

## What appears in the feed

Only notes with `status: public`. Drafts and private notes are never published, not here, not on the site. The feed is generated at build time, so it updates whenever the site deploys.

See [[cluyverth-hub]] for how the site works, or [[how-to-write-notes]] to learn what makes a note appear.
