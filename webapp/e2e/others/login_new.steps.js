import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps';

const apiEndpoint = 'http://localhost:8000';

Given('the user is on the login page', () => {
  cy.visit('/login');
});

When('the user enters valid credentials', () => {
  // Supongamos que el usuario tiene estas credenciales para prueba
  const validUsername = 'testuser';
  const validPassword = 'password123';

  cy.get('input[name="username"]').type(validUsername);
  cy.get('input[name="password"]').type(validPassword);
});

When('the user enters invalid credentials', () => {
  // Usamos credenciales incorrectas para la prueba
  const invalidUsername = 'wronguser';
  const invalidPassword = 'wrongpassword';

  cy.get('input[name="username"]').type(invalidUsername);
  cy.get('input[name="password"]').type(invalidPassword);
});

When('the user clicks the login button', () => {
  cy.get('button').contains('Login').click();
});

Then('the user should be redirected to the homepage', () => {
  cy.url().should('include', '/homepage');
});

Then('a success message should be displayed', () => {
  cy.get('div').contains('Login successful').should('be.visible');
});

Then('the user should see an error message', () => {
  cy.get('div').contains('Error').should('be.visible');
});
