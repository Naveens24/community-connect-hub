import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile, uploadProfileImage } from '@/services/firestore';
import { toast } from 'sonner';
import { Loader2, MapPin, User, Camera, Lock, Eye, EyeOff } from 'lucide-react';
import { ACTIVE_CITIES } from '@/lib/cities';

const CompleteProfile = () => {
  const { currentUser, userProfile, loading: authLoading, refreshUserProfile, linkPassword, clearNewUserFlag } = useAuth();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [activeCity, setActiveCity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user logged in via Google (no password provider)
  const isGoogleUser = currentUser?.providerData?.some(p => p.providerId === 'google.com') ?? false;
  const hasPasswordProvider = currentUser?.providerData?.some(p => p.providerId === 'password') ?? false;

  useEffect(() => {
    // Pre-fill data if available
    if (userProfile?.name) {
      setFullName(userProfile.name);
    }
    if (userProfile?.photoURL) {
      setPreviewUrl(userProfile.photoURL);
    }
    if (userProfile?.activeCity) {
      setActiveCity(userProfile.activeCity);
    }
  }, [userProfile]);

  useEffect(() => {
    // If profile is complete and user is not new, redirect to dashboard
    if (!authLoading && userProfile?.activeCity && !window.location.pathname.includes('complete-profile')) {
      navigate('/');
    }
  }, [authLoading, userProfile, navigate]);

  useEffect(() => {
    // If not logged in, redirect to home
    if (!authLoading && !currentUser) {
      navigate('/');
    }
  }, [authLoading, currentUser, navigate]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    // Preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Firebase Storage
    try {
      setUploadingImage(true);
      await uploadProfileImage(currentUser.uid, file);
      toast.success('Profile image uploaded!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

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

    // Validate password if provided
    if (password) {
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }

    try {
      setSaving(true);

      // Link password if provided and user is Google-only
      if (password && isGoogleUser && !hasPasswordProvider) {
        try {
          await linkPassword(password);
          toast.success('Password set successfully!');
        } catch (error: any) {
          if (error.code === 'auth/provider-already-linked') {
            toast.info('Email/password already linked to this account');
          } else {
            throw error;
          }
        }
      }

      // Update profile
      await updateUserProfile(currentUser.uid, {
        name: fullName.trim(),
        activeCity
      });
      
      await refreshUserProfile();
      clearNewUserFlag();
      
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

  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : currentUser?.email?.slice(0, 2).toUpperCase() || 'U';

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
            {/* Profile Image */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={previewUrl || undefined} />
                  <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {uploadingImage ? (
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
              <p className="text-xs text-muted-foreground">Tap to upload profile photo</p>
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={currentUser?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>

            {/* Full Name */}
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

            {/* Active City */}
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

            {/* Password Setup (optional for Google users) */}
            {isGoogleUser && !hasPasswordProvider && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Set a Password (Optional)</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Set a password to also login with email & password in the future.
                </p>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={saving}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {password && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={saving}
                    />
                  </div>
                )}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={saving || uploadingImage}>
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
