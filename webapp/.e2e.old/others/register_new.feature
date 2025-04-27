Feature: User Registration functionality

  Scenario: User registers successfully
    Given the user is on the registration page
    When the user enters valid registration details
    And clicks the register button
    Then the user should be redirected to the homepage
    And a success message should be displayed

  Scenario: User fails to register with invalid details
    Given the user is on the registration page
    When the user enters invalid registration details
    And clicks the register button
    Then the user should see an error message
