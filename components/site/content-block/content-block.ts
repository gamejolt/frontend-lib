import { SiteContentBlockFactory } from './content-block-model';

export default angular.module( 'gj.Site.ContentBlock', [ 'gj.Model' ] )
.factory( 'SiteContentBlock', SiteContentBlockFactory )
.name;
