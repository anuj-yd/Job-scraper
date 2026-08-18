/**
 * Retries a function with exponential backoff.
 * 
 * @param {Function} fn - The async function to execute.
 * @param {number} retries - Number of retries before failing.
 * @param {number} delay - Initial delay in milliseconds.
 * @returns Promise resolving to the function's result.
 */
async function retryWithBackoff(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) {
      throw error;
    }
    console.log(`Retrying in ${delay}ms... (${retries} attempts left)`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

module.exports = retryWithBackoff;
