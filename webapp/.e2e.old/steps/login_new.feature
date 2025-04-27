Feature: Login functionality

  Scenario: User logs in successfully
    Given the user is on the login page
    When the user enters valid credentials
    And clicks the login button
    Then the user should be redirected to the homepage
    And a success message should be displayed

  Scenario: User fails to log in with incorrect credentials
    Given the user is on the login page
    When the user enters invalid credentials
    And clicks the login button
    Then the user should see an error message
