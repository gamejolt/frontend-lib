- Change any markdown-widget components to use "editor-class" attribute to pass in a class for textarea.
- Remove Codemirror
- Include "angular-elastic": "2.5.1" in bower

- Include gulp-angular-embed-templates.
  "gulp-angular-embed-templates": "^2.1.0"

- Include gettext as well as Translate even if you don't use translations.

- Use our fork of gulp-rev-all.
  gamejolt/gulp-rev-all#master

- gj-tooltip now takes an interpolated attr instead of a parsed one:
  "string {{ var }}" instead of "'string' + var"

- Upgrade
	"gulp-stylus": "2.0.5",
    "stylus": "0.53.0",
	"gulp-imagemin": "2.4.0",

- Upgrade gulp-rev-all to 0.8.22

- Remove ng-animate-children from main ui-view.

- Upgrade to angular 1.4.8

- .navbar styling changed A LOT. Make sure to update the HTML and check styling.

- Change progress-bar in main.styl to progress/bar
  load-module( 'form/upload-control' )

- If not lazy loading ui-codemirror and ngfileupload, you have to set them in app.js.
  'ui.codemirror',
  'angularFileUpload',

- Upgrade node modules:
  "gulp-concat": "~2.6.0"
  "gulp-ng-annotate": "~1.1.0",
  "gulp-uglify": "~1.2.0",

- Add node modules
  "gulp-sourcemaps": "~1.5.2",
  "concat-with-sourcemaps": "~1.0.2"

- In module definitions in gulpfile, change "component" to "components".
  Must be an array now.

- Removed
	Game_Distribution
	Game_File
	Game_Param

- Add emoji styling and spoiler styling to main.styl.

- Update GA tags to use an async version.
  Can set linkid for enhanced link attribution.
	<script async src="//www.google-analytics.com/analytics.js"></script>
	<script>
		window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
		ga('create', 'UA-6742777-1', 'auto');
		ga('require', 'linkid', 'linkid.js');
	</script>

- Environment.imgserverUrl removed.

- Changed form-upload-control to only take file extensions as input for accept tag.

- Change angular-chart.js to tc-angular-chartjs in bower/gulp.

- Any time we modify form controls in some event (updating url based on title) you must set the control as dirty.
  Search for things like `scope.formModel.`
  Add in something like `scope.jamForm.url.$setDirty();`

- npm i gulp-plumber --save-dev

- Upgrade angular-moment to 0.10.1.
  Optionally put in am-time-ago config to app.js
  amTimeAgoConfig.fullDateThreshold = 7;
  amTimeAgoConfig.fullDateFormat = 'll';

- Upgrade angular-ui-router to 0.2.14

- Change any user bar links to be in a <ul> list.

- Remove ngTouch dependency.

- Upgrade to angular 1.4.0-rc.0

- Change stuff like ng-disabled="packageForm.$invalid" -> ng-disabled="!packageForm.$valid"
  regex: button" ng\-disabled="(.*?)\.\$invalid"
  replace: button" ng-disabled="!$1.$valid"

- New toggle-switch component. No dependencies.
  Must update all switches to elements such as: <gj-toggle-switch form-control="checkbox"></gj-toggle-switch>
  It replaces the input element.
  switch-on-text -> toggle-switch-on-text
  switch-off-text -> toggle-switch-off-text

- Using Chart.js instead of flot.
- gj.Graph no longer includes angular-chart, so you must lazy load in, or include it in App dependency.

- If using nav components, must include 'nav' before: load-module( 'nav' )

- Add 'gj.Ruler' to App dependencies.
- Remove dependency on jQuery:

  jQuery Changes
  width() => Ruler.width()
  height() => Ruler.height()
  innerWidth() => .clientWidth
  innerHeight() => .clientHeight
  outerWidth() => .offsetWidth
  outerHeight() => .offsetHeight
  outerWidth( true ) => Ruler.outerWidth()
  outerHeight( true ) => Ruler.outerHeight()
  css( prop ) => getComputedStyle( elem ).prop;
  appendTo() => parent.appendChild()
  $() => angular.element()
  element.find( '.' ) => element.getElementsByClassName()[0]
  element.find( '#' ) => element.querySelector()

  Remove jqLite cruft
  addClass() => classList.add()
  removeClass() => classList.remove()
  toggleClass() => classList.toggle()
  hasClass() => classList.contains()
  css( prop, something ) => .style.prop = something;

