const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const { setDefaultOptions } = require('expect-puppeteer');
const feature = loadFeature('./features/login-form.feature');

let page;
let browser;

const registerUser = async (username, password, name, surname) => {
    await expect(page).toClick('a', { text: '¿No tienes una cuenta? Regístrate aquí.' });

    await expect(page).toFill('[data-testid="username"]', username);
    await expect(page).toFill('[data-testid="password"]', password);
    await expect(page).toFill('[data-testid="name"]', name);
    await expect(page).toFill('[data-testid="surname"]', surname);
    await expect(page).toClick('[data-testid="register-button"]');

    // Esperar navegación automática a /homepage (puedes ajustar si usas otra ruta o animación)
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
};

defineFeature(feature, test => {
    beforeAll(async () => {
        browser = process.env.GITHUB_ACTIONS
            ? await puppeteer.launch()
            : await puppeteer.launch({ headless: false, slowMo: 50 });

        page = await browser.newPage();
        setDefaultOptions({ timeout: 10000 });

        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    });

    test('The user is already registered in the site', ({ given, when, then }) => {
        let username = "usuarioNuevo2";
        let password = "12345678mM.";

        given('A registered user', async () => {
            const name = "Jordi";
            const surname = "Hurtado";

            await registerUser(username, password, name, surname);

            // Logout si es necesario
            await page.goto('http://localhost:3000/login');
        });

        when('I fill the data in the form and press login', async () => {
            await expect(page).toFill('input[name="username"]', username);
            await expect(page).toFill('input[name="password"]', password);
            await expect(page).toClick('button', { text: 'Iniciar sesión' });
            await page.waitForNavigation({ waitUntil: 'networkidle0' });
        });

        then('Home page should be shown in the screen', async () => {
            await expect(page).toMatch('MODOS DE JUEGO'); // o el botón de JUGAR, etc.
            await expect(page).toMatchElement('button', { text: 'JUGAR' });
        });
    });

    afterAll(async () => {
        await browser.close();
    });
});
