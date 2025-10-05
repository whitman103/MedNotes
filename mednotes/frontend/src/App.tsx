import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Button } from '@/components/ui/button'

import { ThemeProvider } from './components/theme-provider'

import { Item, ItemContent } from './components/ui/item'

import DrawLogo from './components/background/background-draw'
import { CardHeader, CardTitle, Card, CardContent } from './components/ui/card'


function WrappedApp() {
  return <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    {<App />}
  </ThemeProvider>
}


function App() {
  const [count, setCount] = useState(0)
  const bgDiv = document.createElement('div')
  bgDiv.id = 'background'
  Object.assign(bgDiv.style, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  })
  document.body.prepend(bgDiv);
  DrawLogo();
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Welcome to MedNotes!</CardTitle>
        </CardHeader>
      </Card>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" className="justify center">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">Welcome To MedNotes!</h1>

      <Card>
        <CardHeader>
          <CardTitle>Here is a button!</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setCount((count) => count + 1)}>
            Count is {count}!
          </Button>
        </CardContent>
      </Card>
    </>


  )
}

export default WrappedApp
