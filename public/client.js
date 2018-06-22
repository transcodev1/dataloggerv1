console.log('Client-side code running');

function isEmptyObject(obj) {
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
}

function post_json(path, body) {
		fetch('/relay_ctrl', { 
								method: 'POST',
								body:    JSON.stringify(body),
								headers: { 'Content-Type': 'application/json' }})
		.then(res => res.json())
		.then(json => console.log(json));	
}

const button1 = document.getElementById('button1');
button1.addEventListener('click', function(e) {
	console.log('button1 was clicked');
	post_json('/relay_ctrl', { UUID: 12345678, CH : 0});
});

const button2 = document.getElementById('button2');
button2.addEventListener('click', function(e) {
  console.log('button2 was clicked');
	post_json('/relay_ctrl', { UUID: 12345678, CH : 1});
});

const button3 = document.getElementById('button3');
button3.addEventListener('click', function(e) {
  console.log('button3 was clicked');
	post_json('/relay_ctrl', { UUID: 12345678, CH : 2});
});

const button4 = document.getElementById('button4');
button4.addEventListener('click', function(e) {
	console.log('button4 was clicked');
	post_json('/relay_ctrl', { UUID: 12345678, CH : 3});
});
const button5 = document.getElementById('button5');
button5.addEventListener('click', function(e) {
	console.log('button5 was clicked');
	post_json('/relay_ctrl', { UUID: 12345678, CH : 4});
});

const button6 = document.getElementById('button6');
button6.addEventListener('click', function(e) {
	console.log('button6 was clicked');
	post_json('/relay_ctrl', { UUID: 12345678, CH : 5});
});

const button7 = document.getElementById('button7');
button7.addEventListener('click', function(e) {

	console.log('button7 was clicked');
	post_json('/relay_ctrl', { UUID: 12345678, CH : 6});

});

const button8 = document.getElementById('button8');
button8.addEventListener('click', function(e) {
	console.log('button8 was clicked');
	post_json('/relay_ctrl', { UUID: 98745612, CH : 7});
});

function post_json(path, body) {
		fetch(path, { method: 'POST',
					  body:   JSON.stringify(body),
					  headers: { 'Content-Type': 'application/json'}})
		.then(res => res.json())
		.then(json => console.log(json));	
}



setInterval(function() {
	
	var body = { UUID: 12345678 };
	
	fetch('/page_update', {
		method: 'POST',
		body:    JSON.stringify(body),
		headers: { 'Content-Type': 'application/json' },
		})
	.then(res => res.json())
	.then(function handleJson (DLOGV1) {
		
		//console.log(DLOGV1);
		
		if (!isEmptyObject(DLOGV1)) {
		
			document.getElementById('button1').innerHTML = "RELAY1 " + ((DLOGV1.RELAY.CH0==1)?"ON":"OFF");
			document.getElementById('button2').innerHTML = "RELAY2 " + ((DLOGV1.RELAY.CH1==1)?"ON":"OFF");
			document.getElementById('button3').innerHTML = "RELAY3 " + ((DLOGV1.RELAY.CH2==1)?"ON":"OFF");
			document.getElementById('button4').innerHTML = "RELAY4 " + ((DLOGV1.RELAY.CH3==1)?"ON":"OFF");	
			document.getElementById('button5').innerHTML = "RELAY5 " + ((DLOGV1.RELAY.CH4==1)?"ON":"OFF");
			document.getElementById('button6').innerHTML = "RELAY6 " + ((DLOGV1.RELAY.CH5==1)?"ON":"OFF");
			document.getElementById('button7').innerHTML = "RELAY7 " + ((DLOGV1.RELAY.CH6==1)?"ON":"OFF");
			document.getElementById('button8').innerHTML = "RELAY8 " + ((DLOGV1.RELAY.CH7==1)?"ON":"OFF");
		

			document.getElementById('button1').style.backgroundColor = ((DLOGV1.RELAY.CH0==1)?"#27AE60":"#CCD1D1");
			document.getElementById('button2').style.backgroundColor = ((DLOGV1.RELAY.CH1==1)?"#27AE60":"#CCD1D1");
			document.getElementById('button3').style.backgroundColor = ((DLOGV1.RELAY.CH2==1)?"#27AE60":"#CCD1D1");
			document.getElementById('button4').style.backgroundColor = ((DLOGV1.RELAY.CH3==1)?"#27AE60":"#CCD1D1");	
			document.getElementById('button5').style.backgroundColor = ((DLOGV1.RELAY.CH4==1)?"#27AE60":"#CCD1D1");
			document.getElementById('button6').style.backgroundColor = ((DLOGV1.RELAY.CH5==1)?"#27AE60":"#CCD1D1");
			document.getElementById('button7').style.backgroundColor = ((DLOGV1.RELAY.CH6==1)?"#27AE60":"#CCD1D1");
			document.getElementById('button8').style.backgroundColor = ((DLOGV1.RELAY.CH7==1)?"#27AE60":"#CCD1D1");
			
			document.getElementById('txt_v1ac').innerHTML = `V1AC = ${DLOGV1.VAC.CH0} V`;
			document.getElementById('txt_v1dc').innerHTML = `V1DC = ${DLOGV1.VDC.CH0} V`;
			document.getElementById('txt_v2dc').innerHTML = `V2DC = ${DLOGV1.VDC.CH1} V`;
			document.getElementById('txt_t1').innerHTML   = `T1 = ${DLOGV1.TEMP.CH0} C`;
		
		}
	  
    })
	.catch(function(ex) {
		console.log('parsing failed', ex)
	});		
}, 500);
