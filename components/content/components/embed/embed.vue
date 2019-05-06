<template>
	<app-base-content-component
		v-if="hasContent"
		:is-editing="isEditing"
		:is-disabled="isDisabled"
		@removed="onRemoved"
		class="embed-main"
	>
		<div class="embed-container">
			<app-video-embed
				v-if="type === 'youtube-video'"
				video-provider="youtube"
				:video-id="source"
			/>
			<app-content-embed-soundcloud-embed
				v-else-if="type === 'soundcloud-song'"
				:track-id="source"
			/>
			<app-content-embed-game-embed
				v-else-if="type === 'game-jolt-game'"
				:game-id="source"
				:hydrator="hydrator"
			/>
			<app-content-embed-user-embed
				v-else-if="type === 'game-jolt-user'"
				:username="source"
				:hydrator="hydrator"
			/>
			<app-content-embed-community-embed
				v-else-if="type === 'game-jolt-community'"
				:community-path="source"
				:hydrator="hydrator"
			/>

			<div v-if="shouldShowOverlay" class="embed-overlay">
				<div class="embed-overlay-img" />
				<div class="embed-overlay-controls">
					<translate v-if="!hasSourceUrl">Go to source</translate>
					<a v-else target="_blank" :href="sourceUrl" rel="nofollow noopener">
						<translate>Go to source</translate>
					</a>
				</div>
			</div>
		</div>
	</app-base-content-component>
	<div v-else contenteditable="false" class="input-container">
		<input
			ref="inputElement"
			class="-input"
			type="text"
			:value="source"
			:disabled="loading || isDisabled"
			@input="onInput"
			@keydown="onKeydown"
			:placeholder="
				' ' +
					$gettext(
						`Paste a link to embed content from Game Jolt or an external site (e.g. YouTube).`
					)
			"
		/>
		<div v-if="loading" class="input-overlay">
			<app-loading hide-label />
		</div>
	</div>
</template>

<style lang="stylus" src="./embed.styl" scoped></style>

<script lang="ts" src="./embed"></script>
