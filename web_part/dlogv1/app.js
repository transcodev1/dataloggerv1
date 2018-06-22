const Influx = require('influxdb-nodejs');
const client = new Influx('http://admin:admin@localhost:8086/tc_dlog');
/* const client = new Influx('http://intern:intern@203.113.114.6:20102/tc_dlog'); */
// i --> integer
// s --> string
// f --> float
// b --> boolean
const fieldSchema = {
  temp: 'f',
  volt_ac: 'f',
  volt_dc_1: 'f',
  volt_dc_2: 'f',
  relay_1:'i',
  relay_2:'i',
  relay_3:'i',
  relay_4:'i',
  relay_5:'i',
  relay_6:'i',
  relay_7:'i',
  relay_8:'i',
  
};
const tagSchema = {
 id : '*'
};
  client.write('dlog')
  .tag({
    id:123456789
  })
  .field({
  temp: 20,
  volt_ac: 0,
  volt_dc_1:120,
  volt_dc_2:300
  })
  .then(() => console.info('write point success'))
  .catch(console.error);
  