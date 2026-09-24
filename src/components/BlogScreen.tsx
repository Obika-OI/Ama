import React, { useState, useMemo } from 'react';
import { 
  Search, BookOpen, Clock, Calendar, ShieldCheck, ArrowRight, Sparkles,
  ChevronRight, Filter, Heart, ArrowLeft, Star, TrendingUp, CheckCircle2,
  Tag, Compass, Smile, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BlogArticle, BLOG_ARTICLES } from '../constants/blogArticles';
import { useSEO } from '../utils/seo';
import { AdSenseBanner } from './AdSenseBanner';

interface BlogScreenProps {
  onSelectArticle: (article: BlogArticle) => void;
  onBack: () => void;
  onNavigateApp: (screen: string) => void;
  isPremium?: boolean;
}

export const BlogScreen: React.FC<BlogScreenProps> = ({
  onSelectArticle,
  onBack,
  onNavigateApp,
  isPremium = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // SEO Optimization for the Blog Hub
  useSEO({
    title: 'Evidence-Based Baby Care Guides & Library | Ama Care',
    description: 'Explore comprehensive pediatric care guides on infant sleep, baby-led weaning, allergen introduction, milestones, and baby health.',
    robots: 'index, follow',
    ogType: 'website',
    ogTitle: 'Evidence-Based Baby Care Guides & Articles | Ama Baby Care',
    ogDescription: 'Authoritative, research-grounded guidance for modern parents. Wake windows, starting solids, fever triage, and sensory milestones.',
    canonicalUrl: `${window.location.origin}${window.location.pathname}#blog`
  });

  const categories = ['All', 'Sleep', 'Nutrition', 'Development', 'Health & Safety', 'Parenting'];

  const filteredArticles = useMemo(() => {
    return BLOG_ARTICLES.filter((article) => {
      const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        article.title.toLowerCase().includes(q) ||
        article.excerpt.toLowerCase().includes(q) ||
        article.tags.some(t => t.toLowerCase().includes(q)) ||
        article.content.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Featured article for top spotlight
  const featuredArticle = BLOG_ARTICLES[0]; // Wake windows guide

  return (
    <div className="min-h-screen bg-background text-foreground text-left font-sans pb-32">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors cursor-pointer border-none"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-lg font-black shrink-0">
                📚
              </div>
              <div>
                <h1 className="font-serif font-black text-lg text-gray-900 leading-tight">
                  Ama Care Library
                </h1>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
                  Pediatric & Parenting Guides
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateApp('home')}
              className="px-4 py-2 rounded-full bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer border-none shadow-sm hidden sm:inline-flex items-center gap-1.5"
            >
              <span>Open Tracker App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12 space-y-10">
        {/* Hero Banner Section */}
        <section className="text-center sm:text-left space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Evidence-Based Pediatric & Parenting Guides</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-black text-gray-900 leading-tight tracking-tight">
            Evidence-Based Baby Care & Development Library
          </h2>

          <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-normal">
            Clear, actionable, and evidence-informed guidance on newborn sleep, infant nutrition, early allergen introduction, fever triage, and developmental milestones.
          </p>
        </section>

        {/* Search & Category Filter Bar */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles (e.g. wake windows, allergens, fever, purees)..."
                className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 text-xs font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary shadow-sm transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 cursor-pointer border-none bg-transparent"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 sm:pb-0 scrollbar-none">
              {categories.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border-none shrink-0 ${
                      active 
                        ? 'bg-primary text-white shadow-md shadow-primary/20 scale-102' 
                        : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200/80 shadow-sm'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {searchQuery && (
            <div className="text-xs text-gray-500 font-medium">
              Found <strong className="text-gray-900">{filteredArticles.length}</strong> {filteredArticles.length === 1 ? 'article' : 'articles'} matching "{searchQuery}"
            </div>
          )}
        </section>

        {/* Top Spotlight Article (If on 'All' and no search query) */}
        {selectedCategory === 'All' && !searchQuery && (
          <section className="p-6 sm:p-8 rounded-[36px] bg-gradient-to-br from-primary/10 via-white to-primary/5 border border-primary/20 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative overflow-hidden">
            <div className="space-y-4 max-w-2xl relative z-10">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-wider">
                  Featured Guide
                </span>
                <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {featuredArticle.readTime}
                </span>
              </div>

              <h3 
                onClick={() => onSelectArticle(featuredArticle)}
                className="text-2xl sm:text-3xl font-serif font-black text-gray-900 hover:text-primary transition-colors cursor-pointer leading-tight tracking-tight"
              >
                {featuredArticle.title}
              </h3>

              <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-normal">
                {featuredArticle.excerpt}
              </p>

              <div className="flex items-center gap-3 pt-2 text-xs text-gray-500 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  Published {featuredArticle.publishedDate}
                </span>
                <span>•</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Evidence-Based Reference
                </span>
              </div>
            </div>

            <button
              onClick={() => onSelectArticle(featuredArticle)}
              className="px-6 py-4 rounded-2xl bg-primary hover:bg-primary-dark text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 transition-all cursor-pointer border-none flex items-center gap-2 shrink-0 self-stretch lg:self-auto justify-center"
            >
              <span>Read Full Guide</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </section>
        )}

        {/* AdSense In-Feed Ad Banner */}
        <AdSenseBanner isPremium={isPremium} slotId="5749201948" className="my-4" />

        {/* Articles Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-black text-xl text-gray-900">
              {selectedCategory === 'All' ? 'All Pediatric Care Articles' : `${selectedCategory} Guides`}
            </h3>
            <span className="text-xs font-bold text-gray-400">
              {filteredArticles.length} {filteredArticles.length === 1 ? 'Article' : 'Articles'}
            </span>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="p-12 text-center space-y-4 rounded-3xl bg-white border border-gray-200">
              <div className="text-4xl">🔍</div>
              <h4 className="font-serif font-bold text-lg text-gray-800">No guides found</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                No articles matched your search query. Try searching for sleep, nutrition, fever, or milestones.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold cursor-pointer border-none hover:bg-gray-200 transition-colors"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => onSelectArticle(article)}
                  className="bg-white rounded-3xl border border-gray-200/90 hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5 transition-all p-6 flex flex-col justify-between space-y-4 cursor-pointer group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
                        {article.category}
                      </span>
                      <span className="text-[11px] font-semibold text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTime}
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-lg text-gray-900 group-hover:text-primary transition-colors leading-snug">
                      {article.title}
                    </h4>

                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed font-normal">
                      {article.excerpt}
                    </p>
                  </div>

                  {/* Key takeaway preview */}
                  <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-[11px] text-gray-700 font-medium space-y-1">
                    <div className="flex items-center gap-1 font-bold text-[10px] text-gray-500 uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-primary" />
                      <span>Key Takeaway</span>
                    </div>
                    <p className="line-clamp-2 leading-relaxed text-gray-600">
                      {article.keyTakeaways[0]}
                    </p>
                  </div>

                  {/* Article Card Footer */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span>{article.publishedDate}</span>
                    </div>

                    <span className="text-primary text-xs font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5 shrink-0">
                      Read Guide <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* AdSense Bottom Banner */}
        <AdSenseBanner isPremium={isPremium} slotId="6948201948" className="my-8" />

        {/* Medical Notice */}
        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-slate-600 text-xs leading-relaxed space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <AlertCircle className="w-4 h-4 text-primary shrink-0" />
            <span>Health & Pediatric Educational Notice</span>
          </div>
          <p>
            Ama Baby app content is for educational, tracking and record-keeping purposes only and does not replace doctor or substitute professional healthcare advice, diagnosis, or treatment. Always seek the advice of your pediatrician or qualified physician with any questions regarding infant medical conditions.
          </p>
        </div>
      </main>
    </div>
  );
};
