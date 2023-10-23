import { searchAtom } from "@/atoms";
import { CupertinoPane } from "cupertino-pane";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";

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
            height: (1.5*16)*2.5
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

  return (
    <div className={`cupertino-pane ${!paneReady ? hiddenStyle : ""}`}>
      <div className="flex w-screen flex-col items-center bg-white rounded-[3rem] p-[1rem] max-w-[425px]">
        <input value={search} min={1} onChange={(e)=>setSearch(e.target.value)} type="text" placeholder="Search" className="p-[1rem] w-full rounded-[1rem] border-[0.1rem] text-black" />
      </div>
    </div>
  )

}

export default BottomNavigation