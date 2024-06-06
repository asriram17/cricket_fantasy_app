function checkTeamComposition(team) {
    // console.log('in function ',team);
    const roles = ['ar', 'batter', 'bowler', 'wk'];
    const composition = {
        isValid: true,
        invalidRoles: [],
        totalPlayers: 0,
        roles: {} 
    };

    for (const role of roles) {
        const playerCount = team[role];
        composition.roles[role] = playerCount;

        if (playerCount <= 0) {
            composition.isValid = false;
            composition.invalidRoles.push(`${role} should have at least 1 player`);
        } else if (playerCount > 8) {
            composition.isValid = false;
            composition.invalidRoles.push(`${role} should not have more than 8 players`);
        }

    }


  return composition;
}

function addTeam(req,players){
    let {TeamA,TeamB} =req.body;
        let team1=TeamA.Team;
        let team2=TeamB.Team;
        let teams = {
        [team1]: {
            ar: 0,
            batter: 0,
            wk: 0,
            bowler: 0
        },
        [team2]: {
            ar: 0,
            batter: 0,
            wk: 0,
            bowler: 0
        }
        };
        let Teams = { team: 0, current: 'team1' };
        for (let [index, keys] of players.entries()) {
          let firstteam =TeamA.Team;
          Teams = (keys.Team === firstteam) ? { ...Teams, team: TeamA, current: team1  } : { ...Teams, team: TeamB, current: team2 };
          for (let key of Teams.team.Players) {
              if (keys.Player === key) {
                  let currentteamkey = Teams.current;
                  teams[currentteamkey] = (keys.Role === "BATTER") ? { ...teams[currentteamkey], batter: teams[currentteamkey].batter + 1 } : (keys.Role === "BOWLER") ? { ...teams[currentteamkey], bowler: teams[currentteamkey].bowler + 1 } : (keys.Role === "ALL-ROUNDER") ? { ...teams[currentteamkey], ar: teams[currentteamkey].ar + 1 } :(keys.Role === "WICKETKEEPER") ? { ...teams[currentteamkey], wk: teams[currentteamkey].wk + 1 }:null;
              }
          }
          
          if (index === players.length - 1) {
            console.log('teams ',teams);
            const team1Composition = checkTeamComposition(teams[team1]);
            const team2Composition = checkTeamComposition(teams[team2]);

            if (!team1Composition.isValid || !team2Composition.isValid) {
    
                if (!team1Composition.isValid) {
                    return(`Team 1 has invalid roles: ${team1Composition.invalidRoles.join(', ')}`);
                }
                if (!team2Composition.isValid) {
                    return(`Team 2 has invalid roles: ${team2Composition.invalidRoles.join(', ')}`);
                }
            } else {
                teams[team1].captain=TeamA.captain;
                teams[team1].vicecaptain=TeamA.vicecaptain;
                teams[team2].captain=TeamB.captain;
                teams[team2].vicecaptain=TeamB.vicecaptain;
                return(teams);
            }
            
          }
        }    
}


module.exports=addTeam;