Feature: Difficulty selection in PicturesGame

  Scenario: Change game difficulty settings
    Given I am in the PicturesGame setup page
    When I select the "hard" difficulty and start the game
    Then The game timer reflects the hard difficulty setting
