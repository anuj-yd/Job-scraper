# Design & Ingestion Strategy

## Detection Surface
Real job platforms (like LinkedIn or Indeed) employ sophisticated techniques to detect and block bots:
- **Headless Browser Fingerprinting:** Checking properties like `navigator.webdriver === true`, missing common browser plugins, unusual screen resolutions, or detecting discrepancies in WebGL/Canvas rendering.
- **Request Timing:** Bot requests often follow highly regular, predictable intervals (e.g., exactly every 2 seconds). Genuine human behavior involves random pauses and variable pacing.
- **Header Analysis:** Bots often miss necessary headers (like `Accept-Language` or `Referer`), or use generic user-agents (e.g., `axios/1.0`, `python-requests`), which immediately flags them as non-browsers.
- **Behavioral Patterns:** Instant clicks right after page loads, zero mouse movement, or failing to interact with cookie consent banners.

In my design, I implemented basic header spoofing. In `RemoteOkSource.js`, I specifically added a custom `User-Agent` header to avoid default `axios` detection. I have intentionally not implemented advanced pacing, residential proxy rotation, or browser automation because my target demo sources are public APIs that do not enforce aggressive anti-bot measures. Implementing those features would be over-engineering for the current scope, though they represent the next logical step for hardened targets.

## Ingestion Strategy
My current implementation relies on a polite ingestion approach tailored for open APIs:
- **Polite Retry Pattern:** Using the `retryWithBackoff` utility, the scraper implements exponential backoff. If the source returns an error (e.g., a rate limit response), the scraper doesn't aggressively hit the endpoint again. Instead, it waits, doubling the delay each time.
- **Scheduled Pacing:** The ingestion is orchestrated by a cron scheduler running once every 30 minutes. This avoids continuous 24/7 polling and respects the target platform's bandwidth.

If I were targeting a heavily guarded platform, my ingestion strategy would evolve to include:
- **IP/Proxy Rotation:** Utilizing residential proxies to distribute requests across multiple IPs.
- **Session/Cookie Management:** Retaining and rotating session cookies per identity to simulate returning users.
- **Randomized Jitter:** Introducing random delays between requests instead of fixed intervals.

A major strength of my architecture is the **Fallback Plan**. Because I built everything around the `IJobSource` interface, if my primary source (RemoteOK) were to get blocked, swapping to `ArbeitnowSource` requires absolutely zero changes to the `ScraperService`. The system seamlessly switches data providers.

## Resilience
The core philosophy of this pipeline is that every stage fails independently. One bad job, one empty response, or one failed save doesn't take down the rest of the application.

- **Exponential Backoff (`retry.util.js`):** Network failures trigger up to 3 retry attempts with a doubling delay, absorbing transient connectivity issues.
- **Schema Validation (`jobValidator.util.js`):** Built with Zod, this ensures that if a platform changes its API response format, invalid records are silently skipped (returning `null`) rather than crashing the data pipeline.
- **Empty Response Handling:** If the source returns nothing even after retries, `ScraperService` simply logs a warning and returns `{ success: false, count: 0 }`. It does not crash.
- **Partial Failure Isolation:** Inside `JobRepository.saveMany`, jobs are saved iteratively. If a single job fails to insert (due to DB constraints or missing data), the rest are completely unaffected.
- **Scheduler Resilience:** The cron job wraps the entire execution in a high-level `try/catch`. If an unhandled exception manages to bubble all the way up, the scraper run fails gracefully, but the Node.js process stays alive to try again 30 minutes later.

## Ethical and Technical Boundaries
I purposefully avoided scraping real, heavily protected platforms like LinkedIn or Indeed for this demo. Instead, I selected public APIs (RemoteOK, Arbeitnow) that are scraping-friendly to avoid violating Terms of Service.

My personal line is clear: I will not bypass CAPTCHAs, I will respect `robots.txt`, and I will strictly follow explicitly stated rate limits. 

When building a real production system, my first choice is always to negotiate official partner APIs or license data from legal providers. Scraping is a last resort. If scraping a protected site becomes a business necessity, I would enforce highly conservative rate limits to ensure we do not degrade the source's performance, and I would mandate a review by a legal team regarding the target's ToS before writing any code.
