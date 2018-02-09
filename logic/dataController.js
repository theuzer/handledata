const sql = require('mssql');

const dataConnection = require('../database/azureDb').dataConnection;

const azureDateBuilder = (year, month, day, hour, minute, second) => `${year}-${month}-${day} ${hour}:${minute}:${second}`;

const azureBoolBuilder = bool => bool ? 1 : 0;

const comma1 = "','";
const comma2 = "',";
const comma3 = ",'";
const comma4 = ",";

const insertTalentQuery = (matchId, teamNo, character, playerId, talent) => {
  const queryInit = "INSERT INTO TALENT (MatchId, PlayerId, TeamNumber, Character, TalentType) VALUES ('";
  const queryEnd = ");";

  const query = [queryInit, matchId, comma1, playerId, comma2, teamNo, comma4, character, comma4, talent, queryEnd].join("");
  //console.log(query);
  return query;
};

const insertCharacterQuery = (matchId, teamNo, character) => {
  const queryInit = "INSERT INTO CHARACTER (MatchId, TeamNumber, PlayerId, TeamId, Character, CharacterLevel, CharacterTimePlayed, Division, DivisionRating, League, TotalTimePlayed, Attachment, Emote, Mount, Outfit) VALUES ('";
  const queryEnd = ");";

  let query = [queryInit, matchId, comma2, teamNo, comma3, character.playerId, comma1, character.teamId, comma2, character.character, comma4, character.characterLevel, comma4, character.characterTimePlayed, comma4, character.division, comma4, character.divisionRating, comma4, character.league, comma4, character.totalTimePlayed, comma4, character.attachment, comma4, character.emote, comma4, character.mount, comma4, character.outfit, queryEnd].join("");

  character.talents.forEach((talent) => {
    query += insertTalentQuery(matchId, teamNo, character.character, character.playerId, talent);
  });

  return query;
};

const insertGameTeamQuery = (matchId, team) => {
  const queryInit = "INSERT INTO GAMETEAM (MatchId, TeamNumber, Win) VALUES ('";
  const queryEnd = ");";

  let query = [queryInit, matchId, comma2, team.teamNo, comma4, azureBoolBuilder(team.win), queryEnd].join("");

  team.characters.forEach((character) => {
    query += insertCharacterQuery(matchId, team.teamNo, character);
  });

  return query;
};

const insertMatchQuery = (match) => {
  const queryInit = "INSERT INTO MATCH (MatchId, MapId, Region, MatchDateCreated, Type, IsRanked, Patch, TeamSize) VALUES ('";
  const queryEnd = ");";
  const date = azureDateBuilder(match.date.getFullYear(), match.date.getMonth() + 1, match.date.getDate(), match.date.getHours(), match.date.getMinutes(), match.date.getSeconds());
  const isRankedConvert = azureBoolBuilder(match.isRanked);

  let query = [queryInit, match.matchId, comma1, match.mapId, comma1, match.region, comma1, date, comma1, match.type, comma2, isRankedConvert, comma3, match.patch, comma2, match.teamSize, queryEnd].join("");

  query += insertGameTeamQuery(match.matchId, match.team1);
  query += insertGameTeamQuery(match.matchId, match.team2);

  return query;
};
let i = 0;
exports.insertMatch = (match) => {
  const queryInit = "BEGIN TRANSACTION \n";
  const queryEnd = "COMMIT TRANSACTION";
  const query = [queryInit, insertMatchQuery(match), queryEnd].join("");

  new sql.Request(dataConnection).query(query)
    .then((response) => {
      i++;
      console.log('good');
      if (i === 100) {
        console.timeEnd('start');
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.insertMatches = (matches) => {
  let query = "BEGIN TRANSACTION \n";
  matches.forEach((match) => {
    query += insertMatchQuery(match);
  });
  query += "COMMIT TRANSACTION";

  new sql.Request(dataConnection).query(query)
    .then((response) => {
      console.log('inserted 100 more.');
    })
    .catch((err) => {
      console.log(err);
    });
};

