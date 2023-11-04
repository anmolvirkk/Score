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
      <div className='game flex w-full opacity-[0.5] gap-[0.5rem]'>
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
            <div className="flex flex-col items-center"><span className="opacity-[0.75]">{matchData.odds[item]}</span></div>
          </div>
        ))}
      </div>
    )
  }

  const LastScore = ({table_data}: {
    table_data: {
      date: string;
      home: {
        team: string;
        score: number;
      };
      away: {
        team: string;
        score: number;
      };
    }[]
  }) => {

    const Score = ({date, home, away} : {
      date: string;
      home: {
        team: string;
        score: number;
      };
      away: {
        team: string;
        score: number;
      };
    }) => {
      const homeGoals = home.score;
      const awayGoals = away.score;
  
      const totalGoals = homeGoals + awayGoals;
    
      const isHomeTeamGreater = homeGoals > awayGoals;
      return (
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between gap-[0.5rem]">
              <div className="flex gap-[1rem] bg-primary-700 py-[0.5rem] px-[1rem] rounded-[0.5rem]">
                <div>{home.team}</div>
                <div
                  className={`last-match-goals text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white ${isHomeTeamGreater ? 'bg-green-400' : 'bg-primary-700'}`}
                >
                  {homeGoals}
                </div>
              </div>
              <div className="flex gap-[1rem] bg-primary-700 py-[0.5rem] px-[1rem] rounded-[0.5rem]">
                <div>{away.team}</div>
                <div
                  className={`last-match-goals text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white ${!isHomeTeamGreater ? 'bg-green-400' : 'bg-primary-700'}`}
                >
                  {awayGoals}
                </div>
              </div>
          </div>
          <div className="flex h-2 overflow-hidden rounded">
              <div
                className={`flex flex-col text-center whitespace-nowrap text-white justify-center ${isHomeTeamGreater ? 'bg-green-400' : 'bg-primary-700'}`}
                style={{
                  width: `${(homeGoals / totalGoals) * 100}%`,
                }}
              />
              <div
                className={`flex flex-col text-center whitespace-nowrap text-white justify-center ${!isHomeTeamGreater ? 'bg-green-400' : 'bg-primary-700'}`}
                style={{
                  width: `${(awayGoals / totalGoals) * 100}%`,
                }}
              />
          </div>
        </div>
      )
    }
  
    return (
      <div className="flex flex-col gap-[1rem]">
        {table_data.map((item, key) => <Score key={key} {...item} />)}
      </div>
    );
  };

  const TeamForm = ({form} : {
    form: {
      [team: string]: {
        wins: number;
        losses: number;
        draws: number;
      };
    }
  }) => {
    if(typeof window === undefined || !form){
      return null;
    }
    return (
      <div className="flex justify-between gap-[2rem]">
        {Object.keys(form).map((item, key) => {
          const formData = form[item];
          const data = [
            {title: 'Wins', value: formData.wins, color: "#00D26A"},
            {title: 'Draws', value: formData.draws, color: "rgb(50,50,60)"},
            {title: 'Losses', value: formData.losses, color: "rgb(30,30,40)"}
          ];
          return (
            <div key={key} className="flex flex-col items-center justify-center">
              <PieChart 
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
                    fill: "white"
                  }
                }}
              />
              <div className="opacity-[0.5] text-[0.8rem]">{item}</div>
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

  const Prediction = ({goals, winner} : {
    goals: {
      over: null | number;
      under: null | number;
    };
    winner: null | {
      team: string;
      confidence: string;
    };
  }) => {
    let confidenceColor = "border-green-400 text-green-400";
    if(winner){
      const confidence = parseInt(winner.confidence.replace('%', ''));
      if(confidence <= 40){
        confidenceColor = "border-red-600 text-red-600"
      }else if(confidence <= 60){
        confidenceColor = "border-orange-600 text-orange-600"
      }else if(confidence <= 80){
        confidenceColor = "border-amber-400 text-amber-400"
      }
    }
    if(winner || goals){
      return (
        <>
          {winner && <div className="flex flex-col gap-[1rem]">
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
        </div>}
          <div className="flex flex-col gap-[1rem]">
          <div className="flex justify-between items-center">
            {goals.over &&
              <div>
                <div className="opacity-[0.35]">Over</div>
                <div className="text-[1.5rem] font-[700]">{goals.over}</div>
              </div>}
            {goals.under &&
              <div>
                <div className="opacity-[0.35]">Under</div>
                <div className="text-[1.5rem] font-[700]">{goals.under}</div>
              </div>}
          </div>
        </div>
        </>
      )
    }
    return null
  }
  
  const LatestGoals = ({average_scored, thresholds} : {
    average_scored: {
      [team: string]: number;
    };
    thresholds: {
      threshold: number;
      teams: {
        team: string;
        matches_over_threshold: number;
        percentage_over_threshold: string;
      }[];
    }[]
  }) => {
    const Thresholds = () => {
      return (
        <div className="flex flex-col gap-[0.5rem] pt-[2.5rem]">
          {thresholds.map((item, key) => {
              // @ts-ignore
              return (
                <div key={key} className="flex justify-between items-center">
                  <div className='w-[10rem]'>
                    <div className='opacity-[0.35]'>Over</div>
                    <div className="text-[2rem] font-[700]">{item.threshold}</div>
                  </div>
                  <div className="flex h-[5rem]">
                    {item.teams?.map((item:any, index:number) => {
                      let color = "bg-green-400";
                      const num = parseInt(item.percentage_over_threshold.replace("%", ""));
                      if(num <= 40){
                        color = "bg-red-600";
                      }else if(num <= 60){
                        color = "bg-orange-600";
                      }else if(num <= 80){
                        color = "bg-amber-400";
                      }
                      if(key === 0){
                        return (
                          <div key={index} className="flex flex-col h-full relative">
                            <div className="opacity-[0.3] absolute top-[-2.5rem]">{item.team}</div>
                            <div className="relative flex items-center justify-center w-[7rem] h-full">
                              <div className='p-[1rem] absolute z-[1]'>{item.percentage_over_threshold}</div>
                              <div className={`absolute top-[0] w-full h-full ${color}`}></div>
                            </div>
                          </div>
                        )
                      }
                      return (
                        <div key={key} className="relative flex items-center justify-center w-[7rem] h-full">
                          <div className='p-[1rem] absolute z-[1]'>{item.percentage_over_threshold}</div>
                          <div className={`absolute top-[0] w-full h-full ${color}`}></div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
          })}
        </div>
      )
    }
    const AverageScored = () => {
      return (
        <div className="flex gap-[0.5rem]">
          {Object.keys(average_scored).map((item, key)=>{
            return (
              <div key={key} className="p-[1rem] rounded-[1rem] bg-primary-700 w-full flex flex-col justify-between">
                <div className="opacity-[0.5] text-[0.8rem]">{capitalize(item)}</div>
                <div className="font-[700] text-[2rem]">{average_scored[item]}</div>
              </div>
            )
          })}
        </div>
      )
    }
    return (
      <>
        <Thresholds />
        <Heading text="Average Scored" className="mb-[1rem] mt-[1.5rem]" />
        <AverageScored />
      </>
    )
  }

  const PowerScale = ({goalScale, winScale, lossScale, drawScale, averageScoredScale, thresholdScale, team1, team2} : {
    goalScale: number,
    winScale: number,
    lossScale: number,
    drawScale: number,
    averageScoredScale: number,
    thresholdScale: number,
    team1: string;
    team2: string;
  }) => {
    const Scale = ({label, number}:any) => {
      return (
        <div className="p-[1rem] w-full h-[8rem] bg-primary-700 rounded-[1rem] flex justify-center flex-col">
          <div className="text-[0.8rem] opacity-[0.5]">{label}</div>
          <div className="text-[2rem] font-[700]">{number || 'N/A'}</div>
        </div>
      )
    }
    return (
      <div className="grid grid-cols-2 justify-center gap-[1rem] pt-[0.5rem]">
        <div>
          <div className="text-[0.8rem] opacity-[0.5]">Team 1</div>
          <div className="text-[1.5rem] font-[700]">{team1}</div>
        </div>
        <div>
          <div className="text-[0.8rem] opacity-[0.5]">Team 2</div>
          <div className="text-[1.5rem] font-[700]">{team2}</div>
        </div>
        <Scale label="Threshold" number={thresholdScale} />
        <Scale label="Goals" number={goalScale} />
        <Scale label="Wins" number={winScale} />
        <Scale label="Losses" number={lossScale} />
        <Scale label="Draws" number={drawScale} />
        <Scale label="Average Score" number={averageScoredScale} />
      </div>
    )
  }
  
  const TotalScore = ({goals}:{
    goals: {
      [team: string]: number;
      total: number;
    }
  }) => {
    const teams = Object.keys(goals);
    return (
      <div className="flex gap-[0.5rem]">
        {teams.map((item, key)=>{
          return (
            <div key={key} className="p-[1rem] rounded-[1rem] bg-primary-700 w-full flex flex-col justify-between">
              <div className="opacity-[0.5] text-[0.8rem]">{capitalize(item)}</div>
              <div className="font-[700] text-[2rem]">{goals[item]}</div>
            </div>
          )
        })}
      </div>
    )
  }
  
  return (
    <>
      <div className='game p-[2rem] rounded-[1rem] bg-primary-600 border-x-2 shadow-md text-white border-gray-900 flex gap-[5rem] max-w-[90vw] overflow-x-auto'>
        <div className="w-[20rem]">
          <GameTime />
          <GameOdds />
          <Heading text="Power Scale" className="mb-[1rem]" />
          <PowerScale {...matchData.head_to_head_data.powerScale} />
        </div>
        <div>
          <Heading text="Prediction" className="mb-[1rem]" />
          <Prediction goals={matchData.head_to_head_data.prediction.goals} winner={matchData.head_to_head_data.prediction.winner} />
          <Heading text="Goals" className="mb-[1rem] mt-[1rem]" />
          <LatestGoals average_scored={matchData.head_to_head_data.average_scored} thresholds={matchData.head_to_head_data.thresholds} />
        </div>
        <div>
          <Heading text="Team Form" className="mb-[0.5rem]" />
          <TeamForm form={matchData.head_to_head_data.form} />
          <Heading text="Last Score" className="mb-[1rem] mt-[1rem]" />
          <LastScore table_data={matchData.head_to_head_table_data} />
          <Heading text="Total Score" className="mb-[1rem] mt-[1.5rem]" />
          <TotalScore goals={matchData.head_to_head_data.goals} />
        </div>
      </div>
      {/* <div className='flex overflow-x-auto w-full'>
        {matchData.home_team_data.map((item, key) => {
          return (
            <div key={key} className='game p-[2rem] rounded-[1rem] bg-primary-600 border-x-2 shadow-md text-white border-gray-900 flex gap-[5rem] max-w-[90vw]'>
              <div className="w-[20rem]">
                <GameTime />
                <GameOdds />
                <Heading text="Power Scale" className="mb-[1rem]" />
                <PowerScale {...item.powerScale} />
              </div>
              <div>
                <Heading text="Prediction" className="mb-[1rem]" />
                <Prediction goals={item.prediction.goals} winner={item.prediction.winner} />
                <Heading text="Goals" className="mb-[1rem] mt-[1rem]" />
                <LatestGoals average_scored={item.average_scored} thresholds={item.thresholds} />
              </div>
              <div>
                <Heading text="Team Form" className="mb-[0.5rem]" />
                <TeamForm form={item.form} />
                <Heading text="Last Score" className="mb-[1rem] mt-[1rem]" />
                <LastScore table_data={matchData.home_team_table_data} />
                <Heading text="Total Score" className="mb-[1rem] mt-[1.5rem]" />
                <TotalScore goals={item.goals} />
              </div>
            </div>
          )
        })}
      </div>
      <div className='flex overflow-x-auto w-full'>
        {matchData.away_team_data.map((item, key) => {
          return (
            <div key={key} className='game p-[2rem] rounded-[1rem] bg-primary-600 border-x-2 shadow-md text-white border-gray-900 flex gap-[5rem] max-w-[90vw]'>
              <div className="w-[20rem]">
                <GameTime />
                <GameOdds />
                <Heading text="Power Scale" className="mb-[1rem]" />
                <PowerScale {...item.powerScale} />
              </div>
              <div>
                <Heading text="Prediction" className="mb-[1rem]" />
                <Prediction goals={item.prediction.goals} winner={item.prediction.winner} />
                <Heading text="Goals" className="mb-[1rem] mt-[1rem]" />
                <LatestGoals average_scored={item.average_scored} thresholds={item.thresholds} />
              </div>
              <div>
                <Heading text="Team Form" className="mb-[0.5rem]" />
                <TeamForm form={item.form} />
                <Heading text="Last Score" className="mb-[1rem] mt-[1rem]" />
                <LastScore table_data={matchData.away_team_table_data} />
                <Heading text="Total Score" className="mb-[1rem] mt-[1.5rem]" />
                <TotalScore goals={item.goals} />
              </div>
            </div>
          )
        })}
      </div> */}
    </>
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
  
  const [filters] = useRecoilState(filtersAtom);
    
  if(!gamesData || gamesData?.length === 0){
    return <Loading />;
  }

  const getFilteredGames = () => {

    let results = gamesData;

    if(filters.search){
      results = results.filter(e=>Object.keys(e?.odds).some(e=>e?.toLowerCase().includes(filters.search.toLowerCase())));
    }

    let showOnlyPredictions = true;
    if(showOnlyPredictions){
      results = results.filter(e=>e?.head_to_head_data.prediction.goals?.over || e?.head_to_head_data.prediction.goals?.under || e?.head_to_head_data.prediction.winner);
    }

    let predictionGoalsUnderHeadToHead = 5.5;
    if(predictionGoalsUnderHeadToHead){
      results = results.filter(e=>e?.head_to_head_data?.prediction?.goals?.under && e.head_to_head_data.prediction.goals.under <= predictionGoalsUnderHeadToHead);
    }

    let predictionGoalsUnderHomeTeam = 5.5;
    if(predictionGoalsUnderHomeTeam){
      results = results.filter(e=>{
        const all_home_team_data = e.home_team_data;
        let maxPredictionUnder = null;
        for(let i = 0; i < all_home_team_data.length; i++){
          const home_team_data = all_home_team_data[i];
          const predictionUnder = home_team_data.prediction?.goals?.under;
          if(predictionUnder){
            if(maxPredictionUnder){
              maxPredictionUnder = Math.max(maxPredictionUnder, predictionUnder);
            }else{
              maxPredictionUnder = predictionUnder;
            }
          }
        }
        if(maxPredictionUnder && maxPredictionUnder <= predictionGoalsUnderHomeTeam){
          return true;
        }
      })
    }


    let predictionGoalsUnderAwayTeam = 5.5;
    if(predictionGoalsUnderAwayTeam){
      results = results.filter(e=>{
        const all_away_team_data = e.away_team_data;
        let maxPredictionUnder = null;
        for(let i = 0; i < all_away_team_data.length; i++){
          const away_team_data = all_away_team_data[i];
          const predictionUnder = away_team_data.prediction?.goals?.under;
          if(predictionUnder){
            if(maxPredictionUnder){
              maxPredictionUnder = Math.max(maxPredictionUnder, predictionUnder);
            }else{
              maxPredictionUnder = predictionUnder;
            }
          }
        }
        if(maxPredictionUnder && maxPredictionUnder <= predictionGoalsUnderAwayTeam){
          return true;
        }
      })
    }

    // let predictionGoalsOver = 2.5;
    // if(predictionGoalsOver){
    //   results = results.filter(e=>e?.head_to_head_data?.prediction?.goals?.over && e.head_to_head_data.prediction.goals.over >= predictionGoalsOver);
    // }

    let minimumMatches = 4;
    if(minimumMatches){
      results = results.filter(e=>e?.head_to_head_table_data && Object.keys(e.head_to_head_table_data).length >= minimumMatches);
    }

    // let powerScaleHeadToHead = [-20,20];
    // if(powerScaleHeadToHead){
    //   results = results.filter(e=>e?.head_to_head_data.powerScale.thresholdScale >= powerScaleHeadToHead[0] && e?.head_to_head_data.powerScale.thresholdScale <= powerScaleHeadToHead[1]);
    // }
  
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