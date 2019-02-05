import { getImgDimensions } from '../../../utils/image';
import { validateFilesAsync } from './_files';

export type MinImgRatioArgs = {
	ratio: number;
	tolerate?: boolean;
};

export async function FormValidatorMinImgRatio(files: File | File[], args: [MinImgRatioArgs]) {
	const ratio = args[0].ratio;
	return validateFilesAsync(files, async file => {
		try {
			const dimensions = await getImgDimensions(file);
			return dimensions[0] / dimensions[1] >= ratio;
		} catch (_) {
			return !!args[0].tolerate;
		}
	});
}
