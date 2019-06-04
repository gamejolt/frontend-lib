export default abstract class Console {
	static debug(message: string) {
		console.log('%c' + message, 'color: white; background-color: blue');
	}
}
