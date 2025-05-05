module.exports = {
    testMatch: ["**/steps/*.js"],
    testTimeout: 120000, // Increase to 2 minutes
    setupFilesAfterEnv: ["expect-puppeteer"]
}