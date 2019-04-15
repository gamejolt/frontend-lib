<template>
	<div>
		<app-content-editor
			class="form-control content-editor-form-control"
			ref="editor"
			:content-context="contentContext"
			:placeholder="placeholder"
			:disabled="disabled"
			:autofocus="autofocus"
			@update="onUpdate"
		/>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.content-editor-form-control
	height: auto
	resize: vertical

.content-editor-form-control:focus-within
	theme-prop('border-color', 'fg-muted')
	box-shadow: none
	outline: 0
</style>

<script lang="ts" src="./content"></script>
