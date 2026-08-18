class IJobSource {
  async fetchListings() {
    throw new Error("fetchListings() must be implemented by subclass");
  }
}

module.exports = IJobSource;
