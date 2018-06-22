//* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
//*
//* DLOGV1 Library Implement
//*
//* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
var _ = require('private-parts').createKey();

global.TAG_OFFSET  	=  0;
global.DESC_OFFSET  	=  1;
global.DATA_OFFSET 	=  2;
global.CBK_FN_OFFSET =  3;


var DLOGV1 = function(client) { 

	_(this).client = client;
	
	_(this).seq_snd_num = 0;	
	
	_(this).ON_RCV_STATES = {
		LOG_IN_STS: 0,
		DATA_TRANSFER_STS: 1,
		PICTURE_TRANSFER_STS: 2
	};
	
	_(this).on_rcv = _(this).ON_RCV_STATES.LOG_IN_STS;
	
	// receive info.
	_(this).proto_num = -1;
	
	_(this).login_info =  new function () {
		this.imei    = "";
	};
		
	_(this).gps_info =  new function () {
		this.utc_ts = '';
		this.sat_num = -1;
		this.lat = -1;
		this.lon = -1;
		this.spd = -1;
		this.course = -1;
		this.status = -1;
		this.mileage = -1;
	};
	
	_(this).lbs_info =  new function() {
		this.lbs_len = -1;
		this.mcc = -1;
		this.mnc = -1;
		this.lac = -1;
		this.cell_id = -1;		
	}
	
	_(this).status_info = new function () {
		this.term_info  = -1;
		this.volt_level = -1;
		this.gsm_ssl    = -1;
		this.alrm_lang  = -1;
	}
	
	_(this).drv_lic = new function () {
		this.track1 =  '';
		this.track2 =  '';
		this.track3 =  '';
		this.alarm = -1;
		this.swipe = -1;	
	}

	
	_(this).seq_rcv_num = -1;	
	
	
	_(this).TAG_DESC = {
					 GPS    : [ '{UTC TIME AND DATE}           ', 
								'{STATUS}                      ', 
								'{LATITUDE AND N/S INDICATOR}  ', 
								'{LONGITUDE AND E/W INDICATOR} ',
								'{SPEED OVER GROUND}           ',
								'{COURSE OVER GROUND}          ',
								'{OPERATE MODE}                ',
								'{FIXED MODE}                  ',
								'{PDOP}                        ',
								'{HDOP}                        ',
								'{VDOP}                        ',
							 ],
										
					 EVT	: ['{EVENT FLAG}', ],
					 
					 EVT_RT	: ['{EVENT RT FLAG}', ],
					 
					 DIN	: ['{PORT1}'],
					 DOUT   : ['{PORT1}'],
					 ANL_IN : ['{A1}', '{A2}', '{A3}', '{A4}'],
					 BUZZ   : ['{PORT1}'],
					 LED	: ['{PORT1}'],
					 BATT   : ['{BATTERY12V}','{BATTERY3V7}'],
					 RFID   : ['{COMMAND}       ',
							   '{Log In/Out}    ',
							   '{Pass/Not Pass} ',
							   '{TIME STAMP}    ',
							   '{LENGTH}        ',
							   '{DATA}          '],		
					 CAN    : ['{SOURCE ADDRESS}      ',
							   '{DESTINATION ADDRESS} ',
							   '{LENGTH}             ',
							   '{DATA}               '],		
					 SPI1   : ['{LENGTH} ',
							   '{DATA}   '],		
					 SPI2   : ['{LENGTH} ',
							   '{DATA}   '],		
					 I2C    : ['{I2C ADDRESS}    ',
							   '{MEMORY ADDRESS} ',
							   '{LENGTH}         ',
							   '{DATA}           '],	
					 FUEL   : ['{DATA} '],
					 
					 CAM    : ['{PACKET NUMBER} ',
							   '{DATA   NUMBER} '],
							   
					 MEMORY    : ['{MILEAGE} '],
					 
					 MEM_RST    : ['{COMMAND}         ',					 
								   '{MEM RST COUNTER} '],	
								   
					 MEM_MILE    : ['{COMMAND}         ',					 
								   '{MEM MILEAGE COUNTER} '],	
								   
					 MEM_LIC_PLT : ['{COMMAND}                  ',	
									'{LENGTH}                   ',					 
								    '{MEM LICENSE PLATE NUMBER} '],		
									
					 MEM_SPD     : ['{COMMAND}            ',
									'{SPEED LIMIT ON/OFF} ',	
								    '{SPEED ALERT ON/OFF} ',					 
								    '{SPEED LIMIT HIGH}   ',
									'{SPEED LIMIT LOW}    '],	
									
					 LPUART1_TRNSPRNT : ['{LENGTH} ',
										 '{DATA}   '],						   
					 UART2_TRNSPRNT   : ['{LENGTH} ',
										 '{DATA}   '],	
					 UART3_TRNSPRNT   : ['{LENGTH} ',
										 '{DATA}   '],	
					 UART4_TRNSPRNT   : ['{LENGTH} ',
										 '{DATA}   '],	
					 UART5_TRNSPRNT   : ['{LENGTH} ',
										 '{DATA}   '],	
										
					 LPUART1_TRNSTCK  : ['{SOURCE ADDRESS}      ',
										 '{DESTINATION ADDRESS} ',
										 '{LENGTH}              ',
										 '{DATA}                '],										 
					 UART2_TRNSTCK    : ['{SOURCE ADDRESS}      ',
										 '{DESTINATION ADDRESS} ',
										 '{LENGTH}              ',
										 '{DATA}                '],										 
					 UART3_TRNSTCK    : ['{SOURCE ADDRESS}      ',
										 '{DESTINATION ADDRESS} ',
										 '{LENGTH}              ',
										 '{DATA}                '],										 
					 UART4_TRNSTCK    : ['{SOURCE ADDRESS}      ',
										 '{DESTINATION ADDRESS} ',
										 '{LENGTH}              ',
										 '{DATA}                '],										 
					 UART5_TRNSTCK    : ['{SOURCE ADDRESS}      ',
										 '{DESTINATION ADDRESS} ',
										 '{LENGTH}              ',
										 '{DATA}                '],
										 
					 DLOGV1    		  : ['{COMMAND} ',
										 '{LENGTH}  ',
										 '{DATA}    '],	
	};
	
	_(this).login_cbk_fn = DLOGV1.dft_login_cbk;
	_(this).login_cmpt_cbk_fn = DLOGV1.dft_login_cmpt_cbk;
	_(this).login_fail_cbk_fn = DLOGV1.dft_login_fail_cbk;
	_(this).proto_fail_cbk_fn = DLOGV1.dft_proto_fail_cbk;
	_(this).decode_cmpt_cbk_fn = DLOGV1.dft_decode_cmpt_cbk;
	
	_(this).TAG_INFO = {
		gps_info 		: [['G00:', 'GPS_INFO'], 		_(this).TAG_DESC.GPS,  	[], DLOGV1.dft_gps_cbk], 
		evt_info		: [['E00:', 'EVENT_INFO'], 		_(this).TAG_DESC.EVT, 	[], DLOGV1.dft_evt_cbk],
		evt_rt_info		: [['E01:', 'EVENT_RT_INFO'], _(this).TAG_DESC.EVT_RT, 	[], DLOGV1.dft_evt_rt_cbk],
		
		di_info			: [['S0F:', 'DIGITAL_IN_INFO'], _(this).TAG_DESC.DIN,   [], DLOGV1.dft_di_cbk],
		do_info			: [['S11:', 'DIGITAL_OUT_INFO'],_(this).TAG_DESC.DOUT,  [], DLOGV1.dft_do_cbk],
		analog_in_info	: [['S12:', 'ANALOG_IN_INFO'], 	_(this).TAG_DESC.ANL_IN,[], DLOGV1.dft_analog_in_cbk],
		buzzer_info		: [['S04:', 'BUZZER_INFO'], 	_(this).TAG_DESC.BUZZ, 	[], DLOGV1.dft_buzzer_cbk],
		led_info		: [['S07:', 'LED_INFO'], 		_(this).TAG_DESC.LED, 	[], DLOGV1.dft_led_cbk],
		batt_info		: [['S08:', 'BATTERY_INFO'], 	_(this).TAG_DESC.BATT, 	[], DLOGV1.dft_batt_cbk],
		rfid_info		: [['P1F:', 'RFID_INFO'], 		_(this).TAG_DESC.RFID, 	[], DLOGV1.dft_rfid_cbk],
		can_info	  	: [['P06:', 'CAN_BUS_INFO'], 	_(this).TAG_DESC.CAN, 	[], DLOGV1.dft_can_cbk],
		spi1_info	  	: [['P0A:', 'SPI1_INFO'], 		_(this).TAG_DESC.SPI1, 	[], DLOGV1.dft_spi1_cbk],
		spi2_info	  	: [['P0B:', 'SPI2_INFO'], 		_(this).TAG_DESC.SPI2, 	[], DLOGV1.dft_spi2_cbk],
		sdc_info     	: [['P0C:', 'SDCARD_INFO'], 	_(this).TAG_DESC.SDC, 	[], DLOGV1.dft_sdc_cbk],
		i2c_info	  	: [['P0D:', 'I2C_INFO'], 		_(this).TAG_DESC.I2C, 	[], DLOGV1.dft_i2c_cbk],
		fuel_info		: [['S1E:', 'FUELINFO'], 		_(this).TAG_DESC.FUEL, 	[],DLOGV1.dft_fuel_cbk],
		memory_info		: [['M00:', 'MEMORY_INFO'], 	_(this).TAG_DESC.MEMORY, 	[], DLOGV1.dft_memory_cbk],
		mem_rst_info	: [['M01:', 'MEMORY_RESET_INFO'], 	_(this).TAG_DESC.MEM_RST, 	[], DLOGV1.dft_mem_rst_cbk],
		mem_mile_info	: [['M02:', 'MEMORY_MILEAGE_INFO'], _(this).TAG_DESC.MEM_MILE, 	[], DLOGV1.dft_mem_mile_cbk],
		mem_lic_plt_info	: [['M03:', 'MEMORY_LICENSE_PLATE_INFO'], _(this).TAG_DESC.MEM_LIC_PLT, 	[], DLOGV1.dft_mem_lic_plt_cbk],
		mem_spd_info	: [['M04:', 'MEMORY_SPEED_INFO'], _(this).TAG_DESC.MEM_SPD, 	[], DLOGV1.dft_mem_spd_cbk],
		
	
		lpuart1_trnsprnt_info 	: [['P0E:', 'LPUART1_TRANSPARENT_INFO'],_(this).TAG_DESC.LPUART1_TRNSPRNT,	[], DLOGV1.dft_lpuart1_trnsprnt_cbk],
		uart2_trnsprnt_info		: [['P01:', 'UART2_TRANSPARENT_INFO'], 	_(this).TAG_DESC.UART2_TRNSPRNT, 	[], DLOGV1.dft_uart2_trnsprnt_cbk],
		uart3_trnsprnt_info		: [['P13:', 'UART3_TRANSPARENT_INFO'], 	_(this).TAG_DESC.UART3_TRNSPRNT, 	[], DLOGV1.dft_uart3_trnsprnt_cbk],
		uart4_trnsprnt_info		: [['P14:', 'UART4_TRANSPARENT_INFO'], 	_(this).TAG_DESC.UART4_TRNSPRNT, 	[], DLOGV1.dft_uart4_trnsprnt_cbk],
		uart5_trnsprnt_info		: [['P15:', 'UART5_TRANSPARENT_INFO'], 	_(this).TAG_DESC.UART5_TRNSPRNT, 	[], DLOGV1.dft_uart5_trnsprnt_cbk],

		lpuart1_trnstck_info 	: [['P1B:', 'LPUART1_TRANSTACK_INFO'], 	_(this).TAG_DESC.LPUART1_TRNSTCK , 	[], DLOGV1.dft_lpuart1_trnstck_cbk],
		uart2_trnstck_info		: [['P17:', 'UART2_TRANSTACK_INFO'], 	_(this).TAG_DESC.UART2_TRNSTCK, 	[], DLOGV1.dft_uart2_trnstck_cbk],
		uart3_trnstck_info		: [['P18:', 'UART3_TRANSTACK_INFO'], 	_(this).TAG_DESC.UART3_TRNSTCK, 	[], DLOGV1.dft_uart3_trnstck_cbk],
		uart4_trnstck_info		: [['P19:', 'UART4_TRANSTACK_INFO'], 	_(this).TAG_DESC.UART4_TRNSTCK, 	[], DLOGV1.dft_uart4_trnstck_cbk],
		uart4_trnstck_info		: [['P1A:', 'UART5_TRANSTACK_INFO'], 	_(this).TAG_DESC.UART5_TRNSTCK, 	[], DLOGV1.dft_uart5_trnstck_cbk],

						
		cam_info		: [['P1C:', 'CAM_INFO'], 		_(this).TAG_DESC.CAM, 	[], DLOGV1.dft_cam_cbk],
		dlogv1_info		: [['L20:', 'DLOGV1_INFO'], 		_(this).TAG_DESC.DLOGV1, 	[], DLOGV1.dft_dlogv1_cbk],

	};	

};


//* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//*
//* Section: Public Function Implement
//*
//* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

//reg function
DLOGV1.prototype.reg_decode_cmpt_cbk = function(decode_cmpt_cbk_fn)	 { _(this).decode_cmpt_cbk_fn = decode_cmpt_cbk_fn; }
DLOGV1.prototype.reg_login_cbk 	    = function(login_cbk_fn)	 	 { _(this).login_cbk_fn  = login_cbk_fn; }
DLOGV1.prototype.reg_login_cmpt_cbk  = function(login_cmpt_cbk_fn)	 { _(this).login_cmpt_cbk_fn  = login_cmpt_cbk_fn; }

DLOGV1.prototype.reg_gps_cbk    = function(gps_cbk_fn)	 { _(this).TAG_INFO.gps_info[CBK_FN_OFFSET]    = gps_cbk_fn; 	}
DLOGV1.prototype.reg_evt_cbk    = function(evt_cbk_fn)	 { _(this).TAG_INFO.evt_info[CBK_FN_OFFSET]    = evt_cbk_fn; 	}
DLOGV1.prototype.reg_evt_rt_cbk    = function(evt_rt_cbk_fn)	 { _(this).TAG_INFO.evt_rt_info[CBK_FN_OFFSET]    = evt_rt_cbk_fn; 	}

