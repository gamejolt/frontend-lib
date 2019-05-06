<template>
	<div
		ref="container"
		class="content-editor-controls"
		:style="{
			top: this.top,
			left: this.left,
		}"
		:class="{
			'controls-desktop': !Screen.isXs,
			'controls-mobile': Screen.isXs,
		}"
	>
		<!-- When adding new buttons here, make sure they are added in both mobile and desktop views -->
		<transition name="fade">
			<div v-if="visible">
				<template v-if="Screen.isXs">
					<button
						v-if="capabilities.media"
						class="control-button"
						@click.prevent="onClickMedia"
						v-app-tooltip="$gettext('Upload Media')"
					>
						<app-jolticon icon="screenshot" />
					</button>
					<button
						v-if="capabilities.hasAnyEmbed"
						class="control-button"
						@click.prevent="onClickEmbed"
						v-app-tooltip="$gettext('Embed Content')"
					>
						<app-jolticon icon="embed" />
					</button>
					<button
						v-if="capabilities.codeBlock"
						class="control-button"
						@click.prevent="onClickCodeBlock"
						v-app-tooltip="$gettext('Add Code Block')"
					>
						<app-jolticon icon="brackets" />
					</button>
					<button
						v-if="capabilities.blockquote"
						class="control-button"
						@click.prevent="onClickBlockquote"
						v-app-tooltip="$gettext('Add Quote')"
					>
						<app-jolticon icon="blockquote" />
					</button>
					<button
						v-if="capabilities.spoiler"
						class="control-button"
						@click.prevent="onClickSpoiler"
						v-app-tooltip="$gettext('Add Spoiler')"
					>
						<app-jolticon icon="inactive" />
					</button>
					<button
						v-if="capabilities.hr"
						class="control-button"
						@click.prevent="onClickHr"
						v-app-tooltip="$gettext('Add Separator')"
					>
						<app-jolticon icon="hr" />
					</button>
					<button
						v-if="capabilities.table"
						class="control-button"
						@click.prevent="onClickTable"
						v-app-tooltip="$gettext('Add Table')"
					>
						<app-jolticon icon="insert-table" />
					</button>
					<button
						v-if="capabilities.lists"
						class="control-button"
						@click.prevent="onClickBulletList"
						v-app-tooltip="$gettext('Add Bullet List')"
					>
						<app-jolticon icon="bullet-list" />
					</button>
					<button
						v-if="capabilities.lists"
						class="control-button"
						@click.prevent="onClickOrderedList"
						v-app-tooltip="$gettext('Add Numbered List')"
					>
						<app-jolticon icon="numbered-list" />
					</button>
				</template>
				<template v-else>
					<app-button
						class="-add-button"
						:class="{
							'-add-button-rotated': !collapsed,
						}"
						circle
						solid
						:icon="'add'"
						@click.prevent="onClickExpand"
					/>
					<transition name="fade">
						<span v-if="!this.collapsed">
							<span class="dot-separator"></span>
							<app-button
								v-if="capabilities.media"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="screenshot"
								@click.prevent="onClickMedia"
								v-app-tooltip="$gettext('Upload Media')"
							/>
							<app-button
								v-if="capabilities.hasAnyEmbed"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="embed"
								@click.prevent="onClickEmbed"
								v-app-tooltip="$gettext('Embed Content')"
							/>
							<app-button
								v-if="capabilities.codeBlock"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="brackets"
								@click.prevent="onClickCodeBlock"
								v-app-tooltip="$gettext('Add Code Block')"
							/>
							<app-button
								v-if="capabilities.blockquote"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="blockquote"
								@click.prevent="onClickBlockquote"
								v-app-tooltip="$gettext('Add Quote')"
							/>
							<app-button
								v-if="capabilities.spoiler"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="inactive"
								@click.prevent="onClickSpoiler"
								v-app-tooltip="$gettext('Add Spoiler')"
							/>
							<app-button
								v-if="capabilities.hr"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="hr"
								@click.prevent="onClickHr"
								v-app-tooltip="$gettext('Add Separator')"
							/>
							<app-button
								v-if="capabilities.table"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="insert-table"
								@click.prevent="onClickTable"
								v-app-tooltip="$gettext('Add Table')"
							/>
							<app-button
								v-if="capabilities.lists"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="bullet-list"
								@click.prevent="onClickBulletList"
								v-app-tooltip="$gettext('Add Bullet List')"
							/>
							<app-button
								v-if="capabilities.lists"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="numbered-list"
								@click.prevent="onClickOrderedList"
								v-app-tooltip="$gettext('Add Numbered List')"
							/>
						</span>
					</transition>
				</template>
			</div>
		</transition>
	</div>
</template>

<style lang="stylus" src="./controls.styl" scoped></style>

<script lang="ts" src="./controls"></script>
