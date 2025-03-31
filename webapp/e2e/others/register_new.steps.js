import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps';

const apiEndpoint = 'http://localhost:8000';

Given('the user is on the registration page', () => {
  cy.visit('/register');
});

When('the user enters valid registration details', () => {
  const validUsername = 'newuser';
  const validPassword = 'password123';
  const validName = 'John';
  const validSurname = 'Doe';

  cy.get('input[name="username"]').type(validUsername);
  cy.get('input[name="password"]').type(validPassword);
  cy.get('input[name="name"]').type(validName);
  cy.get('input[name="surname"]').type(validSurname);
});

When('the user enters invalid registration details', () => {
  const invalidUsername = '';
  const invalidPassword = 'password';
  const invalidName = '';
  const invalidSurname = '';

  cy.get('input[name="username"]').type(invalidUsername);
  cy.get('input[name="password"]').type(invalidPassword);
  cy.get('input[name="name"]').type(invalidName);
  cy.get('input[name="surname"]').type(invalidSurname);
});

When('the user clicks the register button', () => {
  cy.get('button').contains('Register').click();
});

Then('the user should be redirected to the homepage', () => {
  cy.url().should('include', '/homepage');
});

Then('a success message should be displayed', () => {
  cy.get('div').contains('User added successfully').should('be.visible');
});

Then('the user should see an error message', () => {
  cy.get('div').contains('Error').should('be.visible');
});