DLOGV1.prototype.reg_di_cbk 	   = function(di_cbk_fn) 	 { _(this).TAG_INFO.di_info[CBK_FN_OFFSET] 	   = di_cbk_fn; 	}
DLOGV1.prototype.reg_do_cbk	   = function(do_cbk_fn)	 { _(this).TAG_INFO.do_info[CBK_FN_OFFSET] 	   = do_cbk_fn; 	}
DLOGV1.prototype.reg_an_in_cbk  = function(an_in_cbk_fn)	 { _(this).TAG_INFO.an_in_info[CBK_FN_OFFSET]  = an_in_cbk_fn;  }
DLOGV1.prototype.reg_buzzer_cbk = function(buzzer_cbk_fn) { _(this).TAG_INFO.buzzer_info[CBK_FN_OFFSET] = buzzer_cbk_fn; }
DLOGV1.prototype.reg_led_cbk    = function(led_cbk_fn) 	 { _(this).TAG_INFO.led_info[CBK_FN_OFFSET]    = led_cbk_fn;	}
DLOGV1.prototype.reg_batt_cbk   = function(batt_cbk_fn) 	 { _(this).TAG_INFO.batt_info[CBK_FN_OFFSET]   = batt_cbk_fn;	}
DLOGV1.prototype.reg_fuel_cbk   = function(fuel_cbk_fn) 	 { _(this).TAG_INFO.fuel_info[CBK_FN_OFFSET]   = fuel_cbk_fn; 	} 
DLOGV1.prototype.reg_can_cbk    = function(can_cbk_fn) 	 { _(this).TAG_INFO.can_info[CBK_FN_OFFSET]    = can_cbk_fn;	}
DLOGV1.prototype.reg_spi1_cbk   = function(spi1_cbk_fn) 	 { _(this).TAG_INFO.spi1_info[CBK_FN_OFFSET]   = spi1_cbk_fn;	}
DLOGV1.prototype.reg_spi2_cbk   = function(spi2_cbk_fn) 	 { _(this).TAG_INFO.spi2_info[CBK_FN_OFFSET]   = spi2_cbk_fn;	}
DLOGV1.prototype.reg_sdc_cbk    = function(sdc_cbk_fn) 	 { _(this).TAG_INFO.sdc_info[CBK_FN_OFFSET]    = sdc_cbk_fn;	}
DLOGV1.prototype.reg_i2c_cbk    = function(i2c_cbk_fn) 	 { _(this).TAG_INFO.i2c_info[CBK_FN_OFFSET]    = i2c_cbk_fn;	}
DLOGV1.prototype.reg_rfid_cbk   = function(rfid_cbk_fn) 	 { _(this).TAG_INFO.rfid_info[CBK_FN_OFFSET]   = rfid_cbk_fn;	}
DLOGV1.prototype.reg_cam_cbk    = function(cam_cbk_fn) 	 { _(this).TAG_INFO.cam_info[CBK_FN_OFFSET]    = cam_cbk_fn;	}
DLOGV1.prototype.reg_memory_cbk    = function(memory_cbk_fn) 	 { _(this).TAG_INFO.memory_info[CBK_FN_OFFSET]    = memory_cbk_fn;	}
DLOGV1.prototype.reg_mem_rst_cbk    = function(mem_rst_cbk_fn) 	 { _(this).TAG_INFO.mem_rst_info[CBK_FN_OFFSET]    = mem_rst_cbk_fn;	}
DLOGV1.prototype.reg_mem_mile_cbk    = function(mem_mile_cbk_fn) 	 { _(this).TAG_INFO.mem_mile_info[CBK_FN_OFFSET]    = mem_mile_cbk_fn;	}
DLOGV1.prototype.reg_mem_lic_plt_cbk    = function(mem_lic_plt_cbk_fn) 	 { _(this).TAG_INFO.mem_lic_plt_info[CBK_FN_OFFSET]    = mem_lic_plt_cbk_fn;	}
DLOGV1.prototype.reg_mem_spd_cbk    = function(mem_spd_cbk_fn) 	 { _(this).TAG_INFO.mem_spd_info[CBK_FN_OFFSET]    = mem_spd_cbk_fn;	}


