import React from 'react'
import { 
  BookOpen, 
  CreditCard, 
  Star, 
  Shield, 
  Zap, 
  Target, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  ArrowRight,
  DollarSign,
  BarChart3,
  Smartphone,
  Globe,
  Lock,
  Headphones
} from 'lucide-react'

const UserGuide: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            TakaTrack User Guide
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Your complete guide to mastering personal finance with TakaTrack. 
            Learn how to track expenses, set budgets, achieve goals, and take control of your financial future.
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="card text-center">
            <Zap className="w-8 h-8 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
            <p className="text-gray-600 dark:text-gray-400">Learn the basics and set up your account</p>
          </div>
          <div className="card text-center">
            <Target className="w-8 h-8 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Features Guide</h3>
            <p className="text-gray-600 dark:text-gray-400">Master all TakaTrack features</p>
          </div>
          <div className="card text-center">
            <CreditCard className="w-8 h-8 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Pricing & Plans</h3>
            <p className="text-gray-600 dark:text-gray-400">Choose the perfect plan for you</p>
          </div>
        </div>

        {/* Getting Started Section */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Getting Started</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Step 1: Create Your Account</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-sm font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Sign Up</p>
                    <p className="text-gray-600 dark:text-gray-400">Create your account with email and password</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-sm font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Verify Email</p>
                    <p className="text-gray-600 dark:text-gray-400">Check your email and click the verification link</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-sm font-bold text-blue-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Complete Profile</p>
                    <p className="text-gray-600 dark:text-gray-400">Add your personal information and preferences</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Step 2: Set Up Your First Transaction</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-sm font-bold text-green-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Add Income</p>
                    <p className="text-gray-600 dark:text-gray-400">Record your salary, freelance income, or other earnings</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-sm font-bold text-green-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Track Expenses</p>
                    <p className="text-gray-600 dark:text-gray-400">Log your daily expenses with categories and notes</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-sm font-bold text-green-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Review Dashboard</p>
                    <p className="text-gray-600 dark:text-gray-400">See your financial overview and insights</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Guide */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-4">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Features Guide</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Dashboard */}
            <div className="card">
              <div className="flex items-center mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold">Dashboard</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Get a complete overview of your finances with real-time summaries, charts, and insights.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Financial summary cards
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Recent transactions
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Quick action buttons
                </li>
              </ul>
            </div>

            {/* Transactions */}
            <div className="card">
              <div className="flex items-center mb-4">
                <DollarSign className="w-6 h-6 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold">Transactions</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Track all your income and expenses with detailed categorization and notes.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Add/edit/delete transactions
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Category management
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Filter and search
                </li>
              </ul>
            </div>

            {/* Budgets */}
            <div className="card">
              <div className="flex items-center mb-4">
                <Target className="w-6 h-6 text-purple-600 mr-3" />
                <h3 className="text-lg font-semibold">Budgets</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Set spending limits and track your progress with visual progress bars.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Monthly budget limits
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Progress tracking
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Overspend alerts
                </li>
              </ul>
            </div>

            {/* Goals */}
            <div className="card">
              <div className="flex items-center mb-4">
                <TrendingUp className="w-6 h-6 text-orange-600 mr-3" />
                <h3 className="text-lg font-semibold">Financial Goals</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Set and track your financial objectives like saving for a house or vacation.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Goal setting
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Progress visualization
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Achievement tracking
                </li>
              </ul>
            </div>

            {/* Settings */}
            <div className="card">
              <div className="flex items-center mb-4">
                <Shield className="w-6 h-6 text-gray-600 mr-3" />
                <h3 className="text-lg font-semibold">Settings</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Customize your experience and manage your account preferences.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Profile management
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Password changes
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Data export
                </li>
              </ul>
            </div>

            {/* Mobile App */}
            <div className="card">
              <div className="flex items-center mb-4">
                <Smartphone className="w-6 h-6 text-indigo-600 mr-3" />
                <h3 className="text-lg font-semibold">Mobile Ready</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Access TakaTrack from any device with our responsive design.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Mobile-first design
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Touch-friendly interface
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Offline support
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Pricing & Plans */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-4">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Pricing & Plans</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="card border-2 border-gray-200 dark:border-gray-700">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Free</h3>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">$0</div>
                <p className="text-gray-600 dark:text-gray-400">Perfect for getting started</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Up to 100 transactions</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Basic budgeting</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>1 financial goal</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Mobile access</span>
                </li>
              </ul>
              <button className="btn btn-outline btn-md w-full">
                <span className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="font-semibold">Get Started Free</span>
                </span>
              </button>
            </div>

            {/* Pro Plan */}
            <div className="card border-2 border-blue-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pro</h3>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">$9.99</div>
                <p className="text-gray-600 dark:text-gray-400">per month</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Unlimited transactions</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Advanced budgeting</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Unlimited goals</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>AI insights</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Data export</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Priority support</span>
                </li>
              </ul>
              <button className="btn btn-primary btn-md w-full">
                <span className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="font-semibold">Start Pro Trial</span>
                </span>
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="card border-2 border-gray-200 dark:border-gray-700">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">$29.99</div>
                <p className="text-gray-600 dark:text-gray-400">per month</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Team collaboration</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Custom categories</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>API access</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Dedicated support</span>
                </li>
              </ul>
              <button className="btn btn-outline btn-md w-full">
                <span className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="font-semibold">Contact Sales</span>
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-4">
              <Star className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why Choose TakaTrack?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Bank-Level Security</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your financial data is protected with AES-256 encryption and secure authentication.
              </p>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Built with modern technology for instant loading and smooth user experience.
              </p>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Access Anywhere</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Use TakaTrack on any device - desktop, tablet, or mobile with responsive design.
              </p>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get help whenever you need it with our dedicated customer support team.
              </p>
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Success Stories</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
                  <span className="text-lg font-bold text-blue-600">SM</span>
                </div>
                <div>
                  <h4 className="font-semibold">Sarah M.</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Marketing Manager</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                "TakaTrack helped me save $5,000 in 6 months by showing me exactly where my money was going. The budgeting features are incredible!"
              </p>
              <div className="flex items-center mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>

            <div className="card">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-4">
                  <span className="text-lg font-bold text-green-600">JD</span>
                </div>
                <div>
                  <h4 className="font-semibold">John D.</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Freelancer</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                "As a freelancer, tracking irregular income was a challenge. TakaTrack's goal-setting features helped me build a $10K emergency fund."
              </p>
              <div className="flex items-center mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>

            <div className="card">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-4">
                  <span className="text-lg font-bold text-purple-600">AL</span>
                </div>
                <div>
                  <h4 className="font-semibold">Alex L.</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Student</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                "Perfect for students! The mobile app makes it easy to track expenses on the go. I've learned so much about managing money."
              </p>
              <div className="flex items-center mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="card bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Take Control of Your Finances?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of users who have transformed their financial lives with TakaTrack.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn btn-secondary btn-lg shadow-lg hover:shadow-xl">
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="font-bold">Start Free Trial</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </span>
              </button>
              <button className="btn btn-outline btn-lg shadow-lg hover:shadow-xl border-white text-white hover:bg-white hover:text-blue-600">
                <span className="flex items-center justify-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  <span className="font-bold">View Pricing</span>
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default UserGuide
