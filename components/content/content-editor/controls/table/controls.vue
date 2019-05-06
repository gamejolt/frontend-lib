<template>
	<div contenteditable="false" class="content-editor-table-controls">
		<span class="-title">
			<translate>Edit Table</translate>
		</span>

		<span class="control-container">
			<app-popper placement="top">
				<app-button icon="ellipsis-v" sparse circle trans @click.prevent />

				<div slot="popover" clas="fill-darkest">
					<div class="list-group list-group-dark">
						<a class="list-group-item" @click.stop="onClickInsertRowAbove()">
							<translate>Insert Row above</translate>
						</a>

						<a class="list-group-item" @click.stop="onClickInsertRowBelow()">
							<translate>Insert Row below</translate>
						</a>

						<a class="list-group-item" @click.stop="onClickInsertColumnLeft()">
							<translate>Insert Column left</translate>
						</a>

						<a class="list-group-item" @click.stop="onClickInsertColumnRight()">
							<translate>Insert Column right</translate>
						</a>

						<hr />

						<a class="list-group-item" @click.prevent="onClickRemoveRow()">
							<translate>Remove selected Row</translate>
						</a>

						<a class="list-group-item" @click.prevent="onClickRemoveColumn()">
							<translate>Remove selected Column</translate>
						</a>

						<hr />

						<a class="list-group-item" @click.stop="onClickToggleHeader()">
							<translate>Toggle Header Row</translate>
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
				v-app-tooltip="$gettext('Remove Table')"
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
