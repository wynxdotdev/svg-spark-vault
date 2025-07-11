import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileImageUpload } from "@/components/profile/ProfileImageUpload";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<{
    display_name: string | null;
    avatar_url: string | null;
  }>({ display_name: null, avatar_url: null });
  const [stats, setStats] = useState({
    svgsUploaded: 0,
    projectsCreated: 0,
    storageUsed: 0
  });
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || "");
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [
        { count: svgsCount },
        { count: projectsCount },
        { data: svgsData }
      ] = await Promise.all([
        supabase
          .from('svgs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user!.id),
        supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user!.id),
        supabase
          .from('svgs')
          .select('file_size')
          .eq('user_id', user!.id)
      ]);

      const totalStorage = svgsData?.reduce((sum, svg) => sum + (svg.file_size || 0), 0) || 0;

      setStats({
        svgsUploaded: svgsCount || 0,
        projectsCreated: projectsCount || 0,
        storageUsed: totalStorage
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          user_id: user.id, 
          display_name: displayName.trim() || null 
        });

      if (error) throw error;

      setProfile(prev => ({ ...prev, display_name: displayName.trim() || null }));
      
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarUpdated = (url: string) => {
    setProfile(prev => ({ ...prev, avatar_url: url }));
  };
  
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
            <div className="flex items-center space-x-6">
              <ProfileImageUpload 
                currentAvatarUrl={profile.avatar_url}
                onAvatarUpdated={handleAvatarUpdated}
              />
              <div className="flex-1">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter your display name"
                      />
                      <Button 
                        onClick={updateProfile} 
                        disabled={updating || displayName.trim() === (profile.display_name || "")}
                        size="sm"
                      >
                        {updating ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold">{profile.display_name || user?.email?.split('@')[0] || 'User'}</h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
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
                    <span className="font-medium">{loading ? '...' : stats.svgsUploaded}</span>
                  </div>
                  <Progress value={Math.min((stats.svgsUploaded / 100) * 100, 100)} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Projects Created</span>
                    <span className="font-medium">{loading ? '...' : stats.projectsCreated}</span>
                  </div>
                  <Progress value={Math.min((stats.projectsCreated / 20) * 100, 100)} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Storage Used</span>
                    <span className="font-medium">{loading ? '...' : `${(stats.storageUsed / (1024 * 1024)).toFixed(1)} MB`}</span>
                  </div>
                  <Progress value={Math.min((stats.storageUsed / (100 * 1024 * 1024)) * 100, 100)} className="h-2" />
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
            <p>{stats.svgsUploaded === 0 ? 'No recent activity yet. Start by uploading your first SVG!' : 'Activity tracking coming soon!'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}