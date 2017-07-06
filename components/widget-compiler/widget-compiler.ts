import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

import {
	WidgetCompiler,
	WidgetCompilerContext,
} from './widget-compiler.service';

@Component({})
export class AppWidgetCompiler extends Vue {
	@Prop([String])
	content: string;
	@Prop({ type: Boolean, default: false })
	isDisabled: boolean;

	@Prop({
		type: WidgetCompilerContext,
		default: () => new WidgetCompilerContext(),
	})
	context: WidgetCompilerContext;

	mounted() {
		this.refresh();
	}

	@Watch('content')
	contentChanged() {
		this.refresh();
	}

	destroyed() {
		this.context.destroy();
	}

	private refresh() {
		if (!this.content) {
			this.$el.innerHTML = '';
			return;
		}

		if (this.isDisabled) {
			this.$el.innerHTML = this.content;
		} else {
			const compiledElem = WidgetCompiler.compile(this.context, this.content);
			if (compiledElem) {
				this.$el.innerHTML = '';
				this.$el.appendChild(compiledElem);
			}
		}

		this.$emit('compiled');
	}

	render(h: Vue.CreateElement) {
		return h('div');
	}
}
