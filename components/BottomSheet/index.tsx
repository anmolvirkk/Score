import { filtersAtom } from "@/atoms";
import { CupertinoPane } from "cupertino-pane";
import { useEffect, useState, useRef } from "react";
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css'; 
import { useSetRecoilState } from "recoil";

const BottomNavigation = () => {

  const [paneReady, setPaneReady] = useState(false)

  useEffect(() => {
    const paneHeight = document.querySelector('.cupertino-pane')?.clientHeight
    if(window.visualViewport?.height && paneHeight){
      const drawer = new CupertinoPane('.cupertino-pane', {
        initialBreak: 'bottom',
        lowerThanBottom: false,
        clickBottomOpen: true,
        breaks: {
          middle: { enabled: false },
          bottom: {
            enabled: true,
            height: (1.5*16)*2.25
          },
          top: { enabled: true, height: Math.min(window.visualViewport.height, paneHeight) }
        }
      });
      drawer.present({ animated: true });
      setPaneReady(true);
      const inviteAFriend = document.getElementById('inviteAFriend')
      if(inviteAFriend){
        inviteAFriend.onclick = () => {
          drawer.moveToBreak('top');
        }
      }
    }
  }, [])

  const hiddenStyle = "pointer-events-none opacity-0";

  const Slider = ({title, setData, data=0} : {title: string, setData: any, data: any}) => {
    const [value, setValue] = useState([0,data]);
    useEffect(()=>{
      setData(value[1]);
    }, [value])
    return (
      <div className="flex flex-col gap-[1.5rem] w-full">
        <div className="flex gap-[1rem] items-center justify-between">
          <div>{title}</div>
          <div className="flex items-center gap-[0.5rem]">
            <svg onClick={()=>setValue([0,Math.max(value[1]-1, 0)])} className="min-w-[1rem] w-[1rem]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 10h24v4h-24z"/></svg>
            <input min={0} max={100} className="bg-black rounded-[0.5rem] p-[0.5rem] px-[1rem] text-white" type="number" value={value[1]} onChange={(e)=>e.target.value ? setValue([0, Math.max(0, Math.min(parseInt(e.target.value), 100))]) : setValue([0,0])} />
            <svg onClick={()=>setValue([0,Math.min(value[1]+1, 100)])} className="min-w-[1rem] w-[1rem]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z"/></svg>
          </div>
        </div>
        <RangeSlider className="single-thumb" value={value} thumbsDisabled={[true, false]} rangeSlideDisabled={true} onInput={(e:any)=>setValue(e)} />
      </div>
    )
  }

  const filters = useRef<any>({});
  const setFilters = useSetRecoilState(filtersAtom);

  const [loading, setLoading] = useState(false);

  const setFilterData = () => {
    setLoading(true);
    setTimeout(() => {
      setFilters(filters.current);
      setLoading(false);
    }, 0)
  }

  const searchRef = useRef<any>();

  const resetFilters = () => {
    setLoading(true);
    setTimeout(()=>{
      filters.current = {};
      searchRef.current.value = '';
      setFilters(filters.current);
      setLoading(false);
    }, 0)
  }

  const SliderGroup = ({data, heading}:{heading: string, data:{key:string, title:string, defaultValue?: number}[]}) => {
    return (
      <div className="flex flex-col">
        <div className="text-[2rem] font-[900] text-black">{heading}</div>
        <div className="rounded-[2rem] py-[3rem] px-[1.5rem] bg-gray-100 flex flex-col gap-[3rem]">
          {data.map((item, key) => <Slider key={key} data={filters.current[item.key] || item.defaultValue || 0} title={item.title} setData={(e:any)=>filters.current = {...filters.current, [item.key]:e}} />)}
        </div>
      </div>
    )
  }
  
  return (
    <div className={`relative cupertino-pane ${!paneReady ? hiddenStyle : ""}`}>
      <div className="flex w-screen flex-col gap-[3rem] items-center bg-white rounded-[3rem] p-[1rem] max-w-[425px] pb-[10rem]">
        <input ref={searchRef} onChange={(e)=>filters.current = {...filters.current, search:e.target.value}} type="text" placeholder="Search" className="p-[1rem] w-full rounded-[1rem] border-[0.1rem] text-black" />
        <SliderGroup heading="Under Goals" data={[
          {
            key: 'maxHeadToHeadGoals',
            title: 'Maximum Head to Head Goals',
            defaultValue: 100
          },
          {
            key: 'homeTeamMaximumGoals',
            title: 'Home Team Maximum Goals',
            defaultValue: 100
          },
          {
            key: 'awayTeamMaximumGoals',
            title: 'Away Team Maximum Goals',
            defaultValue: 100
          }
        ]} />
        <SliderGroup heading="Over Goals" data={[
          {
            key: 'minimumHeadToHeadGoals',
            title: 'Minimum Head to Head Goals'
          },
          {
            key: 'homeTeamMinimumGoals',
            title: 'Home Team Minimum Goals'
          },
          {
            key: 'awayTeamMinimumGoals',
            title: 'Away Team Minimum Goals'
          }
        ]} />
        <div className="flex flex-col gap-[1rem] fixed bottom-[0] w-full bg-white z-[10] p-[1rem]">
          <button type="button" onClick={setFilterData} className="bg-black text-white rounded-full p-[1.5rem] w-full cursor-pointer flex items-center justify-center">
            <span className={loading ? 'opacity-0' : ''}>Search</span>
            <svg aria-hidden="true" className={`${!loading ? 'hidden' : ''} w-[2rem] h-[2rem] absolute text-gray-200 animate-spin dark:text-gray-900 fill-green-400`} viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
          </button>
          <button type="button" onClick={resetFilters} className="opacity-[0.35] cursor-pointer">Clear</button>
        </div>
      </div>
    </div>
  )

}

export default BottomNavigation