/*

 _______  _______  _______  ___   _  _______  _______  _______                                    
|       ||       ||       ||   | | ||       ||       ||       |                                   
|  _____||   _   ||       ||   |_| ||    ___||_     _||  _____|                                   
| |_____ |  | |  ||       ||      _||   |___   |   |  | |_____                                    
|_____  ||  |_|  ||      _||     |_ |    ___|  |   |  |_____  | ___                               
 _____| ||       ||     |_ |    _  ||   |___   |   |   _____| ||_  |                              
|_______||_______||_______||___| |_||_______|  |___|  |_______|  |_|                              
 _______  ___      _______  __   __  _______  ______    _______                                   
|       ||   |    |   _   ||  | |  ||       ||    _ |  |       |                                  
|    _  ||   |    |  |_|  ||  |_|  ||    ___||   | ||  |  _____|                                  
|   |_| ||   |    |       ||       ||   |___ |   |_||_ | |_____                                   
|    ___||   |___ |       ||_     _||    ___||    __  ||_____  | ___                              
|   |    |       ||   _   |  |   |  |   |___ |   |  | | _____| ||_  |                             
|___|    |_______||__| |__|  |___|  |_______||___|  |_||_______|  |_|                             
 _______  _______  __   __  _______         _______  _______  ______    _______  __   __  _______ 
|       ||   _   ||  |_|  ||       |       |       ||   _   ||    _ |  |   _   ||  |_|  ||       |
|    ___||  |_|  ||       ||    ___|       |    _  ||  |_|  ||   | ||  |  |_|  ||       ||  _____|
|   | __ |       ||       ||   |___        |   |_| ||       ||   |_||_ |       ||       || |_____ 
|   ||  ||       ||       ||    ___|       |    ___||       ||    __  ||       ||       ||_____  |
|   |_| ||   _   || ||_|| ||   |___        |   |    |   _   ||   |  | ||   _   || ||_|| | _____| |
|_______||__| |__||_|   |_||_______|       |___|    |__| |__||___|  |_||__| |__||_|   |_||_______|

*/

// Connected sockets object
exports.sockets = {
  // 123455: {
  //   username: Angel,
  //   userID: 123,
  //   gameRoom: 'The Room',
  //   skins: [],
  //   friends: []
  // }
};


// Online users object
exports.onlineUsers = {
  // user1: user1SocketID
}

// Game parameters
var gameParams = {
  worldWidth: 4096,//In pixels
  worldHeight: 2048,
  foodColors: [
    '#ff0000',//Red
    '#ff6600',//Orange
    '#ffcc00',//Gold
    '#33cc33',//Green
    '#0066ff',//Blue
    '#6600cc',//Purple
    '#ff0066'//Pink
  ],
  foodPerUpdate: 2
};

/*
 
 _______  _______  _______  ______  
|       ||       ||       ||      | 
|    ___||   _   ||   _   ||  _    |
|   |___ |  | |  ||  | |  || | |   |
|    ___||  |_|  ||  |_|  || |_|   |
|   |    |       ||       ||       |
|___|    |_______||_______||______| 

*/

// All food data
exports.foodData = {
  // roomName: {foodInfo, eatenFood, newFood}
};

// Initialize food data for a specified room
var initializeFoodData = function (roomName) {
  // Set food eaten and new food to be empty
  exports.foodData[roomName] = {
    /*
      foodInfo: {
        0: {
          id: 0,
          x: 200 (in pixels),
          y: -500 (in pixels),
          color: '#ff0000' (css style hex red, stringifed)
        }
      }
    */
    foodInfo: {},
    // Array of objects like those in foodInfo
    newFood: [],
    // { foodID_0: foodID_0 }
    eatenFood: {},
    // Current food count
    foodCount: 0,
    // Max food count
    maxFoodCount: 100
  };
  // Initialize 1-1 correspondence with roomData food params
  exports.roomData.rooms[roomName].newFood
    = exports.foodData[roomName].newFood;
  exports.roomData.rooms[roomName].eatenFood
    = exports.foodData[roomName].eatenFood;
};

// Returns a random position on the player map
var getRandomFoodPosition = function () {
  return {
    x: Math.round(gameParams.worldWidth * (Math.random() - .5)),
    y: Math.round(gameParams.worldHeight * (Math.random() - .5))
  };
};

// Returns a random food color
var getRandomFoodColor = function () {
  var idx = Math.round(Math.random() * gameParams.foodColors.length);
  return gameParams.foodColors[idx];
};

// Remove specified food from specified room
var removeFoodFromRoom = function (foodID, roomName) {
  delete exports.roomData.rooms[roomName].food[foodID];
}

// Returns one random food object
var makeOneRandomFood = function (foodID, color) {
  var foodPosition = getRandomFoodPosition();
  return {
    id: foodID,
    x: foodPosition.x,
    y: foodPosition.y,
    color: color || getRandomFoodColor()
  };
};

