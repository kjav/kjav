
function tearDrop() {
  var raincontainer = document.getElementsByClassName("rain-container")[0];
  if (Math.random() < 0.02) {
    var drop = document.createElement("div");
    drop.classList.add("tear");
    drop.style.left = Math.random() * (window.innerWidth - 50) + "px";
    var duration = (2 + Math.random() * 1);
    drop.style["transition-duration"] = duration.toString() + "s";
    raincontainer.appendChild(drop);
    window.setTimeout(function() {
      drop.style.top = "105vh";
//      var drops = raincontainer.children;
//      for (var i = 0; i < drops.length; i++) {
//        if (drops[i].style.top != "105vh") {
//          drops[i].style.top = "105vh";
//        }
    }, 100);
    window.setTimeout(function() {
      raincontainer.removeChild(drop);
    }, duration * 1000 + 1100);

  }
  window.requestAnimationFrame(tearDrop);
}

window.requestAnimationFrame(tearDrop);