DLOGV1.prototype.reg_lpuart1_trnsprnt_cbk = function(lpuart1_trnsprnt_cbk_fn){ _(this).TAG_INFO.lpuart1_trnsprnt_info[CBK_FN_OFFSET] = lpuart1_trnsprnt_cbk_fn; }
DLOGV1.prototype.reg_uart2_trnsprnt_cbk 	 = function(uart2_trnsprnt_cbk_fn)  { _(this).TAG_INFO.uart2_trnsprnt_info[CBK_FN_OFFSET]   = uart2_trnsprnt_cbk_fn;   }
DLOGV1.prototype.reg_uart3_trnsprnt_cbk 	 = function(uart3_trnsprnt_cbk_fn)  { _(this).TAG_INFO.uart3_trnsprnt_info[CBK_FN_OFFSET]   = uart3_trnsprnt_cbk_fn;   }
DLOGV1.prototype.reg_uart4_trnsprnt_cbk   = function(uart4_trnsprnt_cbk_fn)  { _(this).TAG_INFO.uart4_trnsprnt_info[CBK_FN_OFFSET]   = uart4_trnsprnt_cbk_fn;   }
DLOGV1.prototype.reg_uart5_trnsprnt_cbk   = function(uart5_trnsprnt_cbk_fn)  { _(this).TAG_INFO.uart5_trnsprnt_info[CBK_FN_OFFSET]   = uart5_trnsprnt_cbk_fn;   }
DLOGV1.prototype.reg_lpuart1_trnstck_cbk  = function(lpuart1_trnstck_cbk_fn) { _(this).TAG_INFO.lpuart1_trnstck_info[CBK_FN_OFFSET]  = lpuart1_trnstck_cbk_fn;   }
DLOGV1.prototype.reg_uart2_trnstck_cbk    = function(uart2_trnstck_cbk_fn) 	{ _(this).TAG_INFO.uart2_trnstck_info[CBK_FN_OFFSET]    = uart2_trnstck_cbk_fn; 	   }
DLOGV1.prototype.reg_uart3_trnstck_cbk    = function(uart3_trnstck_cbk_fn) 	{ _(this).TAG_INFO.uart3_trnstck_info[CBK_FN_OFFSET]    = uart3_trnstck_cbk_fn;     }
DLOGV1.prototype.reg_uart4_trnstck_cbk    = function(uart4_trnstck_cbk_fn) 	{ _(this).TAG_INFO.uart4_trnstck_info[CBK_FN_OFFSET]    = uart4_trnstck_cbk_fn;     } 
DLOGV1.prototype.reg_uart5_trnstck_cbk    = function(uart5_trnstck_cbk_fn) 	{ _(this).TAG_INFO.uart5_trnstck_info[CBK_FN_OFFSET]    = uart5_trnstck_cbk_fn;     }
DLOGV1.prototype.reg_dlogv1_cbk           = function(dlogv1_cbk_fn) 	        { _(this).TAG_INFO.dlogv1_info[CBK_FN_OFFSET]    = dlogv1_cbk_fn;     }

