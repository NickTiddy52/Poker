const mysql = require("mysql");
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "sys"
});

playerQueryData = {};

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected to Mysql");
});

upsertPlayerSummary = (db_id, wasWon) => {
  var sql = `SELECT * FROM player_summary WHERE player_id = ${db_id}`;
  connection.query(sql, function(err, result) {
    if (err) throw err;
    if (result[0] === undefined) {
      sql = `INSERT INTO player_summary(player_id,hands_played,hands_won,hands_lost,gross_profit) VALUES(${db_id},1,${wasWon},${!wasWon},0)`;
      connection.query(sql, function(err, result) {
        if (err) throw err;
      });
    } else {
      console.log("Updating Record..");
      sql = `update player_summary set hands_played = ${result[0].hands_played +
        1}, hands_won = ${result[0].hands_won +
        wasWon} , hands_lost = ${result[0].hands_lost +
        !wasWon} where player_id = ${db_id}`;
      connection.query(sql, function(err, result) {
        if (err) throw err;
      });
      console.log(result[0]);
    }
  });
};

insertHandRecord = (db_id, hand_strength, wasWon) => {
  var sql = `INSERT INTO hand_detail (player_id,hand_strength, hand_won) VALUES(${db_id},${hand_strength},${wasWon})`;
  connection.query(sql, function(err) {
    if (err) throw err;
    upsertPlayerSummary(db_id, wasWon);
  });
};

deleteUser = (db_id) => {
  var sql = `Delete from player where player_id = ${db_id};`
  connection.query(sql, function(err) {
    if (err) throw err;
  });
}

buyBackUser = (db_id) => {
  console.log("Executing buy back query");
  var sql = `update player set bankroll = 1000 where player_id = ${db_id}`
  connection.query(sql, function(err) {
    if (err) throw err;
  });
}
updateBankroll = (bankroll, db_id) => {
  var sql = `update player set bankroll = ${bankroll} where player_id = ${db_id}`;
  connection.query(sql, function(err) {
    if (err) throw err;
  });
};
function getPlayerData(db_id, filterValue) {
  console.log("getPlayerData for: " + db_id);
  console.log("Filter Value: " + filterValue);
  // if(filterValue === undefined)
  //   filterValue = 0;
  return new Promise(function(resolve, reject) {
    var sql = `select ps.hands_played, ps.hands_won, ps.hands_lost, p.name, p.bankroll, (select avg(hand_strength)  from ( select * from hand_detail where player_id = ${db_id} ORDER BY hand_id LIMIT ${filterValue}) MyTable) as avg_strength  from player_summary as ps left outer join player as p on ps.player_id = p.player_id where p.player_id = ${db_id};`;
    connection.query(sql, function(err, result) {
      if (err) {
        reject(err);
        //throw err;
      }
      playerQueryData = result[0];
      console.log(playerQueryData);
      resolve(playerQueryData);
    });
  });
}

module.exports = {
  updateBankroll,
  insertHandRecord,
  getPlayerData,
  deleteUser,
  buyBackUser
};
