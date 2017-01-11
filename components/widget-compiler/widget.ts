export interface WidgetCompilerWidget
{
	readonly name: string;
	compile( scope: ng.IScope, params: any[] ): ng.IAugmentedJQuery;
}
