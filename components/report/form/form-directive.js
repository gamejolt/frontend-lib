angular.module( 'gj.Report.Form' ).directive( 'gjFormReport', function( $q, App, Form, Api )
{
	var form = new Form( {
		template: '/lib/gj-lib-client/components/report/form/form.html',
	} );

	form.scope.type = '@reportType';
	form.scope.resource = '=reportResource';

	form.onInit = function( scope )
	{

	};

	form.onSubmit = function( scope )
	{
		var data = {
			// Uppercase first letter.
			resourceName: scope.type.charAt( 0 ).toUpperCase() + scope.type.slice( 1 ),
			resourceId: scope.resource.id,
			reason: scope.formModel.reason,
		};

		return Api.sendRequest( '/web/report/submit', data ).then( function( response )
		{
			if ( !response.success ) {
				return $q.reject( response );
			}
		} );
	};

	return form;
} );
