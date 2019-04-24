<template>
	<div class="content-viewer" :class="viewerStyleClass">
		<!-- DEBUG: Remove -->
		<template v-if="showSource">
			<h2>Content Viewer</h2>
			<div class="source-view">
				<pre>{{ source }}</pre>
				<app-button circle icon="edit" @click="onClickCopy" />
			</div>
			<hr />
		</template>

		<app-content-viewer-base-component
			v-if="shouldShowContent"
			:content="data.content"
			:owner="owner"
		/>
	</div>
</template>

<style lang="stylus" src="./content-viewer.styl" scoped></style>

<script lang="ts" src="./content-viewer"></script>
