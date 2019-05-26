(function() {
	var html_elements = {};
	var local_storage = {};
	html_elements.root = document.documentElement;
	html_elements.background_video_player = document.getElementById("background_video_player");
	html_elements.toggle_background_video = document.getElementById("toggle_background_video");
	html_elements.toggle_theme = document.getElementById("toggle_theme");
	html_elements.blog_title = document.getElementById("blog_title");
	html_elements.main = document.getElementById("main");
	local_storage.background_video_enabled = localStorage.getItem("background_video_enabled");
	if (local_storage.background_video_enabled == null) {
		local_storage.background_video_enabled = true;
	} else {
		local_storage.background_video_enabled = (local_storage.background_video_enabled == "true");
	}
	local_storage.theme = localStorage.getItem("theme");
	if (local_storage.theme == null) {
		local_storage.theme = "Dark";
	}
	function clear_main() {
		while (html_elements.main.lastChild) {
			html_elements.main.removeChild(html_elements.main.lastChild);
		}
	}
	function set_background_video(bool) {
		if (bool) {
			html_elements.background_video_player.autoplay = true;
			html_elements.background_video_player.loop = true;
			html_elements.background_video_player.play();
			html_elements.background_video_player.style.display = "inline";
			html_elements.toggle_background_video.firstChild.nodeValue = "Disable background video";
		} else {
			html_elements.background_video_player.pause();
			html_elements.background_video_player.autoplay = false;
			html_elements.background_video_player.loop = false;
			html_elements.background_video_player.style.display = "none";
			html_elements.toggle_background_video.firstChild.nodeValue = "Enable background video";
		}
		local_storage.background_video_enabled = bool;
	}
	function set_theme(theme) {
		if (theme == "Light") {
			html_elements.root.style.setProperty("--body-foreground-color", "#222");
			html_elements.root.style.setProperty("--body-background-color", "#dfdfdf");
			html_elements.root.style.setProperty("--main-foreground-color", "#222");
			html_elements.root.style.setProperty("--main-background-color", "#dfdfdf");
			html_elements.root.style.setProperty("--accent-color", "Black");
			html_elements.toggle_theme.firstChild.nodeValue = "Enable Dark theme";
			local_storage.theme = "Light";
		} else {
			html_elements.root.style.setProperty("--body-foreground-color", "#aaa");
			html_elements.root.style.setProperty("--body-background-color", "Black");
			html_elements.root.style.setProperty("--main-foreground-color", "#aaa");
			html_elements.root.style.setProperty("--main-background-color", "Black");
			html_elements.root.style.setProperty("--accent-color", "DarkRed");
			html_elements.toggle_theme.firstChild.nodeValue = "Enable Light theme";
			local_storage.theme = "Dark";
		}
	}
	function goto_entry(file) {
		var request = new XMLHttpRequest();
		request.open("GET", file, true);
		request.responseType = "text";
		request.onreadystatechange = function() {
			if (request.readyState == 4 && request.status == 200) {
				var fragment = document.createDocumentFragment();
				var article = document.createElement("article");
				article.innerHTML = request.response;
				fragment.appendChild(article);
				clear_main();
				html_elements.main.appendChild(fragment);
				window.location.hash = file;
				window.scrollTo(0,0);
			}
		}
		request.send();
	}
	function goto_index() {
		var request = new XMLHttpRequest();
		request.open("GET", "entries.json", true);
		request.responseType = "json";
		request.onreadystatechange = function() {
			if (request.readyState == 4 && request.status == 200) {
				var fragment = document.createDocumentFragment();
				var list = document.createElement("div");
				list.className = "index";
				request.response.forEach(function(e) {
					var item = document.createElement("div");
					item.className = "entry";
					var link = document.createElement("a");
					var text = document.createTextNode(e[2]);
					link.appendChild(text);
					link.href = "#!";
					link.dataset.file = e[0];
					link.onclick = function() {
						goto_entry(e[0]);
						return false;
					}
					/*link.style.marginLeft = "3em";*/
					item.appendChild(document.createTextNode(e[1] + ":"));
					item.appendChild(document.createElement("br"));
					item.appendChild(link);
					list.appendChild(item);
				});
				fragment.appendChild(list);
				clear_main();
				html_elements.main.appendChild(fragment);
				window.location.hash = "";
			}
		};
		request.send();
	}
	function refresh() {
		if (window.location.hash.length != 0 && window.location.hash != "#!") {
			goto_entry(window.location.hash.substr(1));
		} else {
			goto_index();
		}
	}
	html_elements.toggle_background_video.onclick = function() {
		set_background_video(!local_storage.background_video_enabled);
		return false;
	}
	html_elements.toggle_theme.onclick = function() {
		if (local_storage.theme == "Dark") {
			set_theme("Light");
		} else {
			set_theme("Dark");
		}
		return false;
	}
	html_elements.blog_title.onclick = function() {
		goto_index();
		return false;
	}
	window.onbeforeunload = function() {
		localStorage.setItem("background_video_enabled", String(local_storage.background_video_enabled));
		localStorage.setItem("theme", local_storage.theme);
	}
	window.onhashchange = function() {
		refresh();
	}
	set_background_video(local_storage.background_video_enabled);
	set_theme(local_storage.theme);
	refresh();
})();


