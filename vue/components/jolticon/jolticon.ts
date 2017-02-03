import * as Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export default class AppJolticon extends Vue
{
	@Prop( String ) icon: string;
}
