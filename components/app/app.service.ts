import { Injectable } from '@angular/core';
import { User } from '../user/user.model';

@Injectable()
export class App
{
	ver?: number;
	user?: User;
}
