'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, TrendingUp, MapPin, DollarSign, Clock, Users, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';

interface BusinessIdea {
  id: number;
  name: string;
  category: string;
  tagline: string;
  opportunityScore: number;
  demandLevel: string;
  competitorDensity: string;
  estimatedStartupCost: string;
  timeToProfit: string;
  whyNow: string;
  targetCustomer: string;
}

const CATEGORIES = [
  { name: 'Food & Beverage',      icon: '☕', count: 142, color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { name: 'Retail & Fashion',     icon: '👗', count: 98,  color: 'bg-pink-50 border-pink-200 text-pink-700' },
  { name: 'Trades & Services',    icon: '🔧', count: 87,  color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { name: 'Health & Wellness',    icon: '💪', count: 76,  color: 'bg-green-50 border-green-200 text-green-700' },
  { name: 'Tech & Digital',       icon: '💻', count: 64,  color: 'bg-violet-50 border-violet-200 text-violet-700' },
  { name: 'Education & Training', icon: '📚', count: 53,  color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { name: 'Home & Garden',        icon: '🏡', count: 45,  color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { name: 'Auto & Transport',     icon: '🚗', count: 38,  color: 'bg-slate-50 border-slate-200 text-slate-700' },
];

const getDemandColor = (level: string) => {
  if (level === 'High')    return 'bg-green-100 text-green-700';
  if (level === 'Growing') return 'bg-blue-100 text-blue-700';
  return 'bg-yellow-100 text-yellow-700';
};

const getCompetitorColor = (density: string) => {
  if (density === 'Low')    return 'bg-green-100 text-green-700';
  if (density === 'Medium') return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

const getScoreColor = (score: number) => {
  if (score >= 85) return 'text-green-600';
  if (score >= 70) return 'text-indigo-600';
  return 'text-amber-600';
};

const getScoreBg = (score: number) => {
  if (score >= 85) return 'bg-green-50 border-green-200';
  if (score >= 70) return 'bg-indigo-50 border-indigo-200';
  return 'bg-amber-50 border-amber-200';
};

export default function ExploreBusinessIdeasPage() {
  const [query, setQuery]               = useState('');
  const [ideas, setIdeas]               = useState<BusinessIdea[]>([]);
  const [loading, setLoading]           = useState(false);
  const [searched, setSearched]         = useState(false);
  const [searchedQuery, setSearchedQuery] = useState('');
  const [error, setError]               = useState('');

  const handleSearch = async (searchQuery?: string) => {
    const term = searchQuery ?? query;
    if (!term.trim()) return;

    setLoading(true);
    setError('');
    setSearched(false);

    try {
      const res = await fetch('/api/explore-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: term }),
      });

      if (!res.ok) throw new Error('Failed to fetch ideas');

      const data = await res.json();
      setIdeas(data.ideas || []);
      setSearchedQuery(term);
      setSearched(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    setQuery(categoryName);
    handleSearch(categoryName);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium">
            <span>←</span> Home
          </Link>
          <span className="font-bold text-slate-900 text-lg tracking-tight">
            GlobalBiz <span className="text-indigo-600">AI</span>
          </span>
          <Link
            href="/analyze"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            Start free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-50 to-white pt-16 pb-10 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-6">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <span className="text-indigo-600 text-sm font-medium">Suburb-validated opportunities across Australia</span>
          </div>

          <h1 className="text-5xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
            Explore <span className="text-indigo-600">Business Ideas</span>
          </h1>
          <p className="text-lg text-slate-500 mb-10 max-w-xl mx-auto leading-relaxed">
            Discover validated opportunities for the Australian market. Every idea is scored
            against real demand signals, competitor density, and market gaps.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="flex items-center bg-white border-2 border-slate-200 rounded-2xl shadow-md hover:border-indigo-300 focus-within:border-indigo-500 focus-within:shadow-lg transition-all duration-200">
              <div className="pl-5 pr-3 flex-shrink-0">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by industry or keyword (e.g. coffee, cleaning, fitness)..."
                className="flex-1 py-4 pr-3 text-slate-800 placeholder-slate-400 bg-transparent outline-none text-base font-medium"
              />
              <button
                onClick={() => handleSearch()}
                disabled={loading || !query.trim()}
                className="m-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-all duration-150 flex items-center gap-2 flex-shrink-0"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Searching...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Search
                  </>
                )}
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-400 flex items-center justify-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Ideas ranked by opportunity score for Australian market conditions
            </p>
          </div>

          {/* Quick search tags */}
          {!searched && (
            <div className="mt-5 flex flex-wrap gap-2 justify-center">
              {['Coffee shop', 'Mobile mechanic', 'Childcare', 'Dog grooming', 'Cleaning', 'Tutoring'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => { setQuery(tag); handleSearch(tag); }}
                  className="text-sm bg-white border border-slate-200 text-slate-600 rounded-full px-3 py-1 hover:border-indigo-400 hover:text-indigo-600 transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Loading skeleton */}
      {loading && (
        <section className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 bg-indigo-50 rounded-xl px-6 py-3">
              <svg className="animate-spin h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="text-indigo-700 font-medium">Analysing Australian market opportunities...</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-slate-200 rounded w-full mb-2" />
                <div className="h-3 bg-slate-200 rounded w-2/3 mb-6" />
                <div className="flex gap-2">
                  <div className="h-6 bg-slate-200 rounded-full w-16" />
                  <div className="h-6 bg-slate-200 rounded-full w-20" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Error */}
      {error && (
        <section className="max-w-2xl mx-auto px-6 py-10 text-center">
          <p className="text-red-600 bg-red-50 border border-red-200 rounded-xl px-6 py-4">{error}</p>
        </section>
      )}

      {/* Results */}
      {searched && !loading && ideas.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {ideas.length} ideas found for <span className="text-indigo-600">"{searchedQuery}"</span>
              </h2>
              <p className="text-sm text-slate-500 mt-1">Ranked by opportunity score — highest first</p>
            </div>
            <button
              onClick={() => { setSearched(false); setIdeas([]); setQuery(''); }}
              className="text-sm text-slate-400 hover:text-slate-700 transition-colors"
            >
              Clear results
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...ideas]
              .sort((a, b) => b.opportunityScore - a.opportunityScore)
              .map((idea) => (
                <div
                  key={idea.id}
                  className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-200 flex flex-col"
                >
                  {/* Score badge + category */}
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 rounded-full px-3 py-1">
                      {idea.category}
                    </span>
                    <div className={`flex items-center gap-1.5 border rounded-xl px-3 py-1.5 ${getScoreBg(idea.opportunityScore)}`}>
                      <TrendingUp className={`w-3.5 h-3.5 ${getScoreColor(idea.opportunityScore)}`} />
                      <span className={`text-sm font-bold ${getScoreColor(idea.opportunityScore)}`}>
                        {idea.opportunityScore}
                      </span>
                    </div>
                  </div>

                  {/* Name + tagline */}
                  <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">{idea.name}</h3>
                  <p className="text-sm text-slate-500 mb-4 leading-relaxed flex-1">{idea.tagline}</p>

                  {/* Demand + Competitor pills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${getDemandColor(idea.demandLevel)}`}>
                      ↑ {idea.demandLevel} demand
                    </span>
                    <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${getCompetitorColor(idea.competitorDensity)}`}>
                      {idea.competitorDensity} competition
                    </span>
                  </div>

                  {/* Key metrics */}
                  <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-start gap-2">
                      <DollarSign className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Startup cost</p>
                        <p className="text-xs text-slate-700 font-semibold">{idea.estimatedStartupCost}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Time to profit</p>
                        <p className="text-xs text-slate-700 font-semibold">{idea.timeToProfit}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 col-span-2">
                      <Users className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Target customer</p>
                        <p className="text-xs text-slate-700 font-semibold">{idea.targetCustomer}</p>
                      </div>
                    </div>
                  </div>

                  {/* Why now */}
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 mb-4">
                    <p className="text-xs text-indigo-700 font-semibold mb-1">Why now in Australia?</p>
                    <p className="text-xs text-indigo-600 leading-relaxed">{idea.whyNow}</p>
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/analyze?idea=${encodeURIComponent(idea.name)}&category=${encodeURIComponent(idea.category)}`}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                  >
                    Validate this idea
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center bg-gradient-to-r from-indigo-50 to-slate-50 border border-indigo-100 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Found an idea you like?</h3>
            <p className="text-slate-500 mb-5 text-sm">Get a full feasibility report with suburb analysis, budget fit score, and competitor mapping.</p>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Generate your founder report
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Browse by Category (shown when not searched) */}
      {!searched && !loading && (
        <section className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-indigo-600 tracking-widest uppercase mb-2">Browse by Category</p>
            <h2 className="text-2xl font-bold text-slate-900">What kind of business are you exploring?</h2>
            <p className="text-slate-500 text-sm mt-2">Click a category to see AI-generated opportunities</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className={`flex flex-col items-center gap-3 p-5 border-2 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-md text-center ${cat.color}`}
              >
                <span className="text-3xl">{cat.icon}</span>
                <div>
                  <p className="font-semibold text-sm">{cat.name}</p>
                  <p className="text-xs opacity-70 mt-0.5">{cat.count} ideas</p>
                </div>
              </button>
            ))}
          </div>

          {/* Trending searches */}
          <div className="mt-10 bg-slate-50 border border-slate-100 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Trending searches this week
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Bubble tea', 'Mobile pet grooming', 'EV charging station', 'Home tutoring', 'Meal prep delivery', 'Solar installation', 'Coworking space', 'Aged care services'].map((term) => (
                <button
                  key={term}
                  onClick={() => { setQuery(term); handleSearch(term); }}
                  className="text-sm bg-white border border-slate-200 text-slate-700 rounded-full px-4 py-1.5 hover:border-indigo-400 hover:text-indigo-600 transition-all font-medium"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