//get function
DLOGV1.prototype.get_uuid_info 	= function() { return _(this).uuid;   }	
DLOGV1.prototype.get_gps_info  	= function() { return _(this).TAG_INFO.gps_info;    }	
DLOGV1.prototype.get_evt_info  	= function() { return _(this).TAG_INFO.evt_info;    }	
DLOGV1.prototype.get_di_info  	= function() { return _(this).TAG_INFO.di_info;     }	
DLOGV1.prototype.get_do_info  	= function() { return _(this).TAG_INFO.do_info;     }	
DLOGV1.prototype.get_an_in_info  = function() { return _(this).TAG_INFO.an_in_info;  }	
DLOGV1.prototype.get_buzzer_info = function() { return _(this).TAG_INFO.buzzer_info; }	
DLOGV1.prototype.get_led_info  	= function() { return _(this).TAG_INFO.led_info;    }	
DLOGV1.prototype.get_batt_info  	= function() { return _(this).TAG_INFO.batt_info;   }	
DLOGV1.prototype.get_fuel_info  	= function() { return _(this).TAG_INFO.fuel_info;   }	
DLOGV1.prototype.get_can_info  	= function() { return _(this).TAG_INFO.can_info;    }	
DLOGV1.prototype.get_spi1_info  	= function() { return _(this).TAG_INFO.spi1_info;   }	
DLOGV1.prototype.get_spi2_info  	= function() { return _(this).TAG_INFO.spi2_info;   }	
DLOGV1.prototype.get_sdc_info  	= function() { return _(this).TAG_INFO.sdc_info;    }	
DLOGV1.prototype.get_i2c_info  	= function() { return _(this).TAG_INFO.i2c_info;    }	
DLOGV1.prototype.get_rfid_info  	= function() { return _(this).TAG_INFO.rfid_info;   }	


DLOGV1.prototype.get_lpuart1_trnsprnt_info = function() { return _(this).TAG_INFO.lpuart1_trnsprnt_info; }	
DLOGV1.prototype.get_uart2_trnsprnt_info   = function() { return _(this).TAG_INFO.uart2_trnsprnt_info;  	}	
DLOGV1.prototype.get_uart3_trnsprnt_info   = function() { return _(this).TAG_INFO.uart3_trnsprnt_info;  	}	
DLOGV1.prototype.get_uart4_trnsprnt_info   = function() { return _(this).TAG_INFO.uart4_trnsprnt_info;  	}	
DLOGV1.prototype.get_uart5_trnsprnt_info   = function() { return _(this).TAG_INFO.uart5_trnsprnt_info;   }	
DLOGV1.prototype.get_lpuart1_trnstck_info  = function() { return _(this).TAG_INFO.lpuart1_trnstck_info;  }	
DLOGV1.prototype.get_uart2_trnstck_info    = function() { return _(this).TAG_INFO.uart2_trnstck_info;    }	
DLOGV1.prototype.get_uart3_trnstck_info    = function() { return _(this).TAG_INFO.uart3_trnstck_info;    }	
DLOGV1.prototype.get_uart4_trnstck_info    = function() { return _(this).TAG_INFO.uart4_trnstck_info;    }	
DLOGV1.prototype.get_uart5_trnstck_info    = function() { return _(this).TAG_INFO.uart5_trnstck_info;    }	
DLOGV1.prototype.get_seq_rcv_num    = function() { return _(this).seq_rcv_num;    }		

DLOGV1.prototype.print = function (pdu_buf) { 
	//console.log("[DLOGV1]: PDU BUFFER = {%s}",pdu_buf.toString('hex').toUpperCase());  
	console.log("[DLOGV1]: PDU BUFFER = {%s}",pdu_buf.toString());  
	console.log("[DLOGV1]: PDU LENGTH = " + pdu_buf.byteLength);  
};

DLOGV1.prototype.proto_decode = function (pdu_buf) {
	
	if (_(this).on_rcv == _(this).ON_RCV_STATES.LOG_IN_STS) {	//__lv0__
		if ((offset_indx = pdu_buf.indexOf(">>") + 2) >= 2) {
			var stop_indx = pdu_buf.indexOf(',',2);					//stp*******************,
														
			_(this).uuid = pdu_buf.slice(offset_indx, stop_indx );	//uuid"------------------"	
																		//">>1234567890ABCDEF,01;{TAG1};{TAG2};{TAG3};...;{TAGn};\0x17\r\n"
																		// 012345678901234567890123456789
			/* _(this).uuid = pdu_buf.slice(offset_indx, offset_indx + 8); */
			
			if ((stop_indx = pdu_buf.indexOf(',',2) + 2) >= offset_indx+8)
			{

				if (_(this).login_cbk_fn(_(this).client, _(this).uuid)){	    //tracker valid		 __(lv1)__
					_(this).login_cmpt_cbk_fn(_(this).client, _(this).uuid);	//login complete(with uuid)
					//protocal version
					_(this).on_rcv  = _(this).ON_RCV_STATES.DATA_TRANSFER_STS;	//join lv2
				}
				else {// no >>
					_(this).login_fail_cbk_fn(_(this).client, _(this).uuid);
				}
			}
		}
		else {
			_(this).proto_fail_cbk_fn(_(this).client, pdu_buf);
		}
	}

	if (_(this).on_rcv == _(this).ON_RCV_STATES.DATA_TRANSFER_STS) {	// login complete(lv0+lv1) then can join this condition__(lv2)__
		
		for (var prop in _(this).TAG_INFO) {
	
			var offset = 0;
			var offset_indx = 0;
			var delimiter = '';

			while ((offset_indx = pdu_buf.indexOf(_(this).TAG_INFO[prop][TAG_OFFSET][0], offset_indx + offset) + 4) >= 4) {	

				delimiter = ((_(this).TAG_INFO[prop][TAG_OFFSET][0].indexOf('P') == 0) || (_(this).TAG_INFO[prop][TAG_OFFSET][0].indexOf('L') == 0)) ? ';\r\n' : ';';
				
				offset = pdu_buf.slice(offset_indx).indexOf(delimiter);

				_(this).TAG_INFO[prop][DATA_OFFSET][0] = pdu_buf.slice(offset_indx, offset_indx + offset);	
				
				_(this).TAG_INFO[prop][CBK_FN_OFFSET](_(this).client, _(this).TAG_INFO[prop]);
			
			}
		}
		
		_(this).decode_cmpt_cbk_fn(_(this).client, _(this).TAG_INFO);

		return 1;
	}

	return 0;
}

