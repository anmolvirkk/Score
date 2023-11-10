import axios from 'axios'
import cheerio from 'cheerio';

function findHighestAndLowestCombinedGoals(matches, team1, team2) {

  let highestTotalGoals = null;
  let lowestTotalGoals = null;

  let highestTeam1Score = null;
  let lowestTeam1Score = null;

  let highestTeam2Score = null;
  let lowestTeam2Score = null;

  for (const match of matches) {

    const totalGoals = match.home.score + match.away.score;

    if(!highestTotalGoals){
        highestTotalGoals = {
          score: totalGoals,
          teams: [
            {
              team: match.home.team,
              score: match.home.score
            },
            {
              team: match.away.team,
              score: match.away.score
            }
          ]
        };
    }

    if(!lowestTotalGoals){
        lowestTotalGoals = {
          score: totalGoals,
          teams: [
            {
              team: match.home.team,
              score: match.home.score
            },
            {
              team: match.away.team,
              score: match.away.score
            }
          ]
        };
    }

    if (totalGoals > highestTotalGoals.score) {
      highestTotalGoals = {
        score: totalGoals,
        teams: [
          {
            team: match.home.team,
            score: match.home.score
          },
          {
            team: match.away.team,
            score: match.away.score
          }
        ]
      };
    }

    if (totalGoals < lowestTotalGoals.score) {
      lowestTotalGoals = {
        score: totalGoals,
        teams: [
          {
            team: match.home.team,
            score: match.home.score
          },
          {
            team: match.away.team,
            score: match.away.score
          }
        ]
      };
    }

    let team1Score = match.home.team === team1 ? match.home.score : match.away.score;

    if(!highestTeam1Score){
      highestTeam1Score = {
        score: team1Score,
        team: team1
      };
    }

    if(!lowestTeam1Score){
      lowestTeam1Score = {
        score: team1Score,
        team: team1
      };
    }
    
    if (team1Score > highestTeam1Score.score) {
      highestTeam1Score = {
        score: team1Score,
        team: team1
      };
    }

    if (team1Score < lowestTeam1Score.score) {
      lowestTeam1Score = {
        score: team1Score,
        team: team1
      };
    }

    if(team2){

      const team2Score = match.home.team === team2 ? match.home.score : match.away.score;

      if(!highestTeam2Score){
        highestTeam2Score = {
          team: team2,
          score: team2Score
        };
      }
  
      if(!lowestTeam2Score){
        lowestTeam2Score = {
          team: team2,
          score: team2Score
        };
      }

      if (team2Score > highestTeam2Score.score) {
        highestTeam2Score = {
          team: team2,
          score: team2Score
        };
      }
  
      if (team2Score < lowestTeam2Score.score) {
        lowestTeam2Score = {
          team: team2,
          score: team2Score
        };
      }

    }

  }

  if(!team2){
    return {
      highestTotalGoals,
      lowestTotalGoals,
      highestTeamScore: {...highestTeam1Score},
      lowestTeamScore: {...lowestTeam1Score}
    };
  }

  return {
    highestTotalGoals,
    lowestTotalGoals,
    highestTeam1Score,
    lowestTeam1Score,
    highestTeam2Score,
    lowestTeam2Score
  };
}


