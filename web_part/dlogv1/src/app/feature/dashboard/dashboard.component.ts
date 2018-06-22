import { Component, OnInit, OnDestroy } from '@angular/core';

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

  intv_pooling: any;
  intv_graph_update: any;
  constructor(private service: ServiceService) {

  }

  ngOnInit() {
    /* ################################################### */
    var ip = 'http://13.67.73.17:80'
    /*  var ip = 'http://192.168.64.1:80' */
    /* var ip = 'http://192.168.64.1' */
    /* ################################################### */

    var btn_cd_max = 20  // 10 sec
    var global_index = 0;
    var predata = []
    var predata_vdc = []
    var predata_tmpbar = [30]
    //default value

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

    const selector1 = <HTMLInputElement>document.getElementById('selector1');
    selector1.addEventListener('change', function (e) {
      console.log('selector1 was changed');

      switch (selector1.value) {
        case '0': device_id = device_uuid[0]; global_index = 0; break;
        case '1': device_id = device_uuid[1]; global_index = 1; break;
        case '2': device_id = device_uuid[2]; global_index = 2; break;
        case '3': device_id = device_uuid[3]; global_index = 3; break;
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
    const warning_text = (<HTMLInputElement>document.getElementById('warning_text'))

    const tmpbar_test = (<HTMLInputElement>document.getElementById('tmpbar_test'));

    tmpbar_test.addEventListener('click', function (e) {
      chart_tmpbar.data.datasets[0].data[0]++;
      chart_tmpbar.update();

      console.log('up');
    });


    const button_id = [];
    const buttonAllR = [];

    button_id.push(r1, r2, r3, r4, r5, r6, r7, r8, rst1, rst2, rst3, rst4, rst5, rst6, rst7, rst8, r_on, r_off, r_rst)
    buttonAllR.push(r1, r2, r3, r4, r5, r6, r7, r8)
    function disbleButton() {
      button_id.forEach((btn) => {
        btn.disabled = true;
        warning_text.innerText = "Loading...";
      })
    }
    function enableButton() {

      button_id.forEach((btn) => {
        btn.disabled = false;
        warning_text.innerText = "";
      })
    }
    function resetChecking(r_btn) {
      if (r_btn.className == "button off") {
        warning_text.innerText = "Reset denied";
        return 1;
      }
      else if (r_btn.className == "button on")
        return 0;
    }

    /*  r1.addEventListener('click', function (e) {
       disbleButton()
       console.log('r1 was clicked');
       post_json(ip + '/relay_ctrl', { UUID: device_id, CH: 0, MODE: 0 });
     }); */

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

    /* rst1.addEventListener('click', function (e) {
      if(!resetChecking(r1))
      {
      disbleButton()
      console.log('rst1 was clicked');
      post_json(ip + '/relay_rst', { UUID: device_id, CH: 0 ,MODE:0});
      }
    }); */

    rst2.addEventListener('click', function (e) {
      if (!resetChecking(r2)) {
        disbleButton()
        console.log('rst2 was clicked');
        post_json(ip + '/relay_rst', { UUID: device_id, CH: 1, MODE: 0 });
      }
    });

    rst3.addEventListener('click', function (e) {
      if (!resetChecking(r3)) {
        disbleButton()
        console.log('rst3 was clicked');
        post_json(ip + '/relay_rst', { UUID: device_id, CH: 2, MODE: 0 });
      }
    });

    rst4.addEventListener('click', function (e) {
      if (!resetChecking(r4)) {
        disbleButton()
        console.log('rst4 was clicked');
        post_json(ip + '/relay_rst', { UUID: device_id, CH: 3, MODE: 0 });
      }
    });

    rst5.addEventListener('click', function (e) {
      if (!resetChecking(r5)) {
        disbleButton()
        console.log('rst5 was clicked');
        post_json(ip + '/relay_rst', { UUID: device_id, CH: 4, MODE: 0 });
      }
    });

    rst6.addEventListener('click', function (e) {
      if (!resetChecking(r6)) {
        disbleButton()
        console.log('rst6 was clicked');
        post_json(ip + '/relay_rst', { UUID: device_id, CH: 5, MODE: 0 });
      }
    });

    rst7.addEventListener('click', function (e) {
      if (!resetChecking(r7)) {
        disbleButton()
        console.log('rst7 was clicked');
        post_json(ip + '/relay_rst', { UUID: device_id, CH: 6, MODE: 0 });
      }
    });

    rst8.addEventListener('click', function (e) {
      if (!resetChecking(r8)) {
        disbleButton()
        console.log('rst8 was clicked');
        post_json(ip + '/relay_rst', { UUID: device_id, CH: 7, MODE: 0 });
      }
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
      post_json(ip + '/relay_rst', { UUID: device_id, CH: 0x1, MODE: 1 });
    });

    var btn_cd = 0;
    this.intv_pooling = setInterval(function () {
      var body = { UUID: device_id };

      // timeout >> = 10 s (btn_cd_max)
      if (btn_cd >= btn_cd_max) {
        enableButton();
        btn_cd = 0;
      }

      scaleBar(chart_tmpbar);

      fetch(ip + '/get_id', {
      })
        .then(res => res.json())
        .then(function handleJson(id_login) {
          device_uuid = []
          id_login.forEach(id => { device_uuid.push(id) })
          device_id = device_uuid[global_index]
        })

      fetch(ip + '/page_update', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      })
        .then(res => res.json())
        .then(function handleJson(DLOGV1) {
          

          if (!isEmptyObject(DLOGV1) && !0) {
            console.log(DLOGV1.BTN.CH0)

            const DLOGAllRelay = [
              DLOGV1.RELAY.CH0,
              DLOGV1.RELAY.CH1,
              DLOGV1.RELAY.CH2,
              DLOGV1.RELAY.CH3,
              DLOGV1.RELAY.CH4,
              DLOGV1.RELAY.CH5,
              DLOGV1.RELAY.CH6,
              DLOGV1.RELAY.CH7
            ]


            if (DLOGV1.BTN.CH0 == true)
              enableButton();

            var i = 0;
            buttonAllR.forEach((r) => {
              r.style.backgroundColor = ((DLOGAllRelay[i] == 1) ? "green" : "red");
              r.className = ((DLOGAllRelay[i] == 1) ? "button on" : "button off");
              i++
            })

            document.getElementById('vdc1').innerText = "VDC1 : " + DLOGV1.VDC.CH0 + "V";
            document.getElementById('vdc2').innerText = "VDC2 : " + DLOGV1.VDC.CH1 + "V";
            document.getElementById('vac1').innerText = "VAC1 : " + DLOGV1.VAC.CH0 + "V";

            document.getElementById('temp').innerText = DLOGV1.TEMP.CH0 + "C";

          }
          else {

            buttonAllR.forEach((r) => {
              r.style.backgroundColor = "black";
              r.className = "button null";
            })

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
      fetch(ip + '/init_vdc', {
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

    var count_update = 0;
    //temp graph update
    this.intv_graph_update = setInterval(function () {

      count_update++;

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

            if (count_update == 6) // 60sec
            {
              addData(chart, 0, data[0].mean_temp);
              removeData(chart);
              count_update = 0;
            }
            addData(chart_tmp, 0, data[0].mean_temp);
            removeData(chart_tmp);
            /*       
                        chart_tmp.options.scales.yAxes[0].ticks.min = data[0].mean_temp-0.5
                        chart_tmp.options.scales.yAxes[0].ticks.max = data[0].mean_temp+0.5
                        chart_tmp.update(); */
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
        labels: ["-4m", "-3m", "-2m", "-1m", "now",],
        datasets: [{
          label: "TEMP(1m)",
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
              /*  min: Math.min.apply(this, predata.values[0]) - 3,
              max: Math.max.apply(this, predata.values[0]) + 3, */
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
        labels: ["-40s", "-30s", "-20s", "-10s", "now",],
        datasets: [{
          label: "TEMP(10s)",
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
            ticks: { /* min: 23,
               max: 29,
               */
            },
          }],
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: "Time in sec",
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


    //-------------------------------------
    //** tempbar */
    var canvas = <HTMLCanvasElement>document.getElementById('Chart_tempbar');

    var ctx = canvas.getContext('2d');
    /* var predata = [24.2, 24.1, 26.0, 25.2, 25.5]; */
    /* var predata_vdc = [12.9, 13.0, 12.6, 12.4, 13] */
    var chart_tmpbar = new Chart(ctx, {
      type: 'bar',
      // The data for our dataset
      data: {
        labels: ["NOW"],
        datasets: [{
          label: "temp",
          /* backgroundColor: 'orange' ,*/
          /*  borderColor: 'black', */
          /*  backgroundColor: 'green', */
          data: predata_tmpbar,
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
            ticks: {
              min: 20,
              max: 60,
            },
          }],
          xAxes: [{
            scaleLabel: {
              display: true,
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
    function scaleBar(chart_tmpbar) {
      if (chart_tmpbar.data.datasets[0].data[0] >= 50) {
        chart_tmpbar.data.datasets[0].backgroundColor = 'red';
      }
      else if (chart_tmpbar.data.datasets[0].data[0] >= 40) {
        chart_tmpbar.data.datasets[0].backgroundColor = 'orange';
      }
      else if (chart_tmpbar.data.datasets[0].data[0] >= 30) {
        chart_tmpbar.data.datasets[0].backgroundColor = 'yellow';
      }
      else
        chart_tmpbar.data.datasets[0].backgroundColor = 'green';

      chart_tmpbar.update();
    }
  }
  ngOnDestroy() {
    if (this.intv_pooling)
      clearInterval(this.intv_pooling);
    if (this.intv_graph_update)
      clearInterval(this.intv_graph_update);

  }

  a

  /* ********circle graph********* */
  canvas: any;
  ctx: any;
}

