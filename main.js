(function() {
	var background_video_player = document.getElementById('background_video_player');
	var background_video_toggle = document.getElementById('background_video_toggle');
	var background_music_player = document.getElementById('background_music_player');
	var background_music_toggle = document.getElementById('background_music_toggle');
	var display = localStorage.getItem('background_video_display');
	if (display == null) { display = 'none'; }
	var muted = localStorage.getItem('background_music_muted');
	if (muted == null) { muted = true; } else { muted = JSON.parse(muted); }
	var time = localStorage.getItem('background_music_time');
	if (time == null) { time = 0; }
	background_video_player.style.display = display;
	background_music_player.muted = muted;
	background_music_player.currentTime = time;
	background_music_toggle.onclick = function() {
		background_music_player.muted = !background_music_player.muted;
	}
	background_video_toggle.onclick = function() {
		var display = background_video_player.style.display;
		if (display == 'none') {
			background_video_player.style.display = 'inline';
		} else {
			background_video_player.style.display = 'none';
		}
	}
	window.onbeforeunload = function() {
		localStorage.setItem('background_video_display', background_video_player.style.display);
		localStorage.setItem('background_music_time', background_music_player.currentTime);
		localStorage.setItem('background_music_muted', background_music_player.muted);
	}
})();


