import 'core-js/es6/symbol';
import 'core-js/es6/object';
import 'core-js/es6/function';
import 'core-js/es6/parse-int';
import 'core-js/es6/parse-float';
import 'core-js/es6/array';
import 'core-js/es6/map';
import 'core-js/es6/set';
import 'core-js/es6/promise';
import 'core-js/modules/es7.object.values';
import 'core-js/modules/es7.object.entries';
import 'reflect-metadata';

// Reflect attaches to global.Reflect if it's in node context, so we want to
// also put it on Window.
if (GJ_IS_CLIENT) {
	(window as any).Reflect = (global as any).Reflect;
}
