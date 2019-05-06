<template>
	<div class="content-control">
		<app-content-editor
			class="form-control content-editor-form-control"
			:content-context="contentContext"
			:placeholder="placeholder"
			:disabled="disabled"
			:autofocus="autofocus"
			:model-id="modelId"
			:source="controlVal"
			@update="onUpdate"
		/>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.content-control
	cursor: text

.content-editor-form-control
	height: auto
	resize: vertical

.content-editor-form-control:focus-within
	theme-prop('border-color', 'fg-muted')
	box-shadow: none
	outline: 0
</style>

<script lang="ts" src="./content"></script>
