import { useState } from "react";
import { User, Mail, Calendar, MapPin, Link as LinkIcon, Camera, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock user data
const mockUser = {
  name: "Alex Johnson",
  email: "alex.johnson@email.com",
  username: "alexj",
  bio: "UI/UX Designer passionate about creating beautiful and functional digital experiences. Love working with SVG icons and illustrations.",
  location: "San Francisco, CA",
  website: "https://alexjohnson.design",
  joinedDate: "March 2023",
  avatar: "",
  stats: {
    totalProjects: 12,
    totalSVGs: 234,
    totalViews: 15420,
    totalDownloads: 3240,
    favorites: 890,
    followers: 156,
    following: 89,
  }
};

const mockRecentActivity = [
  { id: 1, action: "Uploaded 5 new SVGs to UI Icons project", timestamp: "2 hours ago" },
  { id: 2, action: "Created new project 'Social Media Icons'", timestamp: "1 day ago" },
  { id: 3, action: "Favorited 'arrow-left.svg' by @designerjo", timestamp: "2 days ago" },
  { id: 4, action: "Updated project 'Illustrations' description", timestamp: "3 days ago" },
  { id: 5, action: "Downloaded 'user-circle.svg' 25 times", timestamp: "1 week ago" },
];

const mockAchievements = [
  { id: 1, title: "First Upload", description: "Uploaded your first SVG", earned: true },
  { id: 2, title: "Popular Creator", description: "Reached 1000 total views", earned: true },
  { id: 3, title: "Organized", description: "Created 10+ projects", earned: true },
  { id: 4, title: "Community Favorite", description: "Received 100+ favorites", earned: true },
  { id: 5, title: "Prolific", description: "Uploaded 500+ SVGs", earned: false },
  { id: 6, title: "Trendsetter", description: "Had a trending SVG", earned: false },
];

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: mockUser.name,
    bio: mockUser.bio,
    location: mockUser.location,
    website: mockUser.website,
  });

  const handleSave = () => {
    // Simulate saving
    setIsEditing(false);
  };

  const ProfileOverview = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={mockUser.avatar} />
                <AvatarFallback className="text-2xl">
                  {mockUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Button size="icon" variant="outline" className="absolute -bottom-2 -right-2 h-8 w-8">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{mockUser.name}</h1>
                  <p className="text-muted-foreground">@{mockUser.username}</p>
                </div>
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
              
              <p className="text-muted-foreground">{mockUser.bio}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {mockUser.location}
                </div>
                <div className="flex items-center gap-1">
                  <LinkIcon className="h-4 w-4" />
                  <a href={mockUser.website} className="text-primary hover:underline">
                    {mockUser.website}
                  </a>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {mockUser.joinedDate}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{mockUser.stats.totalProjects}</div>
              <div className="text-sm text-muted-foreground">Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{mockUser.stats.totalSVGs}</div>
              <div className="text-sm text-muted-foreground">SVGs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{mockUser.stats.totalViews.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{mockUser.stats.totalDownloads.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{mockUser.stats.favorites}</div>
              <div className="text-sm text-muted-foreground">Favorites</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{mockUser.stats.followers}</div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{mockUser.stats.following}</div>
              <div className="text-sm text-muted-foreground">Following</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest actions and achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b border-border/50 last:border-0">
                <div className="h-2 w-2 bg-primary rounded-full mt-3"></div>
                <div className="flex-1">
                  <p className="text-sm">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const EditProfile = () => (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your profile information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            rows={4}
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          />
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleSave}>Save Changes</Button>
          <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );

  const Achievements = () => (
    <Card>
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
        <CardDescription>Your milestones and accomplishments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border ${
                achievement.earned 
                  ? "bg-primary/5 border-primary/20" 
                  : "bg-muted/50 border-border opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{achievement.title}</h3>
                <Badge variant={achievement.earned ? "default" : "secondary"}>
                  {achievement.earned ? "Earned" : "Locked"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{achievement.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your profile and view your statistics</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="edit">Edit Profile</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ProfileOverview />
        </TabsContent>

        <TabsContent value="edit">
          <EditProfile />
        </TabsContent>

        <TabsContent value="achievements">
          <Achievements />
        </TabsContent>
      </Tabs>
    </div>
  );
}