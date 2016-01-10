angular.module( 'gj.Form' ).factory( 'Form', function( $injector, $timeout )
{
	function Form( options )
	{
		var _this = this;

		this.modelName = undefined;
		this.modelClass = undefined;
		this.resetOnSubmit = angular.isDefined( options.resetOnSubmit ) ? options.resetOnSubmit : false;
		this.saveMethod = '$save';

		this.scope = {
			formModel: '=?gjFormModel',
			submitHandler: '&gjFormSubmitHandler'
		};

		if ( options.template ) {
			this.templateUrl = options.template;
		}

		if ( options.model ) {
			this.modelName = options.model;
			this.modelClass = $injector.get( options.model );

			var attributeName = '=?gj' + options.model.replace( /_/g, '' );
			this.scope.baseModel = attributeName;
		}

		if ( angular.isDefined( options.saveMethod ) ) {
			this.saveMethod = options.saveMethod;
		}

		this.link = {};

		this.link.pre = function( scope )
		{
			scope.formState = {
				isProcessing: false
			};
			scope.serverErrors = {};
			scope.method = 'add';

			// Add the model class onto the scope.
			// Makes it easy to include any constants on it.
			if ( _this.modelName && _this.modelClass ) {
				scope[_this.modelName] = _this.modelClass;
			}

			// Make sure that when this scope is destroyed we clean up any timeouts and stuff.
			scope.$on( '$destroy', function()
			{
				if ( _this.successShowPromise ) {
					$timeout.cancel( _this.successShowPromise );
					_this.successShowPromise = undefined;
				}
			} );

			// Initialize the form.
			_this._init( scope );

			// On submit of the form, just funnel off to the form's onSubmit function.
			scope.onSubmit = function()
			{
				_this._onSubmit( scope );
			};
		};
	}

	// Force forms to be elements.
	Form.prototype.restrict = 'E';

	/**
	 * Called to initialize the form.
	 */
	Form.prototype._init = function( scope )
	{
		// Is a base model defined? If so, then we're editing.
		if ( scope.baseModel ) {
			scope.method = 'edit';

			// If a model class was assigned to this form, then create a copy of it on the scope.
			// Otherwise just copy the object.
			if ( this.modelClass ) {
				scope.formModel = new this.modelClass( scope.baseModel );
			}
			else {
				scope.formModel = angular.copy( scope.baseModel );
			}
		}
		// If no base model...
		else {

			// If we have a model class, then create a new one.
			if ( this.modelClass ) {
				scope.formModel = new this.modelClass();
			}
			// Otherwise, just use an empty object as the form's model.
			else {
				scope.formModel = {};
			}
		}

		// If there is an onInit handler attached, call it now.
		// This is where the user can set up the scope.
		if ( this.onInit ) {
			this.onInit( scope );
		}
	};

	/**
	 * Called when the form is submitted.
	 * Attaches to the scope.onSubmit() function.
	 */
	Form.prototype._onSubmit = function( scope )
	{
		var _this = this;
		var response;

		// Don't submit if the form is invalid.
		// Chances are the ng-model-options just haven't had a chance to update the model yet.
		// Also don't submit if the form is processing.
		// Most of the time this is prevented, but just to be sure.
		if ( !scope[ scope.gjFormCtrl.name ].$valid || scope.formState.isProcessing ) {
			return;
		}

		scope.formState.isProcessing = true;
		scope.formState.progress = undefined;

		if ( this.modelClass && this.saveMethod ) {
			scope.formState.progress = scope.formModel[ this.saveMethod ]().then( function( _response )
			{
				response = _response;

				// Copy it back to the base model.
				if ( scope.baseModel ) {
					angular.extend( scope.baseModel, scope.formModel );
				}
			} );
		}

		if ( this.onSubmit ) {
			scope.formState.progress = this.onSubmit( scope ).then( function( _response )
			{
				response = _response;
			} );
		}

		scope.formState.progress.then( function()
		{
			// Send the new model back into the submit handler.
			if ( angular.isDefined( scope.submitHandler ) ) {
				scope.submitHandler( { formModel: scope.formModel, $response: response } );
			}

			// Reset our processing state.
			scope.formState.isProcessing = false;

			// Make sure that serverErrors is reset on a successful submit, just in case.
			scope.serverErrors = {};

			// After successful submit of the form, we broadcast the onSubmitted event.
			// We will capture this in the gjForm directive to set the form to a pristine state.
			scope.$broadcast( 'gjForm.onSubmitted', {} );

			// Show successful form submission.
			_this._showSuccess( scope );

			// If we should reset on successful submit, let's do that now.
			if ( _this.resetOnSubmit ) {
				_this._init( scope );
			}
		} )
		.catch( function( response )
		{
			// Store the server validation errors.
			if ( response && response.errors ) {
				scope.serverErrors = response.errors;
			}

			// Reset our processing state.
			scope.formState.isProcessing = false;
		} );
	};

	Form.prototype._showSuccess = function( scope )
	{
		// Reset the timeout if it's already showing.
		if ( this.successShowPromise ) {
			$timeout.cancel( this.successShowPromise );
		}

		scope.formState.isShowingSuccess = true;

		this.successShowPromise = $timeout( function()
		{
			scope.formState.isShowingSuccess = false;
			this.successShowPromise = undefined;
		}, 1000 );
	};

	return Form;
} );
