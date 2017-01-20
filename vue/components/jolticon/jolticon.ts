import * as Vue from 'vue';
import { Component, prop } from 'vue-property-decorator';

@Component({})
export default class AppJolticon extends Vue
{
	@prop( String ) icon: string;
}
