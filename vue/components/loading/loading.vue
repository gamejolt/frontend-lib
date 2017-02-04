<template>

	<div class="loading"
		:class="{
			'loading-big': big,
			'loading-stationary': stationary,
			'loading-bw': noColor,
			'loading-centered': centered,
		}"
		>
		<img :src="img" alt="Loading" title="Loading...">
		<span class="loading-label" :class="{ 'sr-only': hideLabel }">
			{{ label }}
		</span>
	</div>

</template>

<script lang="ts" src="./loading.ts"></script>
<style lang="styl" scoped src="./loading.styl"></style>
