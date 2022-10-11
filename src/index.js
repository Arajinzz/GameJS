
var SCREEN_WIDTH = 800;
var SCREEN_HEIGHT = 600;


// create the canvas context
var layer1 = document.getElementById('layer1').getContext('2d');
var charlayer = document.getElementById('char').getContext('2d');

var loc = location.pathname;

// DIRECTORY LOCATIONS
var tiledir = loc.substring(0, loc.lastIndexOf('/'))+"/src/Tiles/";
var chardir = loc.substring(0, loc.lastIndexOf('/'))+"/src/Characters/";
var coindir = loc.substring(0, loc.lastIndexOf('/'))+"/src/Coin/";

/*****************************************Image Handle******************************************************* */
  
function loadImg(ctx, TabOfTiles) {

    var Tiles = [];
    NumbTilesLoaded = 0;

    for (var i = 0; i < TabOfTiles.length; i++) {
        Tiles[i] = new Image();
        Tiles[i].src = TabOfTiles[i];
        Tiles[i].onload = function() {
            // Once the image is loaded increment the number of loaded tiles count and check if all images are ready.
            NumbTilesLoaded++;
            if (NumbTilesLoaded === TabOfTiles.length) {
                initImg(ctx, Tiles);
            }
        }
    }

    return Tiles;
}

function initImg(ctx, tiles){

    for(let i = 0 ; i < tiles.length; i++){

        ctx.drawImage(tiles[i], 0, 0);

    }

}

function sliceImage(info, isMap){

    var frames = [];

    if(isMap){
        for(let i = 0; i < info.rows ; i++){
            for(let j = 0 ; j < info.cols ; j++){
                frames.push([info.w*j, info.h*i]);
            }
        }
    }else{
        for(let i = 0; i < info.rows ; i++){
            var frameRow = [];
            for(let j = 0 ; j < info.cols ; j++){
                frameRow.push([info.w*j, info.h*i]);
            }
            frames.push(frameRow);
        }
    }
    
    return frames;

}


/********************************************MAP HANDLE*********************************************/

function drawMap(ctx, mapArray, Tiles, tileSize, tileFrames) {

    var tileW = tileSize.w;
    var tileH = tileSize.h;

    var drawTile;

    // loop through our mapArray and draw out the image represented by the number.
    for (var i = 0; i < mapArray.length; i++) {
        for (var j = mapDisplay.begin; j < mapDisplay.end; j++) {
            drawTile = mapArray[i][j];
            if(drawTile >= 0){
                // Draw the represented image number, at the desired X & Y coordinates followed by the graphic width and height.
                ctx.drawImage(Tiles[0], tileFrames[drawTile][0], tileFrames[drawTile][1], tileW, tileH, (j-mapDisplay.begin)*tileW, (i)*tileH, tileW, tileH);
            }
        }
    }
}


/**********************************************COIN HANDLE***************************** */

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
  }


// GET RANDOM COIN POSITIONS
function CoinPosition(map, howmuch){

    var positions = [];

    for(let i = 0 ; i < map.length ; i++){

        for(let j = 0; j < map[i].length; j++){

            if(map[i][j] == -1){
                positions.push([i, j]);
            }

        }

    }


    for(let i = 0; i < howmuch; i++){

        var b = true;

        var rand = getRndInteger(0, positions.length);

        for(let j = 0 ; j < coinPos.length ; j++){

            if(coinPos[j][0] == positions[rand][0] && coinPos[j][1] == positions[rand][1]){
                b = false;
                break;
            }

        }

        if(b){
            coinPos.push(positions[rand]);
        }

    }

}

function drawCoinFrame(ctx, img, i, j){
    ctx.drawImage(img, coinTiles[coinCurrentFrame][0], coinTiles[coinCurrentFrame][1], coinSize.w, coinSize.h, (j - mapDisplay.begin)*coinSize.w, i*coinSize.h, coinSize.w, coinSize.h);
}


