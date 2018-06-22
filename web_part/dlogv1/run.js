'use strict';
console.log('Server-side code running');
/* const NET = require('net'); */
/* const DLOGV1 = require('./lib-tcdlogv1'); */
const FS = require('fs');

const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors')

// new---------------
const Server = require('./server');
// -------------------


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


/* app.use(session({ secret: "ui2hf89hg32ofn3023fp", resave: false, saveUninitialized: true })) */


app.use(express.static(path.join(__dirname, 'dist/dlogv1')));

app.use(express.json());

app.listen(80, () => {
	console.log('HTTP listening on 80');
});
app.use(bodyParser.json());
/* app.use(bodyParser.urlencoded({ extended: true })); */

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname, '/src/index.html'));
})


function sendRelayCtrl(val) {

	const buf1 = Buffer.from("<<" + guuid.toString(16) + ",01;" + "L20:W,2,");
	const buf2 = Buffer.allocUnsafe(2);
	const buf3 = Buffer.from(";\r\n\x17\r\n");
	buf2.writeUInt8(0xA0, 0);	/* 1010 0000 */
	buf2.writeUInt8(val, 1);

	const buf_req1 = Buffer.concat([buf1, buf2, buf3], buf1.length + buf2.length + buf3.length);

	if (global_socket != null) global_socket.write(buf_req1);
	else console.log('***************************** Socket == Null*****************************************');
}
function sendResetCtrl(val) {

	const buf1 = Buffer.from("<<" + guuid.toString(16) + ",01;" + "L20:W,2,");
	const buf2 = Buffer.allocUnsafe(2);
	const buf3 = Buffer.from(";\r\n\x17\r\n");
	buf2.writeUInt8(0xC0, 0);	/* 1100 0000 */
	buf2.writeUInt8(val, 1);

	const buf_req2 = Buffer.concat([buf1, buf2, buf3], buf1.length + buf2.length + buf3.length);

	if (global_socket != null) global_socket.write(buf_req2);
	else console.log('***************************** Socket == Null*****************************************');
}
function sendConfig(val) {


	const buf1 = Buffer.from("<<" + guuid.toString(16) + ",01;" + "C00:");
	const buf2 = Buffer.from(val);
	const buf3 = Buffer.from(";\r\n\x17\r\n");
	const buf_req3 = Buffer.concat([buf1, buf2, buf3], buf1.length + buf2.length + buf3.length);

	if (global_socket != null) global_socket.write(buf_req3);
	else console.log('***************************** Socket == Null*****************************************');
}

app.post('/btn_all_rst_clicked', (req, res) => {
	const click = { clickTime: new Date() };
	console.log(click);

	//for check receive from dlog
	relay_in_state = 0xFF;
	relay_out_state = relay_in_state;

	reset_out_state = 0xFF;	/* 1000 0000 */

	sendResetCtrl(reset_out_state);
	res.sendStatus(201);
});

app.post('/config', (req, res) => {
	console.log(req.body.data);
	sendConfig(req.body.data);
	res.send({});
})
app.post('/relay_rst', (req, res) => {
	const click = {clickTime: new Date()};
	console.log(click);

	server.clients.forEach((client) => {
		if (client.uuid === req.body.UUID) {
				

			client.rst_out_state = client.rst_in_state ^ (1 << req.body.CH);

			client.rst_in_state = client.rst_out_state	//for showing on web
			
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

			client.relay_in_state = client.relay_out_state	//for showing on web
			
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

