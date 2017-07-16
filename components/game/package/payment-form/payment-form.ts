import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./payment-form.html?style=./payment-form.styl';

import {
	BaseForm,
	FormOnInit,
	FormOnSubmitSuccess,
	FormOnSubmit,
} from '../../../form-vue/form.service';
import { Game } from '../../game.model';
import { GamePackage } from '../package.model';
import { Sellable } from '../../../sellable/sellable.model';
import { User } from '../../../user/user.model';
import { Screen } from '../../../screen/screen-service';
import { makeObservableService } from '../../../../utils/vue';
import { Api } from '../../../api/api.service';
import { arrayIndexBy } from '../../../../utils/array';
import { Geo, Country } from '../../../geo/geo.service';
import { HistoryTick } from '../../../history-tick/history-tick-service';
import { Device } from '../../../device/device.service';
import { OrderPayment } from '../../../order/payment/payment.model';
import { Environment } from '../../../environment/environment.service';
import { AppStore } from '../../../../vue/services/app/app-store';
import { Growls } from '../../../growls/growls.service';
import { currency } from '../../../../vue/filters/currency';
import { AppLoading } from '../../../../vue/components/loading/loading';
import { AppExpand } from '../../../expand/expand';
import { AppTooltip } from '../../../tooltip/tooltip';
import { AppPopoverTrigger } from '../../../popover/popover-trigger.directive.vue';
import { AppPopover } from '../../../popover/popover';
import { AppJolticon } from '../../../../vue/components/jolticon/jolticon';
import { AppFocusWhen } from '../../../form-vue/focus-when.directive';
import { AppForm } from '../../../form-vue/form';

type CheckoutType = 'cc-stripe' | 'paypal' | 'wallet';

