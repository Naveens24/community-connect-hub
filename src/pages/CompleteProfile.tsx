import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/services/firestore';
import { toast } from 'sonner';
import { Loader2, MapPin, User } from 'lucide-react';
import { ACTIVE_CITIES } from '@/lib/cities';

const CompleteProfile = () => {
  const { currentUser, userProfile, loading: authLoading, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [activeCity, setActiveCity] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // If profile is complete, redirect to dashboard
    if (!authLoading && userProfile?.activeCity) {
      navigate('/');
    }
    // Pre-fill name if available
    if (userProfile?.name) {
      setFullName(userProfile.name);
    }
  }, [authLoading, userProfile, navigate]);

  useEffect(() => {
    // If not logged in, redirect to home
    if (!authLoading && !currentUser) {
      navigate('/');
    }
  }, [authLoading, currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!activeCity) {
      toast.error('Please select your active city');
      return;
    }
    if (!currentUser) return;

    try {
      setSaving(true);
      await updateUserProfile(currentUser.uid, {
        name: fullName.trim(),
        activeCity
      });
      await refreshUserProfile();
      toast.success('Profile completed! Welcome to Assistix');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <User className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Set up your profile to start using Assistix in your area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label>Active City *</Label>
              <Select value={activeCity} onValueChange={setActiveCity} disabled={saving}>
                <SelectTrigger className="w-full">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Tap to see active locations" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVE_CITIES.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Your active city determines which tasks you can see and post.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue to Dashboard
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteProfile;
