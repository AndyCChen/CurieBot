# CurieBot
A discord bot written in javascript for returning public info on your steam account with slash commands via steam web api. 
Built with ***google firestore database***, ***node.js*** and the ***discord.js*** wrapper.

## Slash Commands

- **verify** - verify via steam id and writes it to firestore database so user is does not need to re-enter id  <br><br>
![verify!](/images/verify.png "verify")

- **whoami** - returns an embeded message containing a small summary of player profile  <br><br>
![whoami!](/images/whoami.png "whoami")

- **ownedgames** -  returns a message containing a list of all owned applications and corresponding usage time  <br><br>
![getownedgames!](/images/getOwnedGames.png "getownedgames")

- **getfriends** -  returns a list of embeded messages of all current friends in friends list  <br><br>
![getfriends!](/images/getFriends.png "getfriends")

- **deleteme** -  deletes user from firestore database  <br><br>
