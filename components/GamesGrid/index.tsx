'use client'

import { MatchData } from '@/types';
import { useState } from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import BottomNavigation from '../BottomSheet';
import {RecoilRoot, useRecoilState} from 'recoil';
import { filtersAtom, showMoreDetailsAtom } from '@/atoms';
import Loading from '../Loading';
import testJSON from './test.json';
import {Swiper, SwiperSlide} from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import { EffectCoverflow } from 'swiper/modules';

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

  const [showMoreDetails] = useRecoilState(showMoreDetailsAtom);

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
      <div className='game flex w-full text-[0.8rem] opacity-[0.3] gap-[0.5rem]'>
        <div>{matchData.date?.split('.')[0]} {matchData.date && getMonth(parseInt(matchData.date?.split('.')[1]))}</div>
        <div>|</div>
        <div>{convertTo12HourFormat(matchData.time)}</div>
      </div>
    )

  }

  const GameOdds = () => {
    const [showMoreDetails] = useRecoilState(showMoreDetailsAtom);
    return (
      <div className={`flex gap-[3rem] ${showMoreDetails && 'mt-[1.5rem]'}`}>
        {Object.keys(matchData.odds).map((item, key) => (
          <div className='flex flex-col items-center justify-between gap-[0.5rem] w-full' key={key}>
            <div className={`text-center game-team ${item === "Draw" ? 'opacity-[0.15]' : ''}`}>{item === "Draw" ? "x" : item}</div>
            {showMoreDetails && <div className="flex flex-col items-center opacity-[0.5]"><span className="opacity-[0.75]">{matchData.odds[item]}</span></div>}
          </div>
        ))}
      </div>
    )
  }

  const LastScore = ({table_data, defaultShowAmount=4}: {
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
    }[], 
    defaultShowAmount?: number
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
              <div className="flex items-center gap-[1rem] bg-primary-700 py-[0.5rem] px-[1rem] rounded-[0.5rem]">
                <div>{home.team}</div>
                <div
                  className={`last-match-goals h-[2rem] min-w-[2rem] flex items-center justify-center text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white ${isHomeTeamGreater ? 'bg-green-400' : 'bg-primary-700'}`}
                >
                  {homeGoals}
                </div>
              </div>
              <div className="flex items-center gap-[1rem] bg-primary-700 py-[0.5rem] px-[1rem] rounded-[0.5rem]">
                <div>{away.team}</div>
                <div
                  className={`last-match-goals h-[2rem] min-w-[2rem] flex items-center justify-center text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white ${!isHomeTeamGreater ? 'bg-green-400' : 'bg-primary-700'}`}
                >
                  {awayGoals}
                </div>
              </div>
          </div>
        </div>
      )
    }

    const [showMore, setShowMore] = useState(false);
  
    return (
      <div className="flex flex-col gap-[1rem]">
        {table_data.slice(0, showMore ? table_data.length : defaultShowAmount).map((item, key) => <Score key={key} {...item} />)}
        <div onClick={()=>setShowMore(!showMore)} className='opacity-[0.5] cursor-pointer'>Show {showMore ? 'less' : 'more'}</div>
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
          if(formData.wins+formData.draws+formData.losses <= 4){
            return null;
          }
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

  if(!matchData.head_to_head_data.minMaxGoals.lowestTotalGoals.teams){
    return null;
  }

  const GoalStats = () => {
    const Stats = ({team, maxGoals, minGoals, avgGoals} : {team:string, maxGoals:number, minGoals:number, avgGoals:number|string}) => {
      const Stat = ({label, goals} : {label:string, goals:string|number}) => {
        return (
          <div className="w-full bg-primary-700 rounded-[0.5rem] p-[1rem] flex flex-col gap-[0.5rem] justify-between">
            <div className='text-[0.8rem]'>{label}</div>
            <div className='font-[700] text-[2.5rem]'>{goals}</div>
          </div>
        )
      }
      return (
        <div className='flex flex-col gap-[1rem]'>
          <div className='flex flex-col mt-[1.5rem] gap-[1rem]'>
            <div>{team}</div>
            <div className='flex gap-[1rem]'>
              <Stat label='Average Goals' goals={avgGoals} />
              <Stat label='Max Goals' goals={maxGoals} />
              <Stat label='Min Goals' goals={minGoals} />
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className='flex flex-col gap-[1rem]'>
        <Stats 
          team={matchData.home_team_data.minMaxGoals.highestTeamScore.team} 
          maxGoals={matchData.home_team_data.minMaxGoals.highestTeamScore.score} 
          minGoals={matchData.home_team_data.minMaxGoals.lowestTeamScore.score} 
          avgGoals={matchData.home_team_data.average_scored.goals} 
        />
        <Stats 
          team="Combined"
          maxGoals={matchData.head_to_head_data.minMaxGoals.highestTotalGoals.score} 
          minGoals={matchData.head_to_head_data.minMaxGoals.lowestTotalGoals.score} 
          avgGoals={matchData.head_to_head_data.average_scored.reduce((a, b) => a + b.goals, 0).toFixed(1)} 
        />
        <Stats 
          team={matchData.away_team_data.minMaxGoals.highestTeamScore.team}
          maxGoals={matchData.away_team_data.minMaxGoals.highestTotalGoals.score} 
          minGoals={matchData.away_team_data.minMaxGoals.lowestTotalGoals.score} 
          avgGoals={matchData.away_team_data.average_scored.goals} 
        />
      </div>
    )
  }
  
  return (
    <>
      <div className='game py-[1.5rem] w-full md:w-fit rounded-[1rem] bg-primary-600 border-x-2 shadow-md text-white border-gray-900 gap-[5rem] md:max-w-[25rem]'>
        <div className='flex flex-col gap-[1rem] px-[1.5rem]'>
            {showMoreDetails && <GameTime />}
            <GameOdds />
        </div>
        {showMoreDetails && <>
          <Swiper
            spaceBetween={50}
            slidesPerView={1}
            modules={[EffectCoverflow]}
            loop={true}
            effect='coverflow'
          >
            <SwiperSlide className='px-[1.5rem]'>
              <GoalStats />
            </SwiperSlide>
            <SwiperSlide className='px-[1.5rem]'>
              <div className="flex justify-between gap-[1rem] mb-[1rem]">
                <TeamForm form={matchData.home_team_data.form} />
                <TeamForm form={matchData.away_team_data.form} />
              </div>
              <Heading text="Head to Head" className='mb-[1rem]' />
              <LastScore table_data={matchData.head_to_head_table_data} />
            </SwiperSlide>
            <SwiperSlide className='px-[1.5rem]'>
              <div className="mt-[2rem]">
                <Heading text="Home" className='mb-[1rem]' />
                <LastScore table_data={matchData.home_team_table_data} defaultShowAmount={5} />
              </div>
            </SwiperSlide>
            <SwiperSlide className='px-[1.5rem]'>
              <div className="mt-[2rem]">
                <Heading text="Away" className='mb-[1rem]' />
                <LastScore table_data={matchData.away_team_table_data} defaultShowAmount={5} />
              </div>
            </SwiperSlide>
          </Swiper>
        </>}
      </div>
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

    let minimumMatches = 4;
    if(minimumMatches){
      results = results.filter(e=>e?.head_to_head_table_data && Object.keys(e.head_to_head_table_data).length >= minimumMatches);
    }

    // let minimumHomeCombinedGoals = 1;
    // if(minimumHomeCombinedGoals){
    //   results = results.filter(e=>e.home_team_data.minMaxGoals.lowestTotalGoals.score>=minimumHomeCombinedGoals)
    // }

    // let maxHomeCombinedGoals = 5;
    // if(maxHomeCombinedGoals){
    //   results = results.filter(e=>e.home_team_data.minMaxGoals.highestTotalGoals.score<=maxHomeCombinedGoals)
    // }

    // let minMaxHomeCombinedGoals = 5;
    // if(minMaxHomeCombinedGoals){
    //   results = results.filter(e=>e.home_team_data.minMaxGoals.highestTotalGoals.score>=minMaxHomeCombinedGoals)
    // }

    // let minimumHomeGoals = 1;
    // if(minimumHomeGoals){
    //   results = results.filter(e=>e.home_team_data.minMaxGoals.lowestTeamScore.score>=minimumHomeGoals)
    // }

    // let minimumAwayCombinedGoals = 1;
    // if(minimumAwayCombinedGoals){
    //   results = results.filter(e=>e.away_team_data.minMaxGoals.lowestTotalGoals.score>=minimumAwayCombinedGoals)
    // }

    // let maxAwayCombinedGoals = 5;
    // if(maxAwayCombinedGoals){
    //   results = results.filter(e=>e.away_team_data.minMaxGoals.highestTotalGoals.score<=maxAwayCombinedGoals)
    // }

    // let minMaxAwayCombinedGoals = 5;
    // if(minMaxAwayCombinedGoals){
    //   results = results.filter(e=>e.away_team_data.minMaxGoals.highestTotalGoals.score>=minMaxAwayCombinedGoals)
    // }

    // let minimumHomeGoals = 1;
    // if(minimumHomeGoals){
    //   results = results.filter(e=>e.home_team_data.minMaxGoals.lowestTeamScore.score>=minimumHomeGoals)
    // }

    // let minimumAwayGoals = 1;
    // if(minimumAwayGoals){
    //   results = results.filter(e=>e.away_team_data.minMaxGoals.lowestTeamScore.score>=minimumAwayGoals)
    // }

    // let maxHomeGoals = 2;
    // if(maxHomeGoals){
    //   results = results.filter(e=>e.home_team_data.minMaxGoals.highestTeamScore.score<=maxHomeGoals)
    // }

    // let maxAwayGoals = 2;
    // if(maxAwayGoals){
    //   results = results.filter(e=>e.away_team_data.minMaxGoals.highestTeamScore.score<=maxAwayGoals)
    // }

    let minMaxAwayGoals = 5;
    if(minMaxAwayGoals){
      results = results.filter(e=>e.away_team_data.minMaxGoals.highestTeamScore.score>=minMaxAwayGoals)
    }

    // let minMaxHomeGoals = 5;
    // if(minMaxHomeGoals){
    //   results = results.filter(e=>e.home_team_data.minMaxGoals.highestTeamScore.score>=minMaxHomeGoals)
    // }
    
    let minCombinedGoals = 1;
    if(minCombinedGoals){
      results = results.filter(e=>e.head_to_head_data.minMaxGoals.lowestTotalGoals.score>=minCombinedGoals)
    }
    
    // let maxCombinedGoals = 5;
    // if(maxCombinedGoals){
    //   results = results.filter(e=>e.head_to_head_data.minMaxGoals.highestTotalGoals.score<=maxCombinedGoals)
    // }
    
    // let minMaxCombinedGoals = 4;
    // if(minMaxCombinedGoals){
    //   results = results.filter(e=>e.head_to_head_data.minMaxGoals.highestTotalGoals.score>=minMaxCombinedGoals)
    // }

    // let maxOdds = 1.65;
    // if(maxOdds){
    //   results = results.filter(e=>Object.keys(e.odds).filter(odd=>e.odds[odd]<=maxOdds).length>0)
    // }

    // let minOdds = 1.7;
    // if(minOdds){
    //   results = results.filter(e=>Object.keys(e.odds).filter(odd=>e.odds[odd]>=minOdds).length>2)
    // }
  
    return results;

  }
  
  return (
      <div className="w-full h-full overflow-hidden overflow-y-auto flex flex-wrap justify-center pb-[5rem] md:pb-[6rem] p-[1rem] md:p-[2rem] gap-[1rem] md:gap-[2rem]">
        {getFilteredGames().map((item, key) => <Game {...item} key={key} />)}
      </div>
  )
}

export default function GamesGrid() {
  return (
    <RecoilRoot>
      <Games />
      <BottomNavigation />
    </RecoilRoot>
  )
}