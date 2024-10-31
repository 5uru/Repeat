# src/pages/index.ts
export { Home } from './Home'
export { Deck } from './Deck'
export { Study } from './Study'
export { Statistics } from './Statistics'
export { Settings } from './Settings'
export { Cards } from './Cards'
export { Calendar } from './Calendar'
export { Notifications } from './Notifications'

// Also export types used across multiple pages
export interface DeckStats {
    totalCards: number
    dueCards: number
    masteredCards: number
    learningCards: number
    newCards: number
    averageStreak: number
}

export interface StudySession {
    deckId: number
    cardId: number
    studyDate: Date
    quality: number
    timeSpent: number
}

export interface ReviewHistory {
    date: string
    cardsReviewed: number
    accuracy: number
    timeSpent: number
}

export type StudyQuality = 1 | 2 | 3 | 4 | 5

export interface CardStatus {
    isNew: boolean
    isLearning: boolean
    isMastered: boolean
    dueDate?: Date
    interval: number
    repetitions: number
    easeFactor: number
    lastReview?: Date
}

// Export page-specific types
export interface HomeProps {
    onCreateDeck?: (name: string) => Promise<void>
    onStartStudy?: (deckId: number) => void
}

export interface DeckProps {
    onAddCard?: (deckId: number, front: string, back: string) => Promise<void>
    onEditCard?: (cardId: number, front: string, back: string) => Promise<void>
    onDeleteCard?: (cardId: number) => Promise<void>
}

export interface StudyProps {
    onReview?: (cardId: number, quality: StudyQuality) => Promise<void>
    onCompleteSession?: (session: StudySession) => Promise<void>
}

export interface StatisticsProps {
    timeRange?: 'day' | 'week' | 'month' | 'year'
    onTimeRangeChange?: (range: string) => void
}

export interface SettingsProps {
    onSave?: (settings: UserSettings) => Promise<void>
    isDarkMode: boolean
    toggleDarkMode: () => void
}

// Shared interfaces
export interface UserSettings {
    notificationsEnabled: boolean
    cardsPerDay: number
    darkMode: boolean
    studyReminders: boolean
    reminderTime?: string
    weekendStudy: boolean
    soundEnabled: boolean
    autoPlayAudio: boolean
    showHints: boolean
}

export interface NotificationSettings {
    enabled: boolean
    studyReminders: boolean
    achievementNotifications: boolean
    reminderTime: string
    daysOfWeek: string[]
}

// Calendar specific types
export interface CalendarEvent {
    date: Date
    cardsReviewed: number
    studyTime: number
    decks: string[]
    streak: number
}

// Notification specific types
export interface Notification {
    id: number
    type: 'reminder' | 'achievement' | 'streak' | 'system'
    title: string
    message: string
    timestamp: Date
    read: boolean
    action?: {
        label: string
        url: string
    }
}

// Study session types
export interface StudySessionStats {
    startTime: Date
    endTime?: Date
    cardsReviewed: number
    correctAnswers: number
    wrongAnswers: number
    timePerCard: number[]
    qualities: StudyQuality[]
}

// Achievement types
export interface Achievement {
    id: number
    title: string
    description: string
    icon: string
    unlockedAt?: Date
    progress: number
    maxProgress: number
    rewards?: {
        type: 'badge' | 'theme' | 'feature'
        value: string
    }[]
}

// Export constants used across pages
export const DEFAULT_CARDS_PER_DAY = 20
export const MIN_EASE_FACTOR = 1.3
export const INITIAL_EASE_FACTOR = 2.5
export const EASE_BONUS = 0.15
export const EASE_PENALTY = 0.2
export const LEARNING_STEPS = [1, 10]
export const GRADUATING_INTERVAL = 1
export const EASY_INTERVAL = 4
export const MAXIMUM_INTERVAL = 365
export const INTERVAL_MODIFIER = 1

// Route configuration
export const ROUTES = {
    HOME: '/',
    DECK: '/deck/:id',
    STUDY: '/study/:deckId',
    CARDS: '/cards',
    STATISTICS: '/statistics',
    SETTINGS: '/settings',
    CALENDAR: '/calendar',
    NOTIFICATIONS: '/notifications'
} as const

// Layout configurations
export const SIDEBAR_WIDTH = 256
export const COLLAPSED_SIDEBAR_WIDTH = 64
export const TOPBAR_HEIGHT = 64
export const CARD_SPACING = 16