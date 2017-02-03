import { provide } from 'ng-metadata/core';
import { ImgResponsiveDirective } from './responsive-directive';
import ImgHelperModule from '../helper/helper';

export default angular.module( 'gj.Img.ImgResponsive', [
	ImgHelperModule,
] )
.directive( ...provide( ImgResponsiveDirective ) )
.name;
