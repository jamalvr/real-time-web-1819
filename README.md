# Weather drinking 
Real-Time Web @cmda-minor-web · 2018-2019
Author: Jamal van Rooijen

[rubric]: https://docs.google.com/spreadsheets/d/e/2PACX-1vSd1I4ma8R5mtVMyrbp6PA2qEInWiOialK9Fr2orD3afUBqOyvTg_JaQZ6-P4YGURI-eA7PoHT8TRge/pubhtml

--- 

## Week 1
### Game steps
1. Create user with nickname and personal ID
2. Statemanagement
   1. Start the game. At this point no new users can join.
3. Give a random player the option to press the button
   1. When the button is pressed: Select a random city from an array of cities
   2. Weather and country is fetched.
      1. Location is broadcasted to all players.
      2. Every player has 10 seconds to guess the weather. There are limited options available.
      3. After 10 seconds, the players with the right answers earn points. If you guessed wrong, you have to drink.
      4. After 10 turns the game is over and a winner is chosen by the amount of points. The loser has to drink a whole beer.

### Data needed
#### User
- ID / User name
- Score
- Number of players

#### Each turn
- API: City name -> broadcast to players
- API: Weather current city -> hidden
- Per player:
  - If someone answered
  - Answer speed
  - Correct / wrong answer
  - Adding points to right players
- After 10 seconds OR when everybody gave an answer
  - Finish turn
  - Broadcast weather conditions to players
  - Give points

#### Game state
- If a game is started
- If a game is finished
  - If finished, players can enter the roooooom
- Count turns played until 10 -> finish

### API
1. Create semi-static base
2. Define socket.io use cases
3. Add gameplay
4. Get weather API
   1. Poll data every x seconds

### Socket logic
1. Creating a new user: Socket.io -> connection + disconnect
2. Register a user + nickname
3. Button which starts the game -> broadcast/emit to all players
4. Store data in memory (maybe later to a DB)

---

## Study info
### Week 2
[Exercises](https://github.com/cmda-minor-web/real-time-web-1819/blob/master/week-2.md)    
[Slides](https://docs.google.com/presentation/d/1woKoY59D8Zcttna0FzfNjEtGtT8oXWi9b5LYlukRISM/edit?usp=sharing)

### Week 3
[Exercises](https://github.com/cmda-minor-web/real-time-web-1819/blob/master/week-3.md)  
[Slides](https://docs.google.com/presentation/d/1SHofRYg87bhdqhv7DQb_HZMbW7Iq1PtqxpdtZHMbMmk/edit?usp=sharing)