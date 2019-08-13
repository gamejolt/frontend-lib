<template>
	<div
		ref="container"
		:style="{
			top: this.top,
			left: this.left,
			bottom: this.bottom,
		}"
		class="-container"
	>
		<transition name="fade">
			<div v-if="visible && users.length" class="-autocomplete" ref="list">
				<app-loading v-if="isLoading && inverted" class="-loading-top" centered hide-label />

				<button
					v-for="dUser of displayUsers"
					:key="dUser.user.id"
					class="-suggestion"
					:class="{ '-suggestion-selected': isSelected(dUser.user.id) }"
					@click.prevent="onClickInsert(dUser.user)"
				>
					<div v-if="dUser.user.is_following" class="-follow-indicator">
						<small class="text-muted">
							<app-jolticon icon="user" />
							<translate v-if="dUser.user.follows_you">You follow each other</translate>
							<translate v-else>Following</translate>
						</small>
					</div>
					<div class="-user">
						<app-user-avatar-img class="-avatar" :user="dUser.user" />
						<div>
							<div class="-name-row">
								<strong>{{ dUser.user.display_name }}</strong>
								<app-user-verified-tick :user="dUser.user" />
							</div>
							<div>
								<small>@{{ dUser.user.username }}</small>
							</div>
						</div>
					</div>
				</button>

				<app-loading v-if="isLoading && !inverted" class="-loading-bottom" centered hide-label />
			</div>
		</transition>
	</div>
</template>

<style lang="stylus" src="./controls.styl" scoped></style>

<script lang="ts" src="./controls"></script>
