const NB_ROW = 20;
const NB_COL = 25;
const CELL_WIDTH = 100/NB_COL;
const CELL_HEIGHT = 100/NB_ROW;
const MOVE_DURATION = 150;
const MONSTER_MOVE_DURATION = 1000;
const NUM_MONSTER = 5;
const LOST_TEXT = "YOU ARE LOST";
const VICTORY_TEXT = "YOU WIN!";

var keydown = false;
var maze = generateMaze();
var playerXY = [1,1];
var monsterXY = [2,2];
var monsters = [];
var coins = [];
var moving = false;
var life = 3;
var time = 120;
var score = 0;
var countDownTaskId;
var gameStarted = false;
var audioCoin;
var audioDamage;
var audioStartScreen;
var audioVictory;
var audioLose;

function generateMaze() {
    return [
        '#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#',
        '#','0','#','0','0','0','0','0','0','#','0','0','0','0','0','0','0','0','0','0','0','0','0','0','#',
        '#','0','#','#','#','0','#','#','0','#','0','#','0','0','0','#','#','0','0','#','#','0','0','0','#',
        '#','0','0','#','#','0','#','#','0','#','0','#','0','0','0','#','#','0','0','#','#','0','0','0','#',
        '#','0','#','0','#','0','#','#','0','#','0','#','0','0','0','#','#','0','0','#','#','0','0','0','#',
        '#','0','#','0','0','0','#','#','0','0','0','#','0','0','0','#','#','#','#','#','0','0','0','0','#',
        '#','0','#','#','0','0','0','0','#','#','#','#','#','0','0','0','0','0','0','0','#','0','0','0','#',
        '#','0','#','#','#','0','0','0','0','0','0','0','0','0','0','#','#','#','#','0','0','0','0','0','#',
        '#','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','#','0','0','0','0','0','#',
        '#','#','#','#','0','#','0','0','#','0','0','0','0','0','#','0','#','0','#','0','#','#','#','#','#',
        '#','0','0','0','0','#','0','0','0','#','0','#','0','0','#','0','#','0','#','0','0','0','0','0','#',
        '#','0','0','0','0','0','#','#','0','#','0','#','0','0','#','0','#','0','0','0','#','#','#','0','#',
        '#','#','#','#','#','0','#','0','0','#','0','#','0','0','#','#','#','#','#','0','0','0','#','0','#',
        '#','0','0','0','#','0','0','#','0','#','#','#','0','0','0','0','0','0','0','0','0','0','#','0','#',
        '#','0','#','#','#','0','#','0','0','0','0','0','0','#','0','0','0','0','0','0','0','#','#','0','#',
        '#','0','0','0','#','0','#','0','#','0','#','0','#','#','#','0','#','#','#','0','#','0','0','0','#',
        '#','#','#','0','#','#','0','0','#','0','#','0','0','#','0','0','#','0','0','0','#','0','#','0','#',
        '#','#','#','0','0','#','#','0','#','#','#','0','0','#','0','0','#','0','0','0','#','#','#','0','#',
        '#','#','0','0','0','0','0','0','0','0','0','0','0','0','0','#','#','0','0','0','0','0','#','0','#',
        '#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#',
    ];
}

function generateJQueryEle(type) {
    var ele;
    switch(type) {
        case '#':
            ele = $('<img class="svg" src="img/block.svg"/>');
            break;
        case '0':
            return;
        case 'P':
            ele = $('<img id="pac-man" class="svg" src="img/pac-man.svg"/>');
            break;
        case 'M':
            ele = $('<img class="ghost svg" src="img/ghost.svg"/>');
            break;
        case 'C':
            ele = $('<img class="svg coin" src="img/coin.svg"/>');
            break;
    }
    if(ele) {
        ele.css({
            width: CELL_WIDTH+'%',
            height: CELL_HEIGHT+'%',
        });
    }
    return ele;
}

function generateCoins() {
    var coins = [];
    while(coins.length <= 0) { // make sure there is at least some coins
        for(var i = 0; i < NB_ROW; i++) {
            for(var j = 0; j < NB_COL; j++) {
                if(canMove(j, i)) {
                    if(Math.random() < 0.3) { // 30% to place a coin here
                        var ele = generateJQueryEle('C');
                        ele.css({
                            left: (j*CELL_WIDTH)+'%',
                            top: (i*CELL_HEIGHT)+'%'
                        });
                        coins.push({
                            x: j,
                            y: i,
                            obj: ele
                        });
                    }
                }
            }
        }
    }
    return coins;
}