// Prepopulates a food object
var prepopulateFood = function (roomName) {
  var room = exports.roomData.rooms[roomName];
  var roomFoodData = exports.foodData[roomName];
  var roomFoodInfo = roomFoodData.foodInfo;
  // Make a food object associated with an integer ID
  // maxFoodCount-many times
  while (roomFoodData.foodCount < roomFoodData.maxFoodCount) {
    roomFoodInfo[roomFoodData.foodCount]
      = makeOneRandomFood(roomFoodData.foodCount);
    roomFoodData.foodCount++;
  }
};

// Delete food server side
exports.deleteFood = function (roomName, foodIDs) {
  var foodInfo = exports.foodData[roomName].foodInfo;
  var eatenFood = exports.foodData[roomName].eatenFood;
  var room = exports.roomData.rooms[roomName];

  for (var i = 0; i < foodIDs.length; ++i) {
    // If food hasn't been claimed by another player
    if (!(foodIDs[i] in eatenFood)) {
      // Delete on next update
      eatenFood[foodIDs[i]] = foodIDs[i];
      foodInfo[foodIDs[i]] = null;
      // Decrement food count
      --exports.foodData[roomName].foodCount;
    }
  }
};

// Refresh food on the board
exports.refreshFood = function (roomName) {
  var room = exports.roomData.rooms[roomName];
  var foodInfo = exports.foodData[roomName].foodInfo;
  var eatenFood = exports.foodData[roomName].eatenFood;
  var newFood = exports.foodData[roomName].newFood;
  // Only add gameParams.foodPerUpdate-many food per update
  for (var i = 0; i < gameParams.foodPerUpdate; ++i) {
    var eatenFoodKeys = Object.keys(eatenFood);
    if (0 < eatenFoodKeys.length) {
      // Get the first ID
      var tmpID = eatenFoodKeys[0];
      // Make a new food
      foodInfo[tmpID] = makeOneRandomFood(tmpID);
      exports.foodData[roomName].foodCount++;
      // Store new food
      newFood.push(foodInfo[tmpID]);
      console.log(exports.foodData[roomName].newFood);
      console.log(exports.roomData.rooms[roomName].newFood);
      // Remove food from eaten food
      delete eatenFood[tmpID];
    } else {
      // No food left to be repopulated
      break;
    }
  }
};

// Restore food parameters in between updates
exports.restoreFoodParams = function (roomName) {
  // if (exports.foodData[roomName].newFood.length > 0) {
  //   console.log('YOU HAVE FOOOOOOOOD');
  //   console.log(exports.foodData[roomName].newFood);
  // }
  // Reassign empty food array
  exports.foodData[roomName].newFood = [];
  exports.roomData.rooms[roomName].newFood
    = exports.foodData[roomName].newFood;
};

/*
 
 ______    _______  _______  __   __  _______ 
|    _ |  |       ||       ||  |_|  ||       |
|   | ||  |   _   ||   _   ||       ||  _____|
|   |_||_ |  | |  ||  | |  ||       || |_____ 
|    __  ||  |_|  ||  |_|  ||       ||_____  |
|   |  | ||       ||       || ||_|| | _____| |
|___|  |_||_______||_______||_|   |_||_______|

*/

// All possible roomnames
exports.roomNames = [
  "The Room",
  "Hack Reactor",
  "Freehold",
  "San Francisco",
  "Mount Codepocalypse",
  "Tundra",
  "Forest",
  "Ocean"
];

// All room data
exports.roomData = {
  defaultMaxPlayerCount: 10,
  defaultMaxFoodCount: 100,
  maxRooms: 10,
  roomCount: 0,
  rooms: {}
};


// A function to get all roomNames and current sizes
exports.allRooms = function () {
  var result = [];
  for(var roomName in exports.roomData.rooms) {
    result.push({
      roomName: roomName,
      maxCount: exports.roomData.rooms[roomName].maxPlayerCount,
      count:
        exports.roomData.rooms[roomName].playerCount
    });
  }
  return result;
};

// Add a room to roomData.rooms
exports.addRoom = function (size) {
  // If room limit hasn't been reached, create room
  if (exports.roomData.roomCount < exports.roomData.maxRooms) {
    var newRoom = {
      roomName: exports.roomNames[exports.roomData.roomCount],
      playerCount: 0,
      maxPlayerCount: size || exports.roomData.defaultMaxPlayerCount,
      playerInfo: {}
    };
    // Assign room
    exports.roomData.rooms[newRoom.roomName] = newRoom;
    // Initialize and populate food with room
    initializeFoodData(newRoom.roomName);
    prepopulateFood(newRoom.roomName);
    // Increment room count
    exports.roomData.roomCount++;
    console.log('\nA NEW ROOM has been CREATED.\n');
    return newRoom;
  } else {
    console.log('\nThe TOTAL ROOMS CAPACITY has been REACHED.\n');
  }
};

