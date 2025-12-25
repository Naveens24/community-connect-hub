import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Users, CheckCircle, Zap } from 'lucide-react';

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
            <span>Community-Powered Help</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Get Everyday Help from{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Your Neighbors
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Need help carrying groceries? Setting up your phone? Or just finding directions? 
            Connect with helpful people in your locality who are ready to assist.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" onClick={onGetStarted} className="text-lg px-8">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={onBrowseRequests} className="text-lg px-8">
              Browse Requests
            </Button>
          </div>

          {/* How Assistix Works - 3 Step Flow */}
          <div className="bg-card border rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-8 text-center">How Assistix Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <StepCard
                stepNumber={1}
                icon={<MapPin className="h-6 w-6 text-primary" />}
                title="Choose Your City"
                description="Select your active city to see requests and helpers in your area."
              />
              <StepCard
                stepNumber={2}
                icon={<Users className="h-6 w-6 text-primary" />}
                title="Post or Browse Requests"
                description="Need help? Post a request. Want to help? Browse what neighbors need."
              />
              <StepCard
                stepNumber={3}
                icon={<CheckCircle className="h-6 w-6 text-primary" />}
                title="Help Nearby, Instantly"
                description="Connect with helpers, get things done, and build community trust."
              />
            </div>
          </div>
        </div>

        {/* Why Assistix Section */}
        <div className="mt-16 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Why Assistix?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              title="Hyperlocal Help"
              description="Get assistance from people who are just around the corner. No waiting for professionals."
            />
            <FeatureCard
              title="Everyday Tasks"
              description="From carrying groceries to tutoring kids — find help for simple, everyday needs."
            />
            <FeatureCard
              title="Community Trust"
              description="Build connections with neighbors. Help others and earn recognition in your community."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StepCard: React.FC<{
  stepNumber: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ stepNumber, icon, title, description }) => (
  <div className="text-center relative">
    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
      {icon}
    </div>
    <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center md:left-1/2 md:-translate-x-[4rem]">
      {stepNumber}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
);

const FeatureCard: React.FC<{
  title: string;
  description: string;
}> = ({ title, description }) => (
  <div className="p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow text-center">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
);
