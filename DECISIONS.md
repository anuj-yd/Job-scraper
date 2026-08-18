# ⚖️ Architectural Decisions & Trade-offs

---

## 1️⃣ Why this strategy, and what was rejected?

I explicitly chose an **interface-based, pluggable source architecture** (`IJobSource` alongside concrete adapters like `RemoteOkSource` and `ArbeitnowSource`) rather than writing a single, hardcoded scraper function directly for RemoteOK. 

**The Rejected Alternative:**  
The obvious alternative was a quick script that calls the API, parses the JSON, and pushes it to the DB. While that would have been faster, it's a fragile design. In the real world, job platforms block bots or change their API structures frequently. If that happened with a hardcoded script, I would have had to rewrite the entire codebase. By using the Interface pattern, adding `Arbeitnow` as a backup source was as simple as creating a single new file (`ArbeitnowSource.source.js`). None of the existing orchestration logic in `ScraperService` had to be touched.

---

## 2️⃣ Trade-offs made due to time constraints

A major trade-off I made was **hardcoding the cron scheduler interval (30 minutes)** and the **retry logic (3 attempts, 1000ms base delay)**. 

I intentionally skipped implementing a dynamic/adaptive scheduling system (which would adjust intervals based on source response times or rate-limit headers) because of the limited timeframe, and because the demo sources are highly permissible public APIs.

> **If I had a full week to build this:** I would extract these hardcoded values into environment variables, implement a smarter adaptive jitter system, and integrate residential proxy rotation for actual resilience against IP bans. 

---

## 3️⃣ AI Usage & Verification

I utilized AI as a pair-programmer to generate boilerplate code (like the Mongoose schema structure, basic Express route skeletons, and the math for the exponential backoff pattern). 

However, I strictly verified and manually adapted the logic to reality:
- 🔍 **API Field Mapping:** I did not blindly trust the AI's assumption of the source API fields. I directly inspected the RemoteOK and Arbeitnow JSON payloads in my browser to confirm the actual field names (e.g., mapping `position` vs `title`, and `company_name` vs `company`).
- ⏱️ **Timestamp Debugging:** The AI assumed Arbeitnow's `created_at` field was a standard date string. Through manual testing, I realized it was actually a Unix timestamp in seconds, which required me to manually update the code to multiply by 1000 (`new Date(job.created_at * 1000)`) for JavaScript compatibility.
- 🐛 **Debugging Import Issues:** When the AI incorrectly imported the Zod `validateJob` object as a function (causing a runtime crash during a manual test), I manually traced the error back to the export structure and fixed the destructuring logic in the `ScraperService`.
