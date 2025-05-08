const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const { expect } = require('expect-puppeteer');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions;

const feature = loadFeature('./features/category.feature');

let page;
let browser;

defineFeature(feature, test => {

    beforeAll(async () => {        browser = await puppeteer.launch({
            headless: "new", // Use new headless mode to avoid deprecation warning
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
    });test('Change game category to art', ({ given, when, then }) => {
        given('I am in the PicturesGame setup page', async () => {
            await page.goto('http://localhost:3000/pictureGame', { waitUntil: 'networkidle0' });
            await page.waitForSelector('[data-testid="categories-label"]');
            expect(page.url()).toContain('/pictureGame');
        });        when('I select the "art" category and start the game', async () => {
            // Get all dropdown elements
            const selectElements = await page.$$('div.MuiSelect-select');
            expect(selectElements.length).toBeGreaterThanOrEqual(1);
            
            // Click the first dropdown (category)
            await selectElements[0].click();
            
            // Find and click on the "Art" option
            await page.waitForSelector('li[data-value="art"]');
            await page.click('li[data-value="art"]');
            
            // Click the start button
            await page.click('[data-testid="start-button"]');
        });

        then('The question text changes to show art-related question', async () => {
            // Wait for the game to load
            await page.waitForFunction(
                'document.querySelector("body").innerText.includes("¿Qué obra de arte es esta?")',
                { timeout: 5000 }
            );
            
            // Verificar que hemos cargado correctamente un juego de obras de arte
            const questionText = await page.evaluate(() => {
                return document.body.innerText;
            });
            expect(questionText).toContain('¿Qué obra de arte es esta?');
        });
    });
});
