(function() {
	var html_elements = {};
	var local_storage = {};
	html_elements.background_video_player = document.getElementById("background_video_player");
	html_elements.toggle_background_video = document.getElementById("toggle_background_video");
	html_elements.go_to_index = document.getElementById("go_to_index");
	html_elements.main = document.getElementById("main");
	local_storage.background_video_enabled = localStorage.getItem("background_video_enabled");
	if (local_storage.background_video_enabled == null) {
		local_storage.background_video_enabled = true;
	} else {
		local_storage.background_video_enabled = (local_storage.background_video_enabled == "true");
	}
	function clear_main() {
		while (html_elements.main.firstChild) {
			html_elements.main.removeChild(html_elements.main.firstChild);
		}
	}
	function set_background_video(bool) {
		if (bool) {
			html_elements.background_video_player.autoplay = true;
			html_elements.background_video_player.loop = true;
			html_elements.background_video_player.play();
			html_elements.background_video_player.style.display = "inline";
			html_elements.toggle_background_video.textContent = "Disable background video";
		} else {
			html_elements.background_video_player.pause();
			html_elements.background_video_player.autoplay = false;
			html_elements.background_video_player.loop = false;
			html_elements.background_video_player.style.display = "none";
			html_elements.toggle_background_video.textContent = "Enable background video";
		}
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
	html_elements.toggle_background_video.onclick = function() {
		set_background_video(local_storage.background_video_enabled = !local_storage.background_video_enabled);
		return false;
	}
	html_elements.go_to_index.onclick = function() {
		clear_main();
		var request = new XMLHttpRequest();
		request.open("GET", "entries.json", true);
		request.responseType = "json";
		request.onreadystatechange = function() {
			if (request.readyState == 4 && request.status == 200) {
				var fragment = document.createDocumentFragment();
				var list = document.createElement("ul");
				list.style.listStyleType = "none";
				list.style.textAlign = "left";
				request.response.forEach(function(e) {
					var item = document.createElement("li");
					var link = document.createElement("a");
					var text = document.createTextNode(e[2]);
					link.appendChild(text);
					link.href = "#!";
					link.dataset.file = e[0];
					link.onclick = function() {
						open_entry(e[0]);
						return false;
					}
					link.style.marginLeft = "3em";
					item.appendChild(document.createTextNode(e[1] + ":"));
					item.appendChild(document.createElement("br"));
					item.appendChild(link);
					list.appendChild(item);
				});
				fragment.appendChild(list);
				html_elements.main.appendChild(fragment);
				window.location.hash = "";
			}
		};
		request.send();
		return false;
	}
	window.onbeforeunload = function() {
		localStorage.setItem("background_video_enabled", String(local_storage.background_video_enabled));
	}
	set_background_video(local_storage.background_video_enabled);
	if (window.location.hash.length != 0 && window.location.hash != "#!") {
		open_entry(window.location.hash.substr(1));
	} else {
		html_elements.go_to_index.onclick();
	}
})();


