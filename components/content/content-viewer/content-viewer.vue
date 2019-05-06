<template>
	<div class="content-viewer" :class="viewerStyleClass">
		<app-content-viewer-base-component
			v-if="shouldShowContent"
			:content="data.content"
			:owner="owner"
		/>
	</div>
</template>

<script lang="ts" src="./content-viewer"></script>
