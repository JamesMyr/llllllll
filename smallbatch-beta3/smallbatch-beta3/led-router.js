inlets = 2;
outlets = 2;

var lAll = 0;
var rGate = 1; // the status of the router gate, triggered 

// Global (Max namespace) variables
glob = new Global("routinginfo");
glob.gMeta = 0;
glob.g1x = 0; // this is the x-dimension of the 1st attached device
glob.g1y = 0; // this is the y-dimension of the 1st attached device
glob.gridtiling = 0;

// need to have sOSC() args go to 't' to deal with /led/map command which takes address&10args
function sOSC(a,x,y,z,n,o,p,q,r,s,t) { // a=osc address, b-t = data

  // this entire function is enclosed inside of a if statement: if(rGate==1)
  if(rGate==1) { // only process the sOSC commands if in application mode

  // should create a call for /sys/info for apps that request it in case they don't respond to initialisation
	
	// again these are hard-coded to 8x8 divisions, and could be expanded for variable size if required
	
	if(a=="/manager/grid/led/set") { // i:<x>, i:<y>, i:<state>
		if(glob.gMeta==0) { // only one application so will be inlet==0 only
		  if(inlet==0) { // ignore messages from 2nd app
			if(x<glob.g1x && y<glob.g1y) { // the press is within the range of the left most device
				outlet(0,"/manager/grid/led/set",x,y,z);
			}
			else if(glob.gridtiling==0) outlet(1,"/manager/grid/led/set",(x-glob.g1x),y,z);
			else outlet(1,"/manager/grid/led/set",x,(y-glob.g1y),z);
		  }
		}
		if(glob.gMeta==1) { // 2 apps & 2 devices
			if(inlet==0) outlet(0,"/manager/grid/led/set",x,y,z); // inlet0=outlet0
			else outlet(1,"/manager/grid/led/set",x,y,z); // inlet0=outlet0
		}
		if(glob.gMeta==2) { // 1 device split horizontally
			if(inlet==0) {
				if(x<8) outlet(0,"/manager/grid/led/set",x,y,z); // stops overflow into 2nd quad
			}
			else outlet(0,"/manager/grid/led/set",(x+8),y,z);
		}
		if(glob.gMeta==3) { // 1 device split vertically
			if(inlet==0) {
				if(y<8) outlet(0,"/manager/grid/led/set",x,y,z); // stops overflow into bottom quads
			}
			else outlet(0,"/manager/grid/led/set",x,(y+8),z);
		}
	}
	
	
	if(a=="/manager/grid/led/all") { // i:<all state>
		if(glob.gMeta==0) { // only one application so will be inlet==0 only
		  if(inlet==0) { // ignore messages from 2nd application
			outlet(0,"/manager/grid/led/all",x); // send to both outlets (even if only one attached)
			outlet(1,"/manager/grid/led/all",x);
		  }
		}
		if(glob.gMeta==1) { // 2 apps & 2 devices
			if(inlet==0) outlet(0,"/manager/grid/led/all",x); // inlet0=outlet0
			else outlet(1,"/manager/grid/led/all",x);
		}

		if(x==0) lAll = 0;
		else lAll = 255;
		
		if(glob.gMeta==2) { // landcape128 from 2 apps
			if(inlet==0) { // left half of physical grid
				// send a /led/map of 1st quad, set to 0 or 255 for on/off
				outlet(0,"/manager/grid/led/map",0,0,lAll,lAll,lAll,lAll,lAll,lAll,lAll,lAll);
				outlet(0,"/manager/grid/led/map",0,8,lAll,lAll,lAll,lAll,lAll,lAll,lAll,lAll);
			}
			else { // right half of physical grid
				// send a /led/map of 2nd quad, set to 0 or 255 for on/off
				outlet(0,"/manager/grid/led/map",8,0,lAll,lAll,lAll,lAll,lAll,lAll,lAll,lAll);
				outlet(0,"/manager/grid/led/map",8,8,lAll,lAll,lAll,lAll,lAll,lAll,lAll,lAll);
			}
		}
		if(glob.gMeta == 3) { // portrait128/256 from 2 apps
			if(inlet==0) { // top half of physical grid
				// send a /led/map to 1/2 quad, set to 0 or 255 for on/off
				outlet(0,"/manager/grid/led/map",0,0,lAll,lAll,lAll,lAll,lAll,lAll,lAll,lAll);
				outlet(0,"/manager/grid/led/map",8,0,lAll,lAll,lAll,lAll,lAll,lAll,lAll,lAll);
			}
			else { // bottom half of physical grid
				// send a /led/map of 3/4 quad, set to 0 or 255 for on/off
				outlet(0,"/manager/grid/led/map",0,8,lAll,lAll,lAll,lAll,lAll,lAll,lAll,lAll);
				outlet(0,"/manager/grid/led/map",8,8,lAll,lAll,lAll,lAll,lAll,lAll,lAll,lAll);
			}
		}
	}
	
	
	if(a=="/manager/grid/led/map") { // i:<x-offset>, i:<y-offset>, i:[8 led/rows]
		if(glob.gMeta==0) { // only one application so will be inlet==0 only
		  if(inlet==0) { // need to ignore 2nd application
			if((x<glob.g1x) && (y<glob.g1y)) outlet(0,"/manager/grid/led/map",x,y,z,n,o,p,q,r,s,t); // in range of 1st device then echo out
			else if(glob.gridtiling==0) outlet(1,"/manager/grid/led/map",(x-glob.g1x),y,z,n,o,p,q,r,s,t); // remove offset
			else outlet(1,"/manager/grid/led/map",x,(y-glob.g1y),z,n,o,p,q,r,s,t); // remove offset
		  }
		}
		if(glob.gMeta==1) { // 2 apps & 2 devices
			if(inlet==0) outlet(0,"/manager/grid/led/map",x,y,z,n,o,p,q,r,s,t); // echo out
			else outlet(1,"/manager/grid/led/map",x,y,z,n,o,p,q,r,s,t);
		}
		if(glob.gMeta==2) { // 2 apps split horizontally
			if(x==0) { // only accept left-side maps
				if(inlet==0) outlet(0,"/manager/grid/led/map",0,y,z,n,o,p,q,r,s,t);
				else outlet(0,"/manager/grid/led/map",8,y,z,n,o,p,q,r,s,t); // shift to right
			}
		}
		if(glob.gMeta == 3) { // horizontal mode
			if(y==0) { // only accept top-side maps
				if(inlet==0) outlet(0,"/manager/grid/led/map",x,0,z,n,o,p,q,r,s,t);
				else outlet(0,"/manager/grid/led/map",x,8,z,n,o,p,q,r,s,t); // shift to bottom
			}
		}
	}


	if(a=="/manager/grid/led/row") { // i:<x-offset>, i:<y-row>, i:<bitmask>, i:<bitmask2>
		if(glob.gMeta==0) { // only one application so use inlet==0 only
		  if(inlet==0) { // ignore second app
			if(glob.g1x==8) { // if the 1st device attached is 8wide
				if(x<8) { // and the /led/row message applies to that grid
					outlet(0,"/manager/grid/led/row",x,y,z); // send 1st bitmask to left grid
					outlet(1,"/manager/grid/led/row",x,y,n); // send 2nd bitmask to right grid
				}
				else { // there is an offset added to the message
					outlet(1,"/manager/grid/led/row",(x-8),y,z,n); // send double-bitmask to right grid
				}
			}
			if(glob.g1x==16) { // if the 1st device attached is 16 wide
				if(x==0) { // and the /led/row applies to the left quad
					outlet(0,"/manager/grid/led/row",0,y,z,n); // send double bitmask to left grid
				}
				else if(x==8) { // and the /led/row applies to the right quad
					outlet(0,"/manager/grid/led/row",8,y,z); // send 1st bitmask to left grid
					outlet(1,"/manager/grid/led/row",0,y,n); // send 2nd bitmask to right grid
				}
				else if(x>8) { // and the /led/row applies to the right grid
					outlet(1,"/manager/grid/led/row",(x-16),y,z,n); // send double bitmask to right grid
				}
			}
		  }
		}
		if(glob.gMeta==1) { // 2 apps & 2 devices
			if(inlet==0) outlet(0,"/manager/grid/led/row",x,y,z,n);
			else outlet(1,"/manager/grid/led/row",x,y,z,n);
		}
		if(glob.gMeta==2) { // horizontal split
			if(x==0) { //any x-offset would push grid out of range
				if(inlet==0) outlet(0,"/manager/grid/led/row",0,y,z); // trim second half to stop overflow
				else outlet(0,"/manager/grid/led/row",8,y,z);
			}
		}
		if(glob.gMeta == 3) { // vertical split
			if(inlet==0) {
				if(y<8) { // make sure to stop overflow into bottom grid
					outlet(0,"/manager/grid/led/row",x,y,z,n); // can be double bitmask for full width
				}
			}
			else outlet(0,"/manager/grid/led/row",x,(y+8),z,n); // can be double bitmask for full width
		}
	}


	if(a=="/manager/grid/led/col") { // i:<x-col>, i:<y-offset>, i:<bitmask>, i:<bitmask2>
		if(glob.gMeta==0) { // only one application so will be inlet==0 only
		  if(inlet==0) { // ignore 2nd app
			if(glob.g1y==8) {
				if(y<8) {
					outlet(0,"/manager/grid/led/col",x,y,z);
					outlet(1,"/manager/grid/led/col",x,y,n);
				}
				else outlet(1,"/manager/grid/led/col",x,(y-8),z,n)
			}
			if(glob.g1y==16) {
				if(y==0) outlet(0,"/manager/grid/led/col",x,0,z,n);
				else if(y==8) {
					outlet(0,"/manager/grid/led/col",x,8,z);
					outlet(1,"/manager/grid/led/col",x,0,n);
				}
				else if(y>8) {
					outlet(1,"/manager/grid/led/col",x,(y-16),z,n);
				}
			}
		  }
		}
		if(glob.gMeta==1) { // 2 apps & 2 devices
			if(inlet==0) outlet(0,"/manager/grid/led/col",x,y,z,n);
			else outlet(1,"/manager/grid/led/col",x,y,z,n);
		}
		if(glob.gMeta==2) { // landcape128 from 2 apps
			if(inlet==0) {
				if(x<8) outlet(0,"/manager/grid/led/col",x,y,z,n); // stop 2nd half overflow
			}
			else outlet(0,"/manager/grid/led/col",(x+8),y,z,n); //move 2nd app 8 to the right
		}
		if(glob.gMeta == 3) { // portrait128/256 from 2 apps
			if(y==0) { // only allowed if no y-offset (as it would be out of range)
				if(inlet==0) outlet(0,"/manager/grid/led/col",x,0,z); // second bitmask is trimmed
				else outlet(0,"/manager/grid/led/col",x,8,z);
			}
		}	
	}
	

	if(a=="/manager/grid/led/intensity") { // i:<intensity>
		if(glob.gMeta==1) {
			if(inlet==0) outlet(0,"/manager/grid/led/intensity",x);
			else outlet(1,"/manager/grid/led/intensity",x);
		}
		else {
			if(inlet==0) outlet(0,"/manager/grid/led/intensity",x);
		}		
	}


	if(a=="/manager/tilt/set") { // i:<n-sensor>, i:<state>
		if(glob.gMeta==1) {
			if(inlet==0) outlet(0,"/manager/tilt/set",x,y);
			else outlet(1,"/manager/tilt/set",x,y);
		}
		else {
			if(inlet==0) outlet(0,"/manager/tilt/set",x,y);
		}
	}
  }
}




function route(i) { // this function is called when the router changes modes
	if(i==0) { // if switching TO application mode
		clearDisplay();
		rGate = 1;
	}
	else { // switching TO the router
		rGate = 0;
		clearDisplay();
		drawRouter();
	}
}


function clearDisplay() { // this function simply sends a /led/all message to all devices
	outlet(0,"/manager/grid/led/all",0);
	outlet(1,"/manager/grid/led/all",0);
}


function drawRouter() { // draw the led display for route mode, and accept updates to 
	// use the 3rd outlet of router.js to send a list of current selection of leds to draw from
}




////////////////////////////////END CODE//////////////////////////////////////////////////