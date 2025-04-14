Feature: Quiz Game Functionality

Scenario: User starts the quiz successfully
  Given the user is logged in
  When the user navigates to the quiz page
  And clicks the start button
  Then the first question should be displayed

Scenario: User answers question correctly
  Given the user is in the quiz
  When the user selects the first correct answer question
  Then turns the button green and moves to the next question

Scenario: User answers the second question correctly
  Given the user is in the quiz with one question answered
  When the user selects correct answer
  Then turns the button green and moves to the next question
   
Scenario: User runs out of time on a question
  Given the user is in the quiz
  When the timer runs out before the user answers a question go to the next question
  Then moves to the next question
  
Scenario: User submits an incorrect answer
  Given the user is in the quiz
  When the user selects an incorrect answer
  Then turns the button red and moves to the next question

Scenario: User answers the second question correctly
  Given the user is in the quiz with one question answered
  When the user selects correct answer
  Then turns the button green and moves to the next question

Scenario: User answers the third question correctly
  Given the user is in the quiz with one question answered
  When the user selects correct answer
  Then turns the button green and finish the game
   