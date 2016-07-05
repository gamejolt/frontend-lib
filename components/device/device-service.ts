import { Injectable, Inject } from 'ng-metadata/core';
import { UAParser } from 'ua-parser-js';

export type OperatingSystem = 'windows' | 'mac' | 'linux' | 'other';
export type Arch = '64' | '32';

// Keep all these lowercase.
const OS_WINDOWS = [
	'windows',
	'windows phone',
	'windows mobile',
];

const OS_MAC = [
	'mac os',
];

const OS_LINUX = [
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

const ARCH_32 = [
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

const ARCH_64 = [
	'amd64',
	'arm64',
	'ia64',
	'irix64',
	'mips64',
	'sparc64',
];

@Injectable()
export class Device
{
	private _result: IUAParser.IResult;
	private _os: OperatingSystem;
	private _arch: Arch;

	constructor(
		@Inject( 'Environment' ) private env: any
	)
	{
	}

	private _getResult()
	{
		if ( !this._result ) {
			const parser = new UAParser();
			this._result = parser.getResult();
		}

		return this._result;
	}

	os(): OperatingSystem
	{
		if ( this.env.isClient ) {
			const os = require( 'os' );
			const type = os.type();
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
			const result = this._getResult();
			const osName = result.os.name.toLowerCase();

			if ( OS_WINDOWS.indexOf( osName ) !== -1 ) {
				this._os = 'windows';
			}
			else if ( OS_MAC.indexOf( osName ) !== -1 ) {
				this._os = 'mac';
			}
			else if ( OS_LINUX.indexOf( osName ) !== -1 ) {
				this._os = 'linux';
			}
			else {
				this._os = 'other';
			}
		}

		return this._os;
	}

	arch(): Arch
	{
		if ( this.env.isClient ) {
			const arch = require( 'os' ).arch();

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
			const result = this._getResult();
			const arch = result.cpu && result.cpu.architecture ? result.cpu.architecture.toLowerCase() : null;

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
	}
}
