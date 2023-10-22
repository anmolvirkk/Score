'use client'

import { MatchData } from '@/types';
import gamesJSON from '../../test.json';
import Isotope from 'isotope-layout';
import { useEffect, useRef } from 'react';
import { PieChart } from 'react-minimal-pie-chart';

const Game = (matchData : MatchData) => {

  const Heading = ({text}:{text: string}) => {
    return <div className="bg-primary-700 text-center p-[0.5rem] rounded-[0.5rem] mb-[0.5rem]">{text}</div>
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
      <div className='flex gap-[3rem] my-[2rem]'>
        {Object.keys(matchData.odds).map((item, key) => (
          <div className='flex flex-col items-center justify-between gap-[0.5rem] w-full' key={key}>
            <div className='text-center'>{item}</div>
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
                className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
                  isTeamAGreater ? (key === 0 ? 'text-white bg-[#00D26A]' : 'text-teal-600 bg-teal-200') : (key === 0 ? 'text-teal-600 bg-teal-200' : 'text-white bg-[#00D26A]')
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
                  isTeamAGreater ? (key === 0 ? 'bg-[#00D26A]' : 'bg-teal-200') : (key === 0 ? 'bg-teal-200' : 'bg-[#00D26A]')
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
  
  return (
    <div className='game m-[0] my-[1.5rem] sm:m-[2rem] p-[2rem] rounded-[1rem] bg-primary-600 border-x-2 shadow-md text-white border-gray-600 w-[calc(100%-3rem)] sm:w-[calc(100%-10rem)] md:w-[80%] lg:w-[40%] xl:w-[27%] 2xl:w-[20%]'>
      <GameTime />
      <GameOdds />
      <LastScore />
      <TeamForm />
    </div>
  )
}

export default function GamesGrid() {
  const gamesData : any = gamesJSON;
  const isotope = useRef<any>();
  useEffect(() => {
    if(window !== undefined){
      isotope.current = new Isotope('.games', {
        itemSelector: '.game',
        layoutMode: 'fitRows'
      });
      return () => isotope.current?.destroy();
    }
  }, []);
  if(gamesData && gamesData?.length > 0){
    return (
      <div className='games p-[1.5rem] sm:p-[3rem]'>
          {gamesData.map((game : MatchData, key : number) =><Game key={key} {...game} />)}
          <div className='fixed w-screen h-screen top-[0] left-[0] bg-gradient-to-b from-primary-400 to-primary-500 z-[-1]'></div>
      </div>
    )
  }else{
    return null
  }
}