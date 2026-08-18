const RemoteOkSource = require("./src/sources/RemoteOkSource.source");

(async () => {
  const source = new RemoteOkSource();
  const jobs = await source.fetchListings();
  console.log("Total jobs fetched:", jobs.length);
  console.log("Sample job:", jobs[0]);
})();