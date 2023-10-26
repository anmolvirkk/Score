'use client'

import { MatchData } from '@/types';
import { useEffect, useRef, useState } from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import BottomNavigation from '../BottomSheet';
import {RecoilRoot} from 'recoil';
import { useRecoilState } from 'recoil';
import { minimumGoalsLastMatchAtom, searchAtom } from '@/atoms';
import Loading from '../Loading';
import testJSON from './test.json';

const Game = (matchData : MatchData) => {

  if(!matchData || !matchData?.date || !matchData?.time){
    return null;
  }

  const Heading = ({text, className=""}:{text: string, className?: string}) => {
    return <div className={`bg-primary-700 text-center p-[0.5rem] rounded-[0.5rem] mb-[0.5rem] ${className}`}>{text}</div>
  }

  const GameTime = () => {

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

    const convertTo12HourFormat = (time24 : string) => {
      const [hour, minute] = time24.split(':');
      
      const isPM = parseInt(hour) >= 12;
      
      const hour12 = (parseInt(hour) % 12) || 12;
      
      const period = isPM ? 'PM' : 'AM';
      const time12 = `${hour12}:${minute} ${period}`;
      
      return time12;
    }

    return (
      <div className='flex w-full opacity-[0.5] gap-[0.5rem] py-[2rem]'>
        <div>{matchData.date.split('.')[0]} {matchData.date && getMonth(parseInt(matchData.date.split('.')[1]))}</div>
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
  
    const totalGoals = matchData.lastScore.reduce((acc, item) => acc + item.goals, 0);
  
    const isTeamAGreater = matchData.lastScore[0].goals > matchData.lastScore[1].goals;
  
    return (
      <div>
        <Heading text="Last Score" />
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            {matchData.lastScore.map((item, key) => (
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
            {matchData.lastScore.map((item, key) => (
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
              label={({ dataEntry } : {dataEntry : any}) => dataEntry?.value > 0 && dataEntry?.value + ' ' + dataEntry?.title.slice(0, 1)}
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
                <div>Wins - {gamesData[team].draws}</div>
                <div>Wins - {gamesData[team].losses}</div>
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
                <div>Wins - {gamesData[team].draws}</div>
                <div>Wins - {gamesData[team].losses}</div>
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
      const winner = matchData.additional_data.predictions_table_data.winner;
      const goals = matchData.additional_data.predictions_table_data.goals;
      const score = matchData.additional_data.predictions_table_data.score;
      return (
        <div className="flex flex-col gap-[1rem]">
          <div>Winner - {winner.team} | Confidence - {winner.confidence}</div>
          <div>Goals - {goals}</div>
          <div>Score | {score.winner} - {score.loser}</div>
        </div>
      )
    }
    const HeadToHead = () => {
      const head_to_head_table_data = matchData.additional_data.head_to_head_table_data;
      return Object.keys(head_to_head_table_data).map((item, key) => {
        const homeTeam = Object.keys(head_to_head_table_data[item])[0];
        const awayTeam = Object.keys(head_to_head_table_data[item])[1];
        return (
          <div key={key}>
            <div>Date - {item}</div>
            <div>{homeTeam} - {head_to_head_table_data[item][homeTeam]}</div>
            <div>{awayTeam} - {head_to_head_table_data[item][awayTeam]}</div>
          </div>
        )
      })
    }
    const LatestGoals = () => {
      const latest_games_goals_table_data = matchData.additional_data.latest_games_goals_table_data;
      return Object.keys(latest_games_goals_table_data).map((item, key) => {
        // @ts-ignore
        const teamsData = latest_games_goals_table_data[item];
        return (
          <div key={key}>
            <div>Goals - {item}</div>
            <div>{Object.keys(teamsData).map((item, key) => {
              return (
                <div key={key}>{item} - {teamsData[item]}</div>
              )
            })}</div>
          </div>
        )
      })
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
    const HomeTeamData = () => {
      const home_team_table_data = matchData.additional_data.home_team_table_data;
      return (
        <div>
          {Object.keys(home_team_table_data).map((item, key)=>{
            const teams = home_team_table_data[item];
            return (
              <div key={key}>
                <div>Date - {item}</div>
                <div>{Object.keys(teams).map((item, key)=>{
                  return (
                    <div key={key}>{item} - {teams[item]}</div>
                  )
                })}</div>
              </div>
            )
          })}
        </div>
      )
    }
    const AwayTeamData = () => {
      const away_team_table_data = matchData.additional_data.away_team_table_data;
      return (
        <div>
          {Object.keys(away_team_table_data).map((item, key)=>{
            const teams = away_team_table_data[item];
            return (
              <div key={key}>
                <div>Date - {item}</div>
                <div>{Object.keys(teams).map((item, key)=>{
                  return (
                    <div key={key}>{item} - {teams[item]}</div>
                  )
                })}</div>
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
        <Heading text="Team Comparison" className="mb-[1rem] mt-[1rem]" />
        <TeamComparison />
        <Heading text="Prediction" className="mb-[1rem] mt-[1rem]" />
        <Prediction />
        <Heading text="Head to Head" className="mb-[1rem] mt-[1rem]" />
        <HeadToHead />
        <Heading text="Latest Goals" className="mb-[1rem] mt-[1rem]" />
        <LatestGoals />
        <Heading text="Power Rank" className="mb-[1rem] mt-[1rem]" />
        <PowerRank />
        <Heading text="Home Team Data" className="mb-[1rem] mt-[1rem]" />
        <HomeTeamData />
        <Heading text="Away Team Data" className="mb-[1rem] mt-[1rem]" />
        <AwayTeamData />
        <Heading text="Overall Standings" className="mb-[1rem] mt-[1rem]" />
        <OverallStanding />
      </>
    )
  }
  
  return (
    <div className='game m-[0] my-[1.5rem] sm:m-[2rem] p-[2rem] rounded-[1rem] bg-primary-600 border-x-2 shadow-md text-white border-gray-600 max-w-[25rem] sm:min-w-[25rem] w-[calc(100%-3rem)] sm:w-[calc(25%-8rem)]'>
      <GameTime />
      <GameOdds />
      <LastScore />
      <TeamForm />
      <AdditionalData />
    </div>
  )
}

const Games = () => {

  const testData : any = testJSON;

  const [gamesData, setGamesData] = useState<MatchData[] | null>(testData);

  // const getGamesData = async () => {
  //   const response = await fetch('/api/games');
  //   if(response && response.ok){
  //     const gamesData : any = await response.json();
  //     if(gamesData){
  //       setGamesData(gamesData);
  //     }
  //   }
  // }

  // if(!gamesData){
  //   getGamesData();
  // }

  const isotope = useRef<any>();

  useEffect(() => {
    if(window !== undefined && gamesData && gamesData.length > 0 && isotope.current){
      const Isotope = require('isotope-layout');
      isotope.current = new Isotope('.games', {
        itemSelector: '.game',
        layoutMode: 'fitRows'
      });
      return () => isotope.current?.destroy();
    }
  }, [gamesData]);

  useEffect(() => {
    if(window !== undefined && gamesData && gamesData.length > 0){
      const resizeContainer = () => {
        const gamesContainer : HTMLDivElement | null = document.querySelector('.games');
        if(gamesContainer){
          gamesContainer.style.width = '100%';
        }
        const resize = () => {
          const games = document.querySelectorAll('.game');
          if(gamesContainer && games && games.length > 0){
            let gameWidth = 0;
            let previousPositionTop = getComputedStyle(games[0]).getPropertyValue('top'); 
            for(let i = 0; i < 6; i++){
              const game = games[i];
              const positionTop = getComputedStyle(game).getPropertyValue('top');
              if(previousPositionTop === positionTop){
                const positionLeft = parseInt(getComputedStyle(game).getPropertyValue('left'));
                const margin = parseInt(getComputedStyle(game).getPropertyValue('margin'))*2;
                gameWidth = positionLeft + game.clientWidth + margin;
              }
            }
            const containerPadding = parseInt(getComputedStyle(gamesContainer).getPropertyValue('padding'));
            const finalWidth = gameWidth + containerPadding;
            if(window.innerWidth > 480){
              gamesContainer.style.width = (finalWidth) + 'px';
            }else{
              gamesContainer.style.width = '100%';
            }
          }
        }
        setTimeout(resize, 3000);
      }
      window.addEventListener('resize', () => {
        resizeContainer();
      });
      resizeContainer();   
    } 
  }, [gamesData])

  const [search] = useRecoilState(searchAtom);

  useEffect(() => {
    if(isotope.current  && gamesData && gamesData.length > 0){
      isotope.current.arrange({filter: (item:any) => {
        const teamNames = item.querySelectorAll('.game-team');
        if(teamNames){
          let matchFound = false;
          for(let i = 0; i < teamNames.length; i++){
            const teamName = teamNames[i];
            if(teamName.textContent?.toLowerCase().includes(search.toLowerCase())){
              matchFound = true;
              break;
            }
          }
          return matchFound;
        }
      }})
    }
  }, [search, gamesData])

  const [minimumGoalsLastMatchValue] = useRecoilState(minimumGoalsLastMatchAtom);

  useEffect(() => {
    if(isotope.current  && gamesData && gamesData.length > 0){
      isotope.current.arrange({filter: (item:any) => {
        const lastMatchGoals = item.querySelectorAll('.last-match-goals');
        if(lastMatchGoals){
          let matchFound = false;
          const totalGoals = lastMatchGoals.map((goal:any) => Number.parseInt(goal.textContent?.substring(0, 1))).reduce((a:number, b:number)=> a + b);
          if(minimumGoalsLastMatchValue <= totalGoals){
            matchFound = true;
          }
          return matchFound;
        }
      }})
    }
  }, [minimumGoalsLastMatchValue, gamesData])
    
  if(!gamesData || gamesData?.length === 0){
    return <Loading />;
  }
  
  return (
    <div className='games p-[1.5rem] sm:p-[3rem] w-full mx-auto'>
        {gamesData.map((game : MatchData, key : number) =><Game key={key} {...game} />)}
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