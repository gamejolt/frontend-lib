import { getImgDimensions } from '../../../utils/image';
import { validateFilesAsync } from './_files';

export type ImgDimensionsArgs = {
	width: number;
	height: number;
	tolerate?: boolean;
};

export async function FormValidatorImgDimensions(files: File | File[], args: [ImgDimensionsArgs]) {
	const width = args[0].width;
	const height = args[0].height;
	return validateFilesAsync(files, async file => {
		try {
			const dimensions = await getImgDimensions(file);
			return !!width && dimensions[0] === width && !!height && dimensions[1] === height;
		} catch (_) {
			return !!args[0].tolerate;
		}
	});
}
