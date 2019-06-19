(() => {
	window.addEventListener('DOMContentLoaded', (event) => {
		const title = document.getElementById('title');
		const content = document.getElementById('content');
		const loading_spinner_fragment = document.createDocumentFragment();
		let loading_spinner_timer;
		(() => {
			const b = document.createElement('b');
			b.appendChild(document.createTextNode('Loading'));
			const div = document.createElement('div');
			div.classList.add('loading-spinner');
			for (let i = 0; i < 4; ++i) {
				div.appendChild(document.createElement('div'));
			};
			loading_spinner_fragment.appendChild(b);
			loading_spinner_fragment.appendChild(document.createElement('br'));
			loading_spinner_fragment.appendChild(div);
		})();
		const clear_content = async () => {
			while (content.lastChild) {
				content.removeChild(content.lastChild);
			};
		};
		const display_loading_spinner_after = async (timeout) => {
			if (content.classList.contains('loading')) {
				return;
			};
			loading_spinner_timer = setTimeout(async () => {
				await clear_content();
				content.appendChild(loading_spinner_fragment);
			}, timeout);
			content.classList.add('loading');
		};
		const clear_loading_spinner = async () => {
			if (!content.classList.contains('loading')) {
				return;
			};
			clearTimeout(loading_spinner_timer);
			await clear_content();
			content.classList.remove('loading');
		}
		const navigate_index = async () => {
			clear_content();
			display_loading_spinner_after(300);
			fetch('entries.json').then(async (response) => {
				if (response.ok) {
					json = await response.json();
					const fragment = document.createDocumentFragment();
					const ul = document.createElement('ul');
					ul.style.margin = '0';
					ul.style.padding = '0';
					ul.style.listStyleType = 'none';
					json.forEach((e) => {
						const li = document.createElement('li');
						const a = document.createElement('a');
						a.href = '#' + e[0];
						a.appendChild(document.createTextNode(e[1] + ': ' + e[2]));
						li.appendChild(a);
						ul.appendChild(li);
					});
					fragment.appendChild(ul);
					await clear_loading_spinner();
					content.appendChild(fragment);
					location.hash = '';
					scrollTo(0, 0);
				}
			});
		};
		const navigate_entry = async (filename) => {
			clear_content();
			display_loading_spinner_after(300);
			fetch(filename).then(async (response) => {
				if (response.ok) {
					const fragment = document.createDocumentFragment();
					const article = document.createElement('article');
					const text = await response.text();
					article.innerHTML = text;
					fragment.appendChild(article);
					await clear_loading_spinner();
					content.appendChild(fragment);
					location.hash = filename;
				}
			});
		};
		const refresh = async () => {
			if (location.hash.length > 2) {
				navigate_entry(location.hash.substr(1));
			} else {
				navigate_index();
			};
		};
		title.addEventListener('click', () => { location.hash = ''; });
		window.addEventListener('hashchange', () => { refresh(); });
		refresh();
	});
})();
