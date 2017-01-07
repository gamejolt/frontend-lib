import { SiteFactory } from './site-model';

export default angular.module( 'gj.Site', [ 'gj.Model' ] )
.factory( 'Site', SiteFactory )
.name;
