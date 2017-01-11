angular.module( 'gj.Game.Build.LaunchOption' ).factory( 'Game_Build_LaunchOption', function( Model )
{
	function Game_Build_LaunchOption( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	Game_Build_LaunchOption.OS_WINDOWS = 'windows';
	Game_Build_LaunchOption.OS_WINDOWS_64 = 'windows_64';
	Game_Build_LaunchOption.OS_MAC = 'mac';
	Game_Build_LaunchOption.OS_MAC_64 = 'mac_64';
	Game_Build_LaunchOption.OS_LINUX = 'linux';
	Game_Build_LaunchOption.OS_LINUX_64 = 'linux_64';

	Game_Build_LaunchOption.LAUNCHABLE_PLATFORMS = [
		Game_Build_LaunchOption.OS_WINDOWS,
		Game_Build_LaunchOption.OS_WINDOWS_64,
		Game_Build_LaunchOption.OS_MAC,
		Game_Build_LaunchOption.OS_MAC_64,
		Game_Build_LaunchOption.OS_LINUX,
		Game_Build_LaunchOption.OS_LINUX_64,
	];

	return Model.create( Game_Build_LaunchOption );
} );
