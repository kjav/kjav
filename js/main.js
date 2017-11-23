onloads.push(function() {
  var softwares = document.getElementsByClassName("software");
  var white_software, black_software;
  for (var i = 0; i < softwares.length; i++) {
    if (softwares[i].classList.contains("is-white")) {
      white_software = softwares[i];
    } else if (softwares[i].classList.contains("is-black")) {
      black_software = softwares[i];
    }
  }
  white_software.style["margin-top"] = "-" + black_software.getClientRects()[0].height + "px";
});

window.onload = function() {
  for (var i = 0; i < onloads.length; i++) {
    onloads[i]()
  }
}
