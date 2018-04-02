const NB_ROW = 16;
const NB_COL = 16;
const CELL_WIDTH = 100/NB_COL;
const CELL_HEIGHT = 100/NB_ROW;
const MOVE_DURATION = 150;
const NUM_MONSTER = 5;

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

function occupied(x, y) {
    return maze[y*NB_COL+x] !== '0';
}

function generateCoins() {
    var coins = [];
    for(var i = 0; i < NB_ROW; i++) {
        for(var j = 0; j < NB_COL; j++) {
            if(!occupied(j, i)) {
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
                background: color
        });
        monsters.push({
            x: monsterX,
            y: monsterY,
            obj: ele
        });
        maze[monsterY*NB_COL+monsterX] = 'M';
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
}

function countDown() {
    time-=1;
    $('#current-time').text(time);
    if(time <= 0) {
        gameOver();
    }
}

function afterShowGameScreen() {
    addElementToMap(maze);

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
            coins.splice(i, 1);
            score += 10;
            $('#current-score').text(score);
        }
    }

    var player = $('#pac-man');
    for(var i = monsters.length-1; i >= 0; i--) {
        var monster = monsters[i];
        if(monster.x === x && monster.y === y) {
            onGetDamage();
        }
    }
}

function onGetDamage() {
    life--;
    if(life <= 0) gameOver();
    $('#current-life').text(life);
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

$(function() {
    $("#start-button").click(function(){
        $("#game-screen").show();
        $("#start-screen").hide();
        afterShowGameScreen();
    });
});

/*
 * Replace all SVG images with inline SVG
 */
jQuery('img.svg').each(function(){
    var $img = jQuery(this);
    var imgID = $img.attr('id');
    var imgClass = $img.attr('class');
    var imgURL = $img.attr('src');

    jQuery.get(imgURL, function(data) {
        // Get the SVG tag, ignore the rest
        var $svg = jQuery(data).find('svg');

        // Add replaced image's ID to the new SVG
        if(typeof imgID !== 'undefined') {
            $svg = $svg.attr('id', imgID);
        }
        // Add replaced image's classes to the new SVG
        if(typeof imgClass !== 'undefined') {
            $svg = $svg.attr('class', imgClass+' replaced-svg');
        }

        // Remove any invalid XML tags as per http://validator.w3.org
        $svg = $svg.removeAttr('xmlns:a');

        // Check if the viewport is set, if the viewport is not set the SVG wont't scale.
        if(!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
            $svg.attr('viewBox', '0 0 ' + $svg.attr('height') + ' ' + $svg.attr('width'))
        }

        // Replace image with new SVG
        $img.replaceWith($svg);

    }, 'xml');

});
