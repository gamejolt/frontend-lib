<template>
	<div class="content-editor" @focus="onFocus" ref="editor" tabindex="0">
		<div
			class="content-container"
			:class="{
				disabled: disabled,
				'content-container-emoji': couldShowEmojiPanel,
			}"
		>
			<div class="-doc" ref="doc" />
			<transition name="fade">
				<span v-if="shouldShowPlaceholder" class="content-placeholder text-muted">
					{{ placeholder }}
				</span>
			</transition>
			<transition name="fade">
				<app-content-editor-controls-emoji-panel
					v-if="shouldShowEmojiPanel"
					ref="emojiPanel"
					:view="view"
					:state-counter="stateCounter"
					@visibilityChanged="onEmojiPanelVisibilityChanged"
				/>
			</transition>
		</div>

		<transition name="fade">
			<app-content-editor-controls
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
