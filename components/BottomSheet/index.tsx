import { searchAtom } from "@/atoms";
import { CupertinoPane } from "cupertino-pane";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css'; 

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

  const [search, setSearch] = useRecoilState(searchAtom);

  const Slider = ({title} : {title: string}) => {
    const [value, setValue] = useState([0, 100]);
    return (
      <div className="flex flex-col gap-[1.5rem] w-full">
        <div className="flex items-center justify-between">
          <div>{title}</div>
          <div className="bg-black rounded-[0.5rem] p-[0.5rem] px-[1rem] text-white">{value[1]}</div>
        </div>
        <RangeSlider className="single-thumb" defaultValue={value} thumbsDisabled={[true, false]} rangeSlideDisabled={true} onInput={(e:any)=>setValue(e)} />
      </div>
    )
  }

  return (
    <div className={`cupertino-pane ${!paneReady ? hiddenStyle : ""}`}>
      <div className="flex w-screen flex-col gap-[1.5rem] items-center bg-white rounded-[3rem] p-[1rem] max-w-[425px]">
        <input value={search} min={1} onChange={(e)=>setSearch(e.target.value)} type="text" placeholder="Search" className="p-[1rem] w-full rounded-[1rem] border-[0.1rem] text-black" />
        <Slider title="Minimum Goals (Last Match)" />
      </div>
    </div>
  )

}

export default BottomNavigation