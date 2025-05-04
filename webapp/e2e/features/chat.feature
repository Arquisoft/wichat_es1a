Feature: Chat functionality in PicturesGame

  Scenario: Send a message in the chat
    Given I am in a game of PicturesGame
    When I type a message and send it
    Then The message appears in the chat history

  Scenario: Request a hint from the chat
    Given I am in a game of PicturesGame
    When I click the hint button
    Then I receive a hint message in the chat
