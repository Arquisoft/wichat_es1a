Feature: Category selection in PicturesGame

  Scenario: Change game category to animals
    Given I am in the PicturesGame setup page
    When I select the "animals" category and start the game
    Then The question text changes to show animal-related question

  Scenario: Change game category to logos
    Given I am in the PicturesGame setup page
    When I select the "logos" category and start the game
    Then The question text changes to show logo-related question
