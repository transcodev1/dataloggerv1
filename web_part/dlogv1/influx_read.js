const Influx = require('influxdb-nodejs');
/* const client = new Influx('http://admin:admin@localhost:8086/tc_dloger'); */
const client = new Influx('http://intern:intern@203.113.114.6:20102/tc_datalogger');
// select code,spdy,type from ajax where spdy = '0' and time >= now() - 3h and use <= 300 limit 2
  /*  var data_index = ['temp','volt_ac','volt_dc_1','volt_dc_2'] */

// prototype

/*   const times = 1
  var data_index_lenght = 5
  var data_index = [[],[],[],[],[]]
    var start = 1
    var end = 1
    setInterval(function() {


    const reader = client.query('dlog');
      console.log("interval conut");
   
    console.log("start = "+start)
    console.log("end = "+end)
    reader.where('id','123456789012345')      
    reader.addField('time','temp','volt_ac','volt_dc_1','volt_dc_2');
    reader.start = start+'m';
    reader.end = '-'+end+'m';
    reader.set('epoch', 's');
    reader.set({order: 'desc', 
   })
    reader.limit = times;
    reader.fill = 0;
    reader.then(data => {

                                                                                                                                                                                                                                           
     var json = JSON.stringify(data);
     console.log("1st+ "+json+"\n");
  
     for (t = 0;t < times ;t++)
     {
      var start_index = json.indexOf(':[['); //+3
      var stop_index = json.indexOf(',',start_index)
      data_index[0].push(Unix_timestamp(json.slice(start_index+3,stop_index))); 
      console.log( json.slice(start_index+3,stop_index)) 

     for (i = 1; i < data_index_lenght; i++) {

      start_index = stop_index

      stop_index = (i != data_index_lenght-1)?json.indexOf(',',start_index+1):json.indexOf(']',start_index+1)
      data_index[i].push(json.slice(start_index+1,stop_index));
  }  
  start_index = stop_index
  stop_index = json.indexOf(',',start_index+1)
    }
    console.log(data_index);

  
    
    }).catch(err => {
      console.error(err);
    });
    end = end+10
    start = start+10
    },5000) */

//-----------------------------------------------------------------------------------------------------------

const times1 = 1
  var data_index_lenght = 5
  var data_index = [[],[],[],[],[]]
    var start1 = 10
    var end1 = 1
    
    for (t = 0;t < 5 ;t++)
    {
 
    const reader1 = client.query('dlog');
    
    reader1.where('id','123456789012345')      // set tag key
    reader1.addField('time','temp','volt_ac','volt_dc_1','volt_dc_2');
    /* reader1.start = start1+'m'; */
    reader1.end = '-'+end1+'m';
    reader1.set('epoch', 's');
    reader1.set({order: 'desc', // desc/asc
   })
    reader1.limit = 1;
    reader1.fill = 0;
   
    
    reader1.then(data => {
  
                                                                                                                                                                                                                                           
     var json = JSON.stringify(data);
     console.log("1st+ "+json+"\n");
  
     
      var start_index = json.indexOf(':[['); //+3
      var stop_index = json.indexOf(',',start_index)
      data_index[0].push(Unix_timestamp(json.slice(start_index+3,stop_index))); 
      console.log( json.slice(start_index+3,stop_index)) 

     for (i = 1; i < data_index_lenght; i++) {

      start_index = stop_index

      stop_index = (i != data_index_lenght-1)?json.indexOf(',',start_index+1):json.indexOf(']',start_index+1)
      data_index[i].push(json.slice(start_index+1,stop_index));
  }  
  start_index = stop_index
  stop_index = json.indexOf(',',start_index+1)


  console.log(data_index);
    
    }).catch(err => {
      console.error(err);
    });

    end1 = end1+10
    start1 = start1+10

    
  }
 
   


//*** convert timestamp to date ******/
    function Unix_timestamp(t)
    {
    var dt = new Date(t*1000);
    var hr = dt.getHours();
    var m = "0" + dt.getMinutes();
    var s = "0" + dt.getSeconds();
    return hr+ ':' + m.substr(-2) + ':' + s.substr(-2);  
    }
  