import { Component, OnInit, AfterViewInit, OnDestroy, OnChanges, Input } from '@angular/core';

import { ServiceService } from '../../service.service'
import { DashboardService } from './dashboard.service';
import { FormsModule } from '@angular/forms';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import * as Chart from 'chart.js'
import { FUNCTION_TYPE } from '@angular/compiler/src/output/output_ast';
/* import { DIR_DOCUMENT_FACTORY } from '@angular/cdk/bidi'; */

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  @Input()
  intv: any;

  temp: number;

  status_show: string;
  dlog_show: string;

  constructor(private service: ServiceService) {


  }
  ngOnChange() {
    console.log("ON cHANGE")

  }

  ngOnInit() {
    /* ################################################### */
    var ip = 'http://13.67.73.17:80'
   /*  var ip = 'http://192.168.64.1:80' */
    /*  var ip = 'http://192.168.64.1' */

    /* ################################################### */
  
    
    var btn_cd_max = 8  // 4 sec
    var global_index = 0;
    var predata = []
    var predata_vdc = []
    //default value
    this.temp = 60;
    this.status_show = "OFFLINE";  //show
    this.dlog_show = "dlog1"


    var status = "ONLINE"
    var device_id = 12345678
    var device_uuid = []

    fetch(ip + '/get_id', {
    })
      .then(res => res.json())
      .then(function handleJson(id_login) {

        id_login.forEach(id => {

          device_uuid.push(id)
        })
        device_id = device_uuid[global_index]

        console.log("get id here")
        console.log(id_login)

      })

    //*****************************
    //** CHANGE DEVICE ( UUID ) ***
    //***************************** 
    var device_select = 'dlog1'
    /* device_select = (<HTMLInputElement>document.getElementById('selector1')).value; */

    const selector1 = <HTMLInputElement>document.getElementById('selector1');
    selector1.addEventListener('change', function (e) {
      console.log('selector1 was changed');

      status = "ONLINE"
      switch (selector1.value) {
        case '0': device_id = /* 12345678; break; */device_uuid[0]; global_index = 0; break;
        case '1': device_id =/*  0x00007048860DDF79; break; */device_uuid[1]; global_index = 1; break;
        case '2': device_id = /* 33333333; break; */device_uuid[2]; global_index = 2; break;
        case '3': device_id =/*  44444444; break; */device_uuid[3]; global_index = 3; break;
      }
      //re-create graph
      fetch(ip + '/init_temp',
        {
          method: 'POST',
          body: JSON.stringify({ UUID: device_id }),
          headers: { 'Content-Type': 'application/json' },
        })
        .then(res => res.json())
        .then(function handleJson(db_id) {
          console.log(db_id)
          for (i = 0; i < 5; i++) {
            removeData(chart)
            removeData(chart_tmp)
          }
          if (!isEmptyObject(db_id)) {
            console.log("not emtpy")
            console.log(db_id)
            var i;
            for (i = 0; i < 5; i++) {
              addData(chart, 0, db_id[i].mean_temp)
              addData(chart_tmp, 0, db_id[i].mean_temp)
            }
          }
        }
        )

      fetch(ip + '/init_vdc',
        {
          method: 'POST',
          body: JSON.stringify({ UUID: device_id }),
          headers: { 'Content-Type': 'application/json' },
        })
        .then(res => res.json())
        .then(function handleJson(db_id) {
          console.log(db_id)
          for (i = 0; i < 5; i++) {
            removeData(chart_vdc)
          }
          if (!isEmptyObject(db_id)) {
            console.log("not emtpy")
            var i;
            for (i = 0; i < 5; i++) {
              addData(chart_vdc, 0, db_id[i].mean_volt_dc_1)
            }
          }
        }
        )


      device_select = (<HTMLInputElement>document.getElementById('selector1')).value;

    });

    const button_id = [];

    const r1 = (<HTMLInputElement>document.getElementById('r1'));
    const r2 = (<HTMLInputElement>document.getElementById('r2'));
    const r3 = (<HTMLInputElement>document.getElementById('r3'));
    const r4 = (<HTMLInputElement>document.getElementById('r4'));
    const r5 = (<HTMLInputElement>document.getElementById('r5'));
    const r6 = (<HTMLInputElement>document.getElementById('r6'));
    const r7 = (<HTMLInputElement>document.getElementById('r7'));
    const r8 = (<HTMLInputElement>document.getElementById('r8'));
    const rst1 = (<HTMLInputElement>document.getElementById('rst1'));
    const rst2 = (<HTMLInputElement>document.getElementById('rst2'));
    const rst3 = (<HTMLInputElement>document.getElementById('rst3'));
    const rst4 = (<HTMLInputElement>document.getElementById('rst4'));
    const rst5 = (<HTMLInputElement>document.getElementById('rst5'));
    const rst6 = (<HTMLInputElement>document.getElementById('rst6'));
    const rst7 = (<HTMLInputElement>document.getElementById('rst7'));
    const rst8 = (<HTMLInputElement>document.getElementById('rst8'));
    const r_on = (<HTMLInputElement>document.getElementById('r_on'));
    const r_off = (<HTMLInputElement>document.getElementById('r_off'));
    const r_rst = (<HTMLInputElement>document.getElementById('r_rst'));
    
    button_id.push(r1, r2, r3, r4, r5, r6, r7, r8, rst1, rst2, rst3, rst4, rst5, rst6, rst7, rst8, r_on, r_off,r_rst)

    function disbleButton() {
      button_id.forEach((btn) => {
        btn_cd = 0;
        btn.disabled = true;
      })
    }
    function enableButton() {

      button_id.forEach((btn) => {
        btn.disabled = false;
      })
    }

    r1.addEventListener('click', function (e) {
      disbleButton()
      console.log('r1 was clicked');
      post_json(ip + '/relay_ctrl', { UUID: device_id, CH: 0, MODE: 0 });
    });

    r2.addEventListener('click', function (e) {
      disbleButton()
      console.log('r2 was clicked');
      post_json(ip + '/relay_ctrl', { UUID: device_id, CH: 1, MODE: 0 });
    });

    r3.addEventListener('click', function (e) {
      disbleButton()
      console.log('r3 was clicked');
      post_json(ip + '/relay_ctrl', { UUID: device_id, CH: 2, MODE: 0 });
    });

    r4.addEventListener('click', function (e) {
      disbleButton()
      console.log('r4 was clicked');
      post_json(ip + '/relay_ctrl', { UUID: device_id, CH: 3, MODE: 0 });
    });

    r5.addEventListener('click', function (e) {
      disbleButton()
      console.log('r5 was clicked');
      post_json(ip + '/relay_ctrl', { UUID: device_id, CH: 4, MODE: 0 });
    });

    r6.addEventListener('click', function (e) {
      disbleButton()
      console.log('r6 was clicked');
      post_json(ip + '/relay_ctrl', { UUID: device_id, CH: 5, MODE: 0 });
    });

    r7.addEventListener('click', function (e) {
      disbleButton()
      console.log('r7 was clicked');
      post_json(ip + '/relay_ctrl', { UUID: device_id, CH: 6, MODE: 0 });
    });

    r8.addEventListener('click', function (e) {
      disbleButton()
      console.log('r8 was clicked');
      post_json(ip + '/relay_ctrl', { UUID: device_id, CH: 7, MODE: 0 });
    });

    rst1.addEventListener('click', function (e) {
      disbleButton()
      console.log('rst1 was clicked');
      post_json(ip + '/relay_rst', { UUID: device_id, CH: 0 ,MODE:0});
    });

    rst2.addEventListener('click', function (e) {
      disbleButton()
      console.log('rst2 was clicked');
      post_json(ip + '/relay_rst', { UUID: device_id, CH: 1 ,MODE:0});
    });

    rst3.addEventListener('click', function (e) {
      disbleButton()
      console.log('rst3 was clicked');
      post_json(ip + '/relay_rst', { UUID: device_id, CH: 2 ,MODE:0});
    });

    rst4.addEventListener('click', function (e) {
      disbleButton()
      console.log('rst4 was clicked');
      post_json(ip + '/relay_rst', { UUID: device_id, CH: 3 ,MODE:0});
    });

    rst5.addEventListener('click', function (e) {
      disbleButton()
      console.log('rst5 was clicked');
      post_json(ip + '/relay_rst', { UUID: device_id, CH: 4 ,MODE:0});
    });

    rst6.addEventListener('click', function (e) {
      disbleButton()
      console.log('rst6 was clicked');
      post_json(ip + '/relay_rst', { UUID: device_id, CH: 5 ,MODE:0});
    });

    rst7.addEventListener('click', function (e) {
      disbleButton()
      console.log('rst7 was clicked');
      post_json(ip + '/relay_rst', { UUID: device_id, CH: 6 ,MODE:0});
    });

    rst8.addEventListener('click', function (e) {
      disbleButton()
      console.log('rst8 was clicked');
      post_json(ip + '/relay_rst', { UUID: device_id, CH: 7 ,MODE:0});
    });

    r_on.addEventListener('click', function (e) {
      disbleButton()
      console.log('r_on was clicked');
      post_json(ip + '/relay_ctrl', { UUID: device_id, CH: 0xFF, MODE: 1 });
    });

    r_off.addEventListener('click', function (e) {
      disbleButton()
      console.log('r_off was clicked');
      post_json(ip + '/relay_ctrl', { UUID: device_id, CH: 0x01, MODE: 1 });
    });
    r_rst.addEventListener('click', function (e) {
      disbleButton()
      console.log('r_off was clicked');
      post_json(ip + '/relay_rst', { UUID: device_id, CH: 0xFF, MODE: 1 });
    });
    var btn_cd = 0
    this.intv = setInterval(function () {


      if (btn_cd == btn_cd_max) {
        enableButton()
        btn_cd = 0;
      }
      btn_cd++

      fetch(ip + '/get_id', {
      })
        .then(res => res.json())
        .then(function handleJson(id_login) {
          device_uuid = []
          /*      console.log(id_login) */

          id_login.forEach(id => {


            device_uuid.push(id)
          })
          device_id = device_uuid[global_index]

        })

      var body = { UUID: device_id };

      fetch(ip + '/page_update', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      })
        .then(res => res.json())
        .then(function handleJson(DLOGV1) {

        

          if (!isEmptyObject(DLOGV1) && !0) {

            document.getElementById('r1').style.backgroundColor = ((DLOGV1.RELAY.CH0 == 1) ? "green" : "red");
            document.getElementById('r2').style.backgroundColor = ((DLOGV1.RELAY.CH1 == 1) ? "green" : "red");
            document.getElementById('r3').style.backgroundColor = ((DLOGV1.RELAY.CH2 == 1) ? "green" : "red");
            document.getElementById('r4').style.backgroundColor = ((DLOGV1.RELAY.CH3 == 1) ? "green" : "red");
            document.getElementById('r5').style.backgroundColor = ((DLOGV1.RELAY.CH4 == 1) ? "green" : "red");
            document.getElementById('r6').style.backgroundColor = ((DLOGV1.RELAY.CH5 == 1) ? "green" : "red");
            document.getElementById('r7').style.backgroundColor = ((DLOGV1.RELAY.CH6 == 1) ? "green" : "red");
            document.getElementById('r8').style.backgroundColor = ((DLOGV1.RELAY.CH7 == 1) ? "green" : "red");

            /* r1.disabled=false; */
            document.getElementById('r1').className = ((DLOGV1.RELAY.CH0 == 1) ? "button on" : "button off");
            document.getElementById('r2').className = ((DLOGV1.RELAY.CH1 == 1) ? "button on" : "button off");
            document.getElementById('r3').className = ((DLOGV1.RELAY.CH2 == 1) ? "button on" : "button off");
            document.getElementById('r4').className = ((DLOGV1.RELAY.CH3 == 1) ? "button on" : "button off");
            document.getElementById('r5').className = ((DLOGV1.RELAY.CH4 == 1) ? "button on" : "button off");
            document.getElementById('r6').className = ((DLOGV1.RELAY.CH5 == 1) ? "button on" : "button off");
            document.getElementById('r7').className = ((DLOGV1.RELAY.CH6 == 1) ? "button on" : "button off");
            document.getElementById('r8').className = ((DLOGV1.RELAY.CH7 == 1) ? "button on" : "button off");

            document.getElementById('vdc1').innerText = "VDC1 : " + DLOGV1.VDC.CH0 + "V";
            document.getElementById('vdc2').innerText = "VDC2 : " + DLOGV1.VDC.CH1 + "V";
            document.getElementById('vac1').innerText = "VAC1 : " + DLOGV1.VAC.CH0 + "V";

            document.getElementById('temp').innerText = DLOGV1.TEMP.CH0 + "C";
            
          }
          else {

            document.getElementById('r1').style.backgroundColor = "black";
            document.getElementById('r2').style.backgroundColor = "black";
            document.getElementById('r3').style.backgroundColor = "black";
            document.getElementById('r4').style.backgroundColor = "black";
            document.getElementById('r5').style.backgroundColor = "black";
            document.getElementById('r6').style.backgroundColor = "black";
            document.getElementById('r7').style.backgroundColor = "black";
            document.getElementById('r8').style.backgroundColor = "black";

            document.getElementById('r1').className = "button null";
            document.getElementById('r2').className = "button null";
            document.getElementById('r3').className = "button null";
            document.getElementById('r4').className = "button null";
            document.getElementById('r5').className = "button null";
            document.getElementById('r6').className = "button null";
            document.getElementById('r7').className = "button null";
            document.getElementById('r8').className = "button null";

            document.getElementById('vdc1').innerText = "VDC1" + "-V";
            document.getElementById('vdc2').innerText = "VDC2" + "-V";
            document.getElementById('vac1').innerText = "VAC" + "-V";

            document.getElementById('temp').innerText = "-C";



          }

          (device_id != undefined) ? document.getElementById('status_show').innerText = "ONLINE" : document.getElementById('status_show').innerText = "OFFINE";
          (device_id != undefined) ? document.getElementById('status_show').style.color = "green" : document.getElementById('status_show').style.color = "red";
          document.getElementById('dlog_name').innerText = " UUID:" + device_id;
          document.getElementById('dlog_show').innerText = " DLOG :" + (global_index + 1);


        });
    }, 500);

    setTimeout(function () {
      // init 5 value of temp_graph
      fetch(ip + '/init_temp',
        {
          method: 'POST',
          body: JSON.stringify({ UUID: device_id }),
          headers: { 'Content-Type': 'application/json' },
        })
        .then(res => res.json())
        .then(function handleJson(db_id) {

          if (!isEmptyObject(db_id)) {
            console.log(db_id)
            var i;
            for (i = 0; i < 5; i++) {
              /*   predata[i] = (db_id[i].mean_temp) */
              addData(chart, 0, db_id[i].mean_temp)
              addData(chart_tmp, 0, db_id[i].mean_temp)
            }

          } else {

            predata = [];
            for (i = 0; i < 5; i++) {
              removeData(chart)
              removeData(chart_tmp)
            }
          }
        })
      //-----------------------

      fetch(ip + '/init_vdc',
        {
          method: 'POST',
          body: JSON.stringify({ UUID: device_id }),
          headers: { 'Content-Type': 'application/json' },
        })
        .then(res => res.json())
        .then(function handleJson(db_id) {
          console.log(db_id)
          if (!isEmptyObject(db_id)) {

            var i;
            for (i = 0; i < 5; i++) {
              addData(chart_vdc, 0, db_id[i].mean_volt_dc_1)
            }

          }
          else {
            predata_vdc = [];
            for (i = 0; i < 5; i++) {
              removeData(chart_vdc)
            }

          }
        })

    }, 800)

    //temp graph update
    setInterval(function () {

      console.log("graph_update")
      console.log("predata" + predata);

      var body = { UUID: device_id };
      fetch(ip + '/update_temp', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          // not include []
          if (!isEmptyObject(data)) {
            addData(chart, 0, data[0].mean_temp);
            removeData(chart);
            addData(chart_tmp, 0, data[0].mean_temp);
            removeData(chart_tmp);

          }


        });

      fetch(ip + '/update_vdc', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          // not include []
          if (!isEmptyObject(data)) {
            addData(chart_vdc, 0, data[0].mean_volt_dc_1);
            removeData(chart_vdc);


          }
        });





    }, 10000)

    //*********************GRAPH TEMP ****************************** */
    var canvas = <HTMLCanvasElement>document.getElementById('myChart');
    console.log("predata" + predata);
    var ctx = canvas.getContext('2d');
    /* var predata = [24.2, 24.1, 26.0, 25.2, 25.5]; */
    var chart = new Chart(ctx, {
      type: 'line',
      // The data for our dataset
      data: {
        labels: ["-5m", "-4m", "-3m", "-2m", "-1m",],
        datasets: [{
          label: "TEMPERATURE",
          backgroundColor: 'orange',
          borderColor: 'red',
          data: predata,
          spanGaps: false,
          lineTension: 0,

        }]
      },

      // Configuration options go here
      options: {
        responsive: true,
        scales: {
          yAxes: [{
            ticks: {
              min: 23,
              max: 29,
              stepSize: 0.5,
              /*  min: Math.min.apply(this, predata) - 3,
              max: Math.max.apply(this, predata) + 3, */
            },/* suggestedMin: 0.5, suggestedMax: 5.5 */
          }],
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: "Time in Minute",
              fontColor: "black"
            }
          }]

        },
        animation: {
          duration: 0, // general animation time
        },
        hover: {
          animationDuration: 0, // duration of animations when hovering an item
        },
        responsiveAnimationDuration: 0, // animation duration after a resize


      }
    });

    //*********************GRAPH TEMP BIGSIZE ****************************** */
    var canvas = <HTMLCanvasElement>document.getElementById('myChart_tmp');

    var ctx = canvas.getContext('2d');
    /* var predata = [24.2, 24.1, 26.0, 25.2, 25.5]; */
    /* var predata_vdc = [12.9, 13.0, 12.6, 12.4, 13] */
    var chart_tmp = new Chart(ctx, {
      type: 'line',
      // The data for our dataset
      data: {
        labels: ["-5m", "-4m", "-3m", "-2m", "-1m",],
        datasets: [{
          label: "TEMP",
          /* backgroundColor: 'orange' ,*/
          borderColor: 'red',
          data: predata,
          spanGaps: false,
          lineTension: 0,

        }]
      },

      // Configuration options go here
      options: {
        responsive: true,
        scales: {
          yAxes: [{
            ticks: { /* min: 23,
               max: 29,
               */
            },
          }],
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: "Time in Minute",
              fontColor: "black"
            }
          }]

        },

      }
    });

    //*********************GRAPH V DC ****************************** */
    var canvas = <HTMLCanvasElement>document.getElementById('myChart_vdc');

    var ctx = canvas.getContext('2d');
    /* var predata = [24.2, 24.1, 26.0, 25.2, 25.5]; */
    /* var predata_vdc = [12.9, 13.0, 12.6, 12.4, 13] */
    var chart_vdc = new Chart(ctx, {
      type: 'line',
      // The data for our dataset
      data: {
        labels: ["-5m", "-4m", "-3m", "-2m", "-1m",],
        datasets: [{
          label: "VDC",
          /* backgroundColor: 'orange' ,*/
          borderColor: 'yellow',
          data: predata_vdc,
          spanGaps: false,
          lineTension: 0,

        }]
      },

      // Configuration options go here
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [{
            ticks: { /* min: 10,
               max: 13, */
            },
          }],
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: "Time in Minute",
              fontColor: "black"
            }
          }]

        },

      }
    });



    //***************************/
    //**** FUNCTION(ngOninit)****/
    //****************************/


    function post_json(path, body) {
      fetch(path, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
      })
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

    function addData(chart, label, data) {
      /* chart.data.labels.push(label); */
      chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
      });
      chart.update();
    }
    function removeData(chart) {
      /* chart.data.labels.shift(); */
      chart.data.datasets.forEach((dataset) => {
        dataset.data.shift();
      });
      chart.update();
    }



  }
  ngOnDestroy() {
    if (this.intv)
      clearInterval(this.intv);

  }



  /* ********circle graph********* */
  canvas: any;
  ctx: any;

  ngAfterViewInit() {


  }

}

