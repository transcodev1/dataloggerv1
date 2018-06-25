'use strict';
console.log('Server-side code running');
/* const NET = require('net'); */
/* const DLOGV1 = require('./lib-tcdlogv1'); */
const FS = require('fs');
const os = require('os');

const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors')

// new---------------
const Server = require('./server');
// -------------------

//**************************************
//**         DB management            **
//**************************************

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
//---------------------------------------
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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('port', 3000);

app.get('*', function (req, res) {
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
	const click = { clickTime: new Date() };
	console.log(click);

	server.clients.forEach((client) => {

		if (client.uuid === req.body.UUID) {
			if (req.body.MODE == 0)
			client.reset_out_state = client.reset_in_state || (0 << req.body.CH);
		else {
			client.reset_out_state = req.body.CH;	/* 0000 0001 */
		}		

			const buf1 = Buffer.from("<<" + client.uuid.toString(16) + ",01;" + "L20:W,2,");
			const buf2 = Buffer.allocUnsafe(2);
			const buf3 = Buffer.from(";\r\n\x17\r\n");
			buf2.writeUInt8(0xA0, 0);
			buf2.writeUInt8(client.reset_out_state, 1);


			const buf_req1 = Buffer.concat([buf1, buf2, buf3], buf1.length + buf2.length + buf3.length);

			client.socket.write(buf_req1);

			setTimeout(function () {
			
				const buf1 = Buffer.from("<<" + client.uuid.toString(16) + ",01;"+"L20:W,2,");
				const buf2 = Buffer.allocUnsafe(2);
				const buf3 = Buffer.from(";\r\n\x17\r\n");
				buf2.writeUInt8(0xA0, 0);
				buf2.writeUInt8(client.reset_in_state, 1);
	
				
	
				const buf_req1 = Buffer.concat([buf1, buf2, buf3], buf1.length + buf2.length + buf3.length);
	
				client.socket.write(buf_req1);	
				
				
			},5000)
				
		}
	});

	res.send({});
});


app.post('/relay_ctrl', (req, res) => {
	const click = { clickTime: new Date() };
	console.log(click);

	server.clients.forEach((client) => {
		if (client.uuid === req.body.UUID) {

			if (req.body.MODE == 0)
				client.relay_out_state = client.relay_in_state ^ (1 << req.body.CH);
			else {
				client.relay_out_state = req.body.CH;	/* 0000 0001 */
			}

			/* client.relay_in_state = client.relay_out_state */	//for showing on web

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
	
	
			var buf = "'"
			buf = buf.concat(req.body.UUID)
			buf = buf.concat("'")   

			/* var id = `'123456789012345'`  */
			var tmp = `
			SELECT mean("temp") AS "mean_temp" FROM "tc_datalogger"."autogen"."dlog" WHERE time > now() - 15mAND "id"=`+ buf + ` GROUP BY time(1m) FILL(null) limit 5
			`

			client_inf.query(tmp)
				.then(result => res.status(200).json(result))
				.catch(error => res.status(500).json({ error }));

		


});
app.post('/update_temp', (req, res) => {

	
	console.log(req.body.UUID)
			var buf = "'"
			buf = buf.concat(req.body.UUID)
			buf = buf.concat("'")   

			/* var id = `'123456789012345'`  */
			var tmp = `
			SELECT  mean("temp") AS "mean_temp" FROM "tc_datalogger"."autogen"."dlog" WHERE time > now() - 5m AND "id"=`+ buf + ` GROUP BY time(1m) limit 1
			`

			console.log(tmp)
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
			SELECT mean("volt_dc_2") AS "mean_volt_dc_2", mean("volt_dc_1") AS "mean_volt_dc_1" FROM "tc_datalogger"."autogen"."dlog" WHERE time > now() - 15m AND "id"='123456789012345' GROUP BY time(5m) FILL(null) limit 5`

			console.log(tmp)
			client_inf.query(tmp)
			
				.then(result => res.status(200).json(result))
				.catch(error => res.status(500).json({ error }));

});
app.post('/update_vdc', (req, res) => {

	
	console.log(req.body.UUID)
			var buf = "'"
			buf = buf.concat(req.body.UUID)
			buf = buf.concat("'")   

			/* var id = `'123456789012345'`  */
			var tmp = `
			SELECT mean("volt_dc_2") AS "mean_volt_dc_2", mean("volt_dc_1") AS "mean_volt_dc_1" FROM "tc_datalogger"."autogen"."dlog" WHERE time > now() - 5m AND "id"='123456789012345' GROUP BY time(1m) FILL(null) limit 1`

			console.log(tmp)
			client_inf.query(tmp)
			
				.then(result => res.status(200).json(result))
				.catch(error => res.status(500).json({ error }));

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
				},
				BTN:{
					CH0: client.toggle
			}
			}
			
                                                                                                                               
		}
		if(client.toggle == true) client.toggle = false;
	});
	res.send(obj);
	
});

