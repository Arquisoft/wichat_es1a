Feature: Register into the app

Scenario: Register with correct input
  Given A register prompt
  When I correctly set up the input
  Then I'm registered and logged in

Scenario: Register with weak password
  Given A register prompt
  When I try to register with a weak password
  Then I get a message warning about it

Scenario: Register with repeated username
  Given A register prompt
  When I try to register with an already existing username
  Then I get a message warning about it
