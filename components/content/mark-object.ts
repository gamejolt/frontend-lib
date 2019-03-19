export class MarkObject {
	public type!: string;
	public attrs!: { [key: string]: any };

	public static fromJsonObj(jsonObj: any): MarkObject {
		return jsonObj as MarkObject;
	}

	public toJsonObj(): any {
		const jsonObj = {} as any;

		jsonObj.type = this.type;

		if (Object.keys(this.attrs).length > 0) {
			jsonObj.attrs = this.attrs;
		}

		return jsonObj;
	}
}
