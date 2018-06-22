#!/usr/bin/env node
'use strict';

// importing Server class
const Server = require('./lib/lib-server');
var FS = require('fs')
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
const Influx = require('influxdb-nodejs');
const Influx_int = require('influx')
/* const client_inf = new Influx('http://admin:admin@localhost:8086/tc_dlog'); */
const client_inf = new Influx_int.InfluxDB('http://intern:intern@203.113.114.6:20102/tc_datalogger');

// i --> integer
// s --> string
// f --> float
// b --> boolean
const fieldSchema = {
	temp: 'f',
	volt_ac: 'f',
	volt_dc_1: 'f',
	volt_dc_2: 'f',
	relay_1: 'b',
	relay_2: 'b',
	relay_3: 'b',
	relay_4: 'b',
	relay_5: 'b',
	relay_6: 'b',
	relay_7: 'b',
	relay_8: 'b'

};
const tagSchema = {
	id: '*'
};

// Our configuration
const PORT = 8090;

var server = new Server(PORT);

// Starting our server
server.start(() => {
  console.log(`Server started at: ${PORT}`);
});

//* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
//*
//* Application HTTP Program Implement
//*
//* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
// serve files from the public directory

app.set('port', 3000);
app.listen(80, () => {
	console.log('HTTP listening on 80');
});

// serve the homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/relay_rst', (req, res) => {
	const click = {clickTime: new Date()};
	console.log(click);

	server.clients.forEach((client) => {
		if (client.uuid === req.body.UUID) {
				
	
			if (req.body.MODE == 0)
			client.rst_out_state = client.rst_in_state ^ (1 << req.body.CH);
		else {
			client.relay_out_state = req.body.CH;	/* 0000 0001 */
		}
			
			const buf1 = Buffer.from("<<" + client.uuid.toString(16) + ",01;"+"L20:W,2,");
			const buf2 = Buffer.allocUnsafe(2);
			const buf3 = Buffer.from(";\r\n\x17\r\n");
			buf2.writeUInt8(0xC0, 0);
			buf2.writeUInt8(client.rst_out_state, 1);

			

			const buf_req1 = Buffer.concat([buf1, buf2, buf3], buf1.length + buf2.length + buf3.length);

			client.socket.write(buf_req1);	
		}
	});
	
    res.send({});
});


app.post('/relay_ctrl', (req, res) => {
	const click = {clickTime: new Date()};
	console.log(click);

	server.clients.forEach((client) => {
		if (client.uuid === req.body.UUID) {
			
			
				
			if(req.body.MODE == 0)
			client.relay_out_state = client.relay_in_state ^ (1 << req.body.CH);
			else{
				client.relay_out_state = req.body.CH;	/* 0000 0001 */ 
			}

			/* client.relay_in_state = client.relay_out_state	//for showing on web */
			
			const buf1 = Buffer.from("<<" + client.uuid.toString(16) + ",01;"+"L20:W,2,");
			const buf2 = Buffer.allocUnsafe(2);
			const buf3 = Buffer.from(";\r\n\x17\r\n");
			buf2.writeUInt8(0xA0, 0);
			buf2.writeUInt8(client.relay_out_state, 1);

			const buf_req1 = Buffer.concat([buf1, buf2, buf3], buf1.length + buf2.length + buf3.length);

			client.socket.write(buf_req1);	
		}
	});
	
    res.send({});
});


