Feature: Category selection in PicturesGame
  Scenario: Default category should be flags
    Given I am in the PicturesGame setup page
    When I start the game without changing the category
    Then The question text should show flags-related question

  Scenario: Change game category to monuments
    Given I am in the PicturesGame setup page
    When I select the "monuments" category and start the game
    Then The question text changes to show monuments-related question
  Scenario: Change game category to famous people
    Given I am in the PicturesGame setup page
    When I select the "logos" category and start the game
    Then The question text changes to show famous-people-related question
