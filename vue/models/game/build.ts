import { Model } from '../../services/model/model';
import { Api } from '../../services/api/api';
import { GamePackage } from './package';
import { GameRelease } from './release';
import { GameBuildFile } from './build/file';
import { GameBuildParam } from './build/param';
import { GameBuildLaunchOption } from './build/launch_option';

export class GameBuild extends Model
{
	static readonly TYPE_DOWNLOADABLE = 'downloadable';
	static readonly TYPE_HTML = 'html';
	static readonly TYPE_FLASH = 'flash';
	static readonly TYPE_SILVERLIGHT = 'silverlight';
	static readonly TYPE_UNITY = 'unity';
	static readonly TYPE_APPLET = 'applet';
	static readonly TYPE_ROM = 'rom';

	static readonly STATUS_ADDING = 'adding';
	static readonly STATUS_ACTIVE = 'active';
	static readonly STATUS_REMOVED = 'removed';

	static readonly ERROR_MISSING_FIELDS = 'missing-fields';
	static readonly ERROR_LAUNCH_OPTIONS = 'launch-options';

	static readonly browserTypes = [
		GameBuild.TYPE_HTML,
		GameBuild.TYPE_FLASH,
		GameBuild.TYPE_SILVERLIGHT,
		GameBuild.TYPE_UNITY,
		GameBuild.TYPE_APPLET,
	];

	static readonly EMULATOR_GBA = 'gba';
	static readonly EMULATOR_GBC = 'gbc';
	static readonly EMULATOR_GB = 'gb';
	static readonly EMULATOR_NES = 'nes';
	static readonly EMULATOR_VBOY = 'vb';
	static readonly EMULATOR_GENESIS = 'md';
	static readonly EMULATOR_SNES = 'snes';
	static readonly EMULATOR_ZX = 'zx';
	static readonly EMULATOR_MSX = 'msx';
	static readonly EMULATOR_ATARI2600 = 'atari2600';
	static readonly EMULATOR_C64 = 'c64';
	static readonly EMULATOR_CPC = 'cpc';

	primary_file: GameBuildFile;
	params: GameBuildParam[] = [];
	errors?: string[];

	game_id: number;
	game_package_id: number;
	game_release_id: number;
	archive_type: string;
	folder: string;
	type: string;
	os_windows: boolean;
	os_windows_64: boolean;
	os_mac: boolean;
	os_mac_64: boolean;
	os_linux: boolean;
	os_linux_64: boolean;
	os_other: boolean;
	emulator_type: string;
	embed_width: number;
	embed_height: number;
	java_class_name: string;
	browser_disable_right_click: boolean;
	added_on: number;
	updated_on: number;
	modified_on: number;
	status: string;

	// These fields get added only during GamePackage.processPackagePayload.
	_package?: GamePackage;
	_release?: GameRelease;
	_launch_options?: GameBuildLaunchOption[];

	constructor( data?: any )
	{
		super( data );

		if ( data.primary_file ) {
			this.primary_file = new GameBuildFile( data.primary_file );
		}

		this.params = [];
		if ( data.params && Array.isArray( data.params ) && data.params.length ) {
			this.params = GameBuildParam.populate( data.params );
		}

		if ( data.errors && typeof data.errors === 'string' ) {
			this.errors = data.errors.split( ',' );
		}
	}

	isPlatform( os: string, arch?: string )
	{
		if ( os === 'windows' ) {
			return arch === '64' ? !!this.os_windows_64 : !!this.os_windows;
		}
		else if ( os === 'mac' ) {
			return arch === '64' ? !!this.os_mac_64 : !!this.os_mac;
		}
		else if ( os === 'linux' ) {
			return arch === '64' ? !!this.os_linux_64 : !!this.os_linux;
		}
		return false;
	}

	isBrowserBased()
	{
		return GameBuild.browserTypes.indexOf( this.type ) !== -1;
	}

	isRom()
	{
		return this.type === GameBuild.TYPE_ROM;
	}

	hasError( error: string )
	{
		return !!this.errors && this.errors.indexOf( error ) !== -1;
	}

	getDownloadUrl( options: { key?: string } = {} )
	{
		// This is a game key so you can access games that you have a key for.
		let data: any = {};
		if ( options.key ) {
			data.key = options.key;
		}

		return Api.sendRequest( '/web/discover/games/builds/get-download-url/' + this.id, data );
	}
}
