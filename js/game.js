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
            return $('<img class="svg" src="img/block.svg"/>');
        case '0':
            return;
        case 'C':
            return $('<img id="pac-man" class="svg" src="img/pac-man.svg"/>');
        case 'M':
            return $('<img class="ghost svg" src="img/ghost.svg"/>');
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

    // place monster
    for(var i = 0; i<NUM_MONSTER;i++){
      var [x, y] = monsterXY;
      var ele = generateJQueryEle('M');
      var color = getRandomColor();
      console.log(color);
      ele.css({
          left: ((x+i)*CELL_WIDTH)+'%',
          top: ((y+i)*CELL_HEIGHT)+'%',
          width: CELL_WIDTH+'%',
          height: CELL_HEIGHT+'%',
          background:color
      });
      mazeDiv.append(ele);
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
      });
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
