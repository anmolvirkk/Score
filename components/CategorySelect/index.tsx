import {Swiper, SwiperSlide} from "swiper/react"
import Image, { StaticImageData } from "next/image"
import styles from '../_styles.module.sass'
import HeadingText from "../HeadingText"

export default function CategorySelect ({categories, heading} : {categories:{
  img: StaticImageData,
  imgClass?: string,
  text: string,
  link: string
}[], heading:string}) {
  const Category = ({img, text, imgClass, link} : {img:StaticImageData, text:string, imgClass?:string, link:string}) => {
    return (
      <div className="flex flex-col items-center justify-center w-full">
        <div className={styles.categoryImg}>
          <div className={styles['trailer-vignette']} />
          <div className={styles['trailer-vignette']} />
          <div className={styles['hero-vignette']} />
          <div className="w-full h-[6rem]"><Image className={`object-cover ${imgClass}`} src={img} alt="" fill /></div>
        </div>
        <div className="text-white text-[1.25rem] font-[600] mt-[-1rem] relative z-10 text-center leading-[1]">{text}</div>
      </div>
    )
  }
  return (
    <>
      <HeadingText text={heading} />
      <Swiper
        style={{padding: '0 1rem 1rem'}}
        spaceBetween={1.35*16}
        slidesPerView={Math.max(window.innerWidth/(7.65*16))}
      >
        {categories.map((item, key) => (
          <SwiperSlide key={key}>
            <Category {...item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  )
}