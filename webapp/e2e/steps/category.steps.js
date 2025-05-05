const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const { expect } = require('expect-puppeteer');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions;

const feature = loadFeature('./features/category.feature');

let page;
let browser;

defineFeature(feature, test => {

    beforeAll(async () => {
        browser = await puppeteer.launch({
            headless: true, // Use headless mode for CI
            args: ['--no-sandbox', '--disable-setuid-sandbox'], // For stability in CI
            defaultViewport: { width: 1280, height: 720 }, // Consistent viewport size
            slowMo: 40 // Keep some slowdown for stability
        });
        page = await browser.newPage();
        setDefaultOptions({ timeout: 120000 });

        // Login to access the game (pre-condition for all tests)
        await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
        await page.type('input[name="username"]', 'test-user');
        await page.type('input[name="password"]', 'test-password');
        await page.click('[data-testid="login"]');
        await page.waitForNavigation();
    });

    afterAll(async () => {
        await browser.close();
    });

    test('Change game category to animals', ({ given, when, then }) => {
        given('I am in the PicturesGame setup page', async () => {
            await page.goto('http://localhost:3000/pictureGame', { waitUntil: 'networkidle0' });
            await page.waitForSelector('[data-testid="categories-label"]');
        });

        when('I select the "animals" category and start the game', async () => {
            // Click the dropdown to open it
            await page.click('div.MuiSelect-select');
            // Find and click on the "Animales" option
            await page.waitForSelector('li[data-value="animals"]');
            await page.click('li[data-value="animals"]');
            // Click the start button
            await page.click('[data-testid="start-button"]');
        });

        then('The question text changes to show animal-related question', async () => {
            // Wait for the game to load
            await page.waitForFunction(
                'document.querySelector("body").innerText.includes("¿Que animal es este?")',
                { timeout: 5000 }
            );
        });
    });

    test('Change game category to logos', ({ given, when, then }) => {
        given('I am in the PicturesGame setup page', async () => {
            await page.goto('http://localhost:3000/pictureGame', { waitUntil: 'networkidle0' });
            await page.waitForSelector('[data-testid="categories-label"]');
        });

        when('I select the "logos" category and start the game', async () => {
            // Click the dropdown to open it
            await page.click('div.MuiSelect-select');
            // Find and click on the "Logos" option
            await page.waitForSelector('li[data-value="logos"]');
            await page.click('li[data-value="logos"]');
            // Click the start button
            await page.click('[data-testid="start-button"]');
        });

        then('The question text changes to show logo-related question', async () => {
            // Wait for the game to load
            await page.waitForFunction(
                'document.querySelector("body").innerText.includes("¿Que logo es este?")',
                { timeout: 5000 }
            );
        });
    });
});
