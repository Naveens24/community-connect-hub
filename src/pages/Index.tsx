import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { LandingHero } from '@/components/LandingHero';
import { RequestCard } from '@/components/RequestCard';
import { RequestCardSkeleton } from '@/components/RequestCardSkeleton';
import { subscribeToRequestsByCity, Request } from '@/services/firestore';
import { seedDemoData } from '@/services/seedData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/AuthModal';
import { getCityDisplayName } from '@/lib/cities';

const categories = ['All', 'Technology', 'Design', 'Writing', 'Marketing', 'Finance', 'Legal', 'Other'];

const Index = () => {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  // Redirect to complete profile if logged in but no activeCity
  useEffect(() => {
    if (!authLoading && currentUser && userProfile && !userProfile.activeCity) {
      navigate('/complete-profile');
    }
  }, [authLoading, currentUser, userProfile, navigate]);

  useEffect(() => {
    // Seed demo data on first load
    seedDemoData();
  }, []);

  // Subscribe to requests filtered by user's active city
  useEffect(() => {
    if (!userProfile?.activeCity) {
      setLoading(false);
      setRequests([]);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToRequestsByCity(userProfile.activeCity, (reqs) => {
      setRequests(reqs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile?.activeCity]);

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || request.category === categoryFilter;
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const scrollToFeed = () => {
    feedRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGetStarted = () => {
    if (currentUser) {
      if (!userProfile?.activeCity) {
        navigate('/complete-profile');
      } else {
        scrollToFeed();
      }
    } else {
      setAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Landing Hero */}
      <LandingHero 
        onGetStarted={handleGetStarted}
        onBrowseRequests={scrollToFeed}
      />
      
      {/* Requests Feed Section */}
      <main ref={feedRef} className="container mx-auto px-4 py-12">
        {/* Header with City Badge */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <h2 className="text-3xl font-bold">Help Requests</h2>
            {userProfile?.activeCity && (
              <Badge variant="outline" className="gap-2 px-3 py-1.5 text-sm w-fit">
                <MapPin className="h-4 w-4 text-primary" />
                {getCityDisplayName(userProfile.activeCity)}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {userProfile?.activeCity 
              ? 'Browse requests in your area and offer your expertise to help others'
              : 'Sign in and set your location to see requests in your area'}
          </p>
        </div>

        {/* Show message if not logged in or no city */}
        {!currentUser || !userProfile?.activeCity ? (
          <div className="text-center py-16 bg-muted/30 rounded-lg">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground mb-2">
              {!currentUser 
                ? 'Sign in to see requests in your area'
                : 'Complete your profile to see requests'}
            </p>
            <p className="text-sm text-muted-foreground">
              {!currentUser
                ? 'Create an account to post and respond to help requests'
                : 'Select your active city to view and post requests'}
            </p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-3">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Requests Grid */}
            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <RequestCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredRequests.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground mb-2">No requests found</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || categoryFilter !== 'All' || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Be the first to post a help request in your area!'}
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="text-sm">© 2024 Assistix. Connecting skills with needs.</p>
        </div>
      </footer>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default Index;
