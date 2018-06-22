'use strict';

// Load the TCP Library
const net = require('net');
// importing Client class
const Client = require('./client');

var DLOGV1 = require('./lib-tcdlogv1');



global.DLOGV1_TAG_CNT_MASK 			= (0x1F)
global.DLOGV1_TAG_TYP_MASK 			= (0xE0)
global.DLOGV1_TYPE_REQ_ALL 			= (0x00)
global.DLOGV1_TYPE_VDC 				= (0x20)
global.DLOGV1_TYPE_IDC 				= (0x40)
global.DLOGV1_TYPE_VAC 				= (0x60)
global.DLOGV1_TYPE_IAC 				= (0x80)
global.DLOGV1_TYPE_RELAY_CTRL		= (0xA0)
global.DLOGV1_TYPE_RELAY_RESET		= (0xC0)
global.DLOGV1_TYPE_TEMP 			= (0xE0)

class Server {
	


	constructor (port, address) {
		this.port = port || 5000;
		this.address = address || '127.0.0.1';

		// Array to hold our currently connected clients
		this.clients = [];
	}
	
	/*
	 * Broadcasts messages to the network
	 * The clientSender doesn't receive it's own message
	*/
	broadcast (message, clientSender) {
		this.clients.forEach((client) => {
			if (client === clientSender)
				return;
			client.receiveMessage(message);
		});
		console.log(message.replace(/\n+$/, ""));
	}

	/*
	 * Starting the server
	 * The callback is executed when the server finally inits
	*/ 
	start (callback) {
	
		var server = this;
		
		this.connection = net.createServer((socket) => {
			
			var client = new Client(socket, 0);

			// Broadcast the new connection
			//server.broadcast(`${client.name} connected.\n`, client);
			
			var date = new Date();

			var hour = date.getHours();
			hour = (hour < 10 ? "0" : "") + hour;
			var min  = date.getMinutes();
			min = (min < 10 ? "0" : "") + min;
			var sec  = date.getSeconds();
			sec = (sec < 10 ? "0" : "") + sec;
			var year = date.getFullYear();
			var month = date.getMonth() + 1;
			month = (month < 10 ? "0" : "") + month;
			var day  = date.getDate();
			day = (day < 10 ? "0" : "") + day;

			var get_time =  year + "/" + month + "/" + day + "-" + hour + ":" + min + ":" + sec;
			console.log("\r\n----------------------------------------- [DLOGV1 : NEW CONNECTION] -----------------------------------------");
			console.log('\n[SERVER_STATUS] : CLIENT CONNECTED  [' + get_time + ']');
			console.log('[SERVER_STATUS] : CLIENT IP ADDRESS [' + `[${client.name}:${client.uuid}]`+']');
			
			// Storing client for later usage
			server.clients.push(client);
			
			var tcgpsConn = new DLOGV1(client);
			
			tcgpsConn.reg_login_cbk      (login_cbk);
			tcgpsConn.reg_login_cmpt_cbk (login_cmpt_cbk);
			tcgpsConn.reg_gps_cbk 		 (gps_cbk);
			
			tcgpsConn.reg_dlogv1_cbk     (dlogv1_cbk);
	
			// Triggered on message received by this client
			socket.on('data', (data) => { 
			
				// Broadcasting the message
				//server.broadcast(`${client.name}:${client.uuid} says: ${data}`, client);
				console.log("\r\n----------------------------------------- [DLOGV1 : DATA RECEIVE] -----------------------------------------");
				console.log(`[${client.name}:${client.uuid}]`);
				//console.log(`receive: ${data}\r\n`);
				tcgpsConn.print(data);
				if (tcgpsConn.proto_decode(data) == 1) {
	
				}

			});
			
			// Triggered when this client disconnects
			socket.on('end', () => {
				// Removing the client from the list
				server.clients.splice(server.clients.indexOf(client), 1);
				// Broadcasting that this player left
				server.broadcast(`${client.name} disconnected.\n`);
			});

		});
		
		// starting the server
		this.connection.listen(this.port, this.address);
		
		// setuping the callback of the start function
		if (callback != undefined) {
			this.connection.on('listening', callback);	
		}

	}

	/*
	 * An example function: Validating the client
	 */
	_validateClient (client){
		return client.isLocalHost();
	}
}


//* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
//*
//* Application CallBack Program Implement
//*
//* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 

var login_cbk = function (client, uuid) {
	console.log("\n****************** EVENT: LOG-IN  ****************** ");
	console.log("[Login]: Tracker Validation...");

	return true;
};	

var login_cmpt_cbk = function (client, uuid) {
	
	console.log("[Login]: Login Success...(^__^)...");
	console.log("[Login]: UUID = "+ uuid);

	
	if (client.uuid == 0) {
		client.uuid = Number(uuid);
	}

};	

