var sql = require('mysql');

var sqlconn = sql.createConnection({
	host: "sql3.freemysqlhosting.net",
	user: "sql3142792",
	password: "GXj1Q32djv",
	database: "sql3142792"
});

sqlconn.query("ALTER TABLE Accounts ADD Flexums INT", function(err, e){
	if(err) throw err;
});