<template>
	<div class="content-editor" @focus="onFocus" ref="editor" tabindex="0">
		<div
			class="content-container"
			:class="{
				disabled: disabled,
				'content-container-emoji': couldShowEmojiPanel,
			}"
			:style="{
				minHeight: containerMinHeight,
			}"
		>
			<div class="-doc" :class="editorStyleClass" ref="doc" />
			<transition name="fade">
				<span
					v-if="shouldShowPlaceholder"
					class="content-placeholder text-muted"
					:class="editorStyleClass"
				>
					{{ placeholder }}
				</span>
			</transition>
			<transition name="fade">
				<div v-if="shouldShowEmojiPanel">
					<app-content-editor-controls-emoji-panel
						ref="emojiPanel"
						:view="view"
						:state-counter="stateCounter"
						@visibilityChanged="onEmojiPanelVisibilityChanged"
					/>
					<app-button @click.prevent="openGifModal">
						open
					</app-button>
				</div>
			</transition>
		</div>

		<transition name="fade">
			<app-content-editor-block-controls
				v-if="shouldShowControls"
				:capabilities="capabilities"
				:view="view"
				:state-counter="stateCounter"
				:collapsed="controlsCollapsed"
				@collapsedChanged="onControlsCollapsedChanged"
			/>
		</transition>
		<transition name="fade">
			<app-content-editor-text-controls
				v-if="shouldShowTextControls"
				:capabilities="capabilities"
				:view="view"
				:state-counter="stateCounter"
				@click="onTextControlClicked"
			/>
		</transition>
	</div>
</template>

<style lang="stylus" src="./content-editor.styl" scoped></style>

<script lang="ts" src="./content-editor"></script>
