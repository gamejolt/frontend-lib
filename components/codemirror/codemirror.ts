import * as Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import * as View from '!view!./codemirror.html';

import * as CodeMirror from 'codemirror';
import './codemirror.styl';
import { triggerEvent } from '../../utils/event';

const defaultOptions = {
	lineNumbers: true,
	lineWrapping: true,
	tabSize: 4,
	indentWithTabs: true,
};

@View
@Component({
	name: 'codemirror',
})
export class AppCodemirror extends Vue
{
	$el: HTMLTextAreaElement;

	@Prop( String ) value: string;
	@Prop( { type: Object, default: () => new Object() } ) options: any;

	private _options: any = {};
	private editor: CodeMirror.EditorFromTextArea;
	private bootstrapped = false;

	async mounted()
	{
		this._options = Object.assign( defaultOptions, this.options );

		if ( this._options.mode === 'text/css' ) {
			await $import( 'codemirror/mode/css/css.js' );
		}

		this.editor = CodeMirror.fromTextArea( this.$el, this._options );
		this.editor.setValue( this.value || '' );

		this.editor.on( 'change', ( cm ) =>
		{
			this.$emit( 'changed', cm.getValue() );
			this.$emit( 'input', cm.getValue() );
			triggerEvent( this.$el, 'changed', cm.getValue() );
		} );

		this.bootstrapped = true;
	}

	@Watch( 'value' )
	onValueChange( newVal: string )
	{
		if ( !this.bootstrapped ) {
			return;
		}

		const editorVal = this.editor.getValue();
		if ( newVal === editorVal ) {
			return;
		}

		const scrollInfo = this.editor.getScrollInfo();
		this.editor.setValue( newVal || '' );
		this.editor.scrollTo( scrollInfo.left, scrollInfo.top );
	}

	@Watch( 'options' )
	onOptionsChange( newVal: any )
	{
		if ( !this.bootstrapped ) {
			return;
		}

		if ( typeof newVal !== 'object' ) {
			return;
		}

		this._options = Object.assign( defaultOptions, newVal );

		for ( const optionName in Object.keys( this._options ) ) {
			this.editor.setOption( optionName, this._options[ optionName ] );
		}
	}

	beforeDestroy()
	{
		if ( this.editor ) {
			this.editor.toTextArea();
		}
	}
}
