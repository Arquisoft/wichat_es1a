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
    });
    
    test('Default category should be flags', ({ given, when, then }) => {
        given('I am in the PicturesGame setup page', async () => {
            await page.goto('http://localhost:3000/pictureGame', { waitUntil: 'networkidle0' });
            await page.waitForSelector('[data-testid="categories-label"]');
            expect(page.url()).toContain('/pictureGame');
        });

        when('I start the game without changing the category', async () => {
            // Click the start button directly without changing the category
            await page.click('[data-testid="start-button"]');
        });

        then('The question text should show flags-related question', async () => {
            // Wait for the game to load
            await page.waitForFunction(
                'document.querySelector("body").innerText.includes("¿De dónde es esta bandera?")',
                { timeout: 5000 }
            );
            
            // Verificar que hemos cargado correctamente un juego de banderas
            const questionText = await page.evaluate(() => {
                return document.body.innerText;
            });
            expect(questionText).toContain('¿De dónde es esta bandera?');
        });
    });

    test('Change game category to monuments', ({ given, when, then }) => {
        given('I am in the PicturesGame setup page', async () => {
            await page.goto('http://localhost:3000/pictureGame', { waitUntil: 'networkidle0' });
            await page.waitForSelector('[data-testid="categories-label"]');
            expect(page.url()).toContain('/pictureGame');
        });

        when('I select the "monuments" category and start the game', async () => {
            // Click the dropdown to open it
            await page.click('div.MuiSelect-select');
            // Find and click on the "Monumentos" option
            await page.waitForSelector('li[data-value="monuments"]');
            await page.click('li[data-value="monuments"]');
            // Click the start button
            await page.click('[data-testid="start-button"]');
        });

        then('The question text changes to show monuments-related question', async () => {
            // Wait for the game to load
            await page.waitForFunction(
                'document.querySelector("body").innerText.includes("¿Qué monumento es este?")',
                { timeout: 5000 }
            );
            
            // Verificar que hemos cargado correctamente un juego de monumentos
            const questionText = await page.evaluate(() => {
                return document.body.innerText;
            });
            expect(questionText).toContain('¿Qué monumento es este?');
        });
    });test('Change game category to logos', ({ given, when, then }) => {
        given('I am in the PicturesGame setup page', async () => {
            await page.goto('http://localhost:3000/pictureGame', { waitUntil: 'networkidle0' });
            await page.waitForSelector('[data-testid="categories-label"]');
            expect(page.url()).toContain('/pictureGame');
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
            
            // Verificar que hemos cargado correctamente un juego de logos
            const questionText = await page.evaluate(() => {
                return document.body.innerText;
            });
            expect(questionText).toContain('¿Que logo es este?');
        });
    });
});
