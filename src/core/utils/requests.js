const { default: axios } = require("axios");

async function getWithRetry(url, options = {}, retries = 3) {
    let lastError;
    for (let i = 0; i < retries; i++) {
        try {
            return await axios.get(url, options);
        } catch (err) {
            lastError = err;

            console.log(`Request ${url} failed, attempt ${i + 1}/${retries}: ${err.code}`);

            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }
    throw lastError;
}

module.exports = {
    getWithRetry,
};
