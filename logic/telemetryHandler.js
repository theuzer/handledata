const dataController = require('./dataController');

// const sortByTimestamp = telemetry => telemetry.sort((a, b) => a.cursor - b.cursor);
const filterTelemetry = (telemetry, type) => telemetry.filter(x => x.type === type);
const extractMatchStart = telemetry => filterTelemetry(telemetry, "Structures.MatchStart");
const extractPlayers = telemetry => filterTelemetry(telemetry, "Structures.MatchReservedUser");
const extractMatchFinished = telemetry => filterTelemetry(telemetry, "Structures.MatchFinishedEvent");
const extractTalentPickEvents = telemetry => filterTelemetry(telemetry, "Structures.BattleritePickEvent");
const isRanked = players => players[0].dataObject.rankingType === 'RANKED';

const mapTalents = (talents) => {
  const seen = {};
  const out = [];
  let j = 0;
  for (let i = 0; i < talents.length; i++) {
    const item = talents[i].dataObject.battleriteType;
    if (seen[item] !== 1) {
      seen[item] = 1;
      j += 1;
      out[j] = item;
    }
  }
  return out;
};

const mapCharacter = (playerIn, talentPickEvents) => {
  const talents = talentPickEvents.filter(x => x.dataObject.userID === playerIn.accountId);
  return {
    playerId: playerIn.accountId,
    teamId: playerIn.teamId,
    character: playerIn.character,
    characterLevel: playerIn.characterLevel,
    characterTimePlayed: playerIn.characterTimePlayed,
    division: playerIn.division,
    divisionRating: playerIn.divisionRating,
    league: playerIn.league,
    totalTimePlayed: playerIn.totalTimePlayed,
    attachment: playerIn.attachment,
    emote: playerIn.emote,
    mount: playerIn.mount,
    outfit: playerIn.outfit,
    talents: mapTalents(talents),
  };
};

const mapCharacters = (teamCharacters, talents) => {
  const result = [];
  teamCharacters.forEach((character) => {
    result.push(mapCharacter(character.dataObject, talents));
  });
  return result;
};

const mapTeam = (teamNo, players, talents, win) => {
  const teamCharacters = players.filter(x => x.dataObject.team === teamNo);
  return {
    win,
    teamNo,
    characters: mapCharacters(teamCharacters, talents),
  };
};

const matches = [];

exports.mapTelemetry = (telemetry, query) => {
  const matchFinishEvent = extractMatchFinished(telemetry)[0].dataObject;

  if (matchFinishEvent.leavers.length === 0) {
    const matchStartEvent = extractMatchStart(telemetry)[0].dataObject;
    const players = extractPlayers(telemetry);
    const talents = extractTalentPickEvents(telemetry);

    const team1 = mapTeam(1, players, talents, matchFinishEvent.teamOneScore > matchFinishEvent.teamTwoScore);
    const team2 = mapTeam(2, players, talents, matchFinishEvent.teamTwoScore > matchFinishEvent.teamOneScore);

    const match = {
      mapId: matchStartEvent.mapID,
      matchId: matchStartEvent.matchID,
      region: matchStartEvent.region,
      date: new Date(matchStartEvent.time),
      type: matchStartEvent.type,
      patch: matchStartEvent.version,
      teamSize: matchStartEvent.teamSize,
      isRanked: isRanked(players),
      team1,
      team2,
    };

    matches.push(match);
    if (matches.length === 100) {
      dataController.insertTelemetries(matches, query);
      matches.length = 0;
    }
  }
};
