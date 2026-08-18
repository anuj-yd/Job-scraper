# 🏗️ Architecture & Ingestion Strategy

This document details the core architectural philosophies behind the scraping engine, focusing on resilience, anti-bot evasion, and safe data ingestion.

---

## 🕵️‍♂️ Detection Surface

Real job platforms (like LinkedIn or Indeed) employ sophisticated techniques to detect and block automated bots:

1. **Headless Browser Fingerprinting:** Checking properties like `navigator.webdriver === true`, missing common browser plugins, or detecting WebGL rendering discrepancies.
2. **Request Timing:** Bot requests often follow highly regular, predictable intervals. Genuine human behavior involves random pauses and variable pacing.
3. **Header Analysis:** Bots often miss necessary headers (like `Accept-Language`) or use generic user-agents (e.g., `axios/1.0`), instantly flagging them as non-browsers.
4. **Behavioral Patterns:** Instant clicks right after page loads, zero mouse movement, or failing to interact with cookie consent banners.

### Our Approach
In this design, we implemented **basic header spoofing**. In `RemoteOkSource.source.js`, a custom `User-Agent` header is explicitly set to avoid default HTTP client detection. 

We intentionally avoided implementing advanced pacing, residential proxy rotation, or full browser automation (Puppeteer/Playwright) because our target demo sources are public APIs that do not enforce aggressive anti-bot measures. Implementing those features would be over-engineering for the current scope, though they represent the exact next steps for hardened targets.

---

## 📥 Ingestion Strategy

Our current implementation relies on a "polite" ingestion approach tailored for open APIs:

- ⏳ **Polite Retry Pattern:** Using the `retryWithBackoff` utility, the scraper implements **exponential backoff**. If a source returns a rate-limit error, the scraper doesn't aggressively hammer the endpoint. It waits, doubling the delay each time (e.g., 1s ➔ 2s ➔ 4s).
- 🕒 **Scheduled Pacing:** Ingestion is orchestrated by a background cron scheduler running once every 30 minutes. This avoids continuous 24/7 polling and respects the target platform's bandwidth.

### Future Hardening
If targeting a heavily guarded platform, this strategy would evolve to include:
- **IP/Proxy Rotation:** Utilizing residential proxy networks.
- **Session Management:** Rotating session cookies per identity to simulate returning users.
- **Randomized Jitter:** Introducing random delays between requests instead of fixed intervals.

💡 **Strength:** The biggest strength of this architecture is the **Fallback Plan**. By building everything around the `IJobSource` interface, if our primary source gets blocked, swapping to a backup (like `ArbeitnowSource`) requires absolutely **zero changes** to the `ScraperService`.

---

## 🛡️ Resilience

The core philosophy of this pipeline is **Independent Failure Isolation**. One bad job, one empty response, or one failed database save doesn't take down the rest of the application.

- ♻️ **Network Resilience:** Network failures trigger up to 3 retry attempts with a doubling delay, absorbing transient connectivity issues safely.
- 🔍 **Schema Validation:** Built with `Zod`. If a platform abruptly changes its API response format, invalid records are silently skipped (returning `null`) rather than crashing the data pipeline.
- 📭 **Empty Response Handling:** If a source returns nothing, `ScraperService` logs a warning and gracefully returns `{ success: false, count: 0 }`.
- 🧱 **Partial Failure Isolation:** Inside the repository layer, if a single job fails to insert (due to DB constraints), the rest of the batch is completely unaffected.
- ⏱️ **Scheduler Resilience:** The cron job wraps the entire execution in a high-level `try/catch`. If an unhandled exception bubbles up, the scraper run fails gracefully, but the Node.js process stays alive to try again 30 minutes later.

---

## ⚖️ Ethical and Technical Boundaries

We purposefully avoided scraping heavily protected platforms like LinkedIn for this demo, selecting public APIs that are scraping-friendly to respect Terms of Service.

**Our strict operational boundaries:**
1. We do not bypass CAPTCHAs.
2. We respect `robots.txt`.
3. We strictly follow explicitly stated rate limits.

In a production scenario, the first choice is always to negotiate official partner APIs or license data legally. Scraping is a last resort. If required, we enforce highly conservative rate limits to ensure we do not degrade the source's performance.
