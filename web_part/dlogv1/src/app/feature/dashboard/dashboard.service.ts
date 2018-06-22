import { Injectable } from '@angular/core';
import {Http,Headers, RequestOptions, URLSearchParams} from '@angular/http';
import {TopbarService} from '../topbar/topbar.service'
import 'rxjs/add/operator/map';
import { Observable, of } from 'rxjs';
import {DashboardComponent} from './dashboard.component'
@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private topbarService: TopbarService) { }

/*   getSelectDLOG(): Observable<DashboardComponent[]> {
    
    this.topbarService.add('HeroService: fetched heroes');
    return of(HEROES);
  } */


}
