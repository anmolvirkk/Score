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
            <div className="flex flex-col items-center"><span className="opacity-[0.75]">{matchData.odds[item]}</span></div>
          </div>
        ))}
      </div>
    )
  }

  const LastScore = () => {

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
          <div className="flex mb-2 items-center justify-between">
              <div
                className={`last-match-goals text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white ${isHomeTeamGreater ? 'bg-green-400' : 'bg-primary-700'}`}
              >
                {homeGoals}
              </div>
              <div
                className={`last-match-goals text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white ${!isHomeTeamGreater ? 'bg-green-400' : 'bg-primary-700'}`}
              >
                {awayGoals}
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
      <div>
        <Heading text="Last Score" />
        <div className="flex flex-col gap-[1rem]">
          {matchData.head_to_head_table_data.map((item, key) => <Score key={key} {...item} />)}
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
          {Object.keys(matchData.head_to_head_data.form).map((item, key) => {
            const form = matchData.head_to_head_data.form[item];
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
    const Prediction = () => {
      const winner : any = matchData.head_to_head_data.prediction.winner;
      const goals = matchData.head_to_head_data.prediction.goals;
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
    const HeadToHead = () => {
      const head_to_head_table_data = matchData.head_to_head_table_data;
      const Team = ({team, score}:{team: any, score:any}) => <div className='text-[1rem] font-[700] mt-[1rem] flex items-center gap-[0.5rem]'>{team}<span className="bg-primary-700 p-[0.5rem]">{score}</span> </div>
      return (
        <div className="flex flex-wrap gap-[1rem] justify-center">
          {/* {Object.keys(head_to_head_table_data).map((item, key) => {
            const homeTeam = Object.keys(head_to_head_table_data[item])[0];
            const awayTeam = Object.keys(head_to_head_table_data[item])[1];
            const formattedDate = `${item.split('.')[0]} ${getMonth(parseInt(item.split('.')[1]))} ${item.split('.')[2]}`;
            return (
              <div key={key} className='rounded-[1rem] p-[1rem] flex flex-col items-center'>
                <div className="opacity-[0.3]">{formattedDate}</div>
                <div className='text-[1rem] font-[700] mt-[1rem] flex items-center gap-[1rem] justify-center'><Team team={homeTeam} score={head_to_head_table_data[item][homeTeam]} /><Team team={awayTeam} score={head_to_head_table_data[item][awayTeam]} /></div>
              </div>
            )
          })} */}
        </div>
      )
    }
    const LatestGoals = () => {
      const thresholds = matchData.head_to_head_data.thresholds;
      return (
        <div className="flex flex-col gap-[0.5rem]">
          {thresholds.map((item, key) => {
              // @ts-ignore
              return (
                <div key={key} className="flex justify-between items-center">
                  <div className='w-[10rem]'>
                    <div className='opacity-[0.35]'>Over</div>
                    <div className="text-[2rem] font-[700]">{item.threshold}</div>
                  </div>
                  <div className="flex h-[5rem]">
                    {item.teams?.map((item:any, key:number) => {
                      let color = "bg-green-400";
                      const num = parseInt(item.percentage_over_threshold.replace("%", ""));
                      if(num <= 40){
                        color = "bg-red-600";
                      }else if(num <= 60){
                        color = "bg-orange-600";
                      }else if(num <= 80){
                        color = "bg-amber-400";
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

    // return (
    //   <div key={key} className="flex flex-col gap-[1rem] mt-[1rem]">
    //     <div className="opacity-[0.35]">{capitalize(item)}</div>
    //     <div className="flex items-center justify-between">
    //       {Object.keys(teamsData).map((item, key) => {
    //         return <div key={key} className="text-[2rem] font-[700] w-[9rem] py-[1rem] px-[2rem] rounded-[0.5rem] bg-primary-700">{teamsData[item]}</div>
    //       })}
    //     </div>
    //   </div>
    // )
    const getCommonTeam = (data:any) => {
      
      const firstDate = Object.keys(data)[0];
      const secondDate = Object.keys(data)[1];
      const firstDateTeams = Object.keys(data[firstDate]);
      const secondDateTeams = Object.keys(data[secondDate]);

      const commonTeam = firstDateTeams.filter(team => secondDateTeams.includes(team))[0];
      return commonTeam;

    }

    const HomeTeamData = () => {
      const home_team_table_data = matchData.home_team_table_data;
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
      const away_team_table_data = matchData.away_team_table_data;
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

    return (
      <>
        {/* <Heading text="Team Comparison" className="mb-[1rem] mt-[1rem]" />
        <TeamComparison /> */}
        <Heading text="Prediction" className="mb-[1rem] mt-[1rem]" />
        <Prediction />
        <Heading text="Goals" className="mb-[1rem] mt-[1rem]" />
        <LatestGoals />
        {/* <Heading text="Head to Head" className="mb-[1rem] mt-[2.5rem]" />
        <HeadToHead /> */}
        {/* <Heading text="Power Rank" className="mb-[1rem] mt-[1rem]" />
        <PowerRank /> */}
        {/* <Heading text="Home Team Data" className="mb-[1rem] mt-[1rem]" />
        <HomeTeamData />
        <Heading text="Away Team Data" className="mb-[1rem] mt-[1rem]" />
        <AwayTeamData />
        <Heading text="Overall Standings" className="mb-[1rem] mt-[1rem]" />
        <OverallStanding /> */}
      </>
    )
  }

  return (
    <div className='game p-[2rem] rounded-[1rem] bg-primary-600 border-x-2 shadow-md text-white border-gray-600 max-w-[25rem] sm:min-w-[25rem] w-[calc(100%-3rem)] sm:w-[calc(25%-8rem)]'>
      {/* <GameTime /> */}
      <GameOdds />
      <LastScore />
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

    let predictionGoalsUnder = 3.5;
    if(predictionGoalsUnder){
      results = results.filter(e=>e?.head_to_head_data?.prediction?.goals?.under && e.head_to_head_data.prediction.goals.under <= predictionGoalsUnder);
    }

    let minimumMatches = 4;
    if(minimumMatches){
      results = results.filter(e=>e?.head_to_head_table_data && Object.keys(e.head_to_head_table_data).length >= minimumMatches);
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