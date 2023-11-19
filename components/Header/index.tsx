import Image from "next/image";
import logo from './logo.png';
import styles from './_styles.module.sass'

export default function Header () {
  return (
    <div className="flex justify-between items-center p-[1rem] absolute top-[0] z-10 w-full">
        <div className={`w-[5rem] h-[5rem] relative ${styles.logoWrapper}`}><Image src={logo} fill alt="" /></div>
    </div>
  )
}