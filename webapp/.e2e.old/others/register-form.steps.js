const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const { setDefaultOptions } = require('expect-puppeteer');
const feature = loadFeature('./features/register-form.feature');

let page;
let browser;

defineFeature(feature, test => {
    beforeAll(async () => {
        browser = process.env.GITHUB_ACTIONS
            ? await puppeteer.launch()
            : await puppeteer.launch({ headless: false, slowMo: 50 });

        page = await browser.newPage();
        setDefaultOptions({ timeout: 10000 });

        await page.goto("http://localhost:3000", {
            waitUntil: "networkidle0",
        });
    });

    test('The user is not registered in the site', ({ given, when, then }) => {
        let username;
        let password;
        let name;
        let surname;

        given('An unregistered user', async () => {
            username = "usuarioNuevo_" + Date.now(); // para evitar duplicados
            password = "12345678mM.";
            name = "Jordi";
            surname = "Hurtado";

            await expect(page).toClick('a', { text: "¿No tienes una cuenta? Regístrate aquí." });
        });

        when('I fill the data in the form and press submit', async () => {
            await expect(page).toFill('[data-testid="username"]', username);
            await expect(page).toFill('[data-testid="password"]', password);
            await expect(page).toFill('[data-testid="name"]', name);
            await expect(page).toFill('[data-testid="surname"]', surname);
            await expect(page).toClick('[data-testid="register-button"]');

            await page.waitForNavigation({ waitUntil: "networkidle0" });
        });

        then('Home page should be shown in the screen', async () => {
            await expect(page).toMatch("MODOS DE JUEGO"); // Este texto aparece en la homepage
            await expect(page).toMatchElement("button", { text: "JUGAR" }); // O el botón
        });
    });

    afterAll(async () => {
        await browser.close();
    });
});