function drawCoins(ctx, coins){

    if(coinCurrentFrame < coinFrames-1){
        coinCurrentFrame++;
        transitionTime = 0;
    }else{
        coinCurrentFrame = 0;
    }

    for(let i = 0 ; i < coins.length; i++){
        drawCoinFrame(ctx, coin[0], coins[i][0], coins[i][1]);
    }

    
}


/*******************************************************MOUVEMENTS****************************************************/

function checkMove(charDirection){

    var tempX = playerX;
    var tempY = playerY;

    switch(charDirection){

        case 0:
            playerY+=playerSpeed;
            break;

        case 1:
            playerX-=playerSpeed;
            break;

        case 2:
            playerX+=playerSpeed;
            break;

        case 3:
            playerY-=playerSpeed;
            break;

    }

    var pX = Math.floor(playerX/32);
    var pY = Math.floor(playerY/32);

    // IF OBSTACLE DON'T MOVE
    if((pX < 0 || pY < 0) || FLMap[pY][pX+mapDisplay.begin] >= 0){
        playerX = tempX;
        playerY = tempY;
        return;
    }

    var newCoinPos = [];

    // EAT COIN
    for(let i = 0 ; i < coinPos.length ; i++){

        if(coinPos[i][0] == pY && coinPos[i][1] == pX+mapDisplay.begin){
            score++;
        }else{
            newCoinPos.push([coinPos[i][0], coinPos[i][1]]);
        }

    }

    coinPos = newCoinPos;

    // GENERATE COIN EACH TIME PLAYER MOVES RANDOMLY
    // SPAWN RANDOM COIN
    var RNG = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1];

    var rand = RNG[getRndInteger(0, RNG.length)];

    if(rand == 1){
        CoinPosition(FLMap, 1);
    }

    //DEFILMENT
    if(playerX > SCREEN_WIDTH/2 + 100 && charDirection == 2){
        if(mapDisplay.end - mapDisplay.begin > 25){
            mapDisplay.begin+=1;
            playerX = tempX;
        }
    }else if(playerX < SCREEN_WIDTH / 2 - 100 && charDirection == 1){
        if(mapDisplay.begin > 0){
            mapDisplay.begin-=1;
            playerX = tempX;
        }
    }

}


// MOUVEMENT
function MovementInit(){

    addEventListener("keydown", function(e) {
        switch(e.keyCode) {
          case 37: 
                   charDirection = 1;
                   checkMove(charDirection);
                   break;

          case 39: 
                    charDirection=2;
                    checkMove(charDirection);
                    break;

          case 38:  
                    charDirection=3; 
                    checkMove(charDirection);
                    break;
          case 40: 
                    charDirection=0; 
                    checkMove(charDirection);
                    break;
        }
    });

    addEventListener("keyup", function(e) {
        switch(e.keyCode) {
          case 37: current = 0; break;
          case 39: current = 0; break;
          case 38: current = 0; break;
          case 40: current = 0; break;
        }
    });
  
}

