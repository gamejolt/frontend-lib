<template>
	<span
		:id="id"
		role="checkbox"
		class="toggle"
		:class="{
			'-checked': !!controlVal,
			'-disabled': disabled,
		}"
		:tabindex="disabled ? -1 : 0"
		@click="toggle"
		@keypress.space.prevent="toggle"
		@keypress.enter.prevent="toggle"
	>
		<span class="-knob"></span>
	</span>
</template>

<style src="./toggle.styl" scoped />

<script lang="ts" src="./toggle" />
