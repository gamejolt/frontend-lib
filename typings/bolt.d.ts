interface Bolt {
	/**
	 * From: https://support.playwire.com/bolt-api-documentation/#render-player
	 * Renders the player onto the web page when setting the data-autoload attribute to false. This method can only be called once.
	 *
	 * @param playerId A string matching the data-id attribute of the player embed code
	 */
	renderPlayer: (playerId: string) => void;

	/**
	 * From: https://support.playwire.com/bolt-api-documentation/#remove-video
	 * Removes the video object and/or the video container from the DOM depending on the boolean passed.
	 *
	 * @param playerId A string matching the data-id attribute of the player embed code
	 * @param partially A boolean value which determines whether the video object and/or the video container will be removed from the DOM. For example, if true is passed in, the script embed tag and all divs relating to the Bolt Player will be removed from the DOM. If false is passed in, the script embed tag and all divs relating to the Bolt Player except the div containing the poster image will be removed from the DOM. If no boolean is passed, false will be used.
	 */
	removeVideo: (playerId: string, partially?: boolean) => void;
}

interface Window {
	Bolt: Bolt;
}
