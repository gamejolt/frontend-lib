<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-body">
			<div v-if="hasError" class="error-container">
				<p><translate>Something went wrong.</translate></p>
				<app-button @click.prevent="onRetry"><translate>Retry</translate></app-button>
			</div>

			<template v-else>
				<div class="input-container">
					<app-button
						sparse
						trans
						icon="remove"
						v-if="shouldShowResetButton"
						@click.prevent="onClickReset"
					/>
					<div class="search-bar">
						<input
							class="search form-control"
							:placeholder="$gettext('Search Tenor...')"
							:disabled="loadingCategories"
							:value="searchValue"
							@input="onSearchInput"
							@keydown="onSearchKeyDown"
						/>
						<app-jolticon icon="search" class="search-icon text-muted" />
					</div>
				</div>
				<div v-if="loadingCategories" class="loading-categories">
					<app-loading centered big />
				</div>
				<div
					v-else
					class="gif-content"
					id="gif-content-scroller"
					:class="{
						'gif-content-scroll': !Screen.isXs,
						'gif-content-noscroll': isLoading && searchResults.length === 0,
					}"
					@scroll="onContainerScroll"
				>
					<div v-if="shouldShowCategories" class="categories-list">
						<div
							v-for="category of categories"
							:key="category.searchterm"
							class="category"
							:class="{
								'category-sm': Screen.isXs,
							}"
							:style="{
								'animation-delay': category.index * 0.02 + 's',
							}"
							@click.prevent="onClickCategory(category.searchterm)"
						>
							<img :src="category.previewGif" />
							<div class="category-text">
								<span>{{ category.searchterm }}</span>
							</div>
						</div>
					</div>
					<div v-else>
						<div class="search-results">
							<div
								v-for="searchResult of searchResults"
								:key="searchResult.id"
								class="search-result-container"
								:style="{
									'animation-delay': searchResult.index * 0.02 + 's',
								}"
								@click="onClickSearchResult(searchResult)"
							>
								<div
									class="search-result"
									:class="{
										'search-result-sm': Screen.isXs,
									}"
								>
									<img :src="searchResult.previewGif" class="gif-preview" />
								</div>
							</div>
							<template v-if="isLoading">
								<div
									v-for="i of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]"
									:key="i"
									class="search-result-placeholder search-result-loading"
									:class="{
										'search-result-placeholder-sm': Screen.isXs,
									}"
									:style="{
										'animation-delay': i * 0.02 + 's',
									}"
								></div>
							</template>
						</div>
						<div v-if="reachedLastPage" class="endOfScroll">
							<img src="./mascot-complete.png" title="♥" />
							<span class="text-muted">
								These are not the GIFs you are looking for!
							</span>
						</div>
						<div v-else-if="shouldShowMoreButton" class="more-container">
							<app-button @click.prevent="loadNextPage">More</app-button>
						</div>
					</div>
				</div>
			</template>
		</div>
	</app-modal>
</template>

<style lang="stylus" src="./gif-modal.styl" scoped></style>

<script lang="ts" src="./gif-modal"></script>