app.post('/page_update', (req, res) => {
	const click = { clickTime: new Date() };
	/* console.log(click); */
	var obj = {};

	server.clients.forEach((client) => {
		
		

		if (client.uuid == req.body.UUID) {

			obj = {
				RELAY: {
					CH0: ((client.relay_in_state & 0x01) ? 1 : 0),
					CH1: ((client.relay_in_state & 0x02) ? 1 : 0),
					CH2: ((client.relay_in_state & 0x04) ? 1 : 0),
					CH3: ((client.relay_in_state & 0x08) ? 1 : 0),
					CH4: ((client.relay_in_state & 0x10) ? 1 : 0),
					CH5: ((client.relay_in_state & 0x20) ? 1 : 0),
					CH6: ((client.relay_in_state & 0x40) ? 1 : 0),
					CH7: ((client.relay_in_state & 0x80) ? 1 : 0)
				},
				VDC: {
					CH0: client.vdc_buf[0],
					CH1: client.vdc_buf[1]
				},
				VAC: {
					CH0: client.vac_buf[0]
				},
				TEMP: {
					CH0: client.tmp_buf[0]
				},
				RESET: {
					CH0: ((client.reset_in_state & 0x01) ? 1 : 0),
					CH1: ((client.reset_in_state & 0x02) ? 1 : 0),
					CH2: ((client.reset_in_state & 0x04) ? 1 : 0),
					CH3: ((client.reset_in_state & 0x08) ? 1 : 0),
					CH4: ((client.reset_in_state & 0x10) ? 1 : 0),
					CH5: ((client.reset_in_state & 0x20) ? 1 : 0),
					CH6: ((client.reset_in_state & 0x40) ? 1 : 0),
					CH7: ((client.reset_in_state & 0x80) ? 1 : 0)
				}
			}

                                                                                                                               
		}
	});
	res.send(obj);
});

client_inf.getMeasurements()
	.then(names => console.log('My measurement names are: ' + names.join(', ')))
	.then(() => {
		app.listen(app.get('port'), () => {
			console.log(`Listening on ${app.get('port')}.`);
		});
	})
	.catch(error => console.log({ error }));


app.get('/get_id', (req, res) => {
	var id_login = []

	server.clients.forEach((client) => {

		id_login.push(client.uuid)
	})

	res.send(id_login);

})

app.post('/init_temp', (req, res) => {
	console.log("BEGIN INIT TEMP")
	
	
			var buf = "'"
			buf = buf.concat(req.body.UUID)
			buf = buf.concat("'")   

			/* var id = `'123456789012345'`  */
			var tmp = `
			SELECT mean("temp") AS "mean_temp" FROM "tc_datalogger"."autogen"."dlog" WHERE time > now() - 15m AND "id"=`+ buf +`GROUP BY time(1m) FILL(null) limit 5
			`

			client_inf.query(tmp)
				.then(result => res.status(200).json(result))
				.catch(error => res.status(500).json({ error }));

		


});
app.post('/init_vdc', (req, res) => {

	
	console.log(req.body.UUID)
			var buf = "'"
			buf = buf.concat(req.body.UUID)
			buf = buf.concat("'")   

			/* var id = `'123456789012345'`  */
			var tmp = `
			SELECT mean("volt_dc_2") AS "mean_volt_dc_2", mean("volt_dc_1") AS "mean_volt_dc_1" FROM "tc_datalogger"."autogen"."dlog" WHERE time > now() - 20m AND "id"=`+ buf +` GROUP BY time(5m) FILL(null) limit 5`

		
			client_inf.query(tmp)
			
				.then(result => res.status(200).json(result))
				.catch(error => res.status(500).json({ error }));

});
app.post('/update_temp', (req, res) => {

			var buf = "'"
			buf = buf.concat(req.body.UUID)
			buf = buf.concat("'")   

			/* var id = `'123456789012345'`  */
			var tmp = `
			SELECT  mean("temp") AS "mean_temp" FROM "tc_datalogger"."autogen"."dlog" WHERE time > now() - 5m AND "id"=`+ buf + ` GROUP BY time(1m) limit 1
			`
			client_inf.query(tmp)
				.then(result => res.status(200).json(result))
				.catch(error => res.status(500).json({ error }));

});
app.post('/update_vdc', (req, res) => {

	
	
			var buf = "'"
			buf = buf.concat(req.body.UUID)
			buf = buf.concat("'")   

			/* var id = `'123456789012345'`  */
			var tmp = `
			SELECT mean("volt_dc_2") AS "mean_volt_dc_2", mean("volt_dc_1") AS "mean_volt_dc_1" FROM "tc_datalogger"."autogen"."dlog" WHERE time > now() - 5m AND "id"=`+ buf + ` GROUP BY time(1m) FILL(null) limit 1`

		
			client_inf.query(tmp)
			
				.then(result => res.status(200).json(result))
				.catch(error => res.status(500).json({ error }));

});