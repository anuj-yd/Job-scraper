# ⚖️ Architectural Decisions & Trade-offs

---

## 1️⃣ Why this strategy, and what was rejected?

I explicitly chose an **interface-based, pluggable source architecture** (`IJobSource` alongside concrete adapters like `RemoteOkSource` and `ArbeitnowSource`) rather than writing a single, hardcoded scraper function directly for RemoteOK.

**The Rejected Alternative:**
The obvious alternative was a quick script that calls the API, parses the JSON, and pushes it to the DB. While that would have been faster, it's a fragile design. In the real world, job platforms block bots or change their API structures frequently. If that happened with a hardcoded script, I would have had to rewrite the entire codebase. By using the interface pattern, adding Arbeitnow as a backup source was as simple as creating a single new file. None of the existing orchestration logic in `ScraperService` had to be touched — I verified this directly by swapping the active source in `app.js` and confirming the rest of the pipeline (retry, validation, persistence) didn't need a single change.

---

## 2️⃣ Trade-offs made due to time constraints

A major trade-off I made was **hardcoding the cron scheduler interval (30 minutes)** and the **retry logic (3 attempts, 1000ms base delay)**.

I intentionally skipped implementing a dynamic/adaptive scheduling system (which would adjust intervals based on source response times or rate-limit headers) because of the limited timeframe, and because the demo sources are highly permissive public APIs.

> **If I had a full week to build this:** I would extract these hardcoded values into environment variables, implement a smarter adaptive jitter system, and integrate residential proxy rotation for actual resilience against IP bans.

---

## 3️⃣ AI Usage & Verification

I used AI as a pair-programmer to generate boilerplate — the Mongoose schema structure, basic Express route skeletons, and the exponential-backoff retry pattern. I didn't take any of it at face value; here's what I specifically verified or changed:

- 🔍 **API Field Mapping:** I didn't trust the AI's assumption of the source API fields blindly. I opened the RemoteOK and Arbeitnow endpoints directly in the browser to confirm the real field names (e.g. `position` vs `title`, `company_name` vs `company`) before wiring up the adapters.
- ⏱️ **Timestamp Debugging:** The AI assumed Arbeitnow's `created_at` field was a standard date string. Manual testing showed it was actually a Unix timestamp in seconds, which meant fixing the code to multiply by 1000 (`new Date(job.created_at * 1000)`) for it to parse correctly in JavaScript.
- 🧪 **Resilience Verification:** I didn't just trust that the retry/backoff and empty-response handling would work as described — I deliberately broke things to check. I pointed `RemoteOkSource` at an invalid URL and confirmed the retry cycle actually ran with increasing delays (1s → 2s → 4s) before failing gracefully, and that the server and scheduler stayed alive afterward instead of crashing.