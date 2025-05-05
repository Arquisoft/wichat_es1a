Feature: Game Navigation

  Scenario: Navigate from homepage to PicturesGame
    Given I am logged in and on the homepage
    When I click on the play button for PicturesGame
    Then I should be redirected to the PicturesGame configuration page

  Scenario: Navigate from homepage to standard Game
    Given I am logged in and on the homepage
    When I click on the play button for standard Game
    Then I should be redirected to the Game page

  Scenario: Return to homepage after completing a game
    Given I complete a game session
    When The game ends and the results are shown
    Then I am automatically redirected to the homepage
