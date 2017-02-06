<template>

	<div class="ad-video">
		<h3 class="sans-margin-bottom">View ad. Be upset. Keep us running.</h3>
		<p class="text-muted">
			This ad supports the developer! Hang tight, your {{ resourceLabel }} will begin
			<span v-if="timeRemaining">in {{ timeRemaining | time }}...</span>
			<span v-else>soon...</span>
		</p>

		<div class="ad-video-player">
			<div class="ad-video-player-play-overlay"
				v-if="!isAdPlaying"
				@click="toggle()"
				>
				<div class="play-button-overlay">
					<app-jolticon icon="play"></app-jolticon>
				</div>
			</div>

			<app-loading v-if="isLoading" :big="true" :centered="true"></app-loading>

			<div class="ad-video-player-embed">
				<video class="ad-video-player-embed-video">
					<source :src="blankVideoSrc"></source>
				</video>
			</div>

			<div class="ad-video-player-ad-container"></div>
		</div>
	</div>

</template>

<script lang="ts" src="./video.ts"></script>
<style lang="styl" scoped src="./video.styl"></style>
