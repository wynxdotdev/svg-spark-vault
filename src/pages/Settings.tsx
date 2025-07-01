import { useState } from "react";
import { Moon, Sun, Monitor, Bell, Shield, Download, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyReport: true,
    downloadNotifications: false,
  });
  
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showStats: true,
    allowDownloads: true,
    showInSearch: true,
  });

  const [storage, setStorage] = useState({
    autoOptimize: true,
    backupToCloud: false,
    maxFileSize: "5",
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrivacyChange = (key: keyof typeof privacy) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleStorageChange = (key: keyof typeof storage, value: any) => {
    setStorage(prev => ({ ...prev, [key]: value }));
  };

  const AppearanceSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Choose your preferred theme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setTheme("light")}
              className={`p-4 rounded-lg border-2 transition-colors ${
                theme === "light" 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-border/80"
              }`}
            >
              <Sun className="h-6 w-6 mx-auto mb-2" />
              <p className="font-medium">Light</p>
            </button>
            
            <button
              onClick={() => setTheme("dark")}
              className={`p-4 rounded-lg border-2 transition-colors ${
                theme === "dark" 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-border/80"
              }`}
            >
              <Moon className="h-6 w-6 mx-auto mb-2" />
              <p className="font-medium">Dark</p>
            </button>
            
            <button
              onClick={() => setTheme("system")}
              className={`p-4 rounded-lg border-2 transition-colors ${
                theme === "system" 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-border/80"
              }`}
            >
              <Monitor className="h-6 w-6 mx-auto mb-2" />
              <p className="font-medium">System</p>
            </button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Current theme: <Badge variant="secondary">{theme}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Display</CardTitle>
          <CardDescription>Customize your viewing experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Compact View</Label>
              <p className="text-sm text-muted-foreground">Show more items per row</p>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Show File Sizes</Label>
              <p className="text-sm text-muted-foreground">Display file sizes in grid view</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Animated Previews</Label>
              <p className="text-sm text-muted-foreground">Enable hover animations</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const NotificationSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Control which emails you receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>General Notifications</Label>
              <p className="text-sm text-muted-foreground">Updates about your account and projects</p>
            </div>
            <Switch 
              checked={notifications.emailNotifications}
              onCheckedChange={() => handleNotificationChange('emailNotifications')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Weekly Report</Label>
              <p className="text-sm text-muted-foreground">Weekly summary of your SVG analytics</p>
            </div>
            <Switch 
              checked={notifications.weeklyReport}
              onCheckedChange={() => handleNotificationChange('weeklyReport')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Download Notifications</Label>
              <p className="text-sm text-muted-foreground">When someone downloads your SVGs</p>
            </div>
            <Switch 
              checked={notifications.downloadNotifications}
              onCheckedChange={() => handleNotificationChange('downloadNotifications')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>Browser notifications for important updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications in your browser</p>
            </div>
            <Switch 
              checked={notifications.pushNotifications}
              onCheckedChange={() => handleNotificationChange('pushNotifications')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const PrivacySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Privacy</CardTitle>
          <CardDescription>Control who can see your profile and content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Public Profile</Label>
              <p className="text-sm text-muted-foreground">Allow others to view your profile</p>
            </div>
            <Switch 
              checked={privacy.profilePublic}
              onCheckedChange={() => handlePrivacyChange('profilePublic')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Show Statistics</Label>
              <p className="text-sm text-muted-foreground">Display download and view counts</p>
            </div>
            <Switch 
              checked={privacy.showStats}
              onCheckedChange={() => handlePrivacyChange('showStats')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Allow Downloads</Label>
              <p className="text-sm text-muted-foreground">Let others download your SVGs</p>
            </div>
            <Switch 
              checked={privacy.allowDownloads}
              onCheckedChange={() => handlePrivacyChange('allowDownloads')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Show in Search</Label>
              <p className="text-sm text-muted-foreground">Include your SVGs in search results</p>
            </div>
            <Switch 
              checked={privacy.showInSearch}
              onCheckedChange={() => handlePrivacyChange('showInSearch')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const StorageSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Storage Options</CardTitle>
          <CardDescription>Manage your storage preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-optimize SVGs</Label>
              <p className="text-sm text-muted-foreground">Automatically compress SVGs on upload</p>
            </div>
            <Switch 
              checked={storage.autoOptimize}
              onCheckedChange={(checked) => handleStorageChange('autoOptimize', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Cloud Backup</Label>
              <p className="text-sm text-muted-foreground">Backup your SVGs to the cloud</p>
            </div>
            <Switch 
              checked={storage.backupToCloud}
              onCheckedChange={(checked) => handleStorageChange('backupToCloud', checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Maximum File Size</Label>
            <Select 
              value={storage.maxFileSize} 
              onValueChange={(value) => handleStorageChange('maxFileSize', value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 MB</SelectItem>
                <SelectItem value="5">5 MB</SelectItem>
                <SelectItem value="10">10 MB</SelectItem>
                <SelectItem value="25">25 MB</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Storage Usage</CardTitle>
          <CardDescription>Current storage usage and limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Used</span>
              <span>125.5 MB of 1 GB</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '12.5%' }}></div>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-4">
            <span className="text-sm text-muted-foreground">Need more space?</span>
            <Button variant="outline" size="sm">Upgrade Plan</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const SecuritySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showPasswords.current ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPasswords.new ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showPasswords.confirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <Button className="w-full">Update Password</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable 2FA</Label>
              <p className="text-sm text-muted-foreground">Secure your account with two-factor authentication</p>
            </div>
            <Button variant="outline">Setup 2FA</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions for your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Delete Account</Label>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and settings</p>
      </div>

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance">
          <AppearanceSettings />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="privacy">
          <PrivacySettings />
        </TabsContent>

        <TabsContent value="storage">
          <StorageSettings />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}