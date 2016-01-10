angular.module( 'gj.Device' ).service( 'Device', function( $window, Environment )
{
	this._os = undefined;

	this.os = function()
	{
		if ( Environment.isClient ) {
			var os = require( 'os' );
			var type = os.type();
			if ( type == 'Linux' ) {
				return 'linux';
			}
			else if ( type == 'Darwin' ) {
				return 'mac';
			}
			else if ( type == 'Windows_NT' ) {
				return 'windows';
			}
			else {
				return 'other';
			}
		}

		if ( !this._os ) {
			var parser = new $window.UAParser();
			var result = parser.getResult();

			if ( result.os.name == 'Linux' ) {
				this._os = 'linux';
			}
			else if ( result.os.name == 'Mac OS' ) {
				this._os = 'mac';
			}
			else if ( result.os.name == 'Windows' ) {
				this._os = 'windows';
			}
			else {
				this._os = 'other';
			}
		}

		return this._os;
	};

	this.arch = function()
	{
		if ( !Environment.isClient ) {
			return null;
		}

		var arch = require( 'os' ).arch();

		// Because of a bug where 32-bit node versions will always report 32 instead of the OS arch.
		// http://blog.differentpla.net/blog/2013/03/10/processor-architew6432/
		if ( this.os() == 'windows' ) {
			return arch == 'x64' || process.env.hasOwnProperty( 'PROCESSOR_ARCHITEW6432' ) ? '64' : '32';
		}

		if ( arch == 'x64' ) {
			return '64';
		}
		else if ( arch == 'ia32' ) {
			return '32';
		}

		return null;
	};
} );
