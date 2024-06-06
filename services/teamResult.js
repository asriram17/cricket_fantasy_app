const connectToDatabase = require('../mongoClient');
async function teamResult(teams)
{
    try {
        // Connect to the database
        const { db } = await connectToDatabase();
        let team1=0;
        let team2=0;
        let teampoints=new Map();
        
        for(let [index,teamresult] of teams.entries())
        {
          let keys=Object.keys(teamresult);
          const tempteam1=teamresult[keys[1]][0].team;
          for(let [index1,key] of teamresult[keys[1]].entries())
          {

            if(key.team === tempteam1 )
            {
              team1+=key.bonus;
            }
            else{
              if(team2 === 0){
                tempteam2=key.team;
              } 
              team2+=key.bonus;
            }
            if(index1===teamresult[keys[1]].length -1)
            {
              const winner=(team1>team2) ? tempteam1 : (team1===team2)? ` ${tempteam1} & ${tempteam2}`:tempteam2;
              if(teampoints.has(tempteam1))
              {
                teampoints.set(tempteam1,(teampoints.get(tempteam1))+team1);
              }else{
                teampoints.set(tempteam1,team1);
              }
              if(teampoints.has(tempteam2))
              {
                teampoints.set(tempteam2,(teampoints.get(tempteam2))+team2);
              }else{
                teampoints.set(tempteam2,team2);
              }

              try
              {
                const collection = db.collection(`view-teams-result`);
                await collection.insertOne({ [keys[1]]: {[tempteam1]: team1, [tempteam2]: team2, Winner: winner} }); 
                console.log('Data inserted successfully');
              } catch (error) 
              {
                console.error('Error occurred:', error);
              }
              team1=0;
              team2=0;
            }
          }
        }
        let maxPoints = [];
        let maxValue = -Infinity;

        for (const [teampoint, value] of teampoints) {
            if (value > maxValue) {
                maxValue = value;
                maxPoints = [teampoint]; 
            } else if (value === maxValue) {
                maxPoints.push(teampoint); 
            }
        }
        return {maxPoints:maxPoints,maxValue:maxValue}
    }
    catch (error) {
        console.error('Error during initial setup:', error);
        process.exit(1); 
        }

}

module.exports=teamResult;