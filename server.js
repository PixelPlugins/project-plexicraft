'use strict';

var media = {};
var fs = require('fs');
var sql = require('mysql');
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

function med(args, ws){
	if(args[3] == "Get"){
		fs.readFile('Media.json', 'utf8', function(err, content){
			if(err) throw err;
			
			media = JSON.parse(content);
			if(Object.keys(media).indexOf('Posts') == -1){
				media['Posts'] = [];
			}
			
			ws.send(JSON.stringify(media));
		});
	}
	
	if(args[3] == "Post"){
		fs.readFile('Media.json', 'utf8', function(err, content){
			if(err) throw err;
			
			media = JSON.parse(content);
			if(Object.keys(media).indexOf('Posts') == -1){
				media['Posts'] = [];
			}
			
			media.Posts.push({PostedBy: args[1], Post: args[4]});
			
			fs.writeFile('Media.json', JSON.stringify(media), function(err){
				if(err) throw err;
			});
		});
	}
}

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
		  
		  if(args[2] == "%Flexums%"){
			  flexums(args, ws);
		  }
		  
		  if(args[2] == "%Inv%"){
			  inv(args, ws);
		  }
		  
		  if(args[2] == "%Media%"){
			  med(args, ws);
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
		fs.readFile('accounts.json', 'utf8', function(err, content){
			if(err) throw err;
			
			accountlist = JSON.parse(content);
			if(Object.keys(accountlist).indexOf(args[4]) == -1){
				accountlist[args[4]] = {Password: args[5], Flexums: 100, Apps: {}, Storage: {}, Extra: {}};
			}
			else{
				ws.send("@PLEXI %Accounts% %you% Fail 303");
			}
			
			var accountstr = JSON.stringify(accountlist);
			
			fs.writeFile('accounts.json', accountstr, function(err){
				if(err) throw err;
			});
		});
	}
	
	if(args[3] == "Login"){
			fs.readFile('accounts.json', 'utf8', function(err, content){
				if(err) throw err;
				
				accountlist = JSON.parse(content);
				if(Object.keys(accountlist).indexOf(args[4]) != -1){
					if(accountlist[args[4]].Password == args[5]){
						ws.send("@PLEXI %Accounts% %you% Success");
					}
					else{
						ws.send("@PLEXI %Accounts% %you% Fail 505");
					}
				}
				else{
					ws.send("@PLEXI %Accounts% %you% Fail 404");
				}
			});
	}
}

function chat(args, ws){
	if(args[3] == "Send"){
		wss.clients.forEach((client) => {
			client.send("@PLEXI" + " " + args[1] + " %you% Message " + args[4]);
		});
	}
}

function flexums(args, ws){
	if(args[3] == "Pay"){
		console.log("Pay recieved");
		fs.readFile('accounts.json', 'utf8', function(err, content){
			if(err) throw err;
			
			accountlist = JSON.parse(content);
			console.log("atempting payment");
			
			if(Object.keys(accountlist).indexOf(args[1]) != -1){
				if(accountlist[args[1]].Password == args[4]){
					console.log("Paying...");
					accountlist[args[1]].Flexums -= parseInt(args[5]);
					accountlist[args[6]].Flexums += parseInt(args[5]);
					
					fs.writeFile('accounts.json', JSON.stringify(accountlist), function(err){
						if(err) throw err;
					});
				}
				else{
					ws.send("@PLEXI %Flexums% %you% Fail 505");
				}
			}
			else{
				ws.send("@PLEXI %Flexums% %you% Fail 404");
			}
		});
	}
	if(args[3] == "Get"){
		if(Object.keys(accountlist).indexOf(args[4]) != -1){
			ws.send(accountlist[args[4]].Flexums.toString());
		}
		else{
			ws.send("@PLEXI %Flexums% %you% Fail 404");
		}
	}
}

function inv(args, ws){
	if(args[3] == "Add"){
		fs.readFile('accounts.json', 'utf8', function(err, content){
			accountlist = JSON.parse(content);
			
			if(Object.keys(accountlist).indexOf(args[4]) != -1){
				if(Object.keys(accountlist[args[4]].Storage).indexOf("Inventory") == -1){
					accountlist[args[4]].Storage["Inventory"] = [];
				}
				
				if(args[5] == "Sword_Iron"){
					accountlist[args[4]].Storage.Inventory.push("Sword_Iron");
				}
				
				if(args[5] == "Hat_Turkey"){
					accountlist[args[4]].Storage.Inventory.push("Hat_Turkey");
				}
			}
			else{
				ws.send("@PLEXI %Inv% %you% Fail 404");
			}
			
			fs.writeFile('accounts.json', JSON.stringify(accountlist), function(err){
				if(err) throw err;
			});
		});
	}
	
	if(args[3] == "Get"){
		if(Object.keys(accountlist).indexOf(args[4]) != -1){
			if(Object.keys(accountlist[args[4]].Storage).indexOf("Inventory") == -1){
				accountlist[args[4]].Storage["Inventory"] = [];
			}
				
			ws.send(accountlist[args[4]].Storage.Inventory.toString());
		}
	}
}

function admin(args, ws){
	if(args[3] == "GetAccountsList"){
		fs.readFile('accounts.json', 'utf8', function(err, content){
			if(err) throw err;
			
			ws.send(content);
		});
	}
	
	if(args[3] == "SetAccountsList"){
		
	}
}