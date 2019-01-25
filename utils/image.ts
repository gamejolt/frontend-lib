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

/**
 * Creates a file object from an image data url.
 * A data url starts with `data:image/<mime>;`
 */
export function makeFileFromDataUrl(dataUrl: string, fileName: string) {
	var arr = dataUrl.split(','),
		mime = arr[0].match(/:(.*?);/)![1],
		bstr = atob(arr[1]),
		n = bstr.length,
		u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new File([u8arr], fileName, { type: mime });
}
