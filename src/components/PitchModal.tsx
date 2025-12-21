import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createPitch } from '@/services/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, X, Plus } from 'lucide-react';

interface PitchModalProps {
  open: boolean;
  onClose: () => void;
  requestId: string;
  requestTitle: string;
}

export const PitchModal: React.FC<PitchModalProps> = ({ 
  open, 
  onClose, 
  requestId, 
  requestTitle 
}) => {
  const { currentUser } = useAuth();
  const [pitchText, setPitchText] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Please sign in to submit a pitch');
      return;
    }
    if (!pitchText.trim()) {
      toast.error('Please write your pitch');
      return;
    }

    try {
      setLoading(true);
      await createPitch(requestId, currentUser.uid, pitchText, skills);
      toast.success('Pitch submitted successfully!');
      onClose();
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit pitch');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPitchText('');
    setSkills([]);
    setSkillInput('');
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Offer Help</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            For: <span className="font-medium text-foreground">{requestTitle}</span>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="pitch">Your Pitch</Label>
            <Textarea
              id="pitch"
              placeholder="Explain why you're the best person to help with this request..."
              value={pitchText}
              onChange={(e) => setPitchText(e.target.value)}
              rows={5}
              disabled={loading}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Relevant Skills</Label>
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
                disabled={loading}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={addSkill}
                disabled={loading}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-destructive"
                      disabled={loading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Pitch
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
