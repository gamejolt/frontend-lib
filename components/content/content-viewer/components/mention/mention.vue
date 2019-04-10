<template>
	<div class="user-mention">
		<template v-if="user">
			<app-user-card-hover :user="user">
				<router-link :to="user.url">
					<span>
						@{{ user.username }}
						<img
							key="user"
							:src="user.img_avatar"
							class="img-responsive mention-avatar-img"
							alt=""
						/>
					</span>
				</router-link>
			</app-user-card-hover>
		</template>
		<!-- Placeholder until the user data is hydrated: -->
		<template v-else>
			<router-link :to="'@' + username">
				<span :title="'@' + username">@{{ username }}</span>
			</router-link>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.user-mention
	display: inline-block

.mention-avatar-img
	display: inline
	height: 1.5em
	img-circle()
</style>

<script lang="ts" src="./mention"></script>
