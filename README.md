# ApplyGuard — “Did I Already Apply?”

## What annoyed me

While applying to many jobs, I kept losing track of whether I had already applied to a particular opening. A spreadsheet felt too heavy for something I needed in the moment, and bookmarks did not solve it because the same job often appeared with different tracking parameters in its URL. I wanted an answer without leaving the job page: **did I already apply here?**

## What I built

ApplyGuard is a small Chrome extension focused on that single question. On any job page, the popup detects the company and role, lets the user correct them if needed, and saves the application URL and date locally. On a later visit it shows **“Already applied”** with the saved date.

The extension normalizes URLs before comparing them, removing fragments and common tracking parameters such as `utm_*`, `ref`, `source`, `fbclid`, and `gclid` while preserving parameters that may identify the job itself. It also includes a compact, searchable history for reviewing or removing saved entries. All information stays in `chrome.storage.local`; there is no account, backend, analytics, paid API, or LLM call.

I intentionally left out resume matching, recommendations, application analytics, and syncing. They would make the project broader without improving the core interaction I wanted to solve.

## Run it

1. Open `chrome://extensions` in Chrome and enable **Developer mode**.
2. Click **Load unpacked** and select this project folder.
3. Pin ApplyGuard, open a job listing, and click **Mark as applied**.

Run the URL-normalization tests with `npm test`.

## What I would do next

With more time, I would add optional export/import for backups, site-specific extraction rules for major job boards, and browser-level end-to-end tests. I would keep these additions local-first and preserve the one-click workflow rather than turning ApplyGuard into a general job-search platform.
