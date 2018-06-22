import { Component, OnInit, Input } from '@angular/core';
import { TopbarService } from './topbar.service'
@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {

  /* @Input() */
  status: string;
  dlog_number: number;




  constructor(public topbarService: TopbarService) { }

  ngOnInit() {
    this.status = "OFFLINE";
    this.dlog_number = 1;

    var selector1 = document.getElementById('selector1');
    selector1.addEventListener('change', function (e) {
      console.log('selector1 was changed');

      console.log(document.getElementById('selector1'))
      var body = { data:1 };

      // cant get index of selector ( data still wrong)
      fetch('/postSelectDlog',
        {
          method: 'POST',
          body: JSON.stringify(body),
          headers: new Headers({ 'Content-Type': 'application/json' }),
        })
        .then(res => res.json())
        .then(json => console.log(json));
    });
  }

  

  /* dlogSelected(index: number) {
    this.dlog_number = index;
    console.log("dlog_number " + this.dlog_number)
  } */

}
