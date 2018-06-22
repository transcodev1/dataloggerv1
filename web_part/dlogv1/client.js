'use strict';

class Client {
	
	constructor (socket, uuid) {
		this.address = socket.remoteAddress;
		this.port 	 = socket.remotePort;
		this.name    = `${this.address}:${this.port}`;
		this.socket  = socket;
		this.uuid    = uuid;
		
		this.toggle = false;
		
		this.relay_out_state=0;
		this.relay_in_state=0;
		
		this.rst_out_state=0;
		this.rst_in_state=0;

		this.relay_buf = [];
		this.relay_cnt = 0;
		this.vdc_buf=[];
		this.vdc_cnt = 0;
		this.vac_buf = [];
		this.vac_cnt = 0;
		this.tmp_buf= [];
		this.tmp_cnt = 0;
	}

	receiveMessage (message) {
		this.socket.write(message);
	}
	
	isLocalHost() {
		return this.address === 'localhost';
	}

}
module.exports = Client;
