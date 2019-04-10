<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-body">
			<app-comment-widget
				:resource="resource"
				:resource-id="resourceId"
				:thread-comment-id="commentId"
				:show-tabs="false"
				:show-add="false"
				@remove="onRemove"
				@error="onError"
			/>
		</div>

		<div slot="footer" v-if="user && !hasError">
			<app-message-thread-add v-if="parent" hide-message-split>
				<form-comment
					:resource="resource"
					:resource-id="resourceId"
					:parent-id="parent.id"
					:placeholder="$gettext(`Leave a reply...`)"
					:autofocus="autofocus"
					:max-height="Screen.isXs ? '110px' : '250px'"
					@submit="_onCommentAdd"
				/>
			</app-message-thread-add>
		</div>
	</app-modal>
</template>

<script lang="ts" src="./modal"></script>