DLOGV1.prototype.print_info = function(info) {
	
	console.log("\n[" + info[TAG_OFFSET][0] + info[TAG_OFFSET][1] + "]={");
	
	indx_cnt = 0;
	
	info[DATA_OFFSET].forEach(function(sub_tag) {
		console.log("\t" + info[DESC_OFFSET][indx_cnt++] + "= " + sub_tag);
	});
	
	console.log("}");
	
};
//* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
//*
//* Section: Private Function Implement
//*
//* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
DLOGV1.dft_decode_cmpt_cbk = function(client, all_info) {
	//console.log("\nDecode Complete....\n");

	return all_info;
};	

DLOGV1.dft_login_cbk = function(client, uuid) {
	console.log("\n[Login]: Tracker Validation...");

	return true;
};	

DLOGV1.dft_login_cmpt_cbk = function(client, uuid) {
	console.log("[Login]: Login Success...(^__^)...!!");
	console.log("[Login]: UUID = "+ uuid);
/*		
	console.log("[Login]: REQ = \">>123456789012346;P1C:;\\r\\n\\x17\\r\\n\"\n");
	
	client.write(">>123456789012346;P1C:;\r\n\x17\r\n");
*/
};	

DLOGV1.dft_login_fail_cbk = function(client, uuid) {
	console.log("\n[Login]: Fail..o(_ _)o.\n");

	return true;
};	

DLOGV1.dft_proto_fail_cbk = function(client, pdu_buf) {
	console.log("\n[Protocol]: Fail..(Y_Y)...\n");

	return true;
};
DLOGV1.dft_uuid_cbk = function(client, info) {
	info[DATA_OFFSET] = info[DATA_OFFSET][0].toString().split(',');
	
	return info;
};
DLOGV1.dft_gps_cbk = function(client, info) {
	info[DATA_OFFSET] = info[DATA_OFFSET][0].toString().split(',');


	
	return info;
};

DLOGV1.dft_evt_cbk = function(client, info) {
	info[DATA_OFFSET] = info[DATA_OFFSET][0].toString().split(',');

	return info;

};


DLOGV1.dft_evt_rt_cbk = function(client, info) {
	info[DATA_OFFSET] = info[DATA_OFFSET][0].toString().split(',');

	return info;

};

DLOGV1.dft_di_cbk = function(client, info) {
	info[DATA_OFFSET] = info[DATA_OFFSET][0].toString().split(',');
	return info;
};

DLOGV1.dft_do_cbk = function(client, info) {
	info[DATA_OFFSET] = info[DATA_OFFSET][0].toString().split(',');

	return info;
};	

DLOGV1.dft_analog_in_cbk = function(client, info) {
	info[DATA_OFFSET] = info[DATA_OFFSET][0].toString().split(',');

	return info;
};

DLOGV1.dft_buzzer_cbk = function(client, info) {
	info[DATA_OFFSET] = info[DATA_OFFSET][0].toString().split(',');

	return info;
};

DLOGV1.dft_led_cbk = function(client, info) {
	info[DATA_OFFSET] = info[DATA_OFFSET][0].toString().split(',');

	return info;
};		
	
DLOGV1.dft_batt_cbk = function(client, info) {
	info[DATA_OFFSET] = info[DATA_OFFSET][0].toString().split(',');

	return info;
};		

DLOGV1.dft_fuel_cbk = function(client, info) {
	info[DATA_OFFSET] = info[DATA_OFFSET][0].toString().split(',');

	return info;
}	

DLOGV1.dft_can_cbk = function(client, info) {
	var str_tmp = info[DATA_OFFSET][0];
	
	var start_indx = 0;
	var stop_indx = str_tmp.indexOf(",");
}	

DLOGV1.dft_spi1_cbk = function(client, info) {
	var str_tmp = info[DATA_OFFSET][0];
	
	var start_indx = 0;
	var stop_indx = str_tmp.indexOf(",");
}	

DLOGV1.dft_spi2_cbk = function(client, info) {
	var str_tmp = info[DATA_OFFSET][0];
	
	var start_indx = 0;
	var stop_indx = str_tmp.indexOf(",");
}	

DLOGV1.dft_sdc_cbk = function(client, info) {
	var str_tmp = info[DATA_OFFSET][0];
	
	var start_indx = 0;
	var stop_indx = str_tmp.indexOf(",");
}	

DLOGV1.dft_i2c_cbk = function(client, info) {
	var str_tmp = info[DATA_OFFSET][0];
	
	var start_indx = 0;
	var stop_indx = str_tmp.indexOf(",");
}	

DLOGV1.dft_lpuart1_trnsprnt_cbk = function(client, info) {
	var str_tmp = info[DATA_OFFSET][0];
	
	var start_indx = 0;
	var stop_indx = str_tmp.indexOf(",");
	info[DATA_OFFSET][0] = str_tmp.slice(start_indx, stop_indx);
		
	start_indx = str_tmp.indexOf(",", stop_indx) + 1;
	stop_indx  = str_tmp.indexOf(";\r\n");	
	info[DATA_OFFSET][1] = str_tmp.slice(start_indx, stop_indx);
	
	return info;
}	