- Add 'addon/display/placeholder.js' to extra codemirror bower files in gulpfile if comment widget is included.

- Check platform lists to make sure the margins are correct.

- Check to make sure that any collapses or gj-expand-whens aren't broken.

- Upgrade bower packages:
  jquery => 2.1.3
  angular => 1.3.9
  angular-scroll => 0.6.4
  codemirror => 4.11.0
  angular-ui-codemirror => 0.2.2

- Remove gj-show-page-errors.
- Put gj.Errors include higher up.
- No longer set Error.errorCode to set an error. We now just $state.go( 'error-404' ) for example.

- npm remove gulp-changed --save-dev
- npm install gulp-size gulp-newer --save-dev

- Form templates must be full paths now.

- Update to angular 1.3.8

- Changed .section-header-controls to be icon-only buttons.

- Run bower update so that we pull in new version of our bootstrap-stylus.
- Upgrade to angular-ui-router 0.2.13
- Upgrade to angular-bootstrap 0.12.0
- Upgrade to angular 1.3.5

- npm install --save-dev gulp-shell

- Remove app font sizes. Try to just use what we by default.

- Upgrade speakingurl to 0.16.0

- Set ui-tree version to: git@github.com:gamejolt/angular-ui-tree.git#master

- npm install --save-dev gulp-rev-all
- npm remove --save-dev gulp-rev

- Upgrade bootstrap-switch to: 3.1.0

- Editable accordion headers now must be specified in a separate element directive.

- Add gj-form-submit-button to all form submit buttons.

- Editable accordion now requires to be wrapped in a <gj-editable-accordion-body> tag for expanded content.
- Editable accordion's attributes have shortened. No longer need to prefix with "editable-accordion-".

- New pagination directives. Should work on migrating over to it instead of bootstrap's.

- Ensure ng-animate-children is set on parent content element.

- Upgrade to angular 1.3 stable.
- Upgrade ui-router to 0.2.12-pre1.

- New animation library!
- Convert all previous mixins to @extend classes.
  Use .anim-... classes.
  .anim-x-enter/leave should be used for ng-repeated stuff
  .anim-x-in/out should be used for just content on the page that isn't part of angular stuff
  .stagger-enter/leave for ng anims
  .stagger for css anims

- Update gulp-stylus. (run npm update)

- User avatars no longer have hide-name. Instead you opt in with avatar-show-name="true".
- User avatars no longer have dashboard property. Instead set avatar-link="dashboard".
- User avatars no longer have circle-avatar property. Instead use .avatar-circle class on the element: <span gj-user-avatar="user" class="avatar-circle"></span>

- form-markdown-editor must now be in a form group
- form-markdown-editor no longer takes a model

- Update angular-bootstrap to 0.11.2

- Ensure that there are markdown modes for all markdown editors.

- Model helper functions no longer send in the response[field] but rather the whole response.
  Make sure anything in the project is updated: $save, $remove, processRemove, processUpdate, processCreate, etc...

- Remove Modernizr. No longer needed. We hardcode mq() in Screen service now.

- Add to app.js: $httpProvider.useApplyAsync( true );
  https://github.com/angular/angular.js/commit/ea6fc6e69c2a2aa213c71ed4e917a0d54d064e4c

- Add to app.js: $compileProvider.debugInfoEnabled( false );
  Add to app-development.js: $compileProvider.debugInfoEnabled( true );
  https://github.com/angular/angular.js/commit/3660fd0912d3ccf6def8c9f02d8d4c0621c8d91f

- <base> tag required in 1.3

- Must upgrade angular-loading-bar in 1.3

- Remove the cfpLoading stuff from the main config. We put that in the lib component.

- Scroll parallax drag and dim now have different ways of calculating values.
  They multiply now instead of dividing, so adjust accordingly.

- Comment widget must be in a new section because the H2 is now a .section-header.

- Removed $media-desktop variable.
