import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Button } from '@/components/ui/button'

import { ThemeProvider } from './components/theme-provider'

import { Item, ItemContent } from './components/ui/item'

import { SVG } from "@svgdotjs/svg.js"

function WrappedApp() {
  return <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    {<App />}
  </ThemeProvider>
}

class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  createString() {
    return `${this.x},${this.y}`
  }
}

function CreateLogo(lineLength: number): string {
  const basePoint = new Point(0, 0);
  const rightPoint = new Point(basePoint.x + lineLength, 0);
  const topPoint = new Point(basePoint.x + lineLength / 2, basePoint.y + lineLength * Math.sqrt(3) / 2.);
  const middlePoint = new Point(basePoint.x + lineLength / 2, basePoint.y + lineLength * Math.sqrt(2) / 4.)

  return `${basePoint.createString()} ${rightPoint.createString()} ${topPoint.createString()} ${basePoint.createString()} ${middlePoint.createString()} 
  ${topPoint.createString()}
  ${middlePoint.createString()}
  ${rightPoint.createString()}`

}

function DrawLogo() {
  var draw = SVG().addTo('body').size(300, 300);
  const lineLength = 150;

  var polyline = draw.polyline(CreateLogo(lineLength));
  polyline.fill('none').move(20, 20);
  polyline.stroke({ color: '#f06', width: 2, linecap: 'round' })
}


function App() {
  const [count, setCount] = useState(0)
  DrawLogo();
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" className="justify center">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">Welcome To MedNotes!</h1>
      <div className="card">
        <Button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </Button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default WrappedApp
