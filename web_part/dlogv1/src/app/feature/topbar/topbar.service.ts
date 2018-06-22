import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TopbarService {

  messages: string[] = [];
  data:string;

  add(message: string) {
    this.messages.push(message);
  }
  replace(data:string)
  {
    this.data = data; 
  }

  constructor() { }
}
