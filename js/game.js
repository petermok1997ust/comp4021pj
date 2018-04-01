const NB_ROW = 16;
const NB_COL = 16;
const CELL_WIDTH = 100/NB_COL;
const CELL_HEIGHT = 100/NB_ROW;
const MOVE_DURATION = 150;

var keydown = false;
var maze = generateMaze();
var playerXY = [1,1];
var moving = false;

function generateMaze() {
    return [
        '#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#',
        '#','0','0','0','0','0','0','0','0','0','0','0','0','0','0','#',
        '#','0','0','0','0','0','0','0','0','0','0','0','0','0','0','#',
        '#','0','0','0','0','0','0','0','0','0','0','0','0','0','0','#',
        '#','0','0','0','0','0','0','0','0','0','0','0','0','0','0','#',
        '#','0','0','0','0','0','0','0','0','0','0','0','0','0','0','#',
        '#','0','0','0','0','0','0','0','0','0','0','0','0','0','0','#',
        '#','0','0','0','0','0','0','0','0','0','0','0','0','0','0','#',
        '#','0','0','0','0','0','0','0','0','0','0','0','0','0','0','#',
        '#','0','0','0','0','0','0','0','0','0','0','0','0','0','0','#',
        '#','0','0','0','0','0','0','0','0','0','0','0','0','0','0','#',
        '#','0','0','0','0','0','0','0','0','0','0','0','0','0','0','#',
        '#','0','0','0','0','0','0','0','0','0','0','0','0','0','0','#',
        '#','0','0','0','0','0','0','0','0','0','0','0','0','0','0','#',
        '#','0','0','0','0','0','0','0','0','0','0','0','0','0','0','#',
        '#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#',
    ];
}

function afterPlayerMove(x, y) {
    if(keydown && !moving){
      movePlayer(x, y);
    }
      console.log(x, y);
}

function generateJQueryEle(type) {
    switch(type) {
        case '#':
            return $('<img src="img/block.svg"/>');
        case '0':
            return;
        case 'C':
            return $('<img id="pac-man" src="img/pac-man.svg"/>');
    }
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
                width: CELL_WIDTH+'%',
                height: CELL_HEIGHT+'%',
            });
            mazeDiv.append(ele);
        }
    }

    // place the player
    var [x, y] = playerXY;
    var ele = generateJQueryEle('C');
    ele.css({
        left: (x*CELL_WIDTH)+'%',
        top: (y*CELL_HEIGHT)+'%',
        width: CELL_WIDTH+'%',
        height: CELL_HEIGHT+'%',
    });
    mazeDiv.append(ele);
}

function afterShowGameScreen() {
    addElementToMap(maze);
}

function canMove(x, y) {
    if(x < 0 || y < 0 || x >= NB_COL || y >= NB_ROW) return false;
    return maze[NB_COL*y+x] !== '#';
}

function movePlayer(newX, newY) {
    var diff_x = playerXY[0] - newX;
    var diff_y = playerXY[1] - newY;
      if(!canMove(newX, newY)) return;
      moving = true;
      $('#pac-man').css({
          left: (newX*CELL_WIDTH)+'%',
          top: (newY*CELL_HEIGHT)+'%',
          width: CELL_WIDTH+'%',
          height: CELL_HEIGHT+'%',
      }, MOVE_DURATION);
      playerXY = [newX, newY];
      setTimeout(function(){
        moving = false;
        afterPlayerMove(newX - diff_x, newY - diff_y);
      }, MOVE_DURATION);

}

$(function() {
    $("#start-button").click(function(){
        $("#game-screen").show();
        $("#start-screen").hide();
        afterShowGameScreen();
    });

    $(document).keydown(function(e) {
        var curPos = $('#pac-man').position();
        if(!keydown && ! moving){
          keydown = true;
          console.log("keydown");
          switch(e.keyCode) {
              case 37: // left
                  movePlayer(playerXY[0]-1, playerXY[1]);
                  return false;
              case 38: // up
                  movePlayer(playerXY[0], playerXY[1]-1);
                  return false;
              case 39: // right
                  movePlayer(playerXY[0]+1, playerXY[1]);
                  return false;
              case 40: // down
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
});