/**********************************MAP*************************************************/
var FLMap =    [[1,3,2,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,2,3,2],
                [2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1],
                [2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1],
                [2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,3,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1],
                [2,-1,-1,-1,2,18,20,-1,-1,-1,-1,-1,-1,-1,1,2,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1],
                [2,-1,-1,10,4,8,3,4,-1,-1,-1,-1,-1,-1,-1,-1,3,2,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,3,4,-1,-1,-1,3,-1,-1,-1,-1,1],
                [2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4,1,1,2,-1,-1,2,-1,-1,-1,-1,1],
                [2,-1,-1,-1,-1,-1,-1,-1,4,5,-1,-1,-1,-1,-1,-1,2,2,2,2,-1,-1,-1,-1,-1,-1,-1,-1,1,3,2,21,-1,-1,2,-1,-1,-1,-1,1],
                [-1,-1,-1,-1,-1,-1,3,3,4,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,3,1,2,3,1,2,3,2,1,-1,-1,-1,-1,1],
                [-1,-1,-1,-1,-1,4,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,-1,-1,2,2,3,2,-1,-1,-1,-1,-1,-1,-1,1],
                [2,-1,-1,-1,4,-1,-1,-1,-1,-1,-1,3,20,20,3,-1,-1,-1,-1,-1,-1,-1,-1,11,-1,3,-1,-1,1,1,1,2,-1,-1,-1,-1,-1,-1,-1,1],
                [2,1,1,1,1,-1,-1,-1,-1,-1,-1,2,3,-1,3,16,17,-1,-1,-1,-1,-1,-1,11,-1,-1,-1,-1,1,1,1,1,-1,-1,-1,-1,-1,-1,-1,1],
                [2,-1,-1,-1,-1,-1,-1,-1,-1,-1,4,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,1,1,1,1,1,1,-1,-1,-1,-1,1],
                [2,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,-1,-1,-1,-1,-1,-1,5,-1,-1,-1,-1,-1,-1,-1,1,1,1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1],
                [2,-1,-1,-1,-1,-1,-1,3,3,5,-1,-1,-1,-1,-1,-1,-1,11,18,12,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1],
                [2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1],
                [2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1],
                [2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1],
                [1,3,2,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,2,3,2]];

var FLTiles = loadImg(layer1, [tiledir+"ground_1x1.png"]);
var tileSize = {w:800, h:32, rows:1, cols:25};
    tileSize.w /= tileSize.cols;
    tileSize.h /= tileSize.rows;

var tileFrames = sliceImage(tileSize, true);

// 0 25
var mapDisplay = {begin:10, end:FLMap[0].length};

var coin = loadImg(layer1, [coindir+"coin.png"]);
var coinSize = {w: 192, h:32, rows:1, cols:6};
    coinSize.w /= coinSize.cols;
    coinSize.h /= coinSize.rows;

var coinTiles = sliceImage(coinSize, true);

var coinCurrentFrame = 0;
var coinFrames = coinSize.cols ;
var coinPos = [];

// GENERATE RANDOM 10 COINS
CoinPosition(FLMap, 10);

/********************************************CHARACTER*****************************************************/

var char = loadImg(layer1, [chardir+"down.png", chardir+"left.png", chardir+"arrow.png", chardir+"up.png"]);
var charSize = {w: 62, h:46, rows:1, cols:1};
    charSize.w /= charSize.cols;
    charSize.h /= charSize.rows;

// ARROW DIRECTION
var charDirection = 2;

// PLAYER POSITION AND SPEED
var playerX = 33;
var playerY = 33;
var playerSpeed = 32;

// MOUVEMENT
MovementInit();

var score = 0;

/*************************************GAME LOOP****************************************************** */

function gameLoop(){
    layer1.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    charlayer.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // GAME OVER
    if(coinPos.length > 60){

        playerX = 0;
        playerY = 0;

        layer1.fillStyle = "blue";
        layer1.font = "30px Arial";
        layer1.fillText("GAME OVER", SCREEN_WIDTH/2 - 200, SCREEN_HEIGHT/3);
        layer1.fillText("Number of coins > 60", SCREEN_WIDTH/2 - 200, SCREEN_HEIGHT/3 + 100);
        layer1.fillText("Score : " + score, SCREEN_WIDTH/2 - 200, SCREEN_HEIGHT/3 + 200);
        layer1.fillText("Refresh the page to retstart", SCREEN_WIDTH/2 - 200, SCREEN_HEIGHT/3 + 300);
        
        return;
    }

    drawMap(layer1, FLMap, FLTiles, tileSize, tileFrames);
    drawCoins(layer1, coinPos);

    // CHARACTER
    charlayer.drawImage(char[charDirection], playerX, playerY, 32, 32);

    // PRINT SCORE
    layer1.fillStyle = "blue";
    layer1.font = "30px Arial";
    layer1.fillText("Score : " + score, 100, 25); 
    layer1.fillText("Number Of Coins : " + coinPos.length, SCREEN_WIDTH - 300, 25); 

}


setInterval(gameLoop, 40);
