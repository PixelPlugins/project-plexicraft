'use strict';

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
	  }
  });
});

var sqlconn = sql.createConnection({
	host: "sql3.freemysqlhosting.net",
	user: "sql3142792",
	password: "GXj1Q32djv",
	database: "sql3142792"
});

sqlconn.connect();

sqlconn.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
  if (err) throw err;

  console.log('The solution is: ', rows[0].solution);
});

sqlconn.query('SELECT * FROM Accounts', function(err, rows){
	if(err) throw err;
	
	console.log('Data received drom Db:\n');
	console.log(rows);
	
	for (var i = 0; i < rows.length; i++) {
  console.log(rows[i].Bob);
};

/*var employee = {Bob: 'Winnie', Liz: "Australia"};
sqlconn.query('INSERT INTO employees SET ?', employee, function(err,res){
	if(err) throw err;
	
	console.log('Last insert ID: ', res.inserId);
});
*/
});


function accounts(args, ws){
	if(args[3] == "Ping"){
		console.log("Received a ping!");
		ws.send(args[4]);
	}
	
	if(args[3] == "Create"){
		accountlist[args[4]] = {Password: args[5], Flexums: 10};
		var account = {Username: args[4], Password: args[5]}
		sqlconn.query('INSERT INTO Accounts SET ?', account, function(err,res){
			if(err) throw err;
			
			console.log("Last insert id: ", res.insertid);
		});
		console.log("Created account with Username: " + args[4] + " and Password: " + accountlist[args[4]]);
		ws.send("@PLEXI %Accounts% %you% Success");
	}
	
	if(args[3] == "Login"){
			var accountdata;
			sqlconn.query('SELECT * FROM Accounts', function(err, rows){
				accountdata = rows;
				
				for(var i = 0; i < rows.length; i++){
				if(rows[i].Password == args[5]){
					console.log("A user logged in as " + args[4]);
					ws.send("@PLEXI %Accounts% %you% Success");
				}
				else{
					ws.send("@PLEXI %Accounts% %you% Fail");
				}
			}
			});
			
			/*if(accountlist[args[4]].Password == args[5]){
				console.log("A user logged in as " + args[4]);
				ws.send("@PLEXI %Accounts% %you% Success");
			}
			else{
				ws.send("@PLEXI %Accounts% %you% Fail");
			}*/
		
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
		if(args[4] == accountlist[args[1]].Password){
			accountlist[args[1]].Flexums -= args[6];
			accountlist[args[5]].Flexums += args[6];
			ws.send("@PLEXI %Flexums% %you% Success");
			console.log(args[1] + " payed " + args[5] + " " + args[6] + " Flexums.");
		}
	}
	if(args[3] == "Get"){
		ws.send(accountlist[args[4]].Flexums.toString());
	}
}

/*setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(new Date().toTimeString());
  });
}, 1000);*/