DLOGV1.dft_uart2_trnsprnt_cbk = function(client, info) {
	var str_tmp = info[DATA_OFFSET][0];
	
	var start_indx = 0;
	var stop_indx = str_tmp.indexOf(",");
	info[DATA_OFFSET][0] = str_tmp.slice(start_indx, stop_indx);
		
	start_indx = str_tmp.indexOf(",", stop_indx) + 1;
	stop_indx  = str_tmp.indexOf(";\r\n");	
	info[DATA_OFFSET][1] = str_tmp.slice(start_indx, stop_indx);
	
	return info;
}
	
DLOGV1.dft_uart3_trnsprnt_cbk = function(client, info) {
	var str_tmp = info[DATA_OFFSET][0];
	
	var start_indx = 0;
	var stop_indx = str_tmp.indexOf(",");
	info[DATA_OFFSET][0] = str_tmp.slice(start_indx, stop_indx);
		
	start_indx = str_tmp.indexOf(",", stop_indx) + 1;
	stop_indx  = str_tmp.indexOf(";\r\n");	
	info[DATA_OFFSET][1] = str_tmp.slice(start_indx, stop_indx);
	
	return info;
}	
	
DLOGV1.dft_uart4_trnsprnt_cbk = function(client, info) {
	var str_tmp = info[DATA_OFFSET][0];
	
	var start_indx = 0;
	var stop_indx = str_tmp.indexOf(",");
	info[DATA_OFFSET][0] = str_tmp.slice(start_indx, stop_indx);
		
	start_indx = str_tmp.indexOf(",", stop_indx) + 1;
	stop_indx  = str_tmp.indexOf(";\r\n");		
	info[DATA_OFFSET][1] = str_tmp.slice(start_indx, stop_indx);
	
	return info;
}	
	
DLOGV1.dft_uart5_trnsprnt_cbk = function(client, info) {
	var str_tmp = info[DATA_OFFSET][0];
	
	var start_indx = 0;
	var stop_indx = str_tmp.indexOf(",");
	info[DATA_OFFSET][0] = str_tmp.slice(start_indx, stop_indx);
		
	start_indx = str_tmp.indexOf(",", stop_indx) + 1;
	stop_indx  = str_tmp.indexOf(";\r\n");	
	info[DATA_OFFSET][1] = str_tmp.slice(start_indx, stop_indx);
	
	return info;
}	
	
DLOGV1.dft_lpuart1_trnstck_cbk = function(client, info) {
	var str_tmp = info[DATA_OFFSET][0];

	var start_indx = 0;
	var stop_indx = str_tmp.indexOf(",");
	info[DATA_OFFSET][0] = str_tmp.slice(start_indx, stop_indx);
	
	start_indx = str_tmp.indexOf(",", stop_indx ) + 1;
	stop_indx = str_tmp.indexOf(",", start_indx   + 1);
	info[DATA_OFFSET][1] = str_tmp.slice(start_indx, stop_indx);
	
	start_indx = str_tmp.indexOf(",", stop_indx )+ 1;
	stop_indx = str_tmp.indexOf(",", start_indx  + 1);	
	info[DATA_OFFSET][2] = str_tmp.slice(start_indx, stop_indx);
	
	start_indx = str_tmp.indexOf(",", stop_indx) + 1;
	stop_indx  = str_tmp.indexOf(";\r\n");	
	info[DATA_OFFSET][3] = str_tmp.slice(start_indx, stop_indx);
	
	return info;

}	
	
DLOGV1.dft_uart2_trnstck_cbk = function(client, info) {
	var str_tmp = info[DATA_OFFSET][0];

	var start_indx = 0;
	var stop_indx = str_tmp.indexOf(",");
	info[DATA_OFFSET][0] = str_tmp.slice(start_indx, stop_indx);
	
	start_indx = str_tmp.indexOf(",", stop_indx ) + 1;
	stop_indx = str_tmp.indexOf(",", start_indx   + 1);
	info[DATA_OFFSET][1] = str_tmp.slice(start_indx, stop_indx);
	
	start_indx = str_tmp.indexOf(",", stop_indx )+ 1;
	stop_indx = str_tmp.indexOf(",", start_indx  + 1);	
	info[DATA_OFFSET][2] = str_tmp.slice(start_indx, stop_indx);
	
	start_indx = str_tmp.indexOf(",", stop_indx) + 1;
	stop_indx  = str_tmp.indexOf(";\r\n");	
	info[DATA_OFFSET][3] = str_tmp.slice(start_indx, stop_indx);
	
	return info;
}	
	
DLOGV1.dft_uart3_trnstck_cbk = function(client, info) {
	var str_tmp = info[DATA_OFFSET][0];

	var start_indx = 0;
	var stop_indx = str_tmp.indexOf(",");
	info[DATA_OFFSET][0] = str_tmp.slice(start_indx, stop_indx);
	
	start_indx = str_tmp.indexOf(",", stop_indx ) + 1;
	stop_indx = str_tmp.indexOf(",", start_indx   + 1);
	info[DATA_OFFSET][1] = str_tmp.slice(start_indx, stop_indx);
	
	start_indx = str_tmp.indexOf(",", stop_indx )+ 1;
	stop_indx = str_tmp.indexOf(",", start_indx  + 1);	
	info[DATA_OFFSET][2] = str_tmp.slice(start_indx, stop_indx);
	
	start_indx = str_tmp.indexOf(",", stop_indx) + 1;
	stop_indx  = str_tmp.indexOf(";\r\n");	
	info[DATA_OFFSET][3] = str_tmp.slice(start_indx, stop_indx);
	return info;
}	
	
