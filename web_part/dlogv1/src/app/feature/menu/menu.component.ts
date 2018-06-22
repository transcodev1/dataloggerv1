import { Component, OnInit } from '@angular/core';
import {ServiceService} from '../../service.service';
import { Http } from '@angular/http';
import { Router } from "@angular/router";
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  status: string;


  constructor(private router:Router,private dataService:ServiceService) { 
  }

  ngOnInit() {
  this.status =null
    
  }

  canlink(url: string) {
     this.router.navigate([url]);

   /*  this.dataService.getSession().subscribe(res => {
        this.status = res
        if (this.status != null)
          this.router.navigate([url]);
        else
          this.router.navigate(['']);
      }); */

  }

  

}
