import { SiteTemplateFactory } from './template-model';

export default angular.module( 'gj.Site.Template', [ 'gj.Model' ] )
.factory( 'SiteTemplate', SiteTemplateFactory )
.name;