@View
@Component({
	components: {
		AppJolticon,
		AppLoading,
		AppExpand,
		AppPopover,
	},
	directives: {
		AppTooltip,
		AppPopoverTrigger,
		AppFocusWhen,
	},
	filters: {
		currency,
	},
})
export class FormGamePackagePayment extends BaseForm<any>
	implements FormOnInit, FormOnSubmit, FormOnSubmitSuccess {
	@Prop(Game) game: Game;

	@Prop(GamePackage) package: GamePackage;

	@Prop(Sellable) sellable: Sellable;
	// @Prop(SellablePricing)
	// pricing: SellablePricing;

	@Prop(String) partnerReferredKey?: string;

	@Prop(User) partnerReferredBy?: User;

	@Prop(Boolean) partnerNoCut?: boolean;

	@State app: AppStore;

	$refs: {
		form: AppForm;
	};

	// form.this.onBought = '&';

	isLoaded = false;
	isLoadingMethods = true;
	isProcessing = false;
	checkoutType: CheckoutType = 'cc-stripe';
	checkoutStep = 'primary';

	cards: any[] = [];
	cardsTax = {};
	addresses: any[] = [];
	calculatedAddressTax = false;
	addressTaxAmount = 0;
	countries: Country[] = [];
	walletBalance = 0;
	walletTax = 0;
	minOrderAmount = 50;

	Screen = makeObservableService(Screen);

	get pricing() {
		return this.sellable.pricings[0];
	}

	get _minOrderAmount() {
		return this.sellable.type === 'paid' ? this.pricing.amount / 100 : this.minOrderAmount / 100;
	}

	get formattedAmount() {
		return currency(this.pricing.amount);
	}

	get minOrderMessage() {
		return this.$gettextInterpolate(
			// tslint:disable-next-line:max-line-length
			`Because of payment processing fees, we are not able to sell this game for less than %{ amount }. You can click the link below to grab the download for free, though!`,
			{ amount: currency(this.minOrderAmount) }
		);
	}

	get hasSufficientWalletFunds() {
		if (!this.formModel.amount || this.formModel.amount <= 0) {
			return true;
		}

		// When we're filling in the address, pull that tax.
		// Otherwise, when we're on the main page, check the wallet tax amount for their saved address.
		const taxAmount = this.checkoutStep === 'address' ? this.addressTaxAmount : this.walletTax;
		const sellableAmount = this.pricing.amount;
		const currentAmount = this.formModel.amount * 100; // The formModel amount is a decimal.

		// Paid games have to be more than the amount of the game base price.
		if (
			this.sellable.type === Sellable.TYPE_PAID &&
			this.walletBalance < sellableAmount + taxAmount
		) {
			return false;
		}

		// All games have to be more than they've entered into the box.
		if (this.walletBalance < currentAmount + taxAmount) {
			return false;
		}

		return true;
	}

	// this.$watch('formModel.country', function(country) {
	// 	this.regions = Geo.getRegions(country);
	// 	if (this.regions) {
	// 		this.formModel.region = this.regions[0].code; // Default to first.
	// 	} else {
	// 		this.formModel.region = '';
	// 	}
	// });

	// // Tax changes when amount changes.
	// // Gotta repull all methods to get new tax info.
	// var debouncedLoad = _.debounce(load, 1000);
	// this.$watch('formModel.amount', function(newVal, oldVal) {
	// 	if (newVal != oldVal) {
	// 		this.isLoadingMethods = true;
	// 		debouncedLoad();
	// 	}
	// });

	// this.$watchGroup(
	// 	['formModel.country', 'formModel.region'],
	// 	getAddressTax
	// );

	onInit() {
		// this.$state = $state;
		// this.App = App;
		// this.gjCurrencyFilter = gjCurrencyFilter;

		// this.isLoaded = false;
		// this.isLoadingMethods = true;
		// this.checkoutType = 'cc-stripe';
		// this.checkoutStep = 'primary';

		this.setField('amount', this.pricing.amount ? this.pricing.amount / 100 : null);
		this.setField('country', 'us');

		// this.cards = [];
		// this.cardsTax = {};
		// this.addresses = [];
		// this.walletBalance = 0;
		// this.walletTax = 0;

		this.load();
	}

	async load() {
		const response = await Api.sendRequest(
			'/web/checkout/methods?amount=' + this.formModel.amount * 100,
			null,
			{ detach: true }
		);

		this.isLoadingMethods = false;
		this.isLoaded = true;
		this.minOrderAmount = response.minOrderAmount || 50;

		if (response && response.cards && response.cards.length) {
			this.cards = response.cards;
			this.cardsTax = arrayIndexBy<any>(response.cardsTax, 'id');
		}

		if (response && response.billingAddresses && response.billingAddresses.length) {
			this.addresses = response.billingAddresses;
		}

		if (response && response.walletBalance && response.walletBalance > 0) {
			this.walletBalance = response.walletBalance;
			this.walletTax = response.walletTax;
		}
	}

	addMoney(amount: number) {
		let curAmount: number = typeof this.formModel.amount === 'string'
			? parseFloat(this.formModel.amount)
			: this.formModel.amount;

		if (!curAmount) {
			curAmount = amount;
		} else {
			// TODO
			// } else if (this.paymentForm.amount.$valid) {
			// Don't add if the form field is invalid.
			// It will blank out the total amount.
			curAmount += amount;
			curAmount = parseFloat(curAmount.toFixed(2));
		}
		this.formModel.amount = curAmount;
	}

	collectAddress(checkoutType: CheckoutType) {
		if (this.addresses.length) {
			if (checkoutType === 'paypal') {
				this.checkoutPaypal();
				return;
			} else if (checkoutType === 'wallet') {
				this.checkoutWallet();
				return;
			}
		}

		this.checkoutStep = 'address';
		this.checkoutType = checkoutType;
		this.countries = Geo.getCountries();
		this.calculatedAddressTax = false;
		this.addressTaxAmount = 0;
	}

	async getAddressTax() {
		this.calculatedAddressTax = false;
		if (!this.formModel.country || !this.formModel.region) {
			return;
		}

		const data = {
			amount: this.formModel.amount * 100,
			country: this.formModel.country,
			region: this.formModel.region,
		};

		const response = await Api.sendRequest('/web/checkout/taxes', data, {
			detach: true,
		});

		this.calculatedAddressTax = true;
		this.addressTaxAmount = response.amount;
	}

	checkoutCard() {
		this.checkoutType = 'cc-stripe';
		this.$refs.form.submit();
	}

	checkoutPaypal() {
		this.checkoutType = 'paypal';
		this.$refs.form.submit();
	}

	startOver() {
		this.checkoutStep = 'primary';
	}

	checkoutSavedCard(card) {
		const data: any = {
			payment_method: 'cc-stripe',
			sellable_id: this.sellable.id,
			pricing_id: this.pricing.id,
			amount: this.formModel.amount * 100,
		};

		return this.doCheckout(data, { payment_source: card.id });
	}

	checkoutWallet() {
		const data: any = {
			payment_method: 'wallet',
			sellable_id: this.sellable.id,
			pricing_id: this.pricing.id,
			amount: this.formModel.amount * 100,
		};

		if (this.addresses.length) {
			data.address_id = this.addresses[0].id;
		} else {
			data.country = this.formModel.country;
			data.street1 = this.formModel.street1;
			data.region = this.formModel.region;
			data.postcode = this.formModel.postcode;
		}

		return this.doCheckout(data, { wallet: true });
	}

	/**
	 * This is for checkouts outside the normal form submit flow.
	 * We need to manually handle processing and errors.
	 */
	private async doCheckout(setupData, chargeData) {
		if (this.isLoadingMethods || this.isProcessing) {
			return;
		}

		this.isProcessing = true;

		setupData['source'] = HistoryTick.getSource('Game', this.package.game_id) || null;
		setupData['os'] = Device.os();
		setupData['arch'] = Device.arch();
		setupData['ref'] = this.partnerReferredKey || null;

		try {
			let response = await Api.sendRequest('/web/checkout/setup-order', setupData);
			if (response.success === false) {
				throw response;
			}

			response = await Api.sendRequest('/web/checkout/charge/' + response.cart.id, chargeData);
			if (response.success === false) {
				throw response;
			}

			// Notify that we've bought this package.
			this.$emit('bought');
		} catch (_e) {
			this.isProcessing = false;

			// This should always succeed, so let's throw a generic message if it fails.
			Growls.error({
				sticky: true,
				message: this.$gettext('There was a problem processing your payment method.'),
			});
		}
	}

	onSubmit() {
		const data: any = {
			payment_method: this.checkoutType,
			sellable_id: this.sellable.id,
			pricing_id: this.pricing.id,
			amount: this.formModel.amount * 100,

			country: this.formModel.country,
			street1: this.formModel.street1,
			region: this.formModel.region,
			postcode: this.formModel.postcode,
		};

		if (!this.app.user) {
			data.email_address = this.formModel.email_address;
		}

		if (this.addresses.length) {
			data.address_id = this.addresses[0].id;
		}

		data['source'] = HistoryTick.getSource('Game', this.package.game_id) || null;
		data['os'] = Device.os();
		data['arch'] = Device.arch();
		data['ref'] = this.partnerReferredKey || null;

		return Api.sendRequest('/web/checkout/setup-order', data);
	}

	onSubmitSuccess(response: any) {
		if (GJ_IS_CLIENT) {
			// Our checkout can be done in client.
			if (this.checkoutType === OrderPayment.METHOD_CC_STRIPE) {
				window.location.href = Environment.checkoutBaseUrl + '/checkout/' + response.cart.id;
			} else {
				// Otherwise we have to open in browser.
				require('nw.gui').Shell.openExternal(response.redirectUrl);
			}
		} else {
			// For site we have to replace the URL completely since we are switching to https.
			window.location.href = response.redirectUrl;
		}
	}
}
