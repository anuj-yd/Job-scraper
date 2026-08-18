# Architectural Decisions & Trade-offs

## 1. Why this strategy, and what was rejected?
I explicitly chose an interface-based, pluggable source architecture (`IJobSource` alongside concrete adapters like `RemoteOkSource` and `ArbeitnowSource`) rather than a single, hardcoded scraper function. 

The obvious alternative was to write a single script that directly called the RemoteOK API, parsed the JSON, and pushed it straight to MongoDB. While that would have been faster to write initially, it represents a fragile design. In the real world, job platforms frequently change their layouts or block scrapers. If that happened with a hardcoded script, I would have had to rewrite the entire ingestion logic. 

By utilizing the Interface pattern and Dependency Injection, adding a completely new platform (Arbeitnow) was as simple as creating a single new file. The core orchestration logic (`ScraperService`) didn't have to change at all.

## 2. Trade-offs made due to time constraints
Given the limited time, I opted to use Mongoose's standard `.save()` logic inside a loop to handle inserts, relying on the database's unique constraints to prevent duplicates instead of writing complex synchronization logic.

If I had an entire week to build this, I would implement true batch `bulkWrite` operations in MongoDB for massive performance gains on huge datasets. Furthermore, I would add a robust message queue (like RabbitMQ or Redis BullMQ) between the fetching layer and the database layer. This would allow the system to scale horizontally, fetching from dozens of sources concurrently while safely queuing the data for insertion without overwhelming the database connections.

## 3. AI Usage & Verification
I utilized AI as an advanced pair-programmer to accelerate boilerplate generation (like basic Express setup, Winston logger configuration, and Mongoose schema definitions) and to quickly brainstorm the exponential backoff math in the retry utility.

However, I took full ownership of the architectural design. I mandated the Dependency Injection pattern for the `ScraperService` and strictly enforced the `Zod` validation boundaries. When the AI generated the initial implementations, I manually verified the code, ensured the repository logic handled unique constraints properly, and debugged import errors (such as fixing a bug where the Zod validator was imported as an object instead of a function) to ensure the final pipeline was resilient and production-ready.
