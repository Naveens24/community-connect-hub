import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createRequest } from '@/services/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, MapPin } from 'lucide-react';
import { AuthModal } from '@/components/AuthModal';
import { getCityDisplayName } from '@/lib/cities';

const categories = ['Technology', 'Other'];

const PostRequest = () => {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [payment, setPayment] = useState('');
  const [area, setArea] = useState('');
  const [society, setSociety] = useState('');
  const [loading, setLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Redirect to complete profile if no activeCity
  useEffect(() => {
    if (!authLoading && currentUser && userProfile && !userProfile.activeCity) {
      navigate('/complete-profile');
    }
  }, [authLoading, currentUser, userProfile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    if (!userProfile?.activeCity) {
      toast.error('Please complete your profile first');
      navigate('/complete-profile');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    if (!category) {
      toast.error('Please select a category');
      return;
    }
    const paymentNum = parseFloat(payment);
    if (isNaN(paymentNum) || paymentNum <= 0) {
      toast.error('Please enter a valid payment amount greater than 0');
      return;
    }

    try {
      setLoading(true);
      await createRequest(
        title,
        description,
        category,
        paymentNum,
        currentUser.uid,
        userProfile.activeCity,
        area.trim() || undefined,
        society.trim() || undefined
      );
      toast.success('Request posted successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to post request');
    } finally {
      setLoading(false);
    }
  };

  const cityDisplayName = userProfile?.activeCity 
    ? getCityDisplayName(userProfile.activeCity) 
    : '';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Post a Help Request</CardTitle>
            <CardDescription>
              Describe what you need help with and set a reward for the helper
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="What do you need help with?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide more details about your request..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  disabled={loading}
                  className="resize-none"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment">Reward Amount (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-muted-foreground text-sm font-medium">₹</span>
                    <Input
                      id="payment"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="100"
                      value={payment}
                      onChange={(e) => setPayment(e.target.value)}
                      className="pl-8"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-primary" />
                  Location Details
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={cityDisplayName}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    City is based on your active location and cannot be changed here.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="area">Area / Locality</Label>
                    <Input
                      id="area"
                      placeholder="e.g. Sarkanda, Koni"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="society">Society / Landmark (Optional)</Label>
                    <Input
                      id="society"
                      placeholder="e.g. Near XYZ Society"
                      value={society}
                      onChange={(e) => setSociety(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Post Request
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default PostRequest;
