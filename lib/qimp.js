var sounds = {};
//sounds['imps/full songs/Geraldine.m4a'] = new Audio("imps/full songs/Geraldine.m4a");
//sounds['imps/shorts/Jump Around (Short).mp3'] = new Audio("imps/shorts/Jump Around (Short).mp3");

function getSound(arg) {
  if (typeof arg === "string") {
    if (!sounds[arg])
      sounds[arg] = new Audio(arg);
    return sounds[arg];
  }
  return arg;
}

function play(arg) {
  var sound = getSound(arg);
  sound.play();
  analyze(sound, document.getElementById('canvas'));
}

function stop(arg) {
  var sound = getSound(arg);
  sound.pause();
}

function analyze(arg) {
  var audio = getSound(arg);
  if (!audio.audioSrc)
    audio.audioSrc = audioCtx.createMediaElementSource(audio);

  audioSrc = audio.audioSrc;
  // we have to connect the MediaElementSource with the analyser 
  audioSrc.connect(analyser);
  // we could configure the analyser: e.g. analyser.fftSize (for further infos read the spec)
  // frequencyBinCount tells you how many values you'll receive from the analyser
}

var audioCtx = new AudioContext();
var analyser = audioCtx.createAnalyser();
analyser.connect(audioCtx.destination);
var frequencyData = new Uint8Array(analyser.frequencyBinCount);

var ctx = canvas.getContext('2d');

function smoother(data) {
  return function(x) {
    var n = (data.length * x) | 0;
    var y0 = (n-1 > 0) ? data[n-1] : data[n]/2;
    var y1 = data[n];
    var y2 = (n+1 < data.length) ? data[n+1] : data[n] / 2;
    var y3 = (n+2 < data.length) ? data[n+2] : data[n] / 2.66666666;
    return cubic(y0, y1, y2, y3, x * data.length - n);
  }
}

function cubic(y0, y1, y2, y3, x) {
  var d = y1;
  var b = (y0 + y2) / 2 - d;
  var a = (y3 - 2*y2 + d - 2*b) / 6;
  var c = y2 - d - b - a;
  return a*Math.pow(x, 3) + b*Math.pow(x, 2) + c*x + d;
}

