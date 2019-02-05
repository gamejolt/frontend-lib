import { validateFiles } from './_files';

export type FilesizeLimit = number | { [filetype: string]: number };

export function FormValidatorFilesize(files: File | File[], args: [FilesizeLimit]) {
	const maxFilesize = args[0];
	return validateFiles(files, file => {
		if (file.size <= 0) {
			return false;
		}

		const sizeLimit =
			typeof maxFilesize === 'number'
				? maxFilesize
				: maxFilesize[file.type] || maxFilesize['*'] || 0;

		if (!sizeLimit) {
			throw new Error('Size limit not defined properly: ' + JSON.stringify(maxFilesize));
		}

		return file.size <= sizeLimit;
	});
}