function calculateAverageGoals(teamName, matches) {
  let totalGoalsScored = 0;

  for (const match of matches) {
    const homeTeam = match.home.team;
    const awayTeam = match.away.team;
    const homeScore = match.home.score;
    const awayScore = match.away.score;

    if (homeTeam === teamName) {
      totalGoalsScored += homeScore;
    } else if (awayTeam === teamName) {
      totalGoalsScored += awayScore;
    }
  }

  const totalMatches = matches.length;
  const averageScored = (totalGoalsScored / totalMatches);

  return averageScored;
}

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

  const getGamesData = (table_goals, table_data, team) => {
    
    function getTotalGoals(goals) {
      let totalGoals = 0;
    
      totalGoals += goals.reduce((sum, goalsInGame) => sum + goalsInGame, 0);
    
      return totalGoals;
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

    const goals = {
      [Object.keys(table_goals)[0]]: getTotalGoals(table_goals[Object.keys(table_goals)[0]]),
      [Object.keys(table_goals)[1]]: getTotalGoals(table_goals[Object.keys(table_goals)[1]]),
      total: getTotalGoals(table_goals[Object.keys(table_goals)[0]]) + getTotalGoals(table_goals[Object.keys(table_goals)[1]])
    }

    const form = {
      [Object.keys(table_goals)[0]]: calculateForm(Object.keys(table_goals)[0], table_data),
      [Object.keys(table_goals)[1]]: calculateForm(Object.keys(table_goals)[1], table_data)
    }

    const homeTeamAverage = calculateAverageGoals(Object.keys(table_goals)[0], table_data);
    const awayTeamAverage = calculateAverageGoals(Object.keys(table_goals)[1], table_data);

    const average_scored = [
      {
        team: Object.keys(table_goals)[0],
        goals: homeTeamAverage
      },
      {
        team: Object.keys(table_goals)[1],
        goals: awayTeamAverage
      }
    ]
    
    const minMaxGoals = findHighestAndLowestCombinedGoals(table_data, team);

    return {
      goals,
      form,
      average_scored,
      minMaxGoals
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

      let home = null;
      let away = null;

      listGames.each((index, element) => {
        if(index === 0){
          
          const lastResults = $(element).find('.lastresults');

          let head_to_head_goals = {};

          lastResults.each((_, element) => {
                const date = $(element).find('.date-time-wrapper > small > span').text();
                home = $(element).find('.teams > .home').text();
                away = $(element).find('.teams > .away').text();
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

          const homeTeamAverage = calculateAverageGoals(Object.keys(head_to_head_goals)[0], head_to_head_table_data);
          const awayTeamAverage = calculateAverageGoals(Object.keys(head_to_head_goals)[1], head_to_head_table_data);

          const goals = {
            [Object.keys(head_to_head_goals)[0]]: getTotalGoals(head_to_head_goals[Object.keys(head_to_head_goals)[0]]),
            [Object.keys(head_to_head_goals)[1]]: getTotalGoals(head_to_head_goals[Object.keys(head_to_head_goals)[1]]),
            total: getTotalGoals(head_to_head_goals[Object.keys(head_to_head_goals)[0]]) + getTotalGoals(head_to_head_goals[Object.keys(head_to_head_goals)[1]])
          }

          const form = {
            [Object.keys(head_to_head_goals)[0]]: calculateForm(Object.keys(head_to_head_goals)[0], head_to_head_table_data),
            [Object.keys(head_to_head_goals)[1]]: calculateForm(Object.keys(head_to_head_goals)[1], head_to_head_table_data)
          }
          const average_scored = [
            {
              team: Object.keys(head_to_head_goals)[0],
              goals: homeTeamAverage
            },
            {
              team: Object.keys(head_to_head_goals)[1],
              goals: awayTeamAverage
            }
          ]

          const minMaxGoals = findHighestAndLowestCombinedGoals(head_to_head_table_data, Object.keys(head_to_head_goals)[0], Object.keys(head_to_head_goals)[1]);
          
          head_to_head_data = {
            goals,
            form,
            average_scored,
            minMaxGoals
          };
        }

        if(index === 1){
          
          const lastResults = $(element).find('.lastresults');

          let home_team_goals = {};

          lastResults.each((_, element) => {
                const date = $(element).find('.date-time-wrapper > small > span').text();
                const homeScore = $(element).find('.score-container > .home').text();
                const awayScore = $(element).find('.score-container > .away').text();
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
          })

          home_team_data = getGamesData(home_team_goals, home_team_table_data, home);

        }
        if(index === 2){
          
          const lastResults = $(element).find('.lastresults');

          let away_team_goals = {};

          lastResults.each((_, element) => {
                const date = $(element).find('.date-time-wrapper > small > span').text();
                const homeScore = $(element).find('.score-container > .home').text();
                const awayScore = $(element).find('.score-container > .away').text();
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

          })

          away_team_data = getGamesData(away_team_goals, away_team_table_data, away)

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