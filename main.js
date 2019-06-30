(() => {
	window.addEventListener('load', async (event) => {
		document.body.classList.add('ready');
	});
	window.addEventListener('DOMContentLoaded', async (event) => {
		const color = document.querySelector('#color>select');
		const apply_color = (c) => {
			if (!c) { return; }
			if (c == 'Black') {
				document.documentElement.style.setProperty('--foreground-color', '#a0a0a0');
				document.documentElement.style.setProperty('--background-color', '#080808');
			} else if (c == 'White') {
				document.documentElement.style.setProperty('--foreground-color', '#202020');
				document.documentElement.style.setProperty('--background-color', '#e0e0e0');
			} else if (c == 'Sepia') {
				document.documentElement.style.setProperty('--foreground-color', '#202020');
				document.documentElement.style.setProperty('--background-color', '#e8e0c8');
			}
			color.value = c;
			localStorage.setItem('color', c);
		}
		color.addEventListener('change', (ev) => {
			apply_color(ev.target.value);
		});
		apply_color(localStorage.getItem('color'));
		const title = document.querySelector('body>header>h1>a');
		const main = (() => {
			const main = document.querySelector('body>main');
			main.clear = async function() {
				while (this.lastChild) {
					this.removeChild(this.lastChild);
				}
			};
			return main;
		})();
		const footer = document.querySelector('body>footer');
		const transition_delay = 400;
		let loading_spinner_timer = null;
		const loading_spinner_fragment = (() => {
			const fragment = document.createDocumentFragment();
			const b = document.createElement('b');
			b.appendChild(document.createTextNode('Loading'));
			const div = document.createElement('div');
			div.classList.add('loading-spinner');
			for (let i = 0; i < 4; ++i) {
				div.appendChild(document.createElement('div'));
			};
			fragment.appendChild(b);
			fragment.appendChild(document.createElement('br'));
			fragment.appendChild(div);
			return fragment;
		})();
		const fetch_failed_fragment = (() => {
			const fragment = document.createDocumentFragment();
			const strong = document.createElement('strong');
			strong.appendChild(document.createTextNode('Failed to load content.'));
			fragment.appendChild(strong);
			return fragment;
		})();
		const delay = async (ms) => {
			await new Promise((a, r) => {
				setTimeout(() => { a(); }, ms);
			});
		};
		const delayed_fetch = async (resource, ms) => {
			return (await Promise.all([fetch(resource), delay(ms)]))[0];
		};
		const hide_main_and_footer = async () => {
			main.classList.add('hidden');
			footer.classList.add('hidden');
			await delay(transition_delay);
		};
		const show_main_and_footer = async () => {
			main.classList.remove('hidden');
			footer.classList.remove('hidden');
			await delay(transition_delay);
		};
		const animate_out = async () => {
			await hide_main_and_footer();
			await main.clear();
			if (loading_spinner_timer) {
				clearTimeout(loading_spinner_timer);
			};
			loading_spinner_timer = setTimeout(() => {
				main.classList.add('loading');
				main.appendChild(loading_spinner_fragment.cloneNode(true));
				show_main_and_footer();
				loading_spinner_timer = null;
			}, 300);
		};
		const animate_in = async (fragment) => {
			clearTimeout(loading_spinner_timer);
			loading_spinner_timer = null;
			if (main.classList.contains('loading')) {
				await hide_main_and_footer();
				await main.clear();
				main.classList.remove('loading');
			}
			main.appendChild(fragment);
			await show_main_and_footer();
		};
		const navigate_index = async () => {
			scrollTo(0, 0);
			await animate_out();
			try {
				const response = await fetch('entries.json');
				if (response && response.ok) {
					const fragment = document.createDocumentFragment();
					const ul = document.createElement('ul');
					ul.classList.add('entry-list');
					const json = await response.json();
					for (const e of json) {
						const li = document.createElement('li');
						const a = document.createElement('a');
						a.href = '#' + e[0];
						a.appendChild(document.createTextNode(e[1] + ': ' + e[2]));
						li.appendChild(a);
						ul.appendChild(li);
					}
					fragment.appendChild(ul);
					await animate_in(fragment);
				} else {
					animate_in(fetch_failed_fragment.cloneNode(true));
				};
			} catch (e) {
				animate_in(fetch_failed_fragment.cloneNode(true));
			};
		};
		const navigate_entry = async (filename) => {
			scrollTo(0, 0);
			await animate_out();
			try {
				const response = await fetch(filename);
				if (response.ok) {
					const fragment = document.createDocumentFragment();
					const article = document.createElement('article');
					article.innerHTML = await response.text();
					fragment.appendChild(article);
					await animate_in(fragment);
				} else {
					animate_in(fetch_failed_fragment.cloneNode(true));
				};
			} catch (e) {
				animate_in(fetch_failed_fragment.cloneNode(true));
			};
		};
		const refresh = async () => {
			if (location.hash.length > 2) {
				navigate_entry(location.hash.substr(1));
			} else {
				navigate_index();
			};
		};
		title.addEventListener('click', async () => {
			if (location.hash != '') {
				location.hash = '';
			} else {
				await navigate_index();
			};
		});
		window.addEventListener('hashchange', async () => {
			await refresh();
		});
		refresh();
	});
})();
