import { Youtube_ChannelFactory } from './channel-model';

export default angular.module( 'gj.Youtube.Channel', [
	'gj.Model',
] )
.factory( 'Youtube_Channel', Youtube_ChannelFactory )
.name;
