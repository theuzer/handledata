const sql = require('mssql');

const dataConnection = require('../database/azureDb').dataConnection;

const azureDateBuilder = (year, month, day, hour, minute, second) => `${year}-${month}-${day} ${hour}:${minute}:${second}`;
const dateBuilder = date => azureDateBuilder(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
const boolBuilder = bool => bool ? 1 : 0;

const insertChar = (teamNo, playerCode, teamCode, championCode, attach, mount, outfit, emote, br1, br2, br3, br4, br5, champLevel, champTime, totalTime, division, divisionRating, league) => `EXECUTE InsertCharacter @gameTeamId = @team${teamNo}Id, @playerCode = '${playerCode}', @teamCode = '${teamCode}', @championCode = ${championCode}, @attachmentCode = ${attach}, @emoteCode = ${emote}, @mountCode = ${mount}, @outfitCode = ${outfit}, @br1 = ${br1}, @br2 = ${br2}, @br3 = ${br3}, @br4 = ${br4}, @br5 = ${br5}, @championLevel = ${champLevel}, @championTimePlayed = ${champTime}, @totalTimePlayed = ${totalTime}, @division = ${division}, @divisionRating = ${divisionRating}, @league = ${league};`;
const insertMatch = (matchId, map, region, gameType, patch, isRanked, teamSize, date) => `EXEC @matchId = InsertMatch '${matchId}', '${map}', '${region}', '${gameType}', '${patch}', ${isRanked}, ${teamSize}, '${date}';`;
const insertTeam = (teamNo, teamNumber, isWin) => `EXECUTE @team${teamNo}Id = InsertTeam @matchId, ${teamNumber}, ${isWin};`;

const insertTelemetry = (match) => {
  let query = insertMatch(match.matchId, match.mapId, match.region, match.type, match.patch, boolBuilder(match.isRanked), match.teamSize, dateBuilder(match.date));
  query += insertTeam(1, match.team1.teamNo, boolBuilder(match.team1.win));
  query += insertTeam(2, match.team2.teamNo, boolBuilder(match.team2.win));
  match.team1.characters.forEach((c) => {
    c.talents.sort((a, b) => a - b);
    query += insertChar(1, c.playerId, c.teamId, c.character, c.attachment, c.mount, c.outfit, c.emote, c.talents[0], c.talents[1], c.talents[2], c.talents[3], c.talents[4], c.characterLevel, c.characterTimePlayed, c.totalTimePlayed, c.division, c.divisionRating, c.league);
  });
  match.team2.characters.forEach((c) => {
    c.talents.sort((a, b) => a - b);
    query += insertChar(2, c.playerId, c.teamId, c.character, c.attachment, c.mount, c.outfit, c.emote, c.talents[0], c.talents[1], c.talents[2], c.talents[3], c.talents[4], c.characterLevel, c.characterTimePlayed, c.totalTimePlayed, c.division, c.divisionRating, c.league);
  });
  return query;
};

const getInsertTelemetriesQuery = (matches) => {
  let query = "BEGIN TRANSACTION \n declare @matchId int;declare @team1Id int;declare @team2Id int;";
  matches.forEach((match) => {
    query += insertTelemetry(match);
  });
  query += "\n COMMIT TRANSACTION";
  return query;
};

const insertError = (query2) => {
  const query = `INSERT INTO ERROR (Query) VALUES ('${query2}');`;
  new sql.Request(dataConnection).query(query)
    .catch((err) => {
      console.log(err);
    });
};

const doQuery = (query, query2) => {
  new sql.Request(dataConnection).query(query)
    .then(() => {
      console.log('inserted 100');
    })
    .catch((err) => {
      console.log(err);
      insertError(query2);
    });
};

exports.insertTelemetries = (matches, query2) => {
  const query = getInsertTelemetriesQuery(matches);

  doQuery(query, query2);

  let numberOfRetries = 100;

  sql.on('error', (err) => {
    if (err.code === 'ETIMEOUT') {
      if (numberOfRetries > 0) {
        // errorController.createErrorMongo(`timeout saving games. attempt ${(constants.azure.numberOfRetries - numberOfRetries) + 1}`);
        setTimeout(() => {
          numberOfRetries -= 1;
          doQuery(query, query2);
        }, 45000);
      } else {
        // notLoggedGameController.createNotLoggedGames(games);
      }
    }
  });
};
