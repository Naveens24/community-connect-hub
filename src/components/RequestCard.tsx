import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PitchModal } from '@/components/PitchModal';
import { AuthModal } from '@/components/AuthModal';
import { Request, hasUserPitched, updateRequestStatus, subscribeToPitches, Pitch, incrementHelpsGiven, deleteRequest } from '@/services/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { DollarSign, Clock, CheckCircle, MessageSquare, Users, Trash2 } from 'lucide-react';

interface RequestCardProps {
  request: Request;
}

const statusColors = {
  open: 'bg-green-500/10 text-green-600 border-green-500/20',
  in_review: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  assigned: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  completed: 'bg-muted text-muted-foreground border-muted',
};

const statusLabels = {
  open: 'Open',
  in_review: 'In Review',
  assigned: 'Assigned',
  completed: 'Completed',
};

export const RequestCard: React.FC<RequestCardProps> = ({ request }) => {
  const { currentUser } = useAuth();
  const [pitchModalOpen, setPitchModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [hasPitched, setHasPitched] = useState(false);
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [showPitches, setShowPitches] = useState(false);
  const [loading, setLoading] = useState(false);

  const isOwner = currentUser?.uid === request.createdBy;

  useEffect(() => {
    if (currentUser && request.id) {
      hasUserPitched(request.id, currentUser.uid).then(setHasPitched);
    }
  }, [currentUser, request.id]);

  useEffect(() => {
    if (showPitches && request.id) {
      const unsubscribe = subscribeToPitches(request.id, setPitches);
      return () => unsubscribe();
    }
  }, [showPitches, request.id]);

  const handleOfferHelp = () => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setPitchModalOpen(true);
  };

  const handleMarkCompleted = async () => {
    try {
      setLoading(true);
      await updateRequestStatus(request.id, 'completed');
      toast.success('Request marked as completed!');
    } catch (error) {
      toast.error('Failed to update request');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async () => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    try {
      setLoading(true);
      await deleteRequest(request.id);
      toast.success('Request deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete request');
    } finally {
      setLoading(false);
    }
  };

  const timeAgo = request.createdAt?.toDate 
    ? formatDistanceToNow(request.createdAt.toDate(), { addSuffix: true })
    : 'Just now';

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={request.creatorPhoto} />
                <AvatarFallback>
                  {request.creatorName?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{request.creatorName}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgo}
                </p>
              </div>
            </div>
            <Badge variant="outline" className={statusColors[request.status]}>
              {statusLabels[request.status]}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pb-3">
          <h3 className="font-semibold text-lg mb-2">{request.title}</h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
            {request.description}
          </p>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary">{request.category}</Badge>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
              <DollarSign className="h-4 w-4" />
              {request.payment}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-3 border-t">
          <div className="flex items-center justify-between w-full">
            {isOwner ? (
              <div className="flex items-center gap-2 w-full justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPitches(!showPitches)}
                  className="gap-2"
                >
                  <Users className="h-4 w-4" />
                  {showPitches ? 'Hide' : 'View'} Pitches
                </Button>
                <div className="flex items-center gap-2">
                  {request.status !== 'completed' && (
                    <Button
                      size="sm"
                      onClick={handleMarkCompleted}
                      disabled={loading}
                      className="gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark Completed
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteRequest}
                    disabled={loading}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleOfferHelp}
                disabled={hasPitched || request.status === 'completed' || request.status === 'assigned'}
                className="w-full gap-2"
                variant={hasPitched ? 'secondary' : 'default'}
              >
                <MessageSquare className="h-4 w-4" />
                {hasPitched ? 'Already Pitched' : request.status === 'assigned' ? 'Already Assigned' : request.status === 'completed' ? 'Completed' : 'Offer Help'}
              </Button>
            )}
          </div>

          {/* Pitches Section */}
          {showPitches && pitches.length > 0 && (
            <div className="w-full space-y-3 pt-3 border-t">
              <h4 className="text-sm font-medium">Pitches ({pitches.length})</h4>
              {pitches.map((pitch) => (
                <div key={pitch.id} className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={pitch.helperPhoto} />
                      <AvatarFallback>
                        {pitch.helperName?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{pitch.helperName}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{pitch.pitchText}</p>
                  {pitch.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {pitch.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {showPitches && pitches.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              No pitches yet
            </p>
          )}
        </CardFooter>
      </Card>

      <PitchModal
        open={pitchModalOpen}
        onClose={() => setPitchModalOpen(false)}
        requestId={request.id}
        requestTitle={request.title}
      />
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};
