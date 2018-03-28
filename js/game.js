$(function() {
    $("#start-button").click(function(){
        $("#game-screen").show();
        $("#start-screen").hide();
    });
    $("#objective-button").click(function(){
        $("#instruction-canvas").show(500);
    });
    $("#close-instruction").click(function(){
        $("#instruction-canvas").hide(500);
    });


});
