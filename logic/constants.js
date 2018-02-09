const queries = {
  query1: "BEGIN TRANSACTION \n  declare @matchCode varchar(32); declare @mapCode varchar(32); declare @regionCode varchar(20); declare @gameType varchar(20); declare @patch varchar(20); declare @playerCode varchar(32); declare @teamCode varchar(32); declare @championCode int; declare @attachmentCode int; declare @emoteCode int; declare @mountCode int; declare @outfitCode int; declare @br1 int; declare @br2 int; declare @br3 int; declare @br4 int; declare @br5 int;  declare @mapId int; declare @regionId int; declare @gameTypeId int; declare @patchId int; declare @matchId int; declare @gameTeam1Id int; declare @gameTeam2Id int;",
  query2: "SELECT @mapId = id FROM map WHERE mapid = @mapCode; IF @mapId IS NULL AND @mapCode IS NOT NULL \n BEGIN \n INSERT INTO map (mapId) VALUES (@mapCode) SET @mapId = SCOPE_IDENTITY() \n END \n SELECT @regionId = id FROM region WHERE region = @regionCode; IF @regionId IS NULL AND @regionCode IS NOT NULL \n BEGIN \n INSERT INTO region (region) VALUES (@regionCode) SET @regionId = SCOPE_IDENTITY() \n END \n SELECT @gameTypeId = id FROM gameType WHERE gametype = @gameType; IF @gameTypeId IS NULL AND @gameType IS NOT NULL \n BEGIN \n INSERT INTO gametype (gametype) VALUES (@gameType) SET @gameTypeId = SCOPE_IDENTITY() \n END \n SELECT @patchId = id FROM patch WHERE patch = @patch; IF @patchId IS NULL AND @patch IS NOT NULL \n BEGIN \n INSERT INTO patch (patch) VALUES (@patch) SET @patchId = SCOPE_IDENTITY() \n END \n",
  query3: "\n COMMIT TRANSACTION",
  query4: "SELECT @playerId = id FROM player WHERE playerId = @playerCode; IF @playerId IS NULL AND @playerCode IS NOT NULL \n BEGIN \n INSERT INTO player (playerId) VALUES (@playerCode) SET @playerId = SCOPE_IDENTITY() \n END \n SELECT @teamId = id FROM team WHERE teamId = @teamCode; IF @teamId IS NULL AND @teamCode IS NOT NULL \n BEGIN \n INSERT INTO team (teamId) VALUES (@teamCode) SET @teamId = SCOPE_IDENTITY() \n END \n SELECT @championId = id FROM champion WHERE championCode = @championCode; IF @championId IS NULL AND @championCode IS NOT NULL \n BEGIN \n INSERT INTO champion (championCode) VALUES (@championCode) SET @championId = SCOPE_IDENTITY() \n END \n SELECT @attachmentId = id FROM attachment WHERE attachmentCode = @attachmentCode; IF @attachmentId IS NULL AND @attachmentCode IS NOT NULL \n BEGIN \n INSERT INTO attachment (attachmentCode, championId) VALUES (@attachmentCode, @championId) SET @attachmentId = SCOPE_IDENTITY() \n END \n SELECT @mountId = id FROM mount WHERE mountCode = @mountCode; IF @mountId IS NULL AND @mountCode IS NOT NULL \n BEGIN \n INSERT INTO mount (mountCode, championId) VALUES (@mountCode, @championId) SET @mountId = SCOPE_IDENTITY() \n END \n SELECT @outfitId = id FROM outfit WHERE outfitCode = @outfitCode; IF @outfitId IS NULL AND @outfitCode IS NOT NULL \n BEGIN \n INSERT INTO outfit (outfitCode, championId) VALUES (@outfitCode, @championId) SET @outfitId = SCOPE_IDENTITY() \n END \n SELECT @emoteId = id FROM emote WHERE emoteCode = @emoteCode; IF @emoteId IS NULL AND @emoteCode IS NOT NULL \n BEGIN \n INSERT INTO emote (emoteCode, championId) VALUES (@emoteCode, @championId) SET @emoteId = SCOPE_IDENTITY() \n END \n SELECT @loadoutId = id FROM loadout WHERE br1 = @br1 AND br2 = @br2 AND br3 = @br3 AND br4 = @br4 AND br5 = @br5; IF @loadoutId IS NULL \n BEGIN \n INSERT INTO loadout (br1, br2, br3, br4, br5, championId) VALUES (@br1, @br2, @br3, @br4, @br5, @championId) SET @loadoutId = SCOPE_IDENTITY() \n END \n",
};

