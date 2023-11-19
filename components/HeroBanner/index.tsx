import Image from "next/image"
import img from './images/1.jpg'
import styles from '../_styles.module.sass'

export default function HeroBanner () {
  return (
    <div className="w-full relative">
      <div className={styles.heroImg}>
        <div className={styles['trailer-vignette']} />
        <div className={styles['trailer-vignette']} />
        <div className={styles['hero-vignette']} />
        <div className="w-full h-[30rem]"><Image objectFit="cover" src={img} alt="" fill /></div>
      </div>
      <div className="absolute z-10 w-full flex flex-col items-center justify-center bottom-[1.5rem]">
        <div className="text-[1.5rem] text-white">Aresenal</div>
        <div className="text-[3.5rem] text-white font-[900]">Under 2.5</div>
        <div className="bg-white text-black py-[0.5rem] px-[2.5rem] mt-[0.5rem] font-[600]">View More</div>
      </div>
    </div>
  )
}