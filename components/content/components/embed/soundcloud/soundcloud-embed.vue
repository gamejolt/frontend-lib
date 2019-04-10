<template>
	<iframe
		class="soundcloud-embed"
		nwdisable
		nwfaketop
		width="100%"
		height="166"
		scrolling="no"
		frameborder="no"
		:src="embedSrc"
	></iframe>
</template>

<style lang="stylus" scoped>
.soundcloud-embed
	display: block
</style>

<script lang="ts" src="./soundcloud-embed"></script>
