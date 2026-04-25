'use client'
import dynamic from 'next/dynamic'
import LoadingScreen from './LoadingScreen'

const Experience = dynamic(() => import('./Experience'), { ssr: false })

export default function ExperienceLoader() {
  return (
    <>
      <LoadingScreen />
      <Experience />
    </>
  )
}
