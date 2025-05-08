Feature: Category selection in PicturesGame
  Scenario: Change game category to art
    Given I am in the PicturesGame setup page
    When I select the "art" category and start the game
    Then The question text changes to show art-related question