function generateMonsters() {
    var monsters = [];
    var [x, y] = monsterXY;
    for(var i = 0; i < NUM_MONSTER;i++) {
        var ele = generateJQueryEle('M');
        var color = getRandomColor();
        // console.log(color);
        var monsterX = x+i;
        var monsterY = y+i;
        ele.css({
                left: (monsterX*CELL_WIDTH)+'%',
                top: (monsterY*CELL_HEIGHT)+'%',
                // background: color
        });
        monsters.push({
            x: monsterX,
            y: monsterY,
            obj: ele
        });
    }
    return monsters;
}

function addElementToMap(maze) {
    var mazeDiv = $('#maze');
    for(var y = 0; y < NB_ROW; y++) {
        for(var x = 0; x < NB_COL; x++) {
            var ele = generateJQueryEle(maze[y*NB_COL+x]);
            if(!ele) continue;
            ele.css({
                left: (x*CELL_WIDTH)+'%',
                top: (y*CELL_HEIGHT)+'%',
            });
            mazeDiv.append(ele);
        }
    }

    // place the player
    var [x, y] = playerXY;
    var ele = generateJQueryEle('P');
    ele.css({
        left: (x*CELL_WIDTH)+'%',
        top: (y*CELL_HEIGHT)+'%',
    });
    mazeDiv.append(ele);

    // place monster
    monsters = generateMonsters();
    for(var m of monsters) {
        mazeDiv.append(m.obj);
    }

    // place coins
    coins = generateCoins();
    for(var c of coins) {
        mazeDiv.append(c.obj);
    }
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function gameOver() {
    clearInterval(countDownTaskId);
    $(document).off('keydown');
    $("#result-win").text(LOST_TEXT);
    $("#result-score").text(score);
    $("#game-result").show(MOVE_DURATION);
    gameStarted = false;
    audioLose.play();
}

function showVictory() {
    clearInterval(countDownTaskId);
    gameStarted = false;
    $(document).off('keydown');
    $("#result-win").text(VICTORY_TEXT);
    $("#result-score").text(score);
    $("#game-result").show(MOVE_DURATION);
    audioVictory.play();
}

function countDown() {
    time-=1;
    $('#current-time').text(time);
    if(time <= 0) {
        gameOver();
    }
}

function initAudio() {
    audioCoin = document.createElement('audio');
    audioCoin.setAttribute('src', 'sound/coin.mp3');
    audioDamage = document.createElement('audio');
    audioDamage.setAttribute('src', 'sound/damage.mp3');
    audioVictory = document.createElement('audio');
    audioVictory.setAttribute('src', 'sound/winning.mp3');
    audioLose = document.createElement('audio');
    audioLose.setAttribute('src', 'sound/lose.mp3');
}

function afterShowGameScreen() {
    addElementToMap(maze);
    initAudio();
    $('#current-life').text(life);
    $('#current-time').text(time);
    countDownTaskId = setInterval(countDown, 1000);

    // add control
    $(document).keydown(function(e) {
        var curPos = $('#pac-man').position();
        if(!keydown && ! moving){
          keydown = true;
          // $('#pac-man').css({transform: 'rotate(0deg)'});
          console.log("keydown");
          switch(e.keyCode) {
              case 37: // left
                  $('#pac-man').css({transform: 'rotate(180deg)'});
                  movePlayer(playerXY[0]-1, playerXY[1]);
                  return false;
              case 38: // up
                  $('#pac-man').css({transform: 'rotate(270deg)'});
                  movePlayer(playerXY[0], playerXY[1]-1);
                  return false;
              case 39: // right
                  $('#pac-man').css({transform: 'rotate(0deg)'});
                  movePlayer(playerXY[0]+1, playerXY[1]);
                  return false;
              case 40: // down
                  $('#pac-man').css({transform: 'rotate(90deg)'});
                  movePlayer(playerXY[0], playerXY[1]+1);
                  return false;
          }
        }
    });

    $(document).keyup(function(e) {
      console.log("keyup");
      if(keydown)
        keydown = false;
    });
    gameStarted = true;
    getMonsterMove();

}

function canMove(x, y) {
    if(x < 0 || y < 0 || x >= NB_COL || y >= NB_ROW) return false;
    return maze[NB_COL*y+x] !== '#';
}

function afterPlayerMove(x, y) {
    // check conflict
    for(var i = coins.length-1; i >= 0; i--) {
        var coin = coins[i];
        if(coin.x === x && coin.y === y) {
            coin.obj.animate({ top: ((y-1)*CELL_HEIGHT)+'%' }, 1000)
            .delay(MOVE_DURATION)
            .animate({ opacity: 0 }, 500, function() {
                // remove from DOM after animation
                coin.obj.remove();
            });
            coins.splice(i, 1); // remove so that next time will not check it again
            onGetCoin()
        }
    }

    var player = $('#pac-man');
    for(var i = monsters.length-1; i >= 0; i--) {
        var monster = monsters[i];
        if(monster.x === x && monster.y === y) {
            onGetDamage();
        }
    }

    if(coins.length === 0)
      showVictory();
}

function onGetDamage() {
    life--;
    if(life <= 0) gameOver();
    $('#current-life').text(life);
    audioDamage.play();
}

function onGetCoin() {
    score += 10;
    $('#current-score').text(score);
    audioCoin.play();
}

function movePlayer(newX, newY) {
    var diffX = playerXY[0] - newX;
    var diffY = playerXY[1] - newY;

    if(!canMove(newX, newY)) return;
    moving = true;
    $('#pac-man').css({
        left: (newX*CELL_WIDTH)+'%',
        top: (newY*CELL_HEIGHT)+'%',
        width: CELL_WIDTH+'%',
        height: CELL_HEIGHT+'%',
    });
    playerXY = [newX, newY];
    afterPlayerMove(newX, newY);
    setTimeout(function(){
        moving = false;
        if(keydown && !moving){
            movePlayer(newX - diffX, newY - diffY);
        }
    }, MOVE_DURATION);

}

function moveMonster(monster, x, y){
  if(!canMove(x, y)) return false;
    monster.obj.css({
      left: (x*CELL_WIDTH)+'%',
      top: (y*CELL_HEIGHT)+'%',
    });
    monster.x = x;
    monster.y = y;
    return true;
}
function getMonsterMove(){

    if (gameStarted) {
      for(var i = monsters.length-1; i >= 0; i--) {
          var monster = monsters[i];
          var diffX = monsters[i].x - playerXY[0];
          var diffY = monsters[i].y - playerXY[1];
          var moved = false;
          var num = Math.random();
          if(diffX > 0 && num >0.5){
            moved = moveMonster(monster, monster.x-1 , monster.y);
          }else if(diffX < 0){
            moved = moveMonster(monster, monster.x+1 , monster.y);
          }else if(diffY > 0 && num >0.3){
            moved = moveMonster(monster, monster.x , monster.y-1);
          }else{
            moved = moveMonster(monster, monster.x , monster.y+1);
          }
          if(!moved)
            randomMove(monster);
          if(monster.x === playerXY[0] && monster.y === playerXY[1]) {
              onGetDamage();
          }
      }
    }
    setTimeout(getMonsterMove, MONSTER_MOVE_DURATION);

}

function randomMove(monster) {
  if(!gameStarted) return;
  var num = Math.random();
  // console.log(num);
  if(num>0.7)
    moveMonster(monster, monster.x+1 , monster.y);
  else if (num>0.4 & num <0.7)
    moveMonster(monster, monster.x-1 , monster.y);
  else if (num>0.2 & num <0.4)
    moveMonster(monster, monster.x , monster.y -1);
  else
    moveMonster(monster, monster.x , monster.y+1);
}


$(function() {
    $("#start-button").click(function(){
        $("#game-screen").show();
        $("#start-screen").hide();
        afterShowGameScreen();
        audioStartScreen.pause();
    });

    audioStartScreen = document.createElement('audio');
    audioStartScreen.setAttribute('src', 'sound/background.mp3');
    audioStartScreen.play();
    audioStartScreen.addEventListener('ended', function() {
        this.play(); // repeat forever
    }, false);

});
