function processResult(req)
{
    const battingpoints = new Map([['Run',1],['Boundary Bonus',1],['Six Bonus',2],['30 Run Bonus',4],['Half-century Bonus',8],['Century Bonus',16],['Dismissal for a duck',2]]);
    const bowlingpoints = new Map([['Wicket',25],['LBW/Bowled',8],['3 Wicket Bonus',4],['4 Wicket Bonus',8],['5 Wicket Bonus',16],['Maiden Over',12]]);
    const fieldingpoints = new Map([['Catch',8],['3 Catch Bonus',4],['Stumping',12],['Run out',6]]);
    let playerspoints = {};
    let playersbonus = {};
    let bowlersbonus = {};
    let fieldingbonus={};
    let thirty={};
    let fifty={};
    let century={};
    let bowlers={};
    let Fielders={};
    let allplayersArray =req.body;
    allplayersArray.sort((a, b) => {
        if (a.innings === b.innings) {
        if (a.overs === b.overs) {
            return a.ballnumber - b.ballnumber;
        }
        return a.overs - b.overs;
        }
        return a.innings - b.innings;
    });
    let length = allplayersArray.length;
    let currentover = 0;
    let runbyover = {value: 0};
    let maidenbonus={};
    for(let [index,key] of allplayersArray.entries())
    {
        //batting
        let keys = key.batter;
        let playersbonusPoints = playersbonus[keys]?.bonus || 0;
        if(key.batsman_run > 0)
        {
        
        let val = key.batsman_run * battingpoints.get('Run');
        let currentPlayerPoints = playerspoints[keys]?.bonus || 0;
        
        
        playerspoints = { ...playerspoints, [key.batter]: {"bonus":currentPlayerPoints + val, "team":key.BattingTeam} };
        
        if(key.batsman_run == 4)
        {
            playersbonus={...playersbonus,[key.batter]:{"bonus":(playersbonusPoints || 0)+battingpoints.get('Boundary Bonus'), "team":key.BattingTeam}};
        }
        if(key.batsman_run == 6)
        {
            playersbonus={...playersbonus,[key.batter]:{"bonus":(playersbonusPoints || 0)+battingpoints.get('Six Bonus'), "team":key.BattingTeam}};

        }
        if(playerspoints[key.batter].bonus >= 30 && thirty[key.batter]!==true)
        {
            thirty={...thirty,[key.batter] : true};
            playersbonus={...playersbonus,[key.batter]:{"bonus":playersbonus[key.batter].bonus+battingpoints.get('30 Run Bonus'), "team":key.BattingTeam}}
        }
        if(playerspoints[key.batter].bonus >= 50 && fifty[key.batter]!==true)
        {
            fifty={...fifty,[key.batter] : true};
            playersbonus={...playersbonus,[key.batter]:{"bonus":playersbonus[key.batter].bonus+battingpoints.get('Half-century Bonus'), "team":key.BattingTeam}}
        }
        if(playerspoints[key.batter].bonus >= 100 && century[key.batter]!==true)
        {
            century={...century,[key.batter] : true};
            playersbonus={...playersbonus,[key.batter]:{"bonus":playersbonus[key.batter].bonus+battingpoints.get('Century Bonus'), "team":key.BattingTeam}};
        }
        }
        //bowling + fielding/////////
        let decideteam=key.BattingTeam === 'Chennai Super Kings' ? 'Rajasthan Royals' : 'Chennai Super Kings';
        if (key.overs === currentover) {
        runbyover.value += key.total_run;
        runbyover.bowler = key.bowler;
        }
        let extra=12;
        let prevextra = maidenbonus[runbyover.bowler]?.bonus|| 0;
        if (currentover !== key.overs) {
        currentover = key.overs;           
        if(runbyover.value === 0){
            
            maidenbonus={...maidenbonus,[runbyover.bowler]:{"bonus":prevextra+extra, "team":decideteam}};
        }
        runbyover.value = key.total_run;
        runbyover.bowler = key.bowler;
        }

        // including Fielding points 
        let bowlersbonusPoints = bowlersbonus[key.bowler]?.bonus || 0;
        let fieldingbonusPoints = fieldingbonus[key.fielders_involved]?.bonus || 0;
        
        let bonusPoints=0;
        let fieldbonus=0;

        if (key.isWicketDelivery === 1) //playerspoints playersbonus
        {
            if(!playersbonus[key.batter])
            {
                playersbonus={...playersbonus,[key.batter]:{"bonus":(playersbonusPoints || 0)- 2, "team":key.BattingTeam}};
            }
        let prevpoints = Fielders[key.fielders_involved] || 0;
        
        Fielders = (key.fielders_involved !== 'NA')?{ ...Fielders, [key.fielders_involved]: prevpoints + 1 }:{ ...Fielders};
        fieldbonus+=(Fielders[key.fielders_involved] === 3) ? 4 : 0;
        if(key.kind==='Run out')
        {
            fieldingbonus = {
            ...fieldingbonus,
            [key.fielders_involved]:{"bonus":(fieldingbonusPoints) + 8 + fieldbonus,"team":decideteam}
        };
        }
        else{
            let prevrun = bowlers[key.bowler] || 0;
            bowlers = { ...bowlers, [key.bowler]: prevrun + key.isWicketDelivery };
            bonusPoints = (key.kind === "lbw" || key.kind === "bowled") ? 8 : 0;
            bonusPoints+= (bowlers[key.bowler] === 3 ? 4 : bowlers[key.bowler] === 4 ? 8 : bowlers[key.bowler] >= 5 ? 16 : 0);
            
            bowlersbonus = {
                ...bowlersbonus,
                [key.bowler]: {"bonus":(bowlersbonusPoints) + bowlingpoints.get('Wicket') + bonusPoints, "team":decideteam
            }};
            fieldbonus+=((key.kind==='caught') ? 8 : (key.kind==='Stumping') ? 12 : 0);
            if(key.fielders_involved !== 'NA')
            {
            fieldingbonus = {
                ...fieldingbonus,
                [key.fielders_involved]: {"bonus":(fieldingbonusPoints) + fieldbonus,"team":decideteam}
            };
            }
        }
        
        }
        if (index === length - 1) {
        if(runbyover.value === 0){
            maidenbonus={...maidenbonus,[runbyover.bowler]:{"bonus":prevextra+extra, "team":decideteam}};
        }
        }
    }
    
    let mergedBonus = {};

// merge object
    console.log('before merge playersbonus ',playersbonus);
    [bowlersbonus, maidenbonus, fieldingbonus, playerspoints, playersbonus].forEach((obj) => {
        Object.entries(obj).forEach(([key, value]) => {
            if (mergedBonus.hasOwnProperty(key)) {
                mergedBonus[key].bonus += value.bonus;
            } else {
                mergedBonus[key] = value;
            }
        });
    });
    const data = Object.entries(mergedBonus).map(([key, value]) => ({ ...value, player: key }));
    return data;
}

module.exports=processResult;