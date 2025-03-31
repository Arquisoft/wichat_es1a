Feature: Picture Game

  Scenario: User starts a new round
    Given the game is initialized
    When the user starts a new round
    Then a new question should be fetched
    And the possible answers should be set

  Scenario: User selects the correct answer
    Given a question is displayed with multiple choices
    When the user selects the correct answer
    Then the answer should be marked as correct
    And the score should increase

  Scenario: User selects an incorrect answer
    Given a question is displayed with multiple choices
    When the user selects an incorrect answer
    Then the answer should be marked as incorrect
    And the correct answer should be highlighted
    And the incorrect answer count should increase

  Scenario: User completes all rounds
    Given the game is ongoing
    When the user answers all questions
    Then the game should end
    And the final score should be displayed