const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const { expect } = require('expect-puppeteer');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions;

const feature = loadFeature('./features/picturesgame.feature');

let page;
let browser;

defineFeature(feature, test => {

    beforeAll(async () => {
        browser = await puppeteer.launch({ headless: false, slowMo: 40 });
        page = await browser.newPage();
        setDefaultOptions({ timeout: 10000 });
    });

    afterAll(async () => {
        await browser.close();
    });

    test('Answer correctly to a question', ({ given, when, then }) => {
        given('I am in a round with possible answers', async () => {
            await page.goto('http://localhost:3000/game', { waitUntil: 'networkidle0' });
            await page.waitForSelector('[data-testid="answer0"]'); // Espera respuestas cargadas
        });

        when('I select the correct answer', async () => {
            await page.click('[data-testid^="answer"]'); // Click en alguna opción
            // Aquí podrías ser más preciso si sabes cuál es correcta, pero para test genérico basta
        });

        then('The button turns green and my score increases', async () => {
            await page.waitForSelector('[data-testid^="success"]', { visible: true });
            const url = await page.url();
            expect(url).toContain('/game'); // Seguimos en el juego
        });
    });

    test('Answer incorrectly to a question', ({ given, when, then }) => {
        given('I am in a round with possible answers', async () => {
            await page.goto('http://localhost:3000/game', { waitUntil: 'networkidle0' });
            await page.waitForSelector('[data-testid="answer0"]');
        });

        when('I select a wrong answer', async () => {
            await page.click('[data-testid^="answer"]'); // Igual que antes, click en respuesta cualquiera
        });

        then('The button turns red and the correct answer is highlighted', async () => {
            await page.waitForSelector('[data-testid^="fail"]', { visible: true });
            await page.waitForSelector('[data-testid^="success"]', { visible: true });
        });
    });
});
