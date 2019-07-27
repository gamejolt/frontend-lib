<template>
	<div
		ref="container"
		:style="{
			top: this.top,
		}"
		class="-container"
	>
		<transition name="fade">
			<div v-if="visible" class="-autocomplete">
				<div
					v-for="user of users"
					:key="user.id"
					class="-suggestion"
					:class="{ '-suggestion-selected': isSelected(user.id) }"
				>
					<div v-if="user.is_following" class="-follow-indicator">
						<small class="text-muted">
							<app-jolticon icon="user" />
							<translate v-if="user.follows_you">You follow each other</translate>
							<translate v-else>Following</translate>
						</small>
					</div>
					<div class="-user">
						<app-user-avatar-img class="-avatar" :user="user" />
						<div>
							<div class="-name-row">
								<strong>{{ user.display_name }}</strong>
								<app-user-verified-tick :user="user" />
							</div>
							<div>
								<small>@{{ user.username }}</small>
							</div>
						</div>
					</div>
				</div>
			</div>
		</transition>
	</div>
</template>

<style lang="stylus" src="./controls.styl" scoped></style>

<script lang="ts" src="./controls"></script>
