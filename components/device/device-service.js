angular.module( 'gj.Device' ).service( 'Device', function( $window, Environment )
{
	this._result = undefined;
	this._os = undefined;
	this._arch = undefined;

	// Keep all these lowercase.
	var OS_WINDOWS = [
		'windows',
		'windows phone',
		'windows mobile',
	];

	var OS_MAC = [
		'mac os',
	];

	var OS_LINUX = [
		'linux',
		'arch',
		'centos',
		'fedora',
		'debian',
		'gentoo',
		'gnu',
		'mageia',
		'mandriva',
		'mint',
		'pclinuxos',
		'redhat',
		'slackware',
		'suse',
		'ubuntu',
		'unix',
		'vectorlinux',
		'freebsd',
		'netbsd',
		'openbsd',
	];

	var ARCH_32 = [
		'68k',
		'arm',
		'avr',
		'ia32',
		'irix',
		'mips',
		'pa-risc',
		'ppc',
		'sparc',
	];

	var ARCH_64 = [
		'amd64',
		'arm64',
		'ia64',
		'irix64',
		'mips64',
		'sparc64',
	];

	this._getResult = function()
	{
		if ( !this._result ) {
			if ( !$window.UAParser ) {
				throw new Error( 'Could not find UAParser globally.' );
			}

			var parser = new $window.UAParser();
			this._result = parser.getResult();
		}

		return this._result;
	};

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
			var result = this._getResult();
			var osName = result.os.name.toLowerCase();

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
		if ( Environment.isClient ) {
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
		}

		if ( angular.isUndefined( this._arch ) ) {
			var result = this._getResult();
			var arch = result.cpu.architecture.toLowerCase();

			if ( ARCH_64.indexOf( arch ) !== -1 ) {
				this._arch = '64';
			}
			else if ( ARCH_32.indexOf( arch ) !== -1 ) {
				this._arch = '32';
			}
			else {
				this._arch = null;
			}
		}

		return this._arch;
	};
} );
