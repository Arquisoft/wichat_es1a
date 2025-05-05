const puppeteer = require('puppeteer');
const { defineFeature, loadFeature }=require('jest-cucumber');
const { expect } = require('expect-puppeteer');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const feature = loadFeature('./features/register.feature');

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

        //Way of setting up the timeout
        setDefaultOptions({ timeout: 120000 })
    });

    test('Register with correct input', ({given,when,then}) => {

        given('A register prompt', async () => {
            await page
                .goto("http://localhost:3000/register", {
                    waitUntil: "networkidle0",
                })
                .catch(() => {});

        });

        when("I correctly set up the input", async () => {
            await page.type('input[name="username"]', 'new-user')
            await page.type('input[name="password"]', 'New-password129@')
            await page.type('input[name="name"]', 'NEW USER')
            await page.type('input[name="surname"]', 'SURNAME')
            await page.click('[data-testid="register-button"]');
            await page.waitForNavigation();
        });

        then("I'm registered and logged in", async () => {
            expect(page.url()).toBe("http://localhost:3000/homepage")
        });
    })

    test('Register with weak password', ({given,when,then}) => {

        given('A register prompt', async () => {
            await page
                .goto("http://localhost:3000/register", {
                    waitUntil: "networkidle0",
                })
                .catch(() => {});

        });

        when("I try to register with a weak password", async () => {
            await page.type('input[name="username"]', 'new-user2')
            await page.type('input[name="password"]', 'weak_password')
            await page.type('input[name="name"]', 'NEW USER')
            await page.type('input[name="surname"]', 'SURNAME')
            await page.click('[data-testid="register-button"]');
        });

        then("I get a message warning about it", async () => {
            const [div] = await page.$x(
                `//div[contains(text(), "Error: The password must contain at least one numeric character")]`
            );
            expect(div).toBeDefined();
        });
    })

    test('Register with repeated username', ({given,when,then}) => {

        given('A register prompt', async () => {
            await page
                .goto("http://localhost:3000/register", {
                    waitUntil: "networkidle0",
                })
                .catch(() => {});

        });

        when("I try to register with an already existing username", async () => {
            await page.type('input[name="username"]', 'new-user')
            await page.type('input[name="password"]', 'pass123Ak@')
            await page.type('input[name="name"]', 'NEW USER')
            await page.type('input[name="surname"]', 'SURNAME')
            await page.click('[data-testid="register-button"]');
        });

        then("I get a message warning about it", async () => {
            const [div] = await page.$x(
                `//div[contains(text(), "Error: Invalid username")]`
            );
            expect(div).toBeDefined();
        });
    })

    afterAll(async ()=>{
        browser.close()
    })
});
