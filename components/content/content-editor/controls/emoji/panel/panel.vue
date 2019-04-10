<template>
	<div
		class="emoji-button-container"
		ref="container"
		:style="{
			top: this.top,
		}"
	>
		<transition name="fade">
			<span
				v-if="visible"
				class="emoji-button"
				:class="spanClass"
				tabindex="1"
				@click="onButtonClick"
				@mousedown="onMouseDown"
				@mouseenter="onMouseEnter"
				v-app-tooltip="panelVisible ? '' : $gettext('Insert Emoji')"
			/>
		</transition>
		<transition name="fade">
			<div
				v-if="visible && panelVisible"
				class="emoji-panel"
				ref="panel"
				@focus="onPanelFocus"
				@blur="onPanelBlur"
				tabindex="1"
			>
				<div
					v-for="i of emojis"
					:key="i"
					class="emoji-box"
					@click="onClickEmoji(i)"
					:title="':' + i + ':'"
				>
					<span :class="'emoji-selector emoji emoji-' + i" />
				</div>
			</div>
		</transition>
	</div>
</template>

<style lang="stylus" src="./panel.styl" scoped></style>

<script lang="ts" src="./panel"></script>
