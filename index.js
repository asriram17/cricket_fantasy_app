const express = require('express');
const Joi = require('joi');
const connectToDatabase = require('./mongoClient');
const addTeam= require('./services/addTeam');
const processResult=require('./services/processResult');
const teamResult=require('./services/teamResult');
const app = express();
const port = 3000;

// Database Details

function validateTeam(team) {
  const item=Joi.object({
    Team:Joi.string().required().messages({
      'any.required': '"Team" is a required field'}),
    Players:Joi.array().length(11).messages({
      'array.length': '"Players" must contain exactly 11 members'
  }).required(),
    captain:Joi.string().required().messages({
    'any.required': '"captain" is a required field'}),
    vicecaptain:Joi.string().required().messages({
      'any.required': '"vicecaptain" is a required field'})
  });
  const schema = Joi.object({
    TeamA: item.required().messages({'any.required': '"TeamA" is a required field'}),
    TeamB: item.required().messages({'any.required': '"TeamB" is a required field'})
  });
return schema.validate(team);
}

(async () => {
  try {
      // Connect to the database
      const { db } = await connectToDatabase();
       // Endpoints
      app.use(express.json());

      ///add-team
      app.post('/add-team', async (req, res) => {
        const allplayers=await db.collection('players');
        let players= await allplayers.find().toArray();
        const {error} = validateTeam(req.body); 
        if (error){
          return res.send(error.details[0].message);
          }
        const result=addTeam(req,players);
        
        res.send(result);    
      });
      
      app.post('/process-result', async (req, res) => {

        // Not using dynamically
        // const match=await db.collection('match');
        // const allplayers= await match.find().toArray();
        // const result=processresult(req,allplayers);

        const teamResult=processResult(req);
    
        try {
          async function getAndIncrementMatchNo(db, CollectionName) {
            const Collection = db.collection(CollectionName);
        
            const result = await Collection.findOneAndUpdate(
                { _id: 'currentMatchNo' },
                { $inc: { value: 1 } },
                { returnDocument: 'after', upsert: true }
            );
        
            return result.value.value;
          }
          const match = await getAndIncrementMatchNo(db, 'currentMatchNo');
          const collection = db.collection(`process-result`);
          await collection.insertOne({ [`match ${match}`]: teamResult }); 
          console.log('Data inserted successfully');
        } catch (error) {
        console.error('Error occurred:', error);
        }

        res.send(teamResult);
      });
      
      app.get('/team-result', async (req, res) => 
      {
        const processresult= await db.collection('process-result');
        const teams=await processresult.find().toArray();
        const result=await teamResult(teams);
        res.send(`The team with the maximum points are ${result.maxPoints.join(', ')} with ${result.maxValue} points.`);
      });
      
      app.listen(port, () => {
        console.log(`App listening on port ${port}`);
      });

}catch (error) {
  console.error('Error during initial setup:', error);
  process.exit(1); 
}
})();
process.on('SIGINT', async () => {
  const { client } = await connectToDatabase();
  if (client) {
      await client.close();
      console.log('MongoDB client closed');
  }
  process.exit(0);
});





