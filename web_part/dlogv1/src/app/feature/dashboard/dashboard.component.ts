import { Component, OnInit,AfterViewInit,OnDestroy ,OnChanges ,Input } from '@angular/core';

import { ServiceService } from '../../service.service'
import { DashboardService } from './dashboard.service';
import { FormsModule } from '@angular/forms';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import * as Chart from 'chart.js'
import { FUNCTION_TYPE } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit,OnDestroy {

  @Input()
  intv: any;

  temp :number;

  status_show: string;
  dlog_show: string;
  
  constructor(private service: ServiceService) {

  }
  ngOnChange()
  {
   console.log("ON cHANGE")

  }

  ngOnInit() {


    //default value
    this.temp = 60;
    this.status_show = "OFFLINE";  //show
    this.dlog_show = "dlog1"

    
    var status ="ONLINE"  
    var device_id = 12345678
    var device_select = 'dlog1'
    device_select =  (<HTMLInputElement>document.getElementById('selector1')).value;

    interface config {
      data: string;
    }

    const selector1 = <HTMLInputElement>document.getElementById('selector1');
    selector1.addEventListener('change', function (e) {
      console.log('selector1 was changed');

      status = "ONLINE"
    switch(selector1.value)
    {
      case '0' : device_id  = 12345678;break;
      case '1' : device_id  = 0x00007048860DDF79;break;
      case '2' : device_id  = 33333333;break;
      case '3' : device_id  = 44444444;break;
    }
    device_select = (<HTMLInputElement>document.getElementById('selector1')).value;
    });


    var ip = 'http://13.67.73.17:80'

    /* ################################################### */
    const r1 = document.getElementById('r1');
    r1.addEventListener('click', function (e) {
      console.log('r1 was clicked');
      post_json(ip+'/relay_ctrl', { UUID: device_id, CH : 0,MODE:0});
    });
    const r2 = document.getElementById('r2');
    r2.addEventListener('click', function(e) {
      console.log('r2 was clicked');
      post_json(ip+'/relay_ctrl', { UUID: device_id, CH : 1,MODE:0});
    });
    const r3 = document.getElementById('r3');
    r3.addEventListener('click', function(e) {
      console.log('r3 was clicked');
      post_json(ip+'/relay_ctrl', { UUID: device_id, CH : 2,MODE:0});
    });
    const r4 = document.getElementById('r4');
    r4.addEventListener('click', function(e) {
      console.log('r4 was clicked');
      post_json(ip+'/relay_ctrl', { UUID: device_id, CH : 3,MODE:0});
    });
    const r5 = document.getElementById('r5');
    r5.addEventListener('click', function(e) {
      console.log('r5 was clicked');
     post_json(ip+'/relay_ctrl', { UUID: device_id, CH : 4,MODE:0});
  });
    const r6 = document.getElementById('r6');
    r6.addEventListener('click', function(e) {
      console.log('r6 was clicked');
     post_json(ip+'/relay_ctrl', { UUID: device_id, CH : 5,MODE:0});
  });

  const r7 = document.getElementById('r7');
  r7.addEventListener('click', function(e) {
    console.log('r7 was clicked'); 
    post_json(ip+'/relay_ctrl', { UUID: device_id, CH : 6,MODE:0});
  });


  const r8 = document.getElementById('r8');
  r8.addEventListener('click', function(e) {
    console.log('r8 was clicked');
    post_json(ip+'/relay_ctrl', { UUID: device_id, CH : 7,MODE:0});
  });




  const rst1 = document.getElementById('rst1');
  rst1.addEventListener('click', function (e) {
      console.log('rst1 was clicked');
      post_json(ip+'/relay_rst', { UUID: device_id, CH : 0});
    });
    const rst2 = document.getElementById('rst2');
    rst2.addEventListener('click', function (e) {
      console.log('rst2 was clicked');
      post_json(ip+'/relay_rst', { UUID: device_id, CH : 1});
    });
    const rst3 = document.getElementById('rst3');
    rst3.addEventListener('click', function (e) {
      console.log('rst3 was clicked');
      post_json(ip+'/relay_rst', { UUID: device_id, CH : 2});
    });
    const rst4 = document.getElementById('rst4');
    rst4.addEventListener('click', function (e) {
      console.log('rst4 was clicked');
      post_json(ip+'/relay_rst', { UUID: device_id, CH : 3});
    });
    const rst5 = document.getElementById('rst5');
    rst5.addEventListener('click', function (e) {
      console.log('rst5 was clicked');
      post_json(ip+'/relay_rst', { UUID: device_id, CH : 4});
    });
    const rst6 = document.getElementById('rst6');
    rst6.addEventListener('click', function (e) {
      console.log('rst6 was clicked');
      post_json(ip+'/relay_rst', { UUID: device_id, CH : 5});
    });
    const rst7 = document.getElementById('rst7');
    rst7.addEventListener('click', function (e) {
      console.log('rst7 was clicked');
      post_json(ip+'/relay_rst', { UUID: device_id, CH : 6});
    });
    const rst8 = document.getElementById('rst8');
    rst8.addEventListener('click', function (e) {
      console.log('rst8 was clicked');
      post_json(ip+'/relay_rst', { UUID: device_id, CH : 7});
    });


    const r_on = document.getElementById('r_on');
  r_on.addEventListener('click', function (e) {
      console.log('r_on was clicked');
      post_json(ip+'/relay_ctrl', { UUID: device_id, CH : 0xFF,MODE:1});
    });

    const r_off = document.getElementById('r_off');
    r_off.addEventListener('click', function (e) {
      console.log('r_off was clicked');
      post_json(ip+'/relay_ctrl', { UUID: device_id, CH : 0x01,MODE:1});
    });
    
    function post_json(path, body) {
      fetch(path, { method: 'POST',
              body:   JSON.stringify(body),
              headers: { 'Content-Type': 'application/json'}})
              .then(res => res.json())
              .then(json => console.log(json));	
    
  }

  function isEmptyObject(obj) {
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
      }
    }
    return true;
    }
    var temp =[]

    this.intv = setInterval(function() {
    
      var body = { UUID: device_id };
      console.log("body ="+ body.UUID);
      
      fetch(ip+'/page_update', {
        method: 'POST',
        body:    JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        })
      .then(res => res.json())
      .then(function handleJson (DLOGV1) {  
      
        if(!isEmptyObject(DLOGV1))
        {
        document.getElementById('r1').style.backgroundColor = ((DLOGV1.RELAY.CH0==1)?"green":"red");
        document.getElementById('r2').style.backgroundColor = ((DLOGV1.RELAY.CH1==1)?"green":"red");
        document.getElementById('r3').style.backgroundColor = ((DLOGV1.RELAY.CH2==1)?"green":"red");
        document.getElementById('r4').style.backgroundColor = ((DLOGV1.RELAY.CH3==1)?"green":"red");	
        document.getElementById('r5').style.backgroundColor = ((DLOGV1.RELAY.CH4==1)?"green":"red");
        document.getElementById('r6').style.backgroundColor = ((DLOGV1.RELAY.CH5==1)?"green":"red");
        document.getElementById('r7').style.backgroundColor = ((DLOGV1.RELAY.CH6==1)?"green":"red");
        document.getElementById('r8').style.backgroundColor = ((DLOGV1.RELAY.CH7==1)?"green":"red");

        document.getElementById('r1').className = ((DLOGV1.RELAY.CH0 ==1)?"button on":"button off");
        document.getElementById('r2').className = ((DLOGV1.RELAY.CH1 ==1)?"button on":"button off");
        document.getElementById('r3').className = ((DLOGV1.RELAY.CH2 ==1)?"button on":"button off");
        document.getElementById('r4').className = ((DLOGV1.RELAY.CH3 ==1)?"button on":"button off");
        document.getElementById('r5').className = ((DLOGV1.RELAY.CH4 ==1)?"button on":"button off");
        document.getElementById('r6').className = ((DLOGV1.RELAY.CH5 ==1)?"button on":"button off");
        document.getElementById('r7').className = ((DLOGV1.RELAY.CH6 ==1)?"button on":"button off");
        document.getElementById('r8').className = ((DLOGV1.RELAY.CH7 ==1)?"button on":"button off");

        if(temp.length==7)
        {
          temp.shift;
        }
        temp.push(DLOGV1.TEMP.CH0)

        document.getElementById('vdc1').innerText = DLOGV1.VDC.CH0 ;
        document.getElementById('vdc2').innerText = DLOGV1.VDC.CH1 ;
        document.getElementById('vac1').innerText = DLOGV1.VAC.CH0 ;
    
        document.getElementById('temp').innerText = DLOGV1.TEMP.CH0 ;
      
        }
        else{
          
        document.getElementById('r1').style.backgroundColor =  "black"
        document.getElementById('r2').style.backgroundColor =  "black"
        document.getElementById('r3').style.backgroundColor =  "black"
        document.getElementById('r4').style.backgroundColor =  "black"	
        document.getElementById('r5').style.backgroundColor =  "black"
        document.getElementById('r6').style.backgroundColor =  "black"
        document.getElementById('r7').style.backgroundColor =  "black"
        document.getElementById('r8').style.backgroundColor =  "black"

        document.getElementById('r1').className = "button null"
        document.getElementById('r2').className = "button null"
        document.getElementById('r3').className = "button null"
        document.getElementById('r4').className = "button null"
        document.getElementById('r5').className = "button null"
        document.getElementById('r6').className = "button null"
        document.getElementById('r7').className = "button null"
        document.getElementById('r8').className = "button null"

        }
        
    });
  }, 500);
    

  

  }
  ngOnDestroy(){
    if(this.intv)
    clearInterval(this.intv);

  }



  /* ********circle graph********* */
  canvas: any;
  ctx: any;

  ngAfterViewInit() {
    this.canvas = document.getElementById('myChart');
    
    this.ctx = this.canvas.getContext('2d');
    let myChart = new Chart(this.ctx, {
      type: 'bar',
      data: {
          labels: ["VDC", "VAC1", "VAC2"],
          datasets: [{
              data: [75,65,64],
              backgroundColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)'],
              borderWidth: 1,
              barPercentage: 0.2,
              scaleOverride:true,
              steps: 10,
              scaleSteps:9,
              scaleStartValue:0,
              scaleStepWidth:100
             
          }]
          
      },
      options: {
        responsive: false,
        display:true
      }
    }
  
    );
  }

  /* ****************************** */
  
 // lineChart
 lineChartData:Array<any> = [
  {data: [65, 59, 80, 81, 56, 55, 40], label: 'TEMPERATURE'}

];

public lineChartLabels:Array<any> = ['-20', '-15', '-10','-5','0'];
public lineChartOptions:any = {
  responsive: true
};
public lineChartColors:Array<any> = [
  { // grey
    backgroundColor: 'orange',
    borderColor: 'rgba(148,159,177,1)',
    pointBackgroundColor: 'rgba(148,159,177,1)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
  }
];
public lineChartLegend:boolean = true;
public lineChartType:string = 'line';

public randomize():void {
  let _lineChartData:Array<any> = new Array(this.lineChartData.length);
  for (let i = 0; i < this.lineChartData.length; i++) {
    _lineChartData[i] = {data: new Array(this.lineChartData[i].data.length), label: this.lineChartData[i].label};
    for (let j = 0; j < this.lineChartData[i].data.length; j++) {
      _lineChartData[i].data[j] = Math.floor((Math.random() * 100) + 1);
    }
  }
  this.lineChartData = _lineChartData;
}

// events
public chartClicked(e:any):void {
  console.log(e);
}

public chartHovered(e:any):void {
  console.log(e);
}


}

