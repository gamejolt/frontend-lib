<template>
	<app-card class="community-container">
		<template v-if="hasError">
			<app-jolticon icon="notice" />
			<translate>Failed to load community information</translate>
			<br />
			<app-button @click="onClickRetry">
				<translate>Retry</translate>
			</app-button>
		</template>
		<template v-else-if="isHydrated">
			<app-theme :theme="community.theme" force-dark>
				<template v-if="community.header">
					<div class="header-background">
						<img class="header-background-img" :src="community.header.img_url" />
					</div>
					<div class="header-background-fade" />
				</template>
				<div class="-inner">
					<div class="-thumbnail">
						<router-link :to="'/c/' + community.path">
							<app-community-thumbnail-img :community="community" />
						</router-link>
					</div>
					<div class="-title">
						<translate>Community</translate>
						<br />
						<router-link :to="'/c/' + community.path">
							<strong>{{ community.name }}</strong>
						</router-link>
					</div>
				</div>
				<div class="content">
					<app-community-join-widget block :community="community" />
				</div>
			</app-theme>
		</template>
		<template v-else>
			<app-loading />
		</template>
	</app-card>
</template>

<style lang="stylus" src="./community-embed.styl" scoped></style>

<script lang="ts" src="./community-embed"></script>
