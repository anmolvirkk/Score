'use client'

import { MatchData } from '@/types';
import { useState } from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import BottomNavigation from '../BottomSheet';
import {RecoilRoot, useRecoilState} from 'recoil';
import { filtersAtom } from '@/atoms';
import Loading from '../Loading';
import testJSON from './test.json';

function capitalize(string:string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const getMonth = (number:number) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  if (number >= 1 && number <= 12) {
    return months[number - 1];
  } else {
    return null;
  }
};

const Game = (matchData : MatchData) => {

  if(!matchData || !matchData?.date || !matchData?.time){
    return null;
  }

  const Heading = ({text, className=""}:{text: string, className?: string}) => {
    return <div className={`bg-primary-700 text-center p-[0.5rem] rounded-[0.5rem] mb-[0.5rem] ${className}`}>{text}</div>
  }

  const GameTime = () => {

    const convertTo12HourFormat = (time24 : string) => {
      const [hour, minute] = time24.split(':');
      
      const isPM = parseInt(hour) >= 12;
      
      const hour12 = (parseInt(hour) % 12) || 12;
      
      const period = isPM ? 'PM' : 'AM';
      const time12 = `${hour12}:${minute} ${period}`;
      
      return time12;
    }

    return (
      <div className='game flex w-full opacity-[0.5] gap-[0.5rem] py-[2rem]'>
        <div>{matchData.date?.split('.')[0]} {matchData.date && getMonth(parseInt(matchData.date?.split('.')[1]))}</div>
        <div>|</div>
        <div>{convertTo12HourFormat(matchData.time)}</div>
      </div>
    )

  }

  const GameOdds = () => {
    return (
      <div className='flex gap-[3rem] my-[2rem] overflow-x-auto'>
        {Object.keys(matchData.odds).map((item, key) => (
          <div className='flex flex-col items-center justify-between gap-[0.5rem] w-full' key={key}>
            <div className='text-center game-team'>{item}</div>
            <div className="flex flex-col items-center"><span className="opacity-[0.75]">{matchData.odds[item]}</span> <span className={!matchData.tip.includes(item) ? 'opacity-0' : 'opacity-1'}>✅</span></div>
          </div>
        ))}
      </div>
    )
  }

  const LastScore = () => {
  
    const totalGoals = matchData.lastScore?.reduce((acc, item) => acc + item.goals, 0);
  
    const isTeamAGreater = matchData.lastScore[0].goals > matchData.lastScore[1].goals;
  
    return (
      <div>
        <Heading text="Last Score" />
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            {matchData.lastScore?.map((item, key) => (
              <div
                key={key}
                className={`last-match-goals text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
                  isTeamAGreater ? (key === 0 ? 'text-white bg-green-400' : 'text-teal-600 bg-teal-200') : (key === 0 ? 'text-teal-600 bg-teal-200' : 'text-white bg-green-400')
                }`}
              >
                {item.goals}
              </div>
            ))}
          </div>
          <div className="flex h-2 overflow-hidden rounded">
            {matchData.lastScore?.map((item, key) => (
              <div
                key={key}
                className={`flex flex-col text-center whitespace-nowrap text-white justify-center ${
                  isTeamAGreater ? (key === 0 ? 'bg-green-400' : 'bg-teal-200') : (key === 0 ? 'bg-teal-200' : 'bg-green-400')
                }`}
                style={{
                  width: `${(item.goals / totalGoals) * 100}%`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const TeamForm = () => {
    if(typeof window === undefined){
      return null;
    }
    return (
      <div className="mt-[2rem]">
        <Heading text="Team Form" />
        <div className="flex justify-between gap-[2rem] mt-[2rem]">
          {Object.keys(matchData.teamForm).map((item, key) => {
            const form = matchData.teamForm[item];
            const data = [
              {title: 'Wins', value: form.wins, color: "#00D26A"},
              {title: 'Draws', value: form.draws, color: "#99F6E4"},
              {title: 'Losses', value: form.losses, color: "#56667a"}
            ];
            return <PieChart 
              key={key}
              data={data}
              className="w-[10rem]"
              radius={10}
              viewBoxSize={[30, 30]}
              center={[15, 15]}
              segmentsShift={1}
              label={({ dataEntry } : {dataEntry : any}) => dataEntry?.value > 0 && dataEntry?.value + ' ' + dataEntry?.title?.slice(0, 1)}
              labelStyle={(segmentIndex:number) => {
                return {
                  fontSize: '0.1rem',
                  fill: data[segmentIndex].title === "Draws" ? "rgb(20,22,27)" : "white"
                }
              }}
            />
          })}
        </div>
      </div>
    )
  }

  const AdditionalData = () => {
    const TeamComparison = () => {
      const GamesWon = () => {
        const gamesData = matchData.additional_data.compare_teams_table_data.games_won;
        return Object.keys(gamesData).map((team, key) => {
          return (
            <div className="flex gap-[1rem]" key={key}>
              <div>Games Won</div>
              <div key={key}>{team} - {gamesData[team]}</div>
            </div>
          )
        })
      }
      const GamesLostOrDraw = () => {
        const gamesData = matchData.additional_data.compare_teams_table_data.games_lost_or_draw;
        return Object.keys(gamesData).map((team, key) => {
          return (
            <div className="flex gap-[1rem]" key={key}>
              <div>Games Lost or Draw</div>
              <div key={key}>{team} - {gamesData[team]}</div>
            </div>
          )
        })
      }
      const GamesLost = () => {
        const gamesData = matchData.additional_data.compare_teams_table_data.games_lost;
        return Object.keys(gamesData).map((team, key) => {
          return (
            <div className="flex gap-[1rem]" key={key}>
              <div>Games Lost</div>
              <div key={key}>{team} - {gamesData[team]}</div>
            </div>
          )
        })
      }
      const GamesDraw = () => {
        const gamesData = matchData.additional_data.compare_teams_table_data.games_draw;
        return Object.keys(gamesData).map((team, key) => {
          return (
            <div className="flex gap-[1rem]" key={key}>
              <div>Games Draw</div>
              <div key={key}>{team} - {gamesData[team]}</div>
            </div>
          )
        })
      }
      const LastFiveGames = () => {
        const gamesData = matchData.additional_data.compare_teams_table_data.last_five_games;
        return Object.keys(gamesData).map((team, key) => {
          return (
            <div key={key} className="flex gap-[1rem]">
              <div>Last five games</div>
              <div key={key}>
                <div>{team}</div>
                <div>Wins - {gamesData[team].wins}</div>
                <div>Draws - {gamesData[team].draws}</div>
                <div>Losses - {gamesData[team].losses}</div>
              </div>
            </div>
          )
        })
      }
      const LastFiveGamesAgainstEachOther = () => {
        const gamesData = matchData.additional_data.compare_teams_table_data.last_five_games_against_each_other;
        return Object.keys(gamesData).map((team, key) => {
          return (
            <div key={key} className="flex gap-[1rem]">
              <div>Last five games agaist each other</div>
              <div>
                <div>{team}</div>
                <div>Wins - {gamesData[team].wins}</div>
                <div>Draws - {gamesData[team].draws}</div>
                <div>Losses - {gamesData[team].losses}</div>
              </div>
            </div>
          )
        })
      }
      return (
        <div className="flex flex-col gap-[1rem]">
          <GamesWon />
          <GamesLostOrDraw />
          <GamesLost />
          <GamesDraw />
          <LastFiveGames />
          <LastFiveGamesAgainstEachOther />
        </div>
      )
    }
    const Prediction = () => {
      const winner : any = matchData.additional_data.predictions_table_data.winner;
      const goals = matchData.additional_data.predictions_table_data.goals;
      const score = matchData.additional_data.predictions_table_data.score;
      const confidence = parseInt(winner.confidence);
      let confidenceColor = "border-green-400 text-green-400"
      if(confidence <= 4){
        confidenceColor = "border-red-600 text-red-600"
      }else if(confidence <= 6){
        confidenceColor = "border-orange-600 text-orange-600"
      }else if(confidence <= 8){
        confidenceColor = "border-amber-400 text-amber-400"
      }
      return (
        <div className="flex flex-col gap-[1rem]">
          <div className="flex justify-between items-center">
            <div>
              <div className="opacity-[0.35]">Winner</div>
              <div className="text-[1.5rem] font-[700]">{capitalize(winner.team)}</div>
            </div>
            <div className="flex flex-col items-center justify-center gap-[0.75rem]">
              <div className={`rounded-full border-2 w-[4rem] h-[4rem] flex items-center justify-center ${confidenceColor}`}>{winner.confidence}</div>
              <div className="opacity-[0.35] text-[0.75rem]">Confidence</div>
            </div>
          </div>
          {/* <div>Goals - {goals}</div>
          <div>Score | {score?.winner} - {score?.loser}</div> */}
        </div>
      )
    }
    const HeadToHead = () => {
      const head_to_head_table_data = matchData.additional_data.head_to_head_table_data;
      return (
        <div className="flex flex-wrap gap-[1rem] justify-center">
          {Object.keys(head_to_head_table_data).map((item, key) => {
            const homeTeam = Object.keys(head_to_head_table_data[item])[0];
            const awayTeam = Object.keys(head_to_head_table_data[item])[1];
            const formattedDate = `${item.split('.')[0]} ${getMonth(parseInt(item.split('.')[1]))} ${item.split('.')[2]}`;
            return (
              <div key={key} className='rounded-[1rem] p-[1rem] flex flex-col items-center'>
                <div className="opacity-[0.3]">{formattedDate}</div>
                <div className='text-[1rem] font-[700]'>{head_to_head_table_data[item][homeTeam]} - {head_to_head_table_data[item][awayTeam]}</div>
              </div>
            )
          })}
        </div>
      )
    }
    const LatestGoals = () => {
      const latest_games_goals_table_data = matchData.additional_data.latest_games_goals_table_data;
      return (
        <div className="flex flex-col gap-[0.5rem]">
          {Object.keys(latest_games_goals_table_data).map((item, key) => {
        // @ts-ignore
        const teamsData = latest_games_goals_table_data[item];
        if(item.toLowerCase().includes('over')){
          return (
            <div key={key} className="flex justify-between items-center">
              <div className='w-[10rem]'>
                <div className='opacity-[0.35]'>Over</div>
                <div className="text-[2rem] font-[700]">{item.split('over')[1]}</div>
              </div>
              {Object.keys(teamsData).map((item, key) => {
                let color = "bg-green-400";
                const num = parseInt(teamsData[item].replace("%", ""));
                if(num <= 40){
                  color = "bg-red-600";
                }else if(num <= 60){
                  color = "bg-orange-600";
                }else if(num <= 80){
                  color = "bg-amber-400";
                }
                return (
                  <div key={key}>
                    <div className="relative flex items-center justify-center w-[7rem] h-[4rem]">
                      <div className='p-[1rem] absolute z-[1]'>{teamsData[item]}</div>
                      <div className={`absolute top-[0] w-full h-full ${color}`}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        }
        return (
          <div key={key} className="flex flex-col gap-[1rem] mt-[1rem]">
            <div className="opacity-[0.35]">{capitalize(item)}</div>
            <div className="flex items-center justify-between">
              {Object.keys(teamsData).map((item, key) => {
                return <div key={key} className="text-[2rem] font-[700] w-[9rem] py-[1rem] px-[2rem] rounded-[0.5rem] bg-primary-700">{teamsData[item]}</div>
              })}
            </div>
          </div>
        )
      })}
        </div>
      )
    }
    const PowerRank = () => {
      const power_rank_table_data = matchData.additional_data.power_rank_table_data;
      return (
        <div>
          {Object.keys(power_rank_table_data).map((item, key)=>{
            if(item === "h2h"){
              const teams = power_rank_table_data[item];
              return (
                <div key={key}>
                  <div>Head to Head</div>
                  <div>
                    {Object.keys(teams).map((item, key)=>{
                      //@ts-ignore
                      const teamData = teams[item];
                      return (
                        <div key={key}>
                          <div>{item}</div>
                          <div>Wins - {teamData.W}</div>
                          <div>Draws - {teamData.D}</div>
                          <div>Losses - {teamData.L}</div>
                          <div>Goals - {teamData.GOALS}</div>
                          <div>Over 2.5 Goals - {teamData['O2.5']}</div>
                          <div>Both teams to score - {teamData.BTTS}</div>
                          <div>Power - {teamData.POWER}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            }
            const team : any = power_rank_table_data[item];
            return (
              <div key={key} className="border-2">
                <div>{item}</div>
                <div>Wins - {team.W}</div>
                <div>Draws - {team.D}</div>
                <div>Losses - {team.L}</div>
                <div>Goals - {team.GOALS}</div>
                <div>Over 2.5 Goals - {team['O2.5']}</div>
                <div>Both teams to score - {team.BTTS}</div>
                <div>Power - {team.POWER}</div>
              </div>
            )
          })}
        </div>
      )
    }

    const getCommonTeam = (data:any) => {
      
      const firstDate = Object.keys(data)[0];
      const secondDate = Object.keys(data)[1];
      const firstDateTeams = Object.keys(data[firstDate]);
      const secondDateTeams = Object.keys(data[secondDate]);

      const commonTeam = firstDateTeams.filter(team => secondDateTeams.includes(team))[0];
      return commonTeam;

    }

    const HomeTeamData = () => {
      const home_team_table_data = matchData.additional_data.home_team_table_data;
      return (
        <div className="flex flex-wrap gap-[1rem] justify-center">
          {Object.keys(home_team_table_data).map((item, key) => {
            const homeTeam = getCommonTeam(home_team_table_data);
            const firstTeam = Object.keys(home_team_table_data[item])[0];
            const secondTeam = Object.keys(home_team_table_data[item])[1];
            const formattedDate = `${item.split('.')[0]} ${getMonth(parseInt(item.split('.')[1]))}`;
            return (
              <div key={key} className='rounded-[1rem] p-[1rem] flex flex-col items-center'>
                <div className="opacity-[0.3]">{formattedDate}</div>
                <div className='text-[1rem] font-[700]'><span className={homeTeam !== firstTeam ? 'opacity-[0.15]' : ''}>{home_team_table_data[item][firstTeam]}</span> - <span className={homeTeam !== secondTeam ? 'opacity-[0.15]' : ''}>{home_team_table_data[item][secondTeam]}</span></div>
              </div>
            )
          })}
        </div>
      )
    }
    const AwayTeamData = () => {
      const away_team_table_data = matchData.additional_data.away_team_table_data;
      return (
        <div className="flex flex-wrap gap-[1rem] justify-center">
          {Object.keys(away_team_table_data).map((item, key) => {
            const homeTeam = getCommonTeam(away_team_table_data);
            const firstTeam = Object.keys(away_team_table_data[item])[0];
            const secondTeam = Object.keys(away_team_table_data[item])[1];
            const formattedDate = `${item.split('.')[0]} ${getMonth(parseInt(item.split('.')[1]))}`;
            return (
              <div key={key} className='rounded-[1rem] p-[1rem] flex flex-col items-center'>
                <div className="opacity-[0.3]">{formattedDate}</div>
                <div className='text-[1rem] font-[700]'><span className={homeTeam !== firstTeam ? 'opacity-[0.15]' : ''}>{away_team_table_data[item][firstTeam]}</span> - <span className={homeTeam !== secondTeam ? 'opacity-[0.15]' : ''}>{away_team_table_data[item][secondTeam]}</span></div>
              </div>
            )
          })}
        </div>
      )
    }
    const OverallStanding = () => {
      const overall_standings_table_data = matchData.additional_data.overall_standings_table_data;
      return (
        <div>
          {Object.keys(overall_standings_table_data).map((item, key)=>{
            const teamData : any = overall_standings_table_data[item];
            return (
              <div key={key}>
                <div>Team - {item}</div>
                <div>Position - {teamData.position}</div>
                <div>Goals - {teamData.G}</div>
                <div>Wins - {teamData.W}</div>
                <div>Draws - {teamData.D}</div>
                <div>Losses - {teamData.L}</div>
                <div>Power - {teamData.P}</div>
              </div>
            )
          })}
        </div>
      )
    }
    return (
      <>
        {/* <Heading text="Team Comparison" className="mb-[1rem] mt-[1rem]" />
        <TeamComparison /> */}
        <Heading text="Prediction" className="mb-[1rem] mt-[1rem]" />
        <Prediction />
        <Heading text="Goals" className="mb-[1rem] mt-[1rem]" />
        <LatestGoals />
        <Heading text="Head to Head" className="mb-[1rem] mt-[2.5rem]" />
        <HeadToHead />
        {/* <Heading text="Power Rank" className="mb-[1rem] mt-[1rem]" />
        <PowerRank /> */}
        <Heading text="Home Team Data" className="mb-[1rem] mt-[1rem]" />
        <HomeTeamData />
        <Heading text="Away Team Data" className="mb-[1rem] mt-[1rem]" />
        <AwayTeamData />
        {/* <Heading text="Overall Standings" className="mb-[1rem] mt-[1rem]" />
        <OverallStanding /> */}
      </>
    )
  }

  return (
    <div className='game p-[2rem] rounded-[1rem] bg-primary-600 border-x-2 shadow-md text-white border-gray-600 max-w-[25rem] sm:min-w-[25rem] w-[calc(100%-3rem)] sm:w-[calc(25%-8rem)]'>
      {/* <GameTime /> */}
      <GameOdds />
      {/* <LastScore /> */}
      {/* <TeamForm /> */}
      <AdditionalData />
    </div>
  )
}

const Games = () => {

  const testData : any = testJSON;

  const [gamesData, setGamesData] = useState<MatchData[] | null>(testData);

  // const getGamesData = async () => {
  //   const response = await fetch('/api/games');
  //   if(response && response?.ok){
  //     const gamesData : any = await response?.json();
  //     if(gamesData){
  //       setGamesData(gamesData);
  //     }
  //   }
  // }

  // if(!gamesData){
  //   getGamesData();
  // }
    
  if(!gamesData || gamesData?.length === 0){
    return <Loading />;
  }

  const [filters] = useRecoilState(filtersAtom);

  const getFilteredGames = () => {

    let results = gamesData;

    if(filters.search){
      results = results.filter(e=>Object.keys(e?.odds).some(e=>e?.toLowerCase().includes(filters.search.toLowerCase())));
    }

    if(filters.minimumHeadToHeadGoals){
      results = results.filter(e=>{
        if(e?.additional_data.head_to_head_table_data){
          const matches = Object.keys(e?.additional_data.head_to_head_table_data);
          const matchGoals = matches.map((match)=>{
            const matchData : any = e?.additional_data.head_to_head_table_data[match];
            const totalGoals : any = Object.keys(matchData).reduce((acc:number, item)=>{acc+=matchData[item]; return acc;}, 0);
            return totalGoals;
          })
          const minimumGoals = Math.min(...matchGoals);
          if(minimumGoals && minimumGoals >= filters.minimumHeadToHeadGoals){
            return true;
          }
        }
      });
    }

    if(filters.homeTeamMinimumGoals){
      results = results.filter(e => {
        if(e?.additional_data){
          const matches = e?.additional_data.home_team_table_data;
          const goals = Object.keys(matches).map(date => {
            const teams = matches[date];
            const homeTeam = Object.keys(teams)[0];
            return matches[date][homeTeam]
          });
          const minGoals = Math.min(...goals);
          if(filters.homeTeamMinimumGoals <= minGoals){
            return true
          }
        }
      });
    }

    if(filters.awayTeamMinimumGoals){
      results = results.filter(e => {
        if(e?.additional_data){
          const matches = e?.additional_data.away_team_table_data;
          const goals = Object.keys(matches).map(date => {
            const teams = matches[date];
            const awayTeam = Object.keys(teams)[1];
            return matches[date][awayTeam]
          });
          const minGoals = Math.min(...goals);
          if(filters.awayTeamMinimumGoals <= minGoals){
            return true
          }
        }
      });
    }

    if(filters.homeTeamMaximumGoals){
      results = results.filter(e => {
        if(e?.additional_data && e?.odds){
          const matches = e?.additional_data.head_to_head_table_data;
          const goals = Object.keys(matches).map(date => {
            const teams = matches[date];
            const homeTeam = Object.keys(teams)[0];
            return matches[date][homeTeam]
          });
          const maxGoals = Math.max(...goals);
          if(maxGoals <= filters.homeTeamMaximumGoals){
            return true
          }
        }
      });
    }

    if(filters.awayTeamMaximumGoals){
      results = results.filter(e => {
        if(e?.additional_data && e?.odds){
          const matches = e?.additional_data.head_to_head_table_data;
          const goals = Object.keys(matches).map(date => {
            const teams = matches[date];
            const awayTeam = Object.keys(teams)[1];
            return matches[date][awayTeam]
          });
          const maxGoals = Math.max(...goals);
          if(maxGoals <= filters.awayTeamMaximumGoals){
            return true
          }
        }
      });
    }

    if(filters.maxHeadToHeadGoals!==undefined){
      results = results.filter(e=>{
        if(e?.additional_data){
          const matches = Object.keys(e?.additional_data.head_to_head_table_data);
          const matchGoals = matches.map((match)=>{
            const matchData : any = e?.additional_data.head_to_head_table_data[match];
            const totalGoals : any = Object.keys(matchData).reduce((acc:number, item)=>{acc+=matchData[item]; return acc;}, 0);
            return totalGoals;
          })
          const mostGoals = Math.max(...matchGoals);
          if(mostGoals && mostGoals <= filters.maxHeadToHeadGoals){
            return true;
          }
        }
      });
    }
  
    return results;

  }
  
  return (
      <div className="w-full h-full overflow-hidden overflow-y-auto flex flex-wrap justify-center p-[2rem] gap-[2rem]">
        {getFilteredGames().map((item, key) => <Game {...item} key={key} />)}
      </div>
  )
}

export default function GamesGrid() {
  return (
    <RecoilRoot>
      <BottomNavigation />
      <Games />
    </RecoilRoot>
  )
}