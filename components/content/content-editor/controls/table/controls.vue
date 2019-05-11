<template>
	<div contenteditable="false" class="content-editor-table-controls">
		<span class="-title">
			<translate>Edit Table</translate>
		</span>

		<span class="control-container">
			<app-popper placement="top" @show="isMenuShown = true" @hide="isMenuShown = false">
				<app-button icon="ellipsis-v" sparse circle trans @click.prevent />

				<div v-if="isMenuShown" slot="popover" class="fill-darkest">
					<div class="list-group list-group-dark">
						<a class="list-group-item" @click.stop="onClickInsertRowAbove()">
							<translate>Insert row above</translate>
						</a>

						<a class="list-group-item" @click.stop="onClickInsertRowBelow()">
							<translate>Insert row below</translate>
						</a>

						<a class="list-group-item" @click.stop="onClickInsertColumnLeft()">
							<translate>Insert column left</translate>
						</a>

						<a class="list-group-item" @click.stop="onClickInsertColumnRight()">
							<translate>Insert column right</translate>
						</a>

						<hr />

						<a class="list-group-item" @click.prevent="onClickRemoveRow()">
							<translate>Remove selected row</translate>
						</a>

						<a class="list-group-item" @click.prevent="onClickRemoveColumn()">
							<translate>Remove selected column</translate>
						</a>

						<hr />

						<a class="list-group-item" @click.stop="onClickToggleHeader()">
							<translate>Toggle header Row</translate>
						</a>
					</div>
				</div>
			</app-popper>
		</span>

		<span class="pull-right">
			<app-button
				sparse
				circle
				trans
				icon="remove"
				@click.prevent="onClickRemoveTable()"
				v-app-tooltip="$gettext('Remove table')"
			/>
		</span>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.content-editor-table-controls
	theme-prop('background-color', 'bg-offset')
	rounded-corners()
	padding-top: 4px
	padding-bottom: 4px
	padding-left: 10px
	padding-right: 10px
	white-space: normal
	margin-bottom: 10px

.-title
	font-style: italic
	theme-prop('color', 'fg-muted')

.control-container
	margin-left: 12px
</style>

<script lang="ts" src="./controls"></script>
