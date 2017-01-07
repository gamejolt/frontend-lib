import { SiteThemeFactory } from './theme-model';

export default angular.module( 'gj.Site.Theme', [ 'gj.Model' ] )
.factory( 'SiteTheme', SiteThemeFactory )
.name;
