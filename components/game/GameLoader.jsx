'use client'
import dynamic from 'next/dynamic'

const SpaceGame = dynamic(() => import('./SpaceGame'), { ssr: false })

export default function GameLoader({ onExit }) {
  return <SpaceGame onExit={onExit} />
}
