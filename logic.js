$(document).ready(function() {
  var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  if(!isChrome) {
    alert('Please, use Chrome.')
    return;
  }

  var clientId = '9d3c014547458c9f9a3c8d4056ed4b74';

  var audio = new Audio();
  audio.crossOrigin = 'anonymous';

  var context = new AudioContext();

  SC.initialize({
    client_id: clientId
  });

  var playTrack = function(search) {
    SC.get('/tracks', {
      q: search
    }).then(function(tracks) {
      if(tracks.length == 0) {
        alert('Nothing was found. Maybe you\'re looking for something else?');
        return;
      }

      location.hash = search;

      var topTrack = null;
      var topPlayLikesRatio = 0;

      for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i];

        var playLikesRatio = track.likes_count / track.playback_count;
        if(playLikesRatio > topPlayLikesRatio) {
          topPlayLikesRatio = playLikesRatio;
          topTrack = track;
        }
      }

      var singer = $('.footer__singer');
      singer.attr('href', topTrack.permalink_url);
      singer.text(' | Title: ' + topTrack.title + '. L\\P: ' + topPlayLikesRatio + '.')
      singer.show();

      var backgroundImageUrl = topTrack.artwork_url || 'https://unsplash.it/100';

      var backgroundImage = new Image();
      backgroundImage.src = backgroundImageUrl;

      if(audio && audio.src) {
        audio.pause();

        delete audio;
      }

      audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.src = topTrack.stream_url + '?client_id=' + clientId;

      var analyser = context.createAnalyser();
      var canvas = $('#content__analyser');
      var canvasContext = canvas[0].getContext('2d');
      var source = context.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(context.destination);

      audio.play();

      animateSong();

      function animateSong(){
        window.requestAnimationFrame(animateSong);
        fbc_array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(fbc_array);
        canvasContext.clearRect(0, 0, canvas.width(), canvas.height());

        bars = 100;
        for (var i = 0; i < bars; i++) {
          bar_x = i * 3;
          bar_width = window.innerWidth / bars;
          bar_height = (fbc_array[i] / 2);

          canvasContext.drawImage(backgroundImage, bar_x, 0, bar_width, bar_height);
        }
      }
    });
  };

  $('.content__search').keypress(function(e){
    var self = this;

    var code = e.KeyCode || e.which;

    if(code == 13) {
      playTrack(self.value);
    }
  });

  if(location.hash) {
    var track = location.hash.replace('#', '');

    playTrack(track);
    $('.content__search').val(track);
  }
});
