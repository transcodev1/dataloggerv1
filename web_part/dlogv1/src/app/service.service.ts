import { Injectable } from '@angular/core';

import {Http,Headers, RequestOptions, URLSearchParams} from '@angular/http';
import 'rxjs/add/operator/map';


@Injectable({
  providedIn: 'root'
})

export class ServiceService {

  result: any;
  constructor(private http:Http) {

   }

   getData(){
   return this.http.get('https://jsonplaceholder.typicode.com/todos')
   .map((res)=>res.json());

   }
   getSession() {
    return this.http.get("session")
      .map(result => this.result = result.json().data);

  }

  /* getSelectDLOG(){
    return this.http.get('/getselectdlog')
    .map((res)=>res.json());
 
    }
   setSelectDLOG(dlog_nuber:number){

      return this.http.get('/setselectdlog')
      .map((res)=>res.json());
   
      } */
   
}
