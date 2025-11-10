import { useState } from 'react'
import './App.css'
import { Button } from '@/components/ui/button'
import { Toaster } from 'sonner'
import { ThemeProvider } from './components/theme-provider'

import DrawLogo from './components/background/background-draw'
import { CardHeader, CardTitle, Card, CardContent } from './components/ui/card'
import { UserCard } from './components/usercard/usercard'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MutationCache, QueryCache } from '@tanstack/react-query'


function WrappedApp() {


  const queryCache = new QueryCache();
  const mutationCache = new MutationCache();
  const [queryClient] = useState(() => new QueryClient({ mutationCache, queryCache }))

  return <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {<App />}
      <Toaster />
    </ThemeProvider>
  </QueryClientProvider>
}



function App() {
  const [count, setCount] = useState(0)
  if (!document.getElementById('background')) {
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
  }


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl">Welcome To MedNotes!</CardTitle>
        </CardHeader>
      </Card>
      <h1 className="scroll-m-20 text-center text-2xl font-bold tracking-tight text-balance" style={{ 'padding': '1em' }}>MedNotes embeds your notes and questions for easy retrieval and recall at a later date.</h1>



      <UserCard />
    </>


  )
}

export default WrappedApp