// Remove a room
// NOTE ON CLEVER THING:
/*
Roomnames are picked by using exports.roomData.roomCount
as the index to reference a name from exports.roomNames

Suppose roomnames are ['a', 'b', 'c', 'd'], and 'a', 'b', 'c'
are currently up and running. If we turn off room 'b' (0 players),
now exports.roomData.roomCount will be decremented to 2. When
We need to create a new room, we will try and create
['a', 'b', 'c', 'd'][roomData.roomCount === 2] === 'c', but
'c' is already in use.

To avoid this, when we remove a room, we get the roomname ('b'),
remove it from exports.roomNames using Array.splice(), and
push it onto the end of exports.roomNames. This way, in the
example above, after removing a room, exports.roomNames would be
['a', 'c', 'd', 'b'], and exports.roomNames[2] is 'd', which is
not in use
*/
exports.removeRoom = function (roomName) {
  var roomRemoved = false;
  var roomIndex = exports.roomNames.indexOf(roomName);
  if (roomIndex !== -1 && roomName in exports.roomData.rooms) {
    // Delete room
    exports.roomNames.splice(roomIndex, 1);
    exports.roomNames.push(roomName);
    delete exports.roomData.rooms[roomName];
    // Delete room's food
    delete exports.foodData[roomName];
    roomRemoved = true;
    console.log('\nROOM', roomName, 'REMOVED.\n');
  } else {
    console.log('\nROOM', roomName, 'STAYS. !@#%!@!@^!#!\n');
  }
  return roomRemoved;
};

// Add a room when starting the server
exports.addRoom();

// Put a player in a new room
exports.addPlayerToRoom = function (roomName, data) {
  // Assume room won't be joined
  var roomJoined = false;
  // If the room exists
  // AND the player isn't already in the room
  // AND the player count of the room is under the max
  if (roomName in exports.roomData.rooms
    && !(data.username in exports.roomData.rooms[roomName])
    && (exports.roomData.rooms[roomName].playerCount
      < exports.roomData.rooms[roomName].maxPlayerCount)) {

    // Need radius, position, skin, and username to instantiate a player
    // clientside
    exports.roomData.rooms[roomName].playerInfo[data.username] = {
      positionAndRadius: [
        {
          x: 0,
          y: 0,
          radius: 50
        }
      ],
      skin: exports.sockets[data.socketID]['skins'][0] || '',
      // eatenFoodIDs: []
    };
    // Increment room count
    exports.roomData.rooms[roomName].playerCount++;
    // Set gameRoom on player
    exports.sockets[data.socketID].gameRoom = roomName;
    // Set room joined to rue
    roomJoined = true;

    console.log('\nPLAYER', data.username, 'ADDED TO ROOM', roomName + '.\n');
  } else {
    // Player could not join room
    console.log('\nPLAYER', data.username, 'COULD NOT JOIN',
      roomName, '\n. ?!?!??!?!!!?!');
  }

  // Return data necessary for response
  var result = {
    roomName: roomName,
    roomJoined: roomJoined,
  };
  // If room was joined, add foodInfo and player names
  if (result.roomJoined) {
    result.foodInfo = exports.foodData[roomName].foodInfo;
    result.roomPlayers
      = getRoomPlayersForClient(roomName);
  }
  return result;
};

// Check if a new room is needed
var makeNewRoomIfNeeded = function () {
};

// Remove a player from their current game room
exports.removePlayerFromGame = function (data) {
  var gameRoom = exports.sockets[data.socketID].gameRoom;
  var username = exports.sockets[data.socketID].username;
  if (gameRoom !== '') {
    // Decrement roomCount
    exports.roomData.rooms[gameRoom].playerCount--;
    // Remove player information
    delete exports.roomData.rooms[gameRoom].playerInfo[username];
  }
  // Set gameRoom to be empty
  exports.sockets[data.socketID].gameRoom = '';
  return gameRoom;
};

// Get the players in a room for a client
var getRoomPlayersForClient = function (roomName) {
  var playerInfo = exports.roomData.rooms[roomName].playerInfo;
  var result = [];
  for (var username in playerInfo) {
    result.push({
      username: username,
      profileImage: 'http://www.councilforresponsiblegenetics.org/'
        + 'geneticprivacy/images/cell_2.png'
    });
  }
  return result;
};

// Update a player by referencing data on the client
// { username, roomName, positionAndRadius }
exports.updatePlayer = function (data) {
  exports.roomData.rooms[data.roomName]
    .playerInfo[data.username].positionAndRadius
    = data.positionAndRadius;
};