DLOGV1.dft_uart4_trnstck_cbk = function(client, info) {
	var str_tmp = info[DATA_OFFSET][0];

	var start_indx = 0;
	var stop_indx = str_tmp.indexOf(",");
	info[DATA_OFFSET][0] = str_tmp.slice(start_indx, stop_indx);
	
	start_indx = str_tmp.indexOf(",", stop_indx ) + 1;
	stop_indx = str_tmp.indexOf(",", start_indx   + 1);
	info[DATA_OFFSET][1] = str_tmp.slice(start_indx, stop_indx);
	
	start_indx = str_tmp.indexOf(",", stop_indx )+ 1;
	stop_indx = str_tmp.indexOf(",", start_indx  + 1);	
	info[DATA_OFFSET][2] = str_tmp.slice(start_indx, stop_indx);
	
	start_indx = str_tmp.indexOf(",", stop_indx) + 1;
	stop_indx  = str_tmp.indexOf(";\r\n");	
	info[DATA_OFFSET][3] = str_tmp.slice(start_indx, stop_indx);
	
	return info;
}	
	
DLOGV1.dft_uart5_trnstck_cbk = function(client, info) {
	var str_tmp = info[DATA_OFFSET][0];

	var start_indx = 0;
	var stop_indx = str_tmp.indexOf(",");
	info[DATA_OFFSET][0] = str_tmp.slice(start_indx, stop_indx);
	
	start_indx = str_tmp.indexOf(",", stop_indx ) + 1;
	stop_indx = str_tmp.indexOf(",", start_indx   + 1);
	info[DATA_OFFSET][1] = str_tmp.slice(start_indx, stop_indx);
	
	start_indx = str_tmp.indexOf(",", stop_indx )+ 1;
	stop_indx = str_tmp.indexOf(",", start_indx  + 1);	
	info[DATA_OFFSET][2] = str_tmp.slice(start_indx, stop_indx);
	
	start_indx = str_tmp.indexOf(",", stop_indx) + 1;
	stop_indx  = str_tmp.indexOf(";\r\n");	
	info[DATA_OFFSET][3] = str_tmp.slice(start_indx, stop_indx);
	
	return info;
}	


DLOGV1.dft_rfid_cbk = function(client, info) {
	var str_tmp = info[DATA_OFFSET][0];

	var start_indx = 0;
	var stop_indx = str_tmp.indexOf(",");
	info[DATA_OFFSET][0] = str_tmp.slice(start_indx, stop_indx);
	
	start_indx = str_tmp.indexOf(",", stop_indx ) + 1;
	stop_indx = str_tmp.indexOf(",", start_indx   + 1);
	info[DATA_OFFSET][1] = str_tmp.slice(start_indx, stop_indx);
	
	start_indx = str_tmp.indexOf(",", stop_indx )+ 1;
	stop_indx = str_tmp.indexOf(",", start_indx  + 1);	
	info[DATA_OFFSET][2] = str_tmp.slice(start_indx, stop_indx);
	
	start_indx = str_tmp.indexOf(",", stop_indx )+ 1;
	stop_indx = str_tmp.indexOf(",", start_indx  + 1);	
	info[DATA_OFFSET][3] = str_tmp.slice(start_indx, stop_indx);
	
	start_indx = str_tmp.indexOf(",", stop_indx) + 1;
	stop_indx  = str_tmp.indexOf(";\r\n");		
	info[DATA_OFFSET][4] = str_tmp.slice(start_indx, stop_indx);
	
	return info;
	
};	

DLOGV1.dft_cam_cbk = function(client, info) {
	var str_tmp = info[DATA_OFFSET][0];

	var start_indx = 0;
	var stop_indx = str_tmp.indexOf(",");
	info[DATA_OFFSET][0] = str_tmp.slice(start_indx, stop_indx);
	
	start_indx = str_tmp.indexOf(",", stop_indx ) + 1;
	stop_indx = str_tmp.indexOf(",", start_indx   + 1);
	info[DATA_OFFSET][1] = str_tmp.slice(start_indx, stop_indx);

	start_indx = str_tmp.indexOf(",", stop_indx) + 1;
	stop_indx  = str_tmp.indexOf(";\r\n");		
	info[DATA_OFFSET][2] = str_tmp.slice(start_indx, stop_indx);

	return info;
	
};	

DLOGV1.dft_memory_cbk = function(client, info) {
	
	info[DATA_OFFSET] = info[DATA_OFFSET][0].toString().split(',');

	
	return info;
}	

DLOGV1.dft_mem_rst_cbk = function(client, info) {
	
	info[DATA_OFFSET] = info[DATA_OFFSET][0].toString().split(',');

	
	return info;
}	

DLOGV1.dft_mem_mile_cbk  = function(client, info) {
	
	info[DATA_OFFSET] = info[DATA_OFFSET][0].toString().split(',');

	
	return info;
}	

DLOGV1.dft_mem_lic_plt_cbk = function(client, info) {
	
	info[DATA_OFFSET] = info[DATA_OFFSET][0].toString().split(',');

	
	return info;
}	

DLOGV1.dft_mem_spd_cbk = function(client, info) {
	
	info[DATA_OFFSET] = info[DATA_OFFSET][0].toString().split(',');

	
	return info;
}	

DLOGV1.dft_dlogv1_cbk = function(client, info) {
	
	info[DATA_OFFSET] = info[DATA_OFFSET][0].toString().split(',');

	
	return info;
}	
module.exports = DLOGV1;
