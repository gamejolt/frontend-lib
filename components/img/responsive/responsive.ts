import { provide } from '@angular/core';
import { ResponsiveDirective } from './responsive-directive';
import ImgHelperModule from './../helper/helper';

export default angular.module( 'gj.Img.ImgResponsive', [
	'gj.Screen',
	'gj.Ruler',
	ImgHelperModule,
] )
.directive( ...provide( ResponsiveDirective ) )
.name;
