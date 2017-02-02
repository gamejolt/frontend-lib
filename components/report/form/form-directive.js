angular.module( 'gj.Report.Form' ).directive( 'gjFormReport', function( $q, App, Form, Api )
{
	var form = new Form( {
		template: require( './form.html' ),
	} );

	form.scope.type = '@reportType';
	form.scope.resource = '=reportResource';

	form.onInit = function( scope )
	{

	};

	form.onSubmit = function( scope )
	{
		var data = {
			resourceName: scope.type,
			resourceId: scope.resource.id,
			reason: scope.formModel.reason,
		};

		return Api.sendRequest( '/web/report/submit', data );
	};

	return form;
} );
