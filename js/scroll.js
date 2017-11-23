var SCROLL_THRESHOLD = 100;

var sections = ["software"];
var section_elements = [];

var onloads = [];

window.onscroll = function() {
  for (var i = section_elements.length - 1; i >= 0; i--) {
    if (section_elements[i].getBoundingClientRect().top < SCROLL_THRESHOLD) {
      section_elements[i].parentElement.classList.add("scrolled");
      section_elements.splice(i, 1);
      sections.splice(i, 1);
    }
  }
}

onloads.push(function() {
  console.log(section_elements);
  for (var i = 0; i < sections.length; i++) {
    section_elements.push(document.getElementsByName(sections[i])[0]);
  }
  window.onscroll();
});