const setMatch = (matchId, mapCode, regionCode, gameType, patch) => `SET @matchCode = '${matchId}'; SET @mapCode = '${mapCode}'; SET @regionCode = '${regionCode}'; SET @gameType = '${gameType}'; SET @patch = '${patch}';`;
const setCharacter = (playerId, teamId, championCode, attachment, mount, outfit, emote, br1, br2, br3, br4, br5) => `SET @playerCode = '${playerId}'; SET @teamCode = '${teamId}'; SET @championCode = ${championCode}; SET @attachmentCode = ${attachment}; SET @emoteCode = ${emote}; SET @mountCode = ${mount}; SET @outfitCode = ${outfit};SET @br1 = ${br1}; SET @br2 = ${br2}; SET @br3 = ${br3}; SET @br4 = ${br4}; SET @br5 = ${br5};`;

//const insertMatch = (isRanked, teamSize, dateCreated) => `INSERT INTO Match (MatchId, MapId, RegionId, GameTypeId, PatchId, IsRanked, TeamSize, DateCreated) VALUES (@matchCode, @mapId, @regionId, @gameTypeId, @patchId, ${isRanked}, ${teamSize}, '${dateCreated}') SET @matchId = SCOPE_IDENTITY() `;
const insertGameTeam1 = (teamNumber, isWin) => `INSERT INTO GameTeam (MatchId, TeamNumber, Win) VALUES (@matchId, ${teamNumber}, ${isWin}) SET @gameTeam1Id = SCOPE_IDENTITY() \n`;
const insertGameTeam2 = (teamNumber, isWin) => `INSERT INTO GameTeam (MatchId, TeamNumber, Win) VALUES (@matchId, ${teamNumber}, ${isWin}) SET @gameTeam2Id = SCOPE_IDENTITY() \n`;
//const insertCharacter = (championLevel, championTimePlayed, totalTimePlayed, division, divisionRating, league) => `INSERT INTO Character (GameTeamId, PlayerId, TeamId, ChampionId, ChampionLevel, ChampionTimePlayed, TotalTimePlayed, Division, DivisionRating, League, LoadoutId, AttachmentId, MountId, EmoteId, OutfitId) VALUES (@gameTeamId, @playerId, @teamId, @championId, ${championLevel}, ${championTimePlayed}, ${totalTimePlayed}, ${division}, ${divisionRating}, ${league}, @loadoutId, @attachmentId, @mountId, @emoteId, @outfitId)`;

const azureDateBuilder = (year, month, day, hour, minute, second) => `${year}-${month}-${day} ${hour}:${minute}:${second}`;

const dateBuilder = date => azureDateBuilder(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());

const boolBuilder = bool => bool ? 1 : 0;

const insertChar = (teamNo, playerCode, teamCode, championCode, attach, mount, outfit, emote, br1, br2, br3, br4, br5, champLevel, champTime, totalTime, division, divisionRating, league) => `EXECUTE InsertCharacter @gameTeamId = @team${teamNo}Id, @playerCode = '${playerCode}', @teamCode = '${teamCode}', @championCode = ${championCode}, @attachmentCode = ${attach}, @emoteCode = ${emote}, @mountCode = ${mount}, @outfitCode = ${outfit}, @br1 = ${br1}, @br2 = ${br2}, @br3 = ${br3}, @br4 = ${br4}, @br5 = ${br5}, @championLevel = ${champLevel}, @championTimePlayed = ${champTime}, @totalTimePlayed = ${totalTime}, @division = ${division}, @divisionRating = ${divisionRating}, @league = ${league};`;
const insertMatch = (matchId, map, region, gameType, patch, isRanked, teamSize, date) => `EXEC @matchId = InsertMatch '${matchId}', '${map}', '${region}', '${gameType}', '${patch}', ${isRanked}, ${teamSize}, '${date}';`
const insertTeam = (teamNo, teamNumber, isWin) => `EXECUTE @team${teamNo}Id = InsertTeam @matchId, ${teamNumber}, ${isWin};`

const insertMatchAll = (match) => {
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

exports.insertMatches = (matches) => {
  let query = "BEGIN TRANSACTION \n declare @matchId int;declare @team1Id int;declare @team2Id int;";
  matches.forEach((match) => {
    query += insertMatchAll(match);
  });
  query += "\n COMMIT TRANSACTION";
  return query;
};