var gps_cbk = function(client, gps_info) {
	console.log("\n****************** EVENT: GPS ON RECEIVE ****************** ");
	
	gps_info[DATA_OFFSET] = gps_info[DATA_OFFSET][0].toString().split(',');

	console.log("[" + gps_info[TAG_OFFSET][0] + gps_info[TAG_OFFSET][1] + "]={");
	
	indx_cnt = 0;
	
	gps_info[DATA_OFFSET].forEach(function(sub_tag) {
		console.log("    " + gps_info[DESC_OFFSET][indx_cnt++] + "= " + sub_tag);
	});
	
	console.log("}");
	
};


var dlogv1_cbk = function (client, info) {
	
	console.log("\n********* DLOGV1: DLOGV1 INFO. ON RECEIVE ************* ");
	
	var str_tmp = info[DATA_OFFSET][0];

	var start_indx = 0;
	var stop_indx = str_tmp.indexOf(",");
	info[DATA_OFFSET][0] = str_tmp.slice(start_indx, stop_indx);
	
	start_indx = str_tmp.indexOf(",", stop_indx ) + 1;
	stop_indx = str_tmp.indexOf(",", start_indx   + 1);
	info[DATA_OFFSET][1] = str_tmp.slice(start_indx, stop_indx);
	
	start_indx = str_tmp.indexOf(",", stop_indx) + 1;

	info[DATA_OFFSET][2] = str_tmp.slice(start_indx);
	
	/*console.log("\n[" + info[TAG_OFFSET][0] + info[TAG_OFFSET][1] + "]={");
	
	indx_cnt = 0;
	
	info[DATA_OFFSET].forEach(function(sub_tag) {
		console.log("\t" + info[DESC_OFFSET][indx_cnt++] + "= " + sub_tag);
	});
*/
/*	console.log("\t{DATA full} = " + str_tmp.toString('hex'));
	console.log("\t{DATA RAW} = " + info[DATA_OFFSET][2].toString('hex')); 
	console.log("\t{LEN RAW} = " + info[DATA_OFFSET][2].length); 
	*/
	
	decode_dlogv1e(client, info[DATA_OFFSET][2]);
	
	//console.log("}");
	return true;
};	

function decode_dlogv1e (client, buf) {
	var tag_idx = 0;
	var tag_type = 0;
	var tag_cnt = 0;
	var i_cnt = 0;
	
	var buf_len = buf.length;
	
	if (buf_len > 0) {
	
		while (1) {

			tag_type = buf[tag_idx] & DLOGV1_TAG_TYP_MASK;
			tag_cnt = buf[tag_idx] & DLOGV1_TAG_CNT_MASK;

			tag_idx++;

			if (tag_idx >= buf_len) {
				break;
			}

			switch (tag_type) {
			case DLOGV1_TYPE_REQ_ALL:
				break;

			case DLOGV1_TYPE_VDC:
				
				for (i_cnt = 0; i_cnt < tag_cnt; i_cnt++) {
					client.vdc_buf[i_cnt] = Math.round(buf.readFloatLE(tag_idx) * 10) / 10;
					tag_idx += 4;
					client.vdc_cnt++;
					console.log("[DLOG_V1]: V" + (i_cnt + 1) + "DC = " + client.vdc_buf[i_cnt] + "V");
				}

				break;

			case DLOGV1_TYPE_IDC:
				break;

			case DLOGV1_TYPE_VAC:
				for (i_cnt = 0; i_cnt < tag_cnt; i_cnt++) {
					client.vac_buf[i_cnt] = Math.round(buf.readFloatLE(tag_idx) * 10) / 10;
					tag_idx += 4;
					client.vac_cnt++;
					
					console.log("[DLOG_V1]: V" + (i_cnt + 1) + "AC = " + client.vac_buf[i_cnt] + "V");
				}

				break;

			case DLOGV1_TYPE_IAC:

				break;

			case DLOGV1_TYPE_RELAY_CTRL:
				for (i_cnt = 0; i_cnt < tag_cnt; i_cnt++) {
					client.relay_buf[i_cnt] = buf.readUInt8(tag_idx);
					tag_idx++;
					client.relay_cnt++;
					console.log("[DLOG_V1]: RELAY = "+ client.relay_buf[i_cnt].toString(16));
				}
				client.relay_in_state = client.relay_buf[0];
				break;

			case DLOGV1_TYPE_RELAY_RESET:
				break;

			case DLOGV1_TYPE_TEMP:

				for (i_cnt = 0; i_cnt < tag_cnt; i_cnt++) {
					client.tmp_buf[i_cnt] = Math.round(buf.readFloatLE(tag_idx) * 10) / 10;
					tag_idx += 4;
					client.tmp_cnt++;
					console.log("[DLOG_V1]: TEMP = " + client.tmp_buf[i_cnt] + "C");
				}
				
				
				break;
			} //swtich

		} //while(1)
	}//if (reply_len > 0)

}

function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "-" + month + "-" + day + "_" + hour + "-" + min + "-" + sec;

}




module.exports = Server;
