import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";

export default function Profile() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Profile
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your profile information and account settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-lg">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{user?.email?.split('@')[0] || 'User'}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium">Member since</span>
                <span className="text-sm text-muted-foreground">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium">Email Verified</span>
                <Badge variant={user?.email_confirmed_at ? "default" : "secondary"}>
                  {user?.email_confirmed_at ? "Verified" : "Pending"}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium">Last Sign In</span>
                <span className="text-sm text-muted-foreground">
                  {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium">User ID</span>
                <span className="text-xs text-muted-foreground font-mono">{user?.id?.slice(0, 8)}...</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Stats</CardTitle>
            <CardDescription>Your usage statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Account Status</span>
                <Badge variant="default">Active</Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>SVGs Uploaded</span>
                  <span className="font-medium">0</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Projects Created</span>
                  <span className="font-medium">0</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Storage Used</span>
                  <span className="font-medium">0 MB</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest actions in SVG Spark Vault</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent activity yet. Start by uploading your first SVG!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}