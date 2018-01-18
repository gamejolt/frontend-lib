; Script generated by the Inno Script Studio Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

#define MyAppName "Game Jolt Client"
#define MyAppVersion "{{APP_VERSION}}"
#define MyAppPublisher "Lucent Web Creative, LLC"
#define MyAppURL "https://gamejolt.com/"
#define MyAppExeName "GameJoltClient.exe"

[Setup]
; NOTE: The value of AppId uniquely identifies this application.
; Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
SourceDir={{APP_DIR}}
AppId=game-jolt-client
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
AppMutex=game-jolt-client
DefaultDirName={localappdata}\GameJoltClient
DefaultGroupName=Game Jolt
DisableProgramGroupPage=yes
DisableFinishedPage=yes
DisableReadyMemo=yes
DisableReadyPage=yes
DisableWelcomePage=yes
DisableStartupPrompt=yes
PrivilegesRequired=lowest
OutputDir={{OUT_DIR}}
OutputBaseFilename=Setup
SetupIconFile={{ICON_DIR}}\winico.ico
Compression=lzma
SolidCompression=yes
UninstallDisplayIcon={{ICON_DIR}}\winico.ico
CloseApplications=force
RestartApplications=no
CloseApplicationsFilter=GameJoltClient.exe
WizardSmallImageFile={{ICON_DIR}}\win-installer-clyde.bmp
SignTool=signtool

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "GameJoltClient.exe"; DestDir: "{app}"; Flags: ignoreversion
; NOTE: Don't use "Flags: ignoreversion" on any shared system files
Source: "package.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "*.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "*.pak"; DestDir: "{app}"; Flags: ignoreversion
Source: "icudtl.dat"; DestDir: "{app}"; Flags: ignoreversion
Source: "locales\*"; DestDir: "{app}\locales"; Flags: ignoreversion createallsubdirs recursesubdirs
Source: "node_modules\*"; DestDir: "{app}\node_modules"; Flags: ignoreversion createallsubdirs recursesubdirs
Source: "package\*"; DestDir: "{app}\package"; Flags: ignoreversion createallsubdirs recursesubdirs

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{commondesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[Registry]
Root: "HKCU"; Subkey: "SOFTWARE\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "GameJoltClient"; Flags: dontcreatekey uninsdeletevalue

[Code]
Const UninstallRegKey = 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\GameJoltClient';
Const SquirrelUninstallCmd = 'GameJoltClient\Update.exe --uninstall -s';

Const CR = #13;
Const LF = #10;
Const CRLF = CR + LF;

Function GetUninstallCmd( Var UninstallCmd: String; Const Silent: Boolean ): Boolean;
  Var KeyName: String;

  Begin
    If Silent Then
      KeyName := 'QuietUninstallString'
    Else
      KeyName := 'UninstallString';

    Result := RegQueryStringValue( HKEY_CURRENT_USER, UninstallRegKey, KeyName, UninstallCmd );
  End;

Function GetSquirrelUninstall( Var UninstallCmd: String ): Boolean;
  Var HasOldInstall: Boolean;

  Begin
    HasOldInstall := GetUninstallCmd( UninstallCmd, True );
    If HasOldInstall AND ( Pos( SquirrelUninstallCmd, UninstallCmd ) = Length( UninstallCmd ) - Length( SquirrelUninstallCmd ) + 1 ) Then
      Result := True
    Else
      Result := False;
  End;

Function NextButtonClick( CurPageId: Integer ): Boolean;
  Var OldUninstallCmd: String;

  Begin
    If ( CurPageId = wpWelcome ) AND GetSquirrelUninstall( OldUninstallCmd ) Then
      CreateOutputMsgPage( CurPageId,
        'Important!',
        'We detected you have an old version of Game Jolt Client installed',
        'The old version of Game Jolt Client will be uninstalled before we continue.' + CRLF + 'Note, this operation cannot be undone.' + CRLF + CRLF + 'Click next to continue.' );
    Result := True;
  End;

Function PrepareToInstall( Var NeedsRestart: Boolean ): String;
  Var OldUninstallCmd, OldUninstallFile: String; UninstallResult: Integer;

  Begin
    If GetSquirrelUninstall( OldUninstallCmd ) Then
      Begin
        OldUninstallFile := Copy( OldUninstallCmd, 1, Length( OldUninstallCmd ) - Length( ' --uninstall -s' ) );
        If ( Exec( OldUninstallFile, '--uninstall -s', '', SW_HIDE, ewWaitUntilTerminated, UninstallResult ) <> True ) OR ( UninstallResult <> 0 ) Then
          Result := SysErrorMessage( UninstallResult )
        Else
          Result := '';
      End
    Else
      Result := '';
  End;
