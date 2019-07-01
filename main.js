(() => {
	window.addEventListener('load', async (event) => {
		const colorSchemes = {
			Black: [ '#a0a0a0', '#080808', '#a02828' ],
			White: [ '#202020', '#e0e0e0', '#a02828' ],
			Sepia: [ '#202020', '#e8e0c8', '#a02828' ],
			Solarized: [ '#839496', '#002b36', '#b58900' ],
			Dracula: [ '#f8f8f2', '#282a36', '#b890fc' ],
			Zenburn: [ '#dcdccc', '#1f1f1f', '#f0dfaf' ], 
			Matrix: [ '#55af66', '#000000', '#55af66' ]
		}
		const color = document.querySelector('#color>select');
		const applyColorScheme = async (scheme) => {
			if (!scheme || !(scheme in colorSchemes)) {
				return;
			}
			document.documentElement.style.setProperty('--foreground-color',
				colorSchemes[scheme][0]);
			document.documentElement.style.setProperty('--background-color',
				colorSchemes[scheme][1]);
			document.documentElement.style.setProperty('--accent-color',
				colorSchemes[scheme][2]);
			if (scheme == 'Matrix') {
				document.body.style.fontFamily = '\'Share Tech Mono\', monospace';
			} else {
				document.body.style.fontFamily = '\'News Cycle\', sans-serif';
			}
			color.value = scheme;
			localStorage.setItem('color', scheme);
		}
		for (const c in colorSchemes) {
			const option = document.createElement('option');
			option.appendChild(document.createTextNode(c));
			color.appendChild(option);
		}
		color.value = Object.keys(colorSchemes)[0];
		color.addEventListener('change', (event) => {
			applyColorScheme(event.target.value);
		});
		await applyColorScheme(localStorage.getItem('color'));
		document.body.classList.add('ready');
	});
	window.addEventListener('DOMContentLoaded', async (event) => {
		const transitionDuration = 400;
		const loadingSpinnerDelay = 800;
		const title = document.querySelector('body>header>h1>a');
		const main = document.querySelector('body>main');
		const footer = document.querySelector('body>footer');
		let loadingSpinnerTimer = null;
		const loadingSpinnerFragment = (() => {
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
		const failedFetchFragment = (() => {
			const fragment = document.createDocumentFragment();
			const strong = document.createElement('strong');
			strong.appendChild(document.createTextNode(
				'Failed to fetch content.'));
			fragment.appendChild(strong);
			return fragment;
		})();
		const sleep = (ms) => {
			return new Promise(resolve => setTimeout(resolve, ms));
		}
		const delayedFetch = async (resource, ms) => {
			return (await Promise.all([fetch(resource), sleep(ms)]))[0];
		}
		const clear = async () => {
			while (main.lastChild) {
				main.removeChild(main.lastChild);
			}
		}
		const hide = async () => {
			footer.classList.add('hidden');
			main.classList.add('hidden');
			await sleep(transitionDuration);
		}
		const show = async () => {
			main.classList.remove('hidden');
			footer.classList.remove('hidden');
			await sleep(transitionDuration);
		}
		const startLoadingSpinnerAfter = async (ms) => {
			if (loadingSpinnerTimer) {
				clearTimeout(loadingSpinnerTimer);
			}
			loadingSpinnerTimer = setTimeout(() => {
				main.classList.add('loading');
				main.appendChild(loadingSpinnerFragment.cloneNode(true));
				show();
				loadingSpinnerTimer = null;
			}, ms);
		}
		const stopLoadingSpinner = async () => {
			clearTimeout(loadingSpinnerTimer);
			loadingSpinnerTimer = null;
			if (main.classList.contains('loading')) {
				await hide();
				await clear();
				main.classList.remove('loading');
			}
		}
		const animateOut = async () => {
			await hide();
			await clear();
		}
		const animateFragmentIn = async (fragment) => {
			main.appendChild(fragment);
			await show();
		}
		const fetchJson = async (resource) => {
			const response = await fetch(resource);
			if (response.ok) {
				return await response.json();
			} else {
				throw '!response.ok';
			}
		}
		const fetchArticleFragment = async (resource) => {
			const response = await fetch(resource);
			if (response.ok) {
				const fragment = document.createDocumentFragment();
				const article = document.createElement('article');
				article.innerHTML = await response.text();
				fragment.appendChild(article);
				return fragment;
			} else {
				throw '!response.ok';
			}
		}	
		const fetchAndDisplayIndex = async () => {
			scrollTo(0, 0);
			await animateOut();
			await startLoadingSpinnerAfter(loadingSpinnerDelay);
			let json = null;
			try {
				json = await fetchJson('entries.json');
			} catch (error) {
				await stopLoadingSpinner();
				animateFragmentIn(failedFetchFragment.cloneNode(true));
				return;
			}
			const fragment = document.createDocumentFragment();
			const ul = document.createElement('ul');
			ul.classList.add('entry-list');
			for (const e of json) {
				const li = document.createElement('li');
				const a = document.createElement('a');
				a.href = '#' + e[0];
				a.appendChild(document.createTextNode(e[1] + ': ' + e[2]));
				li.appendChild(a);
				ul.appendChild(li);
			}
			fragment.appendChild(ul);
			await stopLoadingSpinner();
			await animateFragmentIn(fragment);
		}
		const fetchAndDisplayArticle = async (resource) => {
			scrollTo(0, 0);
			await animateOut();
			await startLoadingSpinnerAfter(loadingSpinnerDelay);
			let fragment = null;
			try {
				fragment = await fetchArticleFragment(resource);
			} catch (error) {
				await stopLoadingSpinner();
				await animateFragmentIn(failedFetchFragment.cloneNode(true));
			}
			await stopLoadingSpinner();
			await animateFragmentIn(fragment);
		}
		const refresh = async () => {
			if (location.hash.length > 2) {
				fetchAndDisplayArticle(location.hash.substr(1));
			} else {
				fetchAndDisplayIndex();
			};
		};
		title.addEventListener('click', async () => {
			if (location.hash != '') {
				location.hash = '';
			} else {
				await fetchAndDisplayIndex();
			};
		});
		window.addEventListener('hashchange', async () => {
			await refresh();
		});
		refresh();
	});
})();
