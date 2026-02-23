'use client'

import { useState, useEffect } from 'react'
import { Wallet, TrendingUp, TrendingDown, Target, ArrowRight, X } from 'lucide-react'

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to MyWallet',
    description: "Your personal financial compass. Let's take a quick tour to help you get started on your journey to better financial health.",
    icon: <Wallet className="w-12 h-12 text-emerald-400" />,
    color: 'from-emerald-500/20 to-emerald-500/5',
    accent: 'text-emerald-400'
  },
  {
    id: 'income',
    title: 'Track Your Incomes',
    description: 'Log your salary, freelance earnings, or any other money you receive. Fast, simple, and organized.',
    icon: <TrendingUp className="w-12 h-12 text-blue-400" />,
    color: 'from-blue-500/20 to-blue-500/5',
    accent: 'text-blue-400'
  },
  {
    id: 'expenses',
    title: 'Monitor Expenses',
    description: 'Keep a close eye on where your money goes. Categorize your spending to find areas where you can save.',
    icon: <TrendingDown className="w-12 h-12 text-red-400" />,
    color: 'from-red-500/20 to-red-500/5',
    accent: 'text-red-400'
  },
  {
    id: 'goals',
    title: 'Set Monthly Goals',
    description: 'Budgeting is key. Set spending limits for different categories and watch your progress throughout the month.',
    icon: <Target className="w-12 h-12 text-purple-400" />,
    color: 'from-purple-500/20 to-purple-500/5',
    accent: 'text-purple-400'
  }
]

export default function OnboardingGuide() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const hasSeen = localStorage.getItem('has_seen_onboarding')
    if (!hasSeen) {
      // Small delay to let the dashboard render first, makes it feel smoother
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('has_seen_onboarding', 'true')
    setIsVisible(false)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleDismiss()
    }
  }

  if (!isMounted || !isVisible) return null

  const step = steps[currentStep]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleDismiss}
      />
      
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden animate-slide-in">
        {/* Top Gradient Blob */}
        <div className={`absolute top-0 left-0 right-0 h-48 bg-gradient-to-b ${step.color} opacity-60`} />
        
        {/* Dismiss Button */}
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-950/20 hover:bg-neutral-950/40 text-neutral-400 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative pt-12 px-8 pb-8 text-center flex flex-col items-center">
          <div className="bg-neutral-950 p-4 rounded-3xl shadow-xl border border-neutral-800 mb-6 drop-shadow-2xl">
            {step.icon}
          </div>
          
          <h2 className={`text-2xl font-bold mb-3 ${step.accent}`}>
            {step.title}
          </h2>
          
          <p className="text-neutral-400 leading-relaxed min-h-[4rem]">
            {step.description}
          </p>
        </div>

        {/* Footer/Controls */}
        <div className="bg-neutral-950/50 p-6 flex flex-col gap-4 border-t border-neutral-800">
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-2">
            {steps.map((_, idx) => (
              <div 
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep 
                    ? `w-6 bg-current ${steps[idx].accent}` 
                    : 'w-1.5 bg-neutral-700'
                }`}
              />
            ))}
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleDismiss}
              className="flex-1 py-3 rounded-xl border border-neutral-700 text-neutral-400 font-medium hover:bg-neutral-800 hover:text-white transition-colors"
            >
              Skip
            </button>
            <button 
              onClick={handleNext}
              className="flex-[2] py-3 rounded-xl bg-white text-neutral-950 font-bold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
              {currentStep < steps.length - 1 && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
