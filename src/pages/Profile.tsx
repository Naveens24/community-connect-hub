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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateUserProfile, uploadProfileImage, subscribeToUserRequests, subscribeToUserPitches, updateRequestStatus, deleteRequest, deletePitch, subscribeToPitches, Request, Pitch } from '@/services/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/AuthModal';
import { toast } from 'sonner';
import { Loader2, Camera, Plus, X, Trophy, Mail, Calendar, FileText, MessageSquare, DollarSign, MapPin, Trash2, CheckCircle, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { format, formatDistanceToNow } from 'date-fns';
import { ACTIVE_CITIES, getCityDisplayName } from '@/lib/cities';

const Profile = () => {
  const { currentUser, userProfile, loading: authLoading, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [activeCity, setActiveCity] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [userRequests, setUserRequests] = useState<Request[]>([]);
  const [userPitches, setUserPitches] = useState<(Pitch & { requestTitle?: string })[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [deleteRequestModalOpen, setDeleteRequestModalOpen] = useState(false);
  const [deletePitchModalOpen, setDeletePitchModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedPitchId, setSelectedPitchId] = useState<string | null>(null);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const [requestPitches, setRequestPitches] = useState<Record<string, Pitch[]>>({});
  const [loadingPitches, setLoadingPitches] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setSkills(userProfile.skills || []);
      setActiveCity(userProfile.activeCity || '');
    }
  }, [userProfile]);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      setAuthModalOpen(true);
    }
  }, [authLoading, currentUser]);

  // Subscribe to user's requests and pitches in real-time
  useEffect(() => {
    if (!currentUser) return;
    
    setLoadingData(true);
    
    const unsubRequests = subscribeToUserRequests(currentUser.uid, (requests) => {
      setUserRequests(requests);
      setLoadingData(false);
    });
    
    const unsubPitches = subscribeToUserPitches(currentUser.uid, (pitches) => {
      setUserPitches(pitches);
    });
    
    return () => {
      unsubRequests();
      unsubPitches();
    };
  }, [currentUser]);

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

    if (!activeCity) {
      toast.error('Please select an active city');
      return;
    }

    try {
      setSaving(true);
      await updateUserProfile(currentUser.uid, { 
        name: name.trim(), 
        skills,
        activeCity 
      });
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
    JSON.stringify(skills) !== JSON.stringify(userProfile?.skills || []) ||
    activeCity !== (userProfile?.activeCity || '');

  const handleDeleteRequest = async () => {
    if (!selectedRequestId) return;
    try {
      setActionLoading(selectedRequestId);
      await deleteRequest(selectedRequestId);
      toast.success('Request deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete request');
    } finally {
      setActionLoading(null);
      setDeleteRequestModalOpen(false);
      setSelectedRequestId(null);
    }
  };

  const handleMarkCompleted = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      await updateRequestStatus(requestId, 'completed');
      toast.success('Request marked as completed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeletePitch = async () => {
    if (!selectedPitchId) return;
    try {
      setActionLoading(selectedPitchId);
      await deletePitch(selectedPitchId);
      toast.success('Pitch deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete pitch');
    } finally {
      setActionLoading(null);
      setDeletePitchModalOpen(false);
      setSelectedPitchId(null);
    }
  };

  const toggleViewPitches = (requestId: string) => {
    if (expandedRequestId === requestId) {
      setExpandedRequestId(null);
    } else {
      setExpandedRequestId(requestId);
      // Load pitches if not already loaded
      if (!requestPitches[requestId]) {
        setLoadingPitches(prev => ({ ...prev, [requestId]: true }));
        const unsubscribe = subscribeToPitches(requestId, (pitches) => {
          setRequestPitches(prev => ({ ...prev, [requestId]: pitches }));
          setLoadingPitches(prev => ({ ...prev, [requestId]: false }));
        });
        // Store unsubscribe function for cleanup (simplified - in production you'd track these)
      }
    }
  };

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
                {userProfile?.activeCity && (
                  <div className="flex items-center gap-1 justify-center sm:justify-start mt-2">
                    <Badge variant="secondary" className="gap-1">
                      <MapPin className="h-3 w-3" />
                      {getCityDisplayName(userProfile.activeCity)}
                    </Badge>
                  </div>
                )}
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

              {/* Active City */}
              <div className="space-y-2">
                <Label>Active City</Label>
                <Select value={activeCity} onValueChange={setActiveCity} disabled={saving}>
                  <SelectTrigger className="w-full">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Select your active city" />
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

            {/* User Activity Tabs */}
            <Tabs defaultValue="requests" className="mt-8">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="requests" className="gap-2">
                  <FileText className="h-4 w-4" />
                  My Requests ({userRequests.length})
                </TabsTrigger>
                <TabsTrigger value="pitches" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  My Pitches ({userPitches.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="requests" className="mt-4">
                {loadingData ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : userRequests.length > 0 ? (
                  <div className="space-y-3">
                    {userRequests.map(request => (
                      <Card key={request.id} className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-medium">{request.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {request.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              <Badge variant="secondary">{request.category}</Badge>
                              <span className="flex items-center gap-1 text-sm text-green-600">
                                <DollarSign className="h-3 w-3" />
                                {request.payment}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {request.createdAt?.toDate 
                                  ? formatDistanceToNow(request.createdAt.toDate(), { addSuffix: true })
                                  : 'Recently'}
                              </span>
                            </div>
                            {/* Action buttons */}
                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleViewPitches(request.id)}
                                className="gap-1"
                              >
                                {expandedRequestId === request.id ? (
                                  <>
                                    <EyeOff className="h-3 w-3" />
                                    Hide Pitches
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-3 w-3" />
                                    View Pitches
                                  </>
                                )}
                              </Button>
                              {request.status !== 'completed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleMarkCompleted(request.id)}
                                  disabled={actionLoading === request.id}
                                  className="gap-1"
                                >
                                  {actionLoading === request.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-3 w-3" />
                                  )}
                                  Mark Completed
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedRequestId(request.id);
                                  setDeleteRequestModalOpen(true);
                                }}
                                disabled={actionLoading === request.id}
                                className="gap-1 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </Button>
                            </div>
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            {request.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        {/* Pitches section */}
                        {expandedRequestId === request.id && (
                          <div className="mt-4 pt-4 border-t">
                            <h5 className="text-sm font-medium mb-2">Pitches for this request</h5>
                            {loadingPitches[request.id] ? (
                              <div className="space-y-2">
                                {[1, 2].map(i => (
                                  <Skeleton key={i} className="h-16 w-full" />
                                ))}
                              </div>
                            ) : requestPitches[request.id]?.length > 0 ? (
                              <div className="space-y-2">
                                {requestPitches[request.id].map(pitch => (
                                  <div key={pitch.id} className="p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-sm">{pitch.helperName}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{pitch.pitchText}</p>
                                    {pitch.skills.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {pitch.skills.map(skill => (
                                          <Badge key={skill} variant="outline" className="text-xs">
                                            {skill}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No pitches received yet</p>
                            )}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>You haven't posted any requests yet</p>
                    <Button variant="link" onClick={() => navigate('/post-request')} className="mt-2">
                      Post your first request
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="pitches" className="mt-4">
                {loadingData ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : userPitches.length > 0 ? (
                  <div className="space-y-3">
                    {userPitches.map(pitch => (
                      <Card key={pitch.id} className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">Pitched for:</p>
                            <h4 className="font-medium">{pitch.requestTitle}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                              {pitch.pitchText}
                            </p>
                            {pitch.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {pitch.skills.map(skill => (
                                  <Badge key={skill} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {pitch.createdAt?.toDate 
                                ? formatDistanceToNow(pitch.createdAt.toDate(), { addSuffix: true })
                                : 'Recently'}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPitchId(pitch.id);
                              setDeletePitchModalOpen(true);
                            }}
                            disabled={actionLoading === pitch.id}
                            className="gap-1 text-destructive hover:text-destructive shrink-0"
                          >
                            {actionLoading === pitch.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                            Delete
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>You haven't submitted any pitches yet</p>
                    <Button variant="link" onClick={() => navigate('/')} className="mt-2">
                      Browse requests to help
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <DeleteConfirmModal
        open={deleteRequestModalOpen}
        onClose={() => {
          setDeleteRequestModalOpen(false);
          setSelectedRequestId(null);
        }}
        onConfirm={handleDeleteRequest}
        title="Delete Request?"
        message="Are you sure you want to delete this request? This action cannot be undone."
      />

      <DeleteConfirmModal
        open={deletePitchModalOpen}
        onClose={() => {
          setDeletePitchModalOpen(false);
          setSelectedPitchId(null);
        }}
        onConfirm={handleDeletePitch}
        title="Delete Pitch?"
        message="Are you sure you want to delete this pitch? This action cannot be undone."
      />
    </div>
  );
};

export default Profile;
