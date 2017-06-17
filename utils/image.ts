export function isImage(file: File) {
	const type = file.type.slice(file.type.lastIndexOf('/') + 1);
	return ['jpg', 'png', 'jpeg', 'bmp', 'gif'].indexOf(type) !== -1;
}

export function getImgDimensions(file: File): Promise<[number, number]> {
	return new Promise(resolve => {
		const img = document.createElement('img');
		img.src = URL.createObjectURL(file);
		img.onload = function(this: HTMLImageElement) {
			resolve([this.width, this.height]);
			URL.revokeObjectURL(this.src);
		};
	});
}
