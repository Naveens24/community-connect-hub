import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { updateUserProfile, uploadProfileImage } from '@/services/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/AuthModal';
import { toast } from 'sonner';
import { Loader2, Camera, Plus, X, Trophy, Mail, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const Profile = () => {
  const { currentUser, userProfile, loading: authLoading, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setSkills(userProfile.skills || []);
    }
  }, [userProfile]);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      setAuthModalOpen(true);
    }
  }, [authLoading, currentUser]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      setUploading(true);
      await uploadProfileImage(currentUser.uid, file);
      await refreshUserProfile();
      toast.success('Profile image updated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSave = async () => {
    if (!currentUser) return;

    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      setSaving(true);
      await updateUserProfile(currentUser.uid, { name: name.trim(), skills });
      await refreshUserProfile();
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = 
    name !== (userProfile?.name || '') ||
    JSON.stringify(skills) !== JSON.stringify(userProfile?.skills || []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-32" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground mb-4">Please sign in to view your profile</p>
              <Button onClick={() => setAuthModalOpen(true)}>Sign In</Button>
            </CardContent>
          </Card>
        </main>
        <AuthModal open={authModalOpen} onClose={() => {
          setAuthModalOpen(false);
          if (!currentUser) navigate('/');
        }} />
      </div>
    );
  }

  const createdAt = userProfile?.createdAt?.toDate 
    ? format(userProfile.createdAt.toDate(), 'MMMM yyyy')
    : 'Recently';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={previewUrl || userProfile?.photoURL} />
                  <AvatarFallback className="text-2xl">
                    {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-semibold">{userProfile?.name}</h2>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 justify-center sm:justify-start">
                    <Mail className="h-4 w-4" />
                    {userProfile?.email}
                  </span>
                  <span className="flex items-center gap-1 justify-center sm:justify-start">
                    <Calendar className="h-4 w-4" />
                    Joined {createdAt}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center sm:justify-start">
              <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">{userProfile?.helpsGiven || 0}</span>
                <span className="text-muted-foreground">helps given</span>
              </div>
            </div>

            {/* Edit Form */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    disabled={saving}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={addSkill}
                    disabled={saving}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="gap-1 py-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-1 hover:text-destructive"
                          disabled={saving}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Button 
                onClick={handleSave} 
                disabled={saving || !hasChanges}
                className="w-full sm:w-auto"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
