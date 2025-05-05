Feature: Game Statistics Update
  Scenario: Correctly answered questions update statistics
    Given I am playing a PicturesGame
    When I answer a question correctly
    Then My correct answer count should increase
  Scenario: Incorrectly answered questions update statistics
    Given I am playing a PicturesGame
    When I answer a question incorrectly
    Then My incorrect answer count should increase

