<template>
	<div class="user-embed">
		<template v-if="isHydrated">
			<app-user-card :user="user" />
		</template>
		<template v-else-if="hasError">
			{{ errorMessage }}
		</template>
		<template v-else>
			<app-loading />
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.user-embed
	max-width: 320px
</style>

<script lang="ts" src="./user-embed"></script>
