export function lazyModule( moduleName )
{
	// Angular throws an error if you try loading a module that doesn't exist yet.
	try {
		return angular.module( moduleName );
	}
	catch ( e ) {
	}
	return angular.module( moduleName, [] );
}
