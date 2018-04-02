const NB_ROW = 20;
const NB_COL = 25;
const CELL_WIDTH = 100/NB_COL;
const CELL_HEIGHT = 100/NB_ROW;
const MOVE_DURATION = 150;
const MONSTER_MOVE_DURATION = 1000;
const NUM_MONSTER = 5;
const LOST_TEXT = "YOU ARE LOST";
const VICTORY_TEXT = "YOU WIN!";
const ULTRA_MODE_TIME = 10*1000;//10 second
const REBORN_TIME = 10*1000;//10 second
const NB_PILL = 3;

var keydown = false;
var maze;
var monsters = [];
var coins = [];
var pills = [];
var playerXY = [1, 1];
var moving = false;
var life = 3;
var time = 120;
var score = 0;
var countDownTaskId;
var monsterMoveTaskId;
var ultraMode = false;
var ultraTimeout;
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

function setCellFree(x, y) {
  maze[y*NB_COL+x] = '0';
}

function getFreeCells() {
  var free = [];
  for(var x = 0; x < NB_COL; x++) {
    for(var y = 0; y < NB_ROW; y++) {
      if(!occupied(x, y)) free.push([x, y]);
    }
  }
  return free;
}

function occupied(x, y) {
  return maze[y*NB_COL+x] !== '0';
}

function generateJQueryEle(type) {
  var ele;
  switch(type) {
    case '#':
      ele = $('<img class="svg" src="img/block.svg"/>');
      break;
    case 'P':
      ele = $('<img id="pac-man" class="svg" src="img/pac-man.svg"/>');
      break;
    case 'M':
      ele = $('<img class="ghost svg" src="img/ghost.svg"/>');
      break;
    case 'C':
      ele = $('<img class="svg coin" src="img/coin.svg"/>');
      break;
    case 'S':
      ele = $('<img class="svg pill" src="img/pill.svg"/>');
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

function generatePills() {
  var pills = [];
  var freeCells = getFreeCells();
  for(var i = 0; i < NB_PILL; i++) {
    var idx = Math.floor(Math.random() * freeCells.length);
    var [x, y] = freeCells[idx];
    var ele = generateJQueryEle('S');
    ele.css({
      left: (x*CELL_WIDTH)+'%',
      top: (y*CELL_HEIGHT)+'%'
    });
    pills.push({
      x: x,
      y: y,
      obj: ele
    });
    maze[y*NB_COL+x] = 'S';
    freeCells.splice(idx, 1);
  }
  return pills;
}

function generateCoins() {
  var coins = [];
  while(coins.length <= 0) { // make sure there is at least some coins
    for(var y = 0; y < NB_ROW; y++) {
      for(var x = 0; x < NB_COL; x++) {
        // if(coins.length >= 20) return coins;
        if(!occupied(x, y) && Math.random() < 0.3) { // 30% to place a coin here
          var ele = generateJQueryEle('C');
          ele.css({
            left: (x*CELL_WIDTH)+'%',
            top: (y*CELL_HEIGHT)+'%'
          });
          coins.push({
            x: x,
            y: y,
            obj: ele
          });
          maze[y*NB_COL+x] = 'C';
        }
      }
    }
  }
  return coins;
}

function generateMonsters() {
  var monsters = [];
  var freeCells = getFreeCells();
  for(var i = 0; i < NUM_MONSTER; i++) {
    var idx = Math.floor(Math.random()*freeCells.length);
    var [x, y] = freeCells[idx];
    var ele = generateJQueryEle('M');
    var color = getRandomColor();
    ele.css({
      left: (x*CELL_WIDTH)+'%',
      top: (y*CELL_HEIGHT)+'%'
    });
    monsters.push({
      x: x,
      y: y,
      obj: ele,
      attack:true
    });
    freeCells.splice(idx, 1);
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

  // place coins
  coins = generateCoins();
  for(var c of coins) {
    mazeDiv.append(c.obj);
  }

  pills = generatePills();
  for(var p of pills) {
    mazeDiv.append(p.obj);
  }

  // place monster
  monsters = generateMonsters();
  for(var m of monsters) {
    mazeDiv.append(m.obj);
  }

  // place the player
  var [x, y] = playerXY;
  var ele = generateJQueryEle('P');
  ele.css({
    left: (x*CELL_WIDTH)+'%',
    top: (y*CELL_HEIGHT)+'%',
  });
  mazeDiv.append(ele);
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
    clearTimeout(monsterMoveTaskId);
    $(document).off('keydown');
    $("#result-win").text(LOST_TEXT);
    $("#result-score").text(score);
    $("#game-result").show(MOVE_DURATION);
    audioLose.play();
}

function showVictory() {
    clearInterval(countDownTaskId);
    clearTimeout(monsterMoveTaskId);
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
  maze = generateMaze();
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
    if(keydown) keydown = false;
  });
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
      coin.obj.animate({ top: ((coin.y-1)*CELL_HEIGHT)+'%' }, 1000)
      .delay(MOVE_DURATION)
      .animate({ opacity: 0 }, 500);
      coins.splice(i, 1); // remove so that next time will not be check again
      setCellFree(x, y);
      onGetCoin();
    }
  }

  var player = $('#pac-man');
  for(var i = monsters.length-1; i >= 0; i--) {
    var monster = monsters[i];
    if(monster.x === x && monster.y === y && monster.attack == true) {
      if(ultraMode) getKilled(monster);
      else onGetDamage();
    }
  }

  for(var i = pills.length-1; i >= 0; i--) {
    var pill = pills[i];
    if(pill.x === x && pill.y === y) {
      console.log("hi");
      clearTimeout(ultraTimeout);
      pill.obj.animate({ top: ((y-1)*CELL_HEIGHT)+'%' }, 1000)
      .delay(MOVE_DURATION)
      .css({ display:"none" }, 500);
      pills.splice(i, 1);
      ultraMode = true;
      for(var i = monsters.length-1; i >= 0; i--) {
        var monster = monsters[i];
        monster.obj.css({
          'background-color': 'blue'
        });
      }

      ultraTimeout = setTimeout(function(){
        ultraMode = false;
        for(var i = monsters.length-1; i >= 0; i--) {
          var monster = monsters[i];
          monster.obj.css({
            'background-color':""
          });
        }
      }, ULTRA_MODE_TIME);

      setCellFree(pill.x, pill.y);
    }
  }

  if(coins.length <= 0) showVictory();
}

