import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import {
    Moon,
    Sun,
    Bell,
    Calendar,
    Brain,
    Volume2,
    Sparkles,
    Languages,
    Clock,
    Download,
    Upload,
    RotateCcw
} from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"

interface SettingsProps {
    isDarkMode: boolean
    toggleDarkMode: () => void
}

export interface UserSettings {
    notificationsEnabled: boolean
    cardsPerDay: number
    studyReminders: boolean
    reminderTime: string
    weekendStudy: boolean
    soundEnabled: boolean
    autoPlayAudio: boolean
    showHints: boolean
    language: string
}

export function Settings({ isDarkMode, toggleDarkMode }: SettingsProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [settings, setSettings] = useState<UserSettings>({
        notificationsEnabled: true,
        cardsPerDay: 20,
        studyReminders: true,
        reminderTime: '09:00',
        weekendStudy: true,
        soundEnabled: true,
        autoPlayAudio: false,
        showHints: true,
        language: 'en'
    })
    const [hasChanges, setHasChanges] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        try {
            const userSettings = await api.getSettings()
            setSettings(userSettings)
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load settings',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleSettingChange = (key: keyof UserSettings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }))
        setHasChanges(true)
    }

    const handleSaveSettings = async () => {
        try {
            await api.updateSettings(settings)
            setHasChanges(false)
            toast({
                title: 'Success',
                description: 'Settings saved successfully',
            })
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save settings',
                variant: 'destructive',
            })
        }
    }

    const handleResetSettings = () => {
        setSettings({
            notificationsEnabled: true,
            cardsPerDay: 20,
            studyReminders: true,
            reminderTime: '09:00',
            weekendStudy: true,
            soundEnabled: true,
            autoPlayAudio: false,
            showHints: true,
            language: 'en'
        })
        setHasChanges(true)
    }

    if (isLoading) {
        return <SettingsSkeleton />
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Settings</h1>
                {hasChanges && (
                    <Button onClick={handleSaveSettings}>Save Changes</Button>
                )}
            </div>

            <Tabs defaultValue="general">
                <TabsList className="mb-6">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="study">Study</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="backup">Backup & Sync</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Settings</CardTitle>
                            <CardDescription>
                                Configure your general application preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    {isDarkMode ? (
                                        <Moon className="h-5 w-5" />
                                    ) : (
                                        <Sun className="h-5 w-5" />
                                    )}
                                    <Label htmlFor="dark-mode">Dark Mode</Label>
                                </div>
                                <Switch
                                    id="dark-mode"
                                    checked={isDarkMode}
                                    onCheckedChange={toggleDarkMode}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <Languages className="h-5 w-5" />
                                    <Label htmlFor="language">Language</Label>
                                </div>
                                <Select
                                    value={settings.language}
                                    onValueChange={(value) => handleSettingChange('language', value)}
                                >
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="es">Español</SelectItem>
                                        <SelectItem value="fr">Français</SelectItem>
                                        <SelectItem value="de">Deutsch</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <Volume2 className="h-5 w-5" />
                                    <Label htmlFor="sound">Sound Effects</Label>
                                </div>
                                <Switch
                                    id="sound"
                                    checked={settings.soundEnabled}
                                    onCheckedChange={(checked) =>
                                        handleSettingChange('soundEnabled', checked)
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="study">
                    <Card>
                        <CardHeader>
                            <CardTitle>Study Settings</CardTitle>
                            <CardDescription>
                                Configure your study preferences and daily goals
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <Brain className="h-5 w-5" />
                                    <Label htmlFor="cards-per-day">New Cards per Day</Label>
                                </div>
                                <Select
                                    value={settings.cardsPerDay.toString()}
                                    onValueChange={(value) =>
                                        handleSettingChange('cardsPerDay', parseInt(value))
                                    }
                                >
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Select amount" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10 cards</SelectItem>
                                        <SelectItem value="20">20 cards</SelectItem>
                                        <SelectItem value="30">30 cards</SelectItem>
                                        <SelectItem value="50">50 cards</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <Calendar className="h-5 w-5" />
                                    <Label htmlFor="weekend-study">Weekend Study</Label>
                                </div>
                                <Switch
                                    id="weekend-study"
                                    checked={settings.weekendStudy}
                                    onCheckedChange={(checked) =>
                                        handleSettingChange('weekendStudy', checked)
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <Sparkles className="h-5 w-5" />
                                    <Label htmlFor="auto-play">Auto-play Audio</Label>
                                </div>
                                <Switch
                                    id="auto-play"
                                    checked={settings.autoPlayAudio}
                                    onCheckedChange={(checked) =>
                                        handleSettingChange('autoPlayAudio', checked)
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notifications</CardTitle>
                            <CardDescription>
                                Configure your notification preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <Bell className="h-5 w-5" />
                                    <Label htmlFor="notifications">Enable Notifications</Label>
                                </div>
                                <Switch
                                    id="notifications"
                                    checked={settings.notificationsEnabled}
                                    onCheckedChange={(checked) =>
                                        handleSettingChange('notificationsEnabled', checked)
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <Clock className="h-5 w-5" />
                                    <Label htmlFor="reminder-time">Daily Reminder Time</Label>
                                </div>
                                <input
                                    type="time"
                                    id="reminder-time"
                                    value={settings.reminderTime}
                                    onChange={(e) =>
                                        handleSettingChange('reminderTime', e.target.value)
                                    }
                                    className="rounded-md border border-input bg-background px-3 py-2"
                                    disabled={!settings.notificationsEnabled}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="backup">
                    <Card>
                        <CardHeader>
                            <CardTitle>Backup & Sync</CardTitle>
                            <CardDescription>
                                Manage your data and synchronization settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex justify-between items-center">
                                <Button variant="outline" className="w-48">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export Data
                                </Button>
                                <Button variant="outline" className="w-48">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Import Data
                                </Button>
                            </div>

                            <Separator />

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="w-full">
                                        <RotateCcw className="mr-2 h-4 w-4" />
                                        Reset All Settings
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will reset all settings to their default values.
                                            This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleResetSettings}
                                            className="bg-destructive text-destructive-foreground"
                                        >
                                            Reset Settings
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function SettingsSkeleton() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-40" />
            </div>

            <div className="space-y-6">
                <Skeleton className="h-10 w-full" />

                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-72" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {Array(4).fill(0).map((_, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-6 w-24" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}