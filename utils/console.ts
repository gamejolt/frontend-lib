export default abstract class Console {
	static debug(message: string) {
		console.debug('%c' + message, 'color: white; background-color: blue');
	}
}
