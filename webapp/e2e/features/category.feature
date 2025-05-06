Feature: Category selection in PicturesGame
  Scenario: Change game category to monuments
    Given I am in the PicturesGame setup page
    When I select the "monuments" category and start the game
    Then The question text changes to show monuments-related question

  Scenario: Change game category to logos
    Given I am in the PicturesGame setup page
    When I select the "logos" category and start the game
    Then The question text changes to show logo-related question
