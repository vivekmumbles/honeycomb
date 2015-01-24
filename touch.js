
var center = function() {
    var sqr = document.getElementById("square");
    sqr.style.marginTop = window.innerHeight/2 - 100 + "px";
    sqr.style.marginLeft = window.innerWidth/2 - 100 + "px";
}

window.onload = window.onresize = center;