function renderFrame() {
  canvas.width = window.innerWidth - 195;
  // update data in frequencyData
  analyser.getByteFrequencyData(frequencyData);
  // render frame based on values in frequencyData
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = document.fillStyle || '#1b1b1b' || randomColor();
  if (~playlist.current)
    ctx.fillRect(0, 0, (playlist.songs[playlist.current].currentTime / playlist.songs[playlist.current].duration) * canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(209, 0, 86, 0.5)';//#d10056';
  var f = smoother(frequencyData);
  var start = true;
  ctx.moveTo(i, canvas.height / 2 - 0.5);
  ctx.moveTo(i, canvas.height / 2 - 0.5);
  if (document.funk) {
    for (var i=0;i<canvas.width;i++) {
      ctx.strokeStyle = randomColor();
      ctx.beginPath();
      var sum = f((Math.pow(i / canvas.width, 0.7)) % 1);
      ctx.lineTo(i, canvas.height / 2 - 0.5 - Math.pow((1 + i / (canvas.width)) * sum / 40, 2.6));
      ctx.lineTo(i, canvas.height / 2 - 0.5 + Math.pow((1 + i / (canvas.width)) * sum / 40, 2.6));
      ctx.stroke();
    }
  } else {
    for (var i=0;i<canvas.width;i++) {
      var sum = f((Math.pow(i / canvas.width, 0.7)) % 1);
      ctx.lineTo(i, canvas.height / 2 - 0.5 - Math.pow((1 + i / (canvas.width)) * sum / 40, 2.6));
      ctx.lineTo(i, canvas.height / 2 - 0.5 + Math.pow((1 + i / (canvas.width)) * sum / 40, 2.6));
    }
    ctx.stroke();
  }
  requestAnimationFrame(renderFrame);
}

var playlist = {
  current: -1,
  songs: [],
  add: function(song) {
    if (!song.onplay)
      song.onplay = function() { if (playlist.onplay) playlist.onplay(); };
    if (!song.onpause)
      song.onpause = function() { if (playlist.onpause) playlist.onpause(); };
    if (!song.onended)
      song.onended = function() { if (playlist.onended) playlist.onended(); };
    playlist.songs.push(song);
    if (!~playlist.current) {
      playlist.current = playlist.songs.indexOf(song);
      song.tr.prevColor = song.tr.firstChild.style.color;
      song.tr.firstChild.style.color = 'white';
      song.volume = playlist.volume;
    }
  },
  play: function() {
    if (playlist.paused() && ~playlist.current) {
      playlist.songs[playlist.current].play();
      if (playlist.songs[playlist.current].tagName === "AUDIO")
        analyze(playlist.songs[playlist.current]);
      playlist.songs[playlist.current].volume = playlist.volume;
      return true;
    }
    return false;
  },
  pause: function() {
    if (playlist.playing()) {
      playlist.songs[playlist.current].pause();
      return true;
    }
    return false;
  },
  trigger: function() {
    if (playlist.playing())
      playlist.pause();
    else
      playlist.play();
  },
  stop: function() {
    if (~playlist.current) {
      if (playlist.playing())
        playlist.songs[playlist.current].pause();
      playlist.songs[playlist.current].currentTime = 0;
    }
  },
  next: function() {
    playlist.move(playlist.current + 1);
  },
  prev: function() {
    playlist.move(playlist.current - 1);
  },
  move: function(n) {
    if (~playlist.current && playlist.songs[(n + playlist.songs.length) % playlist.songs.length] !== undefined) {
      playlist.songs[playlist.current].tr.firstChild.style.color = playlist.songs[playlist.current].tr.prevColor;
 
      var current = playlist.current;
      var next = (n + playlist.songs.length) % playlist.songs.length;
      if (playlist.playing()) {
        playlist.pause();
        playlist.current = next;
        playlist.last = current;
        playlist.songs[next].currentTime = 0;
        playlist.play();
      } else {
        playlist.current = next;
        playlist.last = current;
        playlist.songs[next].currentTime = 0;
      }

      playlist.songs[playlist.current].volume = playlist.volume;
      playlist.songs[playlist.current].tr.prevColor = playlist.songs[playlist.current].tr.firstChild.style.color;
      playlist.songs[playlist.current].tr.firstChild.style.color = 'white';
    }
  },
  onplay: null,
  onpause: null,
  onended: function(stop) {
    playlist.next();
    console.log(playlist.playing());
    if (stop) {
      playlist.pause();
    } else {
      playlist.play();
    }
  },
  playing: function() { return ~playlist.current && !playlist.songs[playlist.current].paused; },
  paused: function() { return !~playlist.current || playlist.songs[playlist.current].paused; },
  changeVolume: function(v) {
    playlist.volume = v;
    if (~playlist.current)
      playlist.songs[playlist.current].volume = v;
  },
  seek: function(x) {
    console.log('x: ' + x);
    if (~playlist.current)
      playlist.songs[playlist.current].currentTime = playlist.songs[playlist.current].duration * x;
  },
  changeSong: function(song) {
    if (typeof(song) === "object")
      song = playlist.songs.indexOf(song);
    if (!(playlist.songs[song] === undefined))
      playlist.move(song);
  },
  remove: function(song) {
    if (typeof(song) === "object")
      song = playlist.songs.indexOf(song);
    if (playlist.songs.length < 2) {
      playlist.pause();
      playlist.current = -1;
    }
    if (playlist.current === song)
      playlist.next();
    if (~playlist.current) {
      for (var i = song; i < playlist.songs.length - 1; i++) {
        playlist.songs[i] = playlist.songs[i+1];
        playlist.songs[i].tr.children[0].innerHTML = (i + 1).toString() + '.' + playlist.songs[i].tr.children[0].innerHTML.split('.')[1];
      }
      playlist.songs[playlist.songs.length-2].tr.children[0].innerHTML = (playlist.songs.length - 1).toString() + '.' + playlist.songs[playlist.songs.length-2].tr.children[0].innerHTML.split('.')[1];
    }
    playlist.songs.pop();
    if (playlist.current > song)
      playlist.current--;
  }
};

function addSong(uri, name) {
  var sound = getSound(uri);

  var tr = document.createElement('tr');
  var title = document.createElement('td');
  title.innerHTML = (playlist.songs.length+1).toString() + ". " + name;
  tr.appendChild(title);
  var duration = document.createElement('td');
  sound.ondurationchange = function() {
    duration.innerHTML = sound.duration.fromSeconds(true);
  };
  tr.appendChild(duration);
  var minimise = document.createElement('td');
  minimise.innerHTML = '-';
  minimise.style.textAlign = 'center';
  minimise.onclick = function() {
    songs.removeChild(tr);
    playlist.remove(sound);
  };
  tr.appendChild(minimise);
  songs.insertBefore(tr, songs.children[songs.children.length - 1]);
  sound.tr = tr;
  tr.sound = sound;

  tr.ondblclick = function() {
    playlist.changeSong(sound);
  }

  playlist.add(sound);
}

var prevbuttonsvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
prevbuttonsvg.id = 'prev';
prevbuttonsvg.setAttribute('width', 60);
prevbuttonsvg.setAttribute('height', 60);
topbar.insertBefore(prevbuttonsvg, topbar.firstChild);

var nextbuttonsvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
nextbuttonsvg.id = 'next';
nextbuttonsvg.setAttribute('width', 60);
nextbuttonsvg.setAttribute('height', 60);
topbar.insertBefore(nextbuttonsvg, topbar.firstChild);

var buttonsvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
buttonsvg.id = 'play';
buttonsvg.setAttribute('width', 60);
buttonsvg.setAttribute('height', 60);
topbar.insertBefore(buttonsvg, topbar.firstChild);

var s = Snap("#play");
  var tpts  = [30, 15, 30, 45, 10, 60, 10, 00, 30, 15, 30, 15, 50, 30, 50, 30, 30, 45, 30, 15, 30, 45];
  var sqpts = [27, 00, 27, 60, 10, 60, 10, 00, 27, 00, 28, 00, 50, 00, 50, 60, 33, 60, 33, 00, 27, 00];
var button = s.polygon(tpts);
button.attr({
  fill: "#d10056",
  strokeWidth: 0
});
playlist.onplay = function() {
  button.animate({points: sqpts}, 120);
}
playlist.onpause = function() {
  button.animate({points: tpts}, 120);
}
buttonsvg.onclick = playlist.trigger;

var s2 = Snap("#next");
var tpts2  = [45, 30, 15, 50, 15, 50, 15, 10, 40, 30, 40, 10, 45, 10, 45, 50, 40, 50, 40, 30];
var button2 = s2.polygon(tpts2);
button2.attr({
  fill: "#d10056",
  strokeWidth: 0
});
nextbuttonsvg.onclick=playlist.next;

var s3 = Snap("#prev");
var tpts3  = [15, 30, 45, 50, 45, 50, 45, 10, 20, 30, 20, 10, 15, 10, 15, 50, 20, 50, 20, 30];
var button3 = s3.polygon(tpts3);
button3.attr({
  fill: "#d10056",
  strokeWidth: 0
});
prevbuttonsvg.onclick=playlist.prev;

playlist.changeVolume(volume.value);

volume.onchange = function() {
  playlist.changeVolume((Math.exp(volume.value) - 1) / (Math.exp(1) - 1));
}

canvas.onclick = canvas.ontouchstart = function(e) {
  if (~playlist.current)
    playlist.seek((e.offsetX || (e.touches[0].clientX - canvas.getBoundingClientRect().left)) / canvas.width);
}

function addFadeStopControl(time) {
  var sound = {
    pause: function() {
      sound.paused = true;
      if (sound.onpause) sound.onpause();
      if (sound.volumeInterval !== undefined) {
        clearInterval(sound.volumeInterval);
        playlist.songs[playlist.last].pause();
        sound.volumeInterval = undefined;
      }
    },
    play: function() {
      sound.paused = false;
      var now = +new Date();

      playlist.songs[playlist.last].play();

      sound.volumeInterval = setInterval(function() {
        if (+new Date() - now <= sound.duration * 1000) {
          sound.currentTime = (+new Date() - now) / 1000;
          playlist.songs[playlist.last].volume = Math.pow(1 - (+new Date() - now) / (1000 * sound.duration), 2) * playlist.volume;
        } else {
          clearInterval(sound.volumeInterval);
          playlist.songs[playlist.last].pause();
          if (sound.onended) sound.onended();
        }
      }, 16);
      if (sound.onplay) sound.onplay();
    },
    onended: function() {
      if (playlist.onended) playlist.onended(true);
    },
    paused: true,
    volume: 1,
    duration: time
  };

  var tr = document.createElement('tr');
  var title = document.createElement('td');
  title.innerHTML = (playlist.songs.length+1).toString() + ". Stop Cue (fade " + time + "s)";
  tr.appendChild(title);
  var duration = document.createElement('td');
  duration.innerHTML = time.fromSeconds();
  tr.appendChild(duration);
  var minimise = document.createElement('td');
  minimise.innerHTML = '-';
  minimise.style.textAlign = 'center';
  minimise.onclick = function() {
    songs.removeChild(tr);
    playlist.remove(sound);
  };
  tr.appendChild(minimise);
  songs.insertBefore(tr, songs.children[songs.children.length - 1]);
  sound.tr = tr;
  sound.tagName = "CONTROL";
  tr.sound = sound;

  tr.ondblclick = function() {
    playlist.changeSong(sound);
  }

  playlist.add(sound);  
}

renderFrame();

var prev = +new Date();
document.onkeydown = function(e) {
  if (+new Date() - prev < 140) return;
  prev = +new Date();
  if (e.keyCode === 32) {
    if (!playlist.playing())
      playlist.play();
    else
      playlist.next();
  } else if (e.keyCode === 37 || e.keyCode === 38)
    playlist.prev();
  else if (e.keyCode === 39 || e.keyCode === 40)
    playlist.next();
  else
    return;

  // Executed unless key not recognised
  e.preventDefault();
}
