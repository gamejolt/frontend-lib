<template>
	<div>
		<div class="-list">
			<div class="-user" v-for="user of users" :key="user.id">
				<app-user-avatar
					class="-avatar"
					:user="user"
					v-app-tooltip="user.display_name + ' (@' + user.username + ')'"
				/>
				<app-user-verified-tick class="-tick" :user="user" />
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
	position: relative

.-avatar
	img-circle()
	change-bg('bg-subtle')
	pressy()
	flex: none
	width: $-size
	height: $-size

.-tick
	change-bg('bg')
	border-radius: 50%
	position: absolute
	right: 0
	bottom: 0
	pointer-events: none

</style>

<script lang="ts" src="./list"></script>
