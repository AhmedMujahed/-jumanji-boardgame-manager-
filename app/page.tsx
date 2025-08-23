'use client'

import dynamic from 'next/dynamic'

// Dynamically import the App component with no SSR to avoid hydration issues
const App = dynamic(() => import('../src/App'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '1.2rem',
      color: '#667eea'
    }}>
      Loading Jumanji Board Game Shop...
    </div>
  )
})

export default function HomePage() {
  return <App />
}
