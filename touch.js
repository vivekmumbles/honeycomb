
function handleStart(evt) {
    var sqr = document.getElementById("square");
    color = sqr.style.backgroundColor;
    sqr.style.backgroundColor = color === "red" ? "green" : "red";
    console.log("clicking")
}

var init = function() {
    var sqr = document.getElementById("square");
    sqr.style.marginTop = window.innerHeight/2 - 100 + "px";
    sqr.style.marginLeft = window.innerWidth/2 - 100 + "px";
    sqr.style.backgroundColor = "red";
    sqr.addEventListener("touchstart", handleStart, false);
    sqr.onclick = handleStart;
}

window.onload = window.onresize = init;
