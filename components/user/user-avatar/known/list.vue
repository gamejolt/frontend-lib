<template>
	<div>
		<div class="-list">
			<div class="-user" v-for="user of users" :key="user.id">
				<app-user-avatar
					class="-avatar"
					:user="user"
					v-app-tooltip="user.display_name + ' (@' + user.username + ')'"
				/>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

$-size = 40px
$-spacing = 3px

.-list
	position: relative
	flex: 1
	display: flex
	flex-wrap: wrap
	padding-top: 4px
	padding-bottom: 4px

.-user
	flex: none
	width: $-size
	height: $-size
	margin: 0 $-spacing $-spacing

.-avatar
	img-circle()
	theme-prop('background-color', 'bg-subtle')
	pressy()
	flex: none
	width: $-size
	height: $-size
	margin-right: $grid-gutter-width-xs * 0.5

	@media $media-sm-up
		margin-right: $grid-gutter-width * 0.5
</style>

<script lang="ts" src="./list" />
