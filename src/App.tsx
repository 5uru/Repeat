import { useState, useEffect } from 'react'
import {
    createBrowserRouter,
    RouterProvider,
    createRoutesFromElements,
    Route,
    Navigate
} from 'react-router-dom'
import { Home } from './pages/Home'
import { Deck } from './pages/Deck'
import { Study } from './pages/Study'
import { Statistics } from './pages/Statistics'
import { Settings } from './pages/Settings'
import { Notifications } from './pages/Notifications'
import { Calendar } from './pages/Calendar'
import { RootLayout } from './layouts/RootLayout'
import { ThemeProvider } from './components/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/components/ui/use-toast'

// Create router with routes
const router = createBrowserRouter(
    createRoutesFromElements(
        <Route element={<RootLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/deck/:id" element={<Deck />} />
            <Route path="/study/:deckId" element={<Study />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
    )
)

export function App() {
    const [isDarkMode, setIsDarkMode] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        // Load theme preference from localStorage
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme) {
            setIsDarkMode(savedTheme === 'dark')
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            setIsDarkMode(prefersDark)
        }
    }, [])

    const toggleDarkMode = () => {
        setIsDarkMode(prev => {
            const newMode = !prev
            localStorage.setItem('theme', newMode ? 'dark' : 'light')
            toast({
                title: `${newMode ? 'Dark' : 'Light'} mode activated`,
                duration: 2000,
            })
            return newMode
        })
    }

    return (
        <ThemeProvider defaultTheme={isDarkMode ? 'dark' : 'light'}>
            <RouterProvider router={router} />
            <Toaster />
        </ThemeProvider>
    )
}
