import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Briefcase, Star, Zap } from 'lucide-react';

interface LandingHeroProps {
  onGetStarted: () => void;
  onBrowseRequests: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onGetStarted, onBrowseRequests }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 py-16 md:py-24 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            <span>Community-Powered Assistance</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Get Help from{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Skilled Experts
            </span>{' '}
            in Your Community
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Post your requests, connect with talented helpers, and get things done. 
            Whether it's tech, design, writing, or any skill — find the right person for the job.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" onClick={onGetStarted} className="text-lg px-8">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={onBrowseRequests} className="text-lg px-8">
              Browse Requests
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-bold">500+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-bold">1,200+</div>
              <div className="text-sm text-muted-foreground">Tasks Completed</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-bold">4.9</div>
              <div className="text-sm text-muted-foreground">Avg Rating</div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard
            icon={<div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Briefcase className="h-6 w-6 text-primary" /></div>}
            title="Post Your Request"
            description="Describe what you need help with, set your budget, and let experts come to you."
          />
          <FeatureCard
            icon={<div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Users className="h-6 w-6 text-primary" /></div>}
            title="Review Pitches"
            description="Compare offers from skilled community members and choose the best fit."
          />
          <FeatureCard
            icon={<div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Star className="h-6 w-6 text-primary" /></div>}
            title="Get It Done"
            description="Collaborate with your chosen helper and mark the task complete when satisfied."
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow">
    <div className="mb-4">{icon}</div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
);
