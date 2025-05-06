const puppeteer = require('puppeteer');
const { defineFeature, loadFeature }=require('jest-cucumber');
const { expect } = require('expect-puppeteer');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const feature = loadFeature('./features/login.feature');

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

        //Way of setting up the timeout
        setDefaultOptions({ timeout: 120000 })
    });

    test('Login with correct credentials', ({given,when,then}) => {
        given('A login prompt', async () => {
            await page
                .goto("http://localhost:3000/login", {
                    waitUntil: "networkidle0",
                })
                .catch(() => {});

        });

        when("I correctly enter my credentials, and press login", async () => {
            await page.type('input[name="username"]', 'test-user')
            await page.type('input[name="password"]', 'test-password')
            await page.click('[data-testid="login"]');
            await page.waitForNavigation();
        });

        then("I'm logged in and redirected to my home", async () => {
            expect(page.url()).toBe("http://localhost:3000/homepage")
        });
    })

    test('Login with incorrect credentials', ({given,when,then}) => {
        given('A login prompt', async () => {
            await page
                .goto("http://localhost:3000/login", {
                    waitUntil: "networkidle0",
                })
                .catch(() => {});

        });

        when("I enter wrong credentials, and press login", async () => {
            await page.type('input[name="username"]', 'wrong-test-user')
            await page.type('input[name="password"]', 'wrong-test-password')
            await page.click('[data-testid="login"]');
        });

        then("A message informs about wrong credentials", async () => {
            const username = "wrong-test-user";
            const [div] = await page.$x(
                `//div[contains(., "Error: Couldn't find user") and contains(., "${username}")]`
            );
            expect(div).toBeDefined();
        });
    })

    afterAll(async ()=>{
        browser.close()
    })
});
