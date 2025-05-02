Feature: Answering a question in PictureGame

  Scenario: Answer correctly to a question
    Given I am in a round with possible answers
    When I select the correct answer
    Then The button turns green and my score increases

  Scenario: Answer incorrectly to a question
    Given I am in a round with possible answers
    When I select a wrong answer
    Then The button turns red and the correct answer is highlighted
