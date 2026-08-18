# ⚖️ Architectural Decisions & Trade-offs

This document outlines the core technical choices, the reasoning behind them, and the compromises made during development.

---

## 1️⃣ Why this strategy, and what was rejected?

We explicitly chose an **interface-based, pluggable source architecture** (`IJobSource` alongside concrete adapters like `RemoteOkSource` and `ArbeitnowSource`) rather than a single, hardcoded monolithic scraper script. 

**The Rejected Alternative:** 
The obvious alternative was writing a simple, procedural script that directly called the API, parsed the JSON, and pushed it straight to MongoDB. While faster to write initially, it represents a fragile design. 

In the real world, job platforms frequently change their DOM layouts, adjust API structures, or outright block scrapers. If that happened with a hardcoded script, the entire ingestion logic would need a rewrite. By utilizing the **Interface pattern and Dependency Injection**, adding a completely new platform (like Arbeitnow) was as simple as creating a single new file. The core orchestration logic (`ScraperService`) didn't have to change at all.

---

## 2️⃣ Trade-offs made due to time constraints

Given the limited time, we opted to use Mongoose's standard `.saveMany()` logic to iterate and insert records, relying on the database's unique constraints to prevent duplicates instead of writing complex synchronization/upsert logic.

**If we had more time:**
- **Bulk Operations:** We would implement true batch `bulkWrite` operations in MongoDB for massive performance gains on huge datasets. 
- **Message Queues:** We would introduce a robust message broker (like RabbitMQ or Redis BullMQ) between the fetching layer and the database layer. This would allow the system to scale horizontally, fetching from dozens of sources concurrently while safely queuing the data for insertion without overwhelming database connection pools.

---

## 3️⃣ AI Usage & Verification

We utilized AI as an advanced pair-programmer to accelerate boilerplate generation (like basic Express setup, Winston logger configuration, and Mongoose schema definitions) and to rapidly brainstorm the exponential backoff mathematics in the retry utility.

**Ownership and Verification:**
Despite the AI assistance, full ownership of the architectural design was retained. 
- The Dependency Injection pattern for the `ScraperService` was strictly enforced.
- The `Zod` validation boundaries were explicitly mandated. 
- When the AI generated initial implementations, the code was manually verified. 
- Complex bugs—such as fixing a critical import issue where the Zod validator was imported as an object instead of a function—were actively debugged and resolved by hand to ensure the final pipeline was resilient and production-ready.
