#!/usr/bin/env node
'use strict';

// importing Server class
const Server = require('./lib/lib-server');
var FS = require('fs')
const express = require('express');
const app = express();



// Our configuration
const PORT = 5000;
const ADDRESS = "127.0.0.1"

var server = new Server(PORT, ADDRESS);

// Starting our server
server.start(() => {
	console.log(`Server started at: ${ADDRESS}:${PORT}`);
});

//* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
//*
//* Application HTTP Program Implement
//*
//* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
// serve files from the public directory

app.use(express.static('public'));

app.use(express.json());

var cors = require('cors');

// use it before all route definitions


app.listen(80, () => {
	console.log('HTTP listening on 80');
});

// serve the homepage
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

app.post('/relay_ctrl', (req, res) => {
	const click = { clickTime: new Date() };
	console.log(click);

	
	server.clients.forEach((client) => {

		if (client.uuid === req.body.UUID) {

			client.relay_out_state = client.relay_in_state ^ (1 << req.body.CH);
			client.relay_in_state = client.relay_out_state;

			const buf1 = Buffer.from("<<" + client.uuid.toString(16) + ",01;" + "L20:W,2,");
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
				}
			}


		}
	});
	res.send(obj);
});
