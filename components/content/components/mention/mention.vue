<template>
	<span class="mention">
		<template v-if="user">
			<a target="_blank" :href="user.url">
				<span :title="user.display_name + ' (@' + user.username + ')'">
					@{{ user.username }}
					<img key="user" :src="user.img_avatar" class="img-responsive mention-avatar-img" alt="" />
				</span>
			</a>
		</template>
		<!-- Placeholder until the user data is hydrated: -->
		<template v-else>
			<a target="_blank" :href="'@' + username">
				<span :title="'@' + username">@{{ username }}</span>
			</a>
		</template>
	</span>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.mention
	white-space: normal

.mention-avatar-img
	display: inline
	height: 1.25em
	img-circle()
</style>

<script lang="ts" src="./mention"></script>
