(function() {
	var blog_entries = [
		[ "01_01_2019.txt", "January 1, 2019" ],
		[ "12_31_2018.txt", "December 31, 2018" ],
		[ "12_19_2018.txt", "December 19, 2018" ]
	];
	var html_elements = {};
	var local_storage = {};
	html_elements.background_music_player = document.getElementById("background_music_player");
	html_elements.background_video_player = document.getElementById("background_video_player");
	html_elements.toggle_background_music = document.getElementById("toggle_background_music");
	html_elements.toggle_background_video = document.getElementById("toggle_background_video");
	html_elements.go_to_index = document.getElementById("go_to_index");
	html_elements.main = document.getElementById("main");
	local_storage.background_music_enabled = localStorage.getItem("background_music_enabled");
	if (local_storage.background_music_enabled == null) {
		local_storage.background_music_enabled = false;
	} else {
		local_storage.background_music_enabled = (local_storage.background_music_enabled == "true");
	}
	local_storage.background_video_enabled = localStorage.getItem("background_video_enabled");
	if (local_storage.background_video_enabled == null) {
		local_storage.background_video_enabled = false;
	} else {
		local_storage.background_video_enabled = (local_storage.background_video_enabled == "true");
	}
	local_storage.background_music_time = localStorage.getItem("background_music_time");
	if (local_storage.background_music_time == null) {
		local_storage.background_music_time = 0.0;
	} else {
		local_storage.background_music_time = Number(local_storage.background_music_time);
	}
	function clear_main() {
		while (html_elements.main.firstChild) {
			html_elements.main.removeChild(html_elements.main.firstChild);
		}
	}
	var index_fragment = document.createDocumentFragment();
	(function() {
		var title = document.createElement("h1");
		title.appendChild(document.createTextNode("Entries"));
		var list = document.createElement("ul");
		list.style.listStyleType = "none";
		list.style.textAlign = "center";
		blog_entries.forEach(function(e) {
			var item = document.createElement("li");
			var link = document.createElement("a");
			var text = document.createTextNode(e[1]);
			link.appendChild(text);
			link.href = "#!";
			link.dataset.file = e[0];	
			item.appendChild(link);
			list.appendChild(item);
		});
		index_fragment.appendChild(title);
		index_fragment.appendChild(list);
	})();
	function set_background_music(bool) {
		if (bool) {
			html_elements.background_music_player.preload = "auto";
			html_elements.background_music_player.autoplay = true;
			html_elements.background_music_player.loop = true;
			html_elements.background_music_player.muted = false;
			html_elements.background_music_player.currentTime = local_storage.background_music_time;
			html_elements.background_music_player.play();
			html_elements.toggle_background_music.textContent = "Disable background music";
		} else {
			html_elements.background_music_player.pause();
			html_elements.background_music_player.preload = "none";
			html_elements.background_music_player.autoplay = false;
			html_elements.background_music_player.loop = false;
			local_storage.background_music_time = html_elements.background_music_player.currentTime;
			html_elements.background_music_player.muted = true;
			html_elements.toggle_background_music.textContent = "Enable background music";
		}
	}
	html_elements.toggle_background_music.onclick = function() {
		set_background_music(local_storage.background_music_enabled = !local_storage.background_music_enabled);
	}
	function set_background_video(bool) {
		if (bool) {
			html_elements.background_video_player.preload = "auto";
			html_elements.background_video_player.autoplay = true;
			html_elements.background_video_player.loop = true;
			html_elements.background_video_player.play();
			html_elements.background_video_player.style.display = "inline";
			html_elements.toggle_background_video.textContent = "Disable background video";
		} else {
			html_elements.background_video_player.pause();
			html_elements.background_video_player.preload = "none";
			html_elements.background_video_player.autoplay = false;
			html_elements.background_video_player.loop = false;
			html_elements.background_video_player.style.display = "none";
			html_elements.toggle_background_video.textContent = "Enable background video";
		}
	}
	html_elements.toggle_background_video.onclick = function() {
		set_background_video(local_storage.background_video_enabled = !local_storage.background_video_enabled);
	}
	function open_entry(file) {
		var request = new XMLHttpRequest();
		request.open("GET", file, true);
		request.responseType = "text";
		request.onreadystatechange = function() {
			if (request.readyState == 4 && request.status == 200) {
				clear_main();
				html_elements.main.innerHTML = request.response;
				window.location.hash = file;
			}
		}
		request.send();
	}
	html_elements.go_to_index.onclick = function() {
		clear_main();
		var fragment = index_fragment.cloneNode(true);
		fragment.lastChild.childNodes.forEach(function(item) {
			item.firstChild.onclick = function() {
				open_entry(item.firstChild.dataset.file);
				return false;
			}
		});
		html_elements.main.appendChild(fragment);
		return false;
	}
	window.onbeforeunload = function() {
		localStorage.setItem("background_music_enabled", String(local_storage.background_music_enabled));
		localStorage.setItem("background_video_enabled", String(local_storage.background_video_enabled));
		localStorage.setItem("background_music_time", String(local_storage.background_music_time));
	}
	set_background_music(local_storage.background_music_enabled);
	set_background_video(local_storage.background_video_enabled);
	if (window.location.hash.length != 0 && window.location.hash != "#!") {
		open_entry(window.location.hash.substr(1));
	} else {
		html_elements.go_to_index.onclick();
	}
})();


