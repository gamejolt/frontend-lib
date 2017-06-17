const Favico: favicojs.FavicoJsStatic = require('favico.js');

export class Favicon {
	static favicon: favicojs.Favico;

	static badge(num: number) {
		this.ensureFavico();
		this.favicon.badge(num);
	}

	static reset() {
		this.ensureFavico();
		this.favicon.reset();
	}

	private static ensureFavico() {
		if (this.favicon) {
			return;
		}

		this.favicon = new Favico({
			animation: 'none',
			type: 'rectangle',
			bgColor: '#ff3fac',
			textColor: '#fff',
		});
	}
}
