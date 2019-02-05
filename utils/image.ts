export function isImage(file: File) {
	const type = file.type.slice(file.type.lastIndexOf('/') + 1);
	return ['jpg', 'png', 'jpeg', 'bmp', 'gif'].indexOf(type) !== -1;
}

export function getImgDimensions(file: File): Promise<[number, number]> {
	return new Promise((resolve, reject) => {
		if (file.type === 'video/mp4' || file.type === 'video/webm') {
			const vid = document.createElement('video');

			vid.onloadedmetadata = function() {
				resolve([vid.videoWidth, vid.videoHeight]);
				URL.revokeObjectURL(vid.src);
			};

			vid.onerror = function(err) {
				reject(err);
				URL.revokeObjectURL(vid.src);
			};

			vid.src = URL.createObjectURL(file);

			return;
		}

		const img = document.createElement('img');
		img.src = URL.createObjectURL(file);
		img.onload = function(this: HTMLImageElement) {
			resolve([this.width, this.height]);
			URL.revokeObjectURL(this.src);
		};
		img.onerror = function(err) {
			reject(err);
			URL.revokeObjectURL(this.src);
		};
	});
}
