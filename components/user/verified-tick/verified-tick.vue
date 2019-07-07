<template>
	<app-jolticon
		v-if="user.is_verified"
		:class="{
			'-highlight': this.highlight,
			'-vertical-align': this.verticalAlign,
			'-small': this.small,
		}"
		icon="verified"
		:big="big"
		v-app-tooltip="$gettext(`Verified Account`)"
	/>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

$jolticon-size = 16px

.-vertical-align
	vertical-align: middle

.-highlight
	theme-prop('color', 'highlight')

.-small
	margin: 0 2px
	font-size: $jolticon-size * 0.85
</style>

<script lang="ts" src="./verified-tick"></script>
