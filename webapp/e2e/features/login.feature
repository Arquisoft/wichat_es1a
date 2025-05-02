Feature: Login into the app

Scenario: Login with correct credentials
  Given A login prompt
  When I correctly enter my credentials, and press login
  Then I'm logged in and redirected to my home

Scenario: Login with incorrect credentials
  Given A login prompt
  When I enter wrong credentials, and press login
  Then A message informs about wrong credentials
