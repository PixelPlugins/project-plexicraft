'use strict';

const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });

var accountlist = {};

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
  
  ws.on('message', function(data, flags){
	  console.log('Received: ' + data);
	  
	  var args = data.split(' ');
	  if(args[0] == "@PLEXI"){
		  console.log("Received @PLEXI message.");
		  if(args[2] == "%Accounts%"){
			  accounts(args, ws);
		  }
		  if(args[2] == "%Chat%"){
			  chat(args, ws);
		  }
	  }
  });
});

function accounts(args, ws){
	if(args[3] == "Ping"){
		console.log("Received a ping!");
		ws.send(args[4]);
	}
	
	if(args[3] == "Create"){
		accountlist[args[4]] = args[5];
		console.log("Created account with Username: " + args[4] + " and Password: " + accountlist[args[4]]);
		ws.send("@PLEXI %Accounts% %you% Success");
	}
	
	if(args[3] == "Login"){
		if(accountlist[args[4]] != "" && accountlist[args[4]] != undefined && accountlist[args[4]] != null){
			if(accountlist[args[4]] == args[5]){
				console.log("A user logged in as " + args[4]);
				ws.send("@PLEXI %Accounts% %you% Success");
			}
			else{
				ws.send("@PLEXI %Accounts% %you% Fail");
			}
		}
	}
}

function chat(args, ws){
	if(args[3] == "Send"){
		wss.clients.forEach((client) => {
			client.send("@PLEXI" + args[1] + " %you% Message " + args[4]);
		});
	}
}

/*setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(new Date().toTimeString());
  });
}, 1000);*/