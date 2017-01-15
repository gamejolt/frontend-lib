import { SiteBuildFactory } from './build-model';

export default angular.module( 'gj.Site.Build', [ 'gj.Model' ] )
.factory( 'SiteBuild', SiteBuildFactory )
.name;