function getKilled(monster){
  var temp_x = monster.x;
  var temp_y = monster.y;
  monster.obj.animate({ top: ((monster.y-1)*CELL_HEIGHT)+'%' }, 1000)
  .delay(MOVE_DURATION)
  .animate({ opacity: 0 }, 500, function() {
    monster.attack = false;
  });
  setTimeout(function(){
    monster.obj.css({
      'opacity':'1' ,
    });
    monster.attack = true;
  }, REBORN_TIME);
}

function onGetDamage() {
  if(!ultraMode & life>0){
    life--;
    if(life <= 0) gameOver();
    $('#current-life').text(life);
    audioDamage.play();
  }
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
  for(var i = monsters.length-1; i >= 0; i--) {
      var monster = monsters[i];
      var diffX = monsters[i].x - playerXY[0];
      var diffY = monsters[i].y - playerXY[1];
      var moved = false;
      var num = Math.random();
      if(diffX > 0 && num >0.5){
          moved = moveMonster(monster, monster.x-1 , monster.y);
      } else if(diffX < 0){
          moved = moveMonster(monster, monster.x+1 , monster.y);
      } else if(diffY > 0 && num >0.3){
          moved = moveMonster(monster, monster.x , monster.y-1);
      } else{
          moved = moveMonster(monster, monster.x , monster.y+1);
      }
      if(!moved) randomMove(monster);
      if(monster.x === playerXY[0] && monster.y === playerXY[1] && monster.attack == true) {
          if(ultraMode)
              getKilled(monster);
          else
              onGetDamage();
      }
  }
  monsterMoveTaskId = setTimeout(getMonsterMove, MONSTER_MOVE_DURATION);
}

function randomMove(monster) {
  var num = Math.random();
  // console.log(num);
  if(num>0.7) moveMonster(monster, monster.x+1 , monster.y);
  else if (num>0.4 & num <0.7) moveMonster(monster, monster.x-1 , monster.y);
  else if (num>0.2 & num <0.4) moveMonster(monster, monster.x , monster.y -1);
  else moveMonster(monster, monster.x , monster.y+1);
}

function onGetCoin() {
  score += 10;
  $('#current-score').text(score);
  audioCoin.play();
}

function restart() {
    monsters = [];
    coins = [];
    pills = [];
    moving = false;
    keydown = false;
    life = 3;
    time = 120;
    score = 0;
    playerXY = [1, 1];
    $('#maze').empty();
    afterShowGameScreen();
    $("#game-result").hide();
}

$(function() {
    $("#start-button").click(function(){
        $("#game-screen").show();
        $("#start-screen").hide();
        afterShowGameScreen();
        audioStartScreen.pause();
    });

    $('#restart').click(restart);

    audioStartScreen = document.createElement('audio');
    audioStartScreen.setAttribute('src', 'sound/background.mp3');
    audioStartScreen.play();
    audioStartScreen.addEventListener('ended', function() {
        this.play(); // repeat forever
    }, false);

});
