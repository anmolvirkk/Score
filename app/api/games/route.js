import axios from 'axios'
import cheerio from 'cheerio';

export async function GET() {

  const getSoccerecoGames = async (day=0) => {
    try {

      const current_date = new Date();
      const tomorrow_date = new Date(current_date);
      tomorrow_date.setDate(current_date.getDate() + day);

      const dd = String(tomorrow_date.getDate()).padStart(2, '0');
      const mm = String(tomorrow_date.getMonth() + 1).padStart(2, '0');
      const yyyy = tomorrow_date.getFullYear();
      
      const formatted_date = `${dd}-${mm}-${yyyy}`;

      const url = `https://www.soccereco.com/soccer-games?date=${formatted_date}`;
  
      const response = await axios.get(url);
      const html = response.data;

      const $ = cheerio.load(html);

      const games = $('.list-games-item');

      const gameData = [];
      
      games.each((_, element) => {
        const $game = $(element);
      
        const url = $game.find('.matchesbar-link').attr('href');
        const date = $game.find('span[data-frmt="%d.%m"]').text();
        const time = $game.find('.match-date__time').text();
        const homeTeam = $game.find('.home .teamname').text();
        const awayTeam = $game.find('.away .teamname').text();
        const oddsElements = $game.find('.sizeodd span');
        const oddsData = oddsElements.toArray().map((el) => $(el).text());
        
        if(homeTeam !== "" && awayTeam !== "" && oddsData.length > 0){
            
            const odds = {
              [homeTeam]: parseFloat(oddsData[0]),
              Draw: parseFloat(oddsData[1]),
              [awayTeam]: parseFloat(oddsData[2]),
            };
          
            const gameInfo = {
              url,
              date,
              time,
              odds,
            };
  
            gameData.push(gameInfo);

        }
      
      });

      return gameData;

    } catch (err) {
      return null;
    }
  }

  let allSoccerecoGames = [];

  const NUMBER_OF_DAYS_TO_SEARCH = 4;

  for(let i = 0; i <= NUMBER_OF_DAYS_TO_SEARCH; i++){
    const nextDayGames = await getSoccerecoGames(i);
    if(nextDayGames.length > 0){
      if(nextDayGames.every(item => allSoccerecoGames.filter(game => game.url === item.url).length === 0)){
        allSoccerecoGames = [...allSoccerecoGames, ...nextDayGames];
      }else{
        break;
      }
    }
  }

  const getGamesData = (table_goals, table_data) => {
    
    function getTotalGoals(goals) {
      let totalGoals = 0;
    
      totalGoals += goals.reduce((sum, goalsInGame) => sum + goalsInGame, 0);
    
      return totalGoals;
    }

    function countGamesWithGoalsThresholds(table_goals) {
    
      const thresholds = [0.5, 1.5, 2.5, 3.5, 4.5];

      const gamesCountByThreshold = [];
    
      for (const threshold of thresholds) {

        let teamsStats = [];
    
        for (const team in table_goals) {

          const matches = table_goals[team];

          const totalNumberOfMatches = matches.length;

          const matches_over_threshold = matches.reduce((count, goalsInGame) => (goalsInGame > threshold ? count + 1 : count), 0);
          
          const percentage_over_threshold = ((matches_over_threshold / totalNumberOfMatches) * 100).toFixed(2) + '%';

          teamsStats.push({
            team,
            matches_over_threshold,
            percentage_over_threshold,
          });

        }

        const teams = Object.keys(table_goals);
        const totalGoalsArray = table_goals[teams[0]].map((goals, i) => goals + table_goals[teams[1]][i]);
        const totalNumberOfMatches = totalGoalsArray.length;

        const matches_over_threshold = totalGoalsArray.reduce((count, goalsInGame) => (goalsInGame > threshold ? count + 1 : count), 0);
        
        const percentage_over_threshold = ((matches_over_threshold / totalNumberOfMatches) * 100).toFixed(2) + '%';

        teamsStats.push({
          team: 'Total',
          matches_over_threshold,
          percentage_over_threshold,
        });
    
        gamesCountByThreshold.push({
          threshold,
          teams: teamsStats,
        });

      }
    
      return gamesCountByThreshold;
    }

    function calculateForm(teamName, matches) {
      let wins = 0;
      let losses = 0;
      let draws = 0;
    
      for (const match of matches) {
        const homeTeam = match.home.team;
        const awayTeam = match.away.team;
        const homeScore = match.home.score;
        const awayScore = match.away.score;
    
        if (homeTeam === teamName) {
          if (homeScore > awayScore) {
            wins++;
          } else if (homeScore < awayScore) {
            losses++;
          } else {
            draws++;
          }
        } else if (awayTeam === teamName) {
          if (awayScore > homeScore) {
            wins++;
          } else if (awayScore < homeScore) {
            losses++;
          } else {
            draws++;
          }
        }

      }
    
      return { wins, losses, draws };
    }

    function calculateAverageGoals(teamName, matches) {
      let totalGoalsScored = 0;
      let totalGoalsConceded = 0;
    
      for (const match of matches) {
        const homeTeam = match.home.team;
        const awayTeam = match.away.team;
        const homeScore = match.home.score;
        const awayScore = match.away.score;
    
        if (homeTeam === teamName) {
          totalGoalsScored += homeScore;
          totalGoalsConceded += awayScore;
        } else if (awayTeam === teamName) {
          totalGoalsScored += awayScore;
          totalGoalsConceded += homeScore;
        }
      }
    
      const totalMatches = matches.length;
      const averageScored = (totalGoalsScored / totalMatches).toFixed(2);
      const averageConceded = (totalGoalsConceded / totalMatches).toFixed(2);
    
      return { averageScored, averageConceded };
    }

    const homeTeamAverage = calculateAverageGoals(Object.keys(table_goals)[0], table_data);

    const calculatePridictionWinner = (table_goals, table_data) => {
      const team1Form = calculateForm(Object.keys(table_goals)[0], table_data);
      const team1Score = team1Form.wins - team1Form.losses - team1Form.draws;
      const team2Form = calculateForm(Object.keys(table_goals)[1], table_data);
      const team2Score = team2Form.wins - team2Form.losses - team2Form.draws;
      const totalScore = team1Form.wins + team1Form.losses + team1Form.draws;
      let winner = null;
      let loser = null;
      if(team1Score === totalScore){
        winner = Object.keys(table_goals)[0];
        loser = Object.keys(table_goals)[1];
      }else if(team2Score === totalScore){
        winner = Object.keys(table_goals)[1];
        loser = Object.keys(table_goals)[0];
      }
      const loserForm = calculateForm(loser, table_data);
      const confidence = ((loserForm.losses - loserForm.wins - loserForm.draws)/totalScore) * 100;
      if(!winner){
        return null
      }
      return {team:winner, confidence: confidence.toFixed(0) + '%'}
    }
    
    function findHighestAndLowestCombinedGoals(matches) {

      let highestTotalGoals = null;
      let lowestTotalGoals = null;

      for (const match of matches) {

        const totalGoals = match.home.score + match.away.score;

        if(!highestTotalGoals){
            highestTotalGoals = totalGoals
        }

        if(!lowestTotalGoals){
            lowestTotalGoals = totalGoals
        }

        if (totalGoals > highestTotalGoals) {
          highestTotalGoals = totalGoals;
        }

        if (totalGoals < lowestTotalGoals) {
          lowestTotalGoals = totalGoals;
        }

      }

      return {
        highestTotalGoals,
        lowestTotalGoals,
      };
    }

    const calculatePowerScale = (goals, form, average_scored, thresholds) => {

        const goalteams = Object.keys(goals);
        const goalScale = Math.round(((goals[goalteams[1]]-goals[goalteams[0]])/goals[goalteams[2]])*100);

        const formTeams = Object.keys(form);
        const winScale = Math.round(((form[formTeams[1]].wins-form[formTeams[0]].wins)/(form[formTeams[1]].wins+form[formTeams[0]].wins))*100);
        const lossScale = Math.round(((form[formTeams[1]].losses-form[formTeams[0]].losses)/(form[formTeams[1]].losses+form[formTeams[0]].losses))*100);
        const drawScale = Math.round(((form[formTeams[1]].draws-form[formTeams[0]].draws)/(form[formTeams[1]].draws+form[formTeams[0]].draws))*100);

        const averageScoreTeams = Object.keys(average_scored);
        const averageScoreDiff = average_scored[averageScoreTeams[1]]-average_scored[averageScoreTeams[0]]
        const averageScoreTotal = average_scored[averageScoreTeams[1]]+average_scored[averageScoreTeams[0]]
        const averageScoredScale = Math.round((averageScoreDiff/averageScoreTotal)*100);

        let thresholdScales = [];
        let thresholdTotal = [];
        for(let i = 0; i < thresholds.length; i++){
          const threshold = thresholds[i];
          const teams = threshold.teams;
          if((parseInt(teams[1].percentage_over_threshold.split('%')[0])+parseInt(teams[0].percentage_over_threshold.split('%')[0])) > 0){
            const thresholdScale = Math.round(((parseInt(teams[1].percentage_over_threshold.split('%')[0])-parseInt(teams[0].percentage_over_threshold.split('%')[0]))/(parseInt(teams[1].percentage_over_threshold.split('%')[0])+parseInt(teams[0].percentage_over_threshold.split('%')[0])))*100);
            thresholdScales.push(thresholdScale);
            const totalScale = Math.round((parseInt(teams[0].percentage_over_threshold.split('%')[0])+parseInt(teams[1].percentage_over_threshold.split('%')[0])));
            thresholdTotal.push(totalScale);
          }
        }
        const thresholdScale = Math.round((thresholdScales.reduce((x, y) => x + y)/thresholdTotal.reduce((x, y) => x + y))*100);
       
        return {goalScale, winScale, lossScale, drawScale, averageScoredScale, thresholdScale, team1: goalteams[0], team2: goalteams[1]}
    }

    const goals = {
      [Object.keys(table_goals)[0]]: getTotalGoals(table_goals[Object.keys(table_goals)[0]]),
      [Object.keys(table_goals)[1]]: getTotalGoals(table_goals[Object.keys(table_goals)[1]]),
      total: getTotalGoals(table_goals[Object.keys(table_goals)[0]]) + getTotalGoals(table_goals[Object.keys(table_goals)[1]])
    }

    const form = {
      [Object.keys(table_goals)[0]]: calculateForm(Object.keys(table_goals)[0], table_data),
      [Object.keys(table_goals)[1]]: calculateForm(Object.keys(table_goals)[1], table_data)
    }

    const average_scored = {
      [Object.keys(table_goals)[0]]: parseFloat(homeTeamAverage.averageScored),
      [Object.keys(table_goals)[1]]: parseFloat(homeTeamAverage.averageConceded),
      total: (parseFloat(homeTeamAverage.averageScored) + parseFloat(homeTeamAverage.averageConceded)).toFixed(2),
    }

    const total_matches = table_goals[Object.keys(table_goals)[0]].length;

    const thresholds = countGamesWithGoalsThresholds(table_goals);

    const prediction = {
      goals: {
        over: findHighestAndLowestCombinedGoals(table_data).lowestTotalGoals ? findHighestAndLowestCombinedGoals(table_data).lowestTotalGoals-1.5 > 0 ? findHighestAndLowestCombinedGoals(table_data).lowestTotalGoals-1.5 : null : null,
        under: findHighestAndLowestCombinedGoals(table_data).highestTotalGoals ? findHighestAndLowestCombinedGoals(table_data).highestTotalGoals+1.5 < 7 ? findHighestAndLowestCombinedGoals(table_data).highestTotalGoals+1.5 : null : null,
      },
      winner: calculatePridictionWinner(table_goals, table_data)
    }

    const powerScale = calculatePowerScale(goals, form, average_scored, thresholds);

    return {
      goals,
      form,
      average_scored,
      total_matches,
      thresholds,
      prediction,
      powerScale
    };

  }

  const getMoreSoccerecoData = async (game) => {
    try {
      
      const url = game.url;
  
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);

      let head_to_head_table_data = [];

      let head_to_head_data = [];

      let home_team_table_data = [];

      let home_team_data = [];

      let away_team_table_data = [];

      let away_team_data = [];

      const listGames = $('.list-games');

      listGames.each((index, element) => {
        if(index === 0){
          
          const lastResults = $(element).find('.lastresults');

          let head_to_head_goals = {};

          lastResults.each((_, element) => {
                const date = $(element).find('.date-time-wrapper > small > span').text();
                const home = $(element).find('.teams > .home').text();
                const away = $(element).find('.teams > .away').text();
                const homeScore = $(element).find('.score-container > .home').text();
                const awayScore = $(element).find('.score-container > .away').text();
                if(!head_to_head_goals[home]){
                  head_to_head_goals[home] = []
                }
                if(!head_to_head_goals[away]){
                  head_to_head_goals[away] = []
                }
                head_to_head_goals[home] = [...head_to_head_goals[home], parseFloat(homeScore)];
                head_to_head_goals[away] = [...head_to_head_goals[away], parseFloat(awayScore)];
                head_to_head_table_data = [...head_to_head_table_data, {
                  date,
                  home: {
                    team: home,
                    score: parseFloat(homeScore)
                  },
                  away: {
                    team: away,
                    score: parseFloat(awayScore)
                  }
                }];
          })

          function getTotalGoals(goals) {
            let totalGoals = 0;
          
            totalGoals += goals.reduce((sum, goalsInGame) => sum + goalsInGame, 0);
          
            return totalGoals;
          }

          function countGamesWithGoalsThresholds(head_to_head_goals) {
          
            const thresholds = [0.5, 1.5, 2.5, 3.5, 4.5];

            const gamesCountByThreshold = [];
          
            for (const threshold of thresholds) {

              let teamsStats = [];
          
              for (const team in head_to_head_goals) {

                const matches = head_to_head_goals[team];

                const totalNumberOfMatches = matches.length;

                const matches_over_threshold = matches.reduce((count, goalsInGame) => (goalsInGame > threshold ? count + 1 : count), 0);
                
                const percentage_over_threshold = ((matches_over_threshold / totalNumberOfMatches) * 100).toFixed(2) + '%';

                teamsStats.push({
                  team,
                  matches_over_threshold,
                  percentage_over_threshold,
                });

              }

              const teams = Object.keys(head_to_head_goals);
              const totalGoalsArray = head_to_head_goals[teams[0]].map((goals, i) => goals + head_to_head_goals[teams[1]][i]);
              const totalNumberOfMatches = totalGoalsArray.length;

              const matches_over_threshold = totalGoalsArray.reduce((count, goalsInGame) => (goalsInGame > threshold ? count + 1 : count), 0);
              
              const percentage_over_threshold = ((matches_over_threshold / totalNumberOfMatches) * 100).toFixed(2) + '%';

              teamsStats.push({
                team: 'Total',
                matches_over_threshold,
                percentage_over_threshold,
              });
          
              gamesCountByThreshold.push({
                threshold,
                teams: teamsStats,
              });

            }
          
            return gamesCountByThreshold;
          }

          function calculateForm(teamName, matches) {
            let wins = 0;
            let losses = 0;
            let draws = 0;
          
            for (const match of matches) {
              const homeTeam = match.home.team;
              const awayTeam = match.away.team;
              const homeScore = match.home.score;
              const awayScore = match.away.score;
          
              if (homeTeam === teamName) {
                if (homeScore > awayScore) {
                  wins++;
                } else if (homeScore < awayScore) {
                  losses++;
                } else {
                  draws++;
                }
              } else if (awayTeam === teamName) {
                if (awayScore > homeScore) {
                  wins++;
                } else if (awayScore < homeScore) {
                  losses++;
                } else {
                  draws++;
                }
              }

            }
          
            return { wins, losses, draws };
          }

          function calculateAverageGoals(teamName, matches) {
            let totalGoalsScored = 0;
            let totalGoalsConceded = 0;
          
            for (const match of matches) {
              const homeTeam = match.home.team;
              const awayTeam = match.away.team;
              const homeScore = match.home.score;
              const awayScore = match.away.score;
          
              if (homeTeam === teamName) {
                totalGoalsScored += homeScore;
                totalGoalsConceded += awayScore;
              } else if (awayTeam === teamName) {
                totalGoalsScored += awayScore;
                totalGoalsConceded += homeScore;
              }
            }
          
            const totalMatches = matches.length;
            const averageScored = (totalGoalsScored / totalMatches).toFixed(2);
            const averageConceded = (totalGoalsConceded / totalMatches).toFixed(2);
          
            return { averageScored, averageConceded };
          }

          const homeTeamAverage = calculateAverageGoals(Object.keys(head_to_head_goals)[0], head_to_head_table_data);

          const calculatePridictionWinner = (head_to_head_goals, head_to_head_table_data) => {
            const team1Form = calculateForm(Object.keys(head_to_head_goals)[0], head_to_head_table_data);
            const team1Score = team1Form.wins - team1Form.losses - team1Form.draws;
            const team2Form = calculateForm(Object.keys(head_to_head_goals)[1], head_to_head_table_data);
            const team2Score = team2Form.wins - team2Form.losses - team2Form.draws;
            const totalScore = team1Form.wins + team1Form.losses + team1Form.draws;
            let winner = null;
            let loser = null;
            if(team1Score === totalScore){
              winner = Object.keys(head_to_head_goals)[0];
              loser = Object.keys(head_to_head_goals)[1];
            }else if(team2Score === totalScore){
              winner = Object.keys(head_to_head_goals)[1];
              loser = Object.keys(head_to_head_goals)[0];
            }
            const loserForm = calculateForm(loser, head_to_head_table_data);
            const confidence = ((loserForm.losses - loserForm.wins - loserForm.draws)/totalScore) * 100;
            if(!winner){
              return null
            }
            return {team:winner, confidence: confidence.toFixed(0) + '%'}
          }
          
          function findHighestAndLowestCombinedGoals(matches) {

            let highestTotalGoals = null;
            let lowestTotalGoals = null;

            for (const match of matches) {

              const totalGoals = match.home.score + match.away.score;

              if(!highestTotalGoals){
                  highestTotalGoals = totalGoals
              }

              if(!lowestTotalGoals){
                  lowestTotalGoals = totalGoals
              }

              if (totalGoals > highestTotalGoals) {
                highestTotalGoals = totalGoals;
              }

              if (totalGoals < lowestTotalGoals) {
                lowestTotalGoals = totalGoals;
              }

            }

            return {
              highestTotalGoals,
              lowestTotalGoals,
            };
          }

          const calculatePowerScale = (goals, form, average_scored, thresholds) => {

              const goalteams = Object.keys(goals);
              const goalScale = Math.round(((goals[goalteams[1]]-goals[goalteams[0]])/goals[goalteams[2]])*100);

              const formTeams = Object.keys(form);
              const winScale = Math.round(((form[formTeams[1]].wins-form[formTeams[0]].wins)/(form[formTeams[1]].wins+form[formTeams[0]].wins))*100);
              const lossScale = Math.round(((form[formTeams[1]].losses-form[formTeams[0]].losses)/(form[formTeams[1]].losses+form[formTeams[0]].losses))*100);
              const drawScale = Math.round(((form[formTeams[1]].draws-form[formTeams[0]].draws)/(form[formTeams[1]].draws+form[formTeams[0]].draws))*100);

              const averageScoreTeams = Object.keys(average_scored);
              const averageScoreDiff = average_scored[averageScoreTeams[1]]-average_scored[averageScoreTeams[0]]
              const averageScoreTotal = average_scored[averageScoreTeams[1]]+average_scored[averageScoreTeams[0]]
              const averageScoredScale = Math.round((averageScoreDiff/averageScoreTotal)*100);

              let thresholdScales = [];
              let thresholdTotal = [];
              for(let i = 0; i < thresholds.length; i++){
                const threshold = thresholds[i];
                const teams = threshold.teams;
                if((parseInt(teams[1].percentage_over_threshold.split('%')[0])+parseInt(teams[0].percentage_over_threshold.split('%')[0])) > 0){
                  const thresholdScale = Math.round(((parseInt(teams[1].percentage_over_threshold.split('%')[0])-parseInt(teams[0].percentage_over_threshold.split('%')[0]))/(parseInt(teams[1].percentage_over_threshold.split('%')[0])+parseInt(teams[0].percentage_over_threshold.split('%')[0])))*100);
                  thresholdScales.push(thresholdScale);
                  const totalScale = Math.round((parseInt(teams[0].percentage_over_threshold.split('%')[0])+parseInt(teams[1].percentage_over_threshold.split('%')[0])));
                  thresholdTotal.push(totalScale);
                }
              }
              const thresholdScale = Math.round((thresholdScales.reduce((x, y) => x + y)/thresholdTotal.reduce((x, y) => x + y))*100);
             
              return {goalScale, winScale, lossScale, drawScale, averageScoredScale, thresholdScale, team1: goalteams[0], team2: goalteams[1]}
          }

          const goals = {
            [Object.keys(head_to_head_goals)[0]]: getTotalGoals(head_to_head_goals[Object.keys(head_to_head_goals)[0]]),
            [Object.keys(head_to_head_goals)[1]]: getTotalGoals(head_to_head_goals[Object.keys(head_to_head_goals)[1]]),
            total: getTotalGoals(head_to_head_goals[Object.keys(head_to_head_goals)[0]]) + getTotalGoals(head_to_head_goals[Object.keys(head_to_head_goals)[1]])
          }
          const form = {
            [Object.keys(head_to_head_goals)[0]]: calculateForm(Object.keys(head_to_head_goals)[0], head_to_head_table_data),
            [Object.keys(head_to_head_goals)[1]]: calculateForm(Object.keys(head_to_head_goals)[1], head_to_head_table_data)
          }
          const average_scored = {
            [Object.keys(head_to_head_goals)[0]]: parseFloat(homeTeamAverage.averageScored),
            [Object.keys(head_to_head_goals)[1]]: parseFloat(homeTeamAverage.averageConceded),
            total: (parseFloat(homeTeamAverage.averageScored) + parseFloat(homeTeamAverage.averageConceded)).toFixed(2),
          }
          const total_matches = head_to_head_goals[Object.keys(head_to_head_goals)[0]].length;
          const thresholds = countGamesWithGoalsThresholds(head_to_head_goals);
          const prediction = {
            goals: {
              over: findHighestAndLowestCombinedGoals(head_to_head_table_data).lowestTotalGoals ? findHighestAndLowestCombinedGoals(head_to_head_table_data).lowestTotalGoals-1.5 > 0 ? findHighestAndLowestCombinedGoals(head_to_head_table_data).lowestTotalGoals-1.5 : null : null,
              under: findHighestAndLowestCombinedGoals(head_to_head_table_data).highestTotalGoals ? findHighestAndLowestCombinedGoals(head_to_head_table_data).highestTotalGoals+1.5 < 7 ? findHighestAndLowestCombinedGoals(head_to_head_table_data).highestTotalGoals+1.5 : null : null,
            },
            winner: calculatePridictionWinner(head_to_head_goals, head_to_head_table_data)
          }
          const powerScale = calculatePowerScale(goals, form, average_scored, thresholds);
          head_to_head_data = {
            goals,
            form,
            average_scored,
            total_matches,
            thresholds,
            prediction,
            powerScale
          };
        }
        if(index === 1){
          
          const lastResults = $(element).find('.lastresults');

          lastResults.each((_, element) => {
                const date = $(element).find('.date-time-wrapper > small > span').text();
                const home = $(element).find('.teams > .home').text();
                const away = $(element).find('.teams > .away').text();
                const homeScore = $(element).find('.score-container > .home').text();
                const awayScore = $(element).find('.score-container > .away').text();
                let home_team_goals = {};
                if(!home_team_goals[home]){
                  home_team_goals[home] = []
                }
                if(!home_team_goals[away]){
                  home_team_goals[away] = []
                }
                home_team_goals[home] = [...home_team_goals[home], parseFloat(homeScore)];
                home_team_goals[away] = [...home_team_goals[away], parseFloat(awayScore)];
                home_team_table_data = [...home_team_table_data, {
                  date,
                  home: {
                    team: home,
                    score: parseFloat(homeScore)
                  },
                  away: {
                    team: away,
                    score: parseFloat(awayScore)
                  }
                }];
      
                home_team_data = [...home_team_data, getGamesData(home_team_goals, home_team_table_data)];
          })

        }
        if(index === 2){
          
          const lastResults = $(element).find('.lastresults');

          lastResults.each((_, element) => {
                const date = $(element).find('.date-time-wrapper > small > span').text();
                const home = $(element).find('.teams > .home').text();
                const away = $(element).find('.teams > .away').text();
                const homeScore = $(element).find('.score-container > .home').text();
                const awayScore = $(element).find('.score-container > .away').text();
                let away_team_goals = {};
                if(!away_team_goals[home]){
                  away_team_goals[home] = []
                }
                if(!away_team_goals[away]){
                  away_team_goals[away] = []
                }
                away_team_goals[home] = [...away_team_goals[home], parseFloat(homeScore)];
                away_team_goals[away] = [...away_team_goals[away], parseFloat(awayScore)];
                away_team_table_data = [...away_team_table_data, {
                  date,
                  home: {
                    team: home,
                    score: parseFloat(homeScore)
                  },
                  away: {
                    team: away,
                    score: parseFloat(awayScore)
                  }
                }];

                away_team_data = [...away_team_data, getGamesData(away_team_goals, away_team_table_data)];

          })

        }
      })

      const extraTables = $('.extratable');

      extraTables.each((_, tableElement) => {
        const table = $(tableElement);
        const rows = table.find('tr');

        const headers = [];
        rows.eq(0).find('th').each((_, header) => {
          headers.push($(header).text());
        });

        rows.slice(1).each((_, row) => {
          const rowData = {};
          let team = null;
          $(row).find('td').each((j, cell) => {
            let cellText = $(cell).text();
            if(headers[j] === "Team"){
              team = cellText;
            }else{
              if(!cellText.includes('%') && !cellText.includes(':')){
                cellText = parseFloat(cellText);
              }
              rowData[headers[j]] = cellText;
            }
          });

        });
      });

      const leagueStandings = $('.LeagueStandings table:not(.extratable)');

      const leagueStandingsRows = leagueStandings.find('tr');

      const leagueStandingsHeaders = [];

      leagueStandings.find('tr').eq(0).find('th').each((_, header) => {
        leagueStandingsHeaders.push($(header).text());
      });

      leagueStandingsRows.slice(1).each((_, row) => {
        const rowData = {};
        let team = null;
        const className = $(row).attr('class');
        if(className === "home" || className === "away"){

          $(row).find('td').each((j, cell) => {
            let cellText = $(cell).text();
            if(leagueStandingsHeaders[j] === "Team"){
              const match = cellText.match(/^\d+/g);
              const position = parseInt(match[0], 10);
              team = cellText.replace(match[0], '').trim();
              rowData['position'] = position;
            }else{
              if(!cellText.includes('%') && !cellText.includes(':')){
                cellText = parseFloat(cellText);
              }
              rowData[leagueStandingsHeaders[j]] = cellText;
            }
          });

        }

      });

      return {...game, head_to_head_table_data, head_to_head_data, home_team_table_data, home_team_data, away_team_table_data, away_team_data};

    } catch (err) {
      return null;
    }
  }

  let allGames = [];

  for(let i = 0; i < allSoccerecoGames.length; i++){
      const gameData = await getMoreSoccerecoData(allSoccerecoGames[i]);
      console.log((i/allSoccerecoGames.length * 100) + '%')
      if(gameData){
        allGames.push(gameData);
      }
  }
 
  return Response.json(allGames)

}