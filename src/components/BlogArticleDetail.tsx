import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, Clock, Calendar, User, ShieldCheck, Share2, Check, BookOpen, 
  ChevronRight, Sparkles, AlertCircle, HelpCircle, Bookmark, Printer, Heart,
  Utensils, Activity, Moon, Mic, ExternalLink, ChevronDown, ChevronUp, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BlogArticle, BLOG_ARTICLES } from '../constants/blogArticles';
import { useSEO } from '../utils/seo';
import { AdSenseBanner } from './AdSenseBanner';

interface BlogArticleDetailProps {
  article: BlogArticle;
  onBack: () => void;
  onSelectArticle: (article: BlogArticle) => void;
  onNavigateApp: (screen: string) => void;
  isPremium?: boolean;
}

export const BlogArticleDetail: React.FC<BlogArticleDetailProps> = ({
  article,
  onBack,
  onSelectArticle,
  onNavigateApp,
  isPremium = false
}) => {
  const [copied, setCopied] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // SEO & Social OpenGraph Tags for the specific article
  useSEO({
    title: `${article.seoTitle} | Ama Baby Care`,
    description: article.metaDescription,
    robots: 'index, follow',
    ogType: 'article',
    ogTitle: article.title,
    ogDescription: article.metaDescription,
    publishedTime: new Date(article.publishedDate).toISOString(),
    canonicalUrl: `${window.location.origin}${window.location.pathname}#article=${article.slug}`
  });

  // Track Reading Progress Bar
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setReadingProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Inject Schema.org JSON-LD Structured Data for Article and FAQPage
  useEffect(() => {
    const scriptId = `json-ld-article-${article.id}`;
    let scriptElement = document.getElementById(scriptId) as HTMLScriptElement;
    
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = scriptId;
      scriptElement.type = 'application/ld+json';
      document.head.appendChild(scriptElement);
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BlogPosting',
          'headline': article.title,
          'description': article.metaDescription,
          'datePublished': new Date(article.publishedDate).toISOString(),
          'dateModified': new Date(article.updatedDate).toISOString(),
          'author': {
            '@type': 'Organization',
            'name': 'Ama Baby Care',
            'url': window.location.origin
          },
          'publisher': {
            '@type': 'Organization',
            'name': 'Ama Baby Care',
            'url': window.location.origin,
            'logo': {
              '@type': 'ImageObject',
              'url': `${window.location.origin}/logo.png`
            }
          },
          'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': `${window.location.origin}#article=${article.slug}`
          },
          'keywords': article.tags.join(', '),
          'articleSection': article.category
        },
        {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Home',
              'item': window.location.origin
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': 'Care Guides & Blog',
              'item': `${window.location.origin}#blog`
            },
            {
              '@type': 'ListItem',
              'position': 3,
              'name': article.title,
              'item': `${window.location.origin}#article=${article.slug}`
            }
          ]
        },
        ...(article.faq.length > 0 ? [{
          '@type': 'FAQPage',
          'mainEntity': article.faq.map(item => ({
            '@type': 'Question',
            'name': item.question,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': item.answer
            }
          }))
        }] : [])
      ]
    };

    scriptElement.textContent = JSON.stringify(schemaData);

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [article]);

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}#article=${article.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.metaDescription,
          url
        });
      } catch (err) {
        // Fallback to copy
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Find related articles
  const relatedArticles = useMemo(() => {
    return BLOG_ARTICLES.filter(a => a.id !== article.id && (article.relatedSlugs.includes(a.slug) || a.category === article.category)).slice(0, 3);
  }, [article]);

  // Contextual Tool Bridge recommendations
  const toolBridge = useMemo(() => {
    if (article.category === 'Sleep') {
      return {
        title: 'Track Sleep & Predict Optimal Nap Windows',
        desc: 'Log wake times with 1-tap and let Ama calculate exact subsequent wake windows automatically.',
        actionLabel: 'Open Sleep & Nap Tracker',
        icon: <Moon className="w-5 h-5 text-indigo-500" />,
        screen: 'sleep'
      };
    }
    if (article.category === 'Nutrition') {
      return {
        title: 'Generate Personalized 7-Day Solid Meal Plans',
        desc: 'Explore age-appropriate baby recipes, iron trackers, and 100 First Foods allergen checklists in Ama.',
        actionLabel: 'Open Solid Food & Recipe Hub',
        icon: <Utensils className="w-5 h-5 text-emerald-500" />,
        screen: 'recipes'
      };
    }
    if (article.category === 'Health & Safety') {
      return {
        title: 'Check CDC/WHO Vaccine Schedules & Diaper Health',
        desc: 'Log immunizations, check normal stool color milestones, and keep a clean pediatric health record.',
        actionLabel: 'Open Health & Journal Hub',
        icon: <ShieldCheck className="w-5 h-5 text-blue-500" />,
        screen: 'journal'
      };
    }
    return {
      title: 'Analyze Baby Cries with Acoustic AI Guidance',
      desc: 'Differentiate hunger, fatigue, gas, and discomfort sounds with acoustic feedback and care timers.',
      actionLabel: 'Try Acoustic Cry Analyzer',
      icon: <Mic className="w-5 h-5 text-purple-500" />,
      screen: 'cry-analyzer'
    };
  }, [article.category]);

  // Simple Markdown to HTML formatter for rich blog content
  const renderedContent = useMemo(() => {
    const raw = article.content.trim();
    // Transform headings, bold, bullet points, tables, blockquotes
    const lines = raw.split('\n');
    let inTable = false;
    let tableHtml = '';
    const output: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Table parsing
      if (line.trim().startsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableHtml = '<div class="overflow-x-auto my-6 rounded-2xl border border-gray-200"><table class="w-full text-left text-xs border-collapse">';
        }
        const cells = line.split('|').map(c => c.trim()).filter(c => c.length > 0);
        if (line.includes('---')) {
          // delimiter
          continue;
        }
        const isHeader = !tableHtml.includes('<tbody>');
        if (isHeader && !tableHtml.includes('<thead>')) {
          tableHtml += '<thead class="bg-gray-50 border-b border-gray-200"><tr>';
          cells.forEach(c => {
            const formatted = c.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            tableHtml += `<th class="px-4 py-3 font-black text-gray-900 uppercase tracking-wider text-[11px]">${formatted}</th>`;
          });
          tableHtml += '</tr></thead><tbody>';
        } else {
          tableHtml += '<tr class="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">';
          cells.forEach(c => {
            const formatted = c.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
            tableHtml += `<td class="px-4 py-3.5 text-gray-700 font-medium">${formatted}</td>`;
          });
          tableHtml += '</tr>';
        }
        continue;
      } else if (inTable) {
        inTable = false;
        tableHtml += '</tbody></table></div>';
        output.push(tableHtml);
      }

      if (line.startsWith('## ')) {
        const text = line.replace('## ', '');
        output.push(`<h2 class="text-xl sm:text-2xl font-serif font-black text-gray-900 mt-10 mb-4 tracking-tight leading-snug">${text}</h2>`);
      } else if (line.startsWith('### ')) {
        const text = line.replace('### ', '');
        output.push(`<h3 class="text-base sm:text-lg font-serif font-bold text-gray-800 mt-6 mb-2 tracking-tight leading-snug">${text}</h3>`);
      } else if (line.startsWith('> ')) {
        const text = line.replace('> ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        output.push(`<blockquote class="border-l-4 border-primary bg-primary/5 p-4 rounded-r-2xl my-6 text-sm text-gray-800 font-semibold italic">${text}</blockquote>`);
      } else if (line.startsWith('- ')) {
        const text = line.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
        output.push(`<li class="ml-4 list-disc text-sm sm:text-base text-gray-700 my-1.5 leading-relaxed font-normal">${text}</li>`);
      } else if (/^\d+\.\s/.test(line)) {
        const text = line.replace(/^\d+\.\s/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
        output.push(`<li class="ml-4 list-decimal text-sm sm:text-base text-gray-700 my-1.5 leading-relaxed font-normal">${text}</li>`);
      } else if (line.trim() === '---') {
        output.push('<hr class="my-8 border-gray-200/80" />');
      } else if (line.trim().length > 0) {
        const text = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
        output.push(`<p class="text-sm sm:text-base text-gray-700 my-4 leading-relaxed font-normal">${text}</p>`);
      }
    }

    if (inTable) {
      tableHtml += '</tbody></table></div>';
      output.push(tableHtml);
    }

    return output.join('\n');
  }, [article.content]);

  return (
    <article className="min-h-screen bg-background text-foreground text-left font-sans selection:bg-primary/20 pb-32">
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-gray-100 z-50">
        <motion.div 
          className="h-full bg-primary transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors cursor-pointer border-none"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
            <span>Back to Care Guides</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-colors cursor-pointer border-none"
              title="Share article"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors cursor-pointer border-none"
              title="Print guide"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 space-y-8">
        {/* Breadcrumb List */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-bold text-gray-500 overflow-x-auto whitespace-nowrap pb-1">
          <button onClick={() => onNavigateApp('landing')} className="hover:text-primary transition-colors cursor-pointer border-none bg-transparent p-0">Home</button>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <button onClick={onBack} className="hover:text-primary transition-colors cursor-pointer border-none bg-transparent p-0">Care Guides</button>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="text-primary truncate max-w-[200px] sm:max-w-xs">{article.category}</span>
        </nav>

        {/* Article Header & Badges */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-wider">
              {article.category}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold">
              <Clock className="w-3 h-3 text-gray-500" />
              {article.readTime}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-bold">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Evidence-Based Pediatric Guide
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black text-gray-900 leading-tight tracking-tight">
            {article.title}
          </h1>

          <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
            {article.excerpt}
          </p>

          {/* Article Publication & Evidence-Based Notice */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-gray-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
                📖
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-gray-900">Ama Baby Care Reference</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-xs text-gray-500 font-medium">Evidence-Based Clinical Guidelines & Pediatric Research</p>
                <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-1 font-medium">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Published: {article.publishedDate}</span>
                  <span>•</span>
                  <span>Updated: {article.updatedDate}</span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 sm:border-l border-gray-100 pt-2 sm:pt-0 sm:pl-4 w-full sm:w-auto">
              <span className="text-[10px] font-black text-primary uppercase tracking-wider block">Standard Reference</span>
              <span className="text-xs font-semibold text-gray-700 block">AAP / WHO Pediatric Best Practices</span>
            </div>
          </div>
        </div>

        {/* Key Takeaways Callout Box */}
        <section aria-labelledby="key-takeaways" className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-serif font-black text-sm uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span id="key-takeaways">Executive Takeaways for Parents</span>
          </div>
          <ul className="space-y-2">
            {article.keyTakeaways.map((point, index) => (
              <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-800 font-medium leading-relaxed">
                <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* AdSense Top In-Content Banner */}
        <AdSenseBanner isPremium={isPremium} slotId="8472910384" className="my-6" />

        {/* Article Core Body */}
        <div 
          className="prose prose-slate max-w-none prose-p:text-gray-700 prose-headings:font-serif prose-headings:text-gray-900 prose-strong:text-gray-900 prose-strong:font-bold"
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />

        {/* Contextual Interactive App Tool Bridge Card */}
        <section className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 my-8">
          <div className="space-y-1.5 max-w-md">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-white shadow-sm">
                {toolBridge.icon}
              </div>
              <h3 className="font-serif font-black text-base text-gray-900">{toolBridge.title}</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              {toolBridge.desc}
            </p>
          </div>
          <button
            onClick={() => onNavigateApp(toolBridge.screen)}
            className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary/95 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-primary/20 transition-all cursor-pointer border-none shrink-0 flex items-center gap-2"
          >
            <span>{toolBridge.actionLabel}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </section>

        {/* Frequently Asked Questions (FAQ Section + Schema) */}
        {article.faq && article.faq.length > 0 && (
          <section aria-labelledby="faq-heading" className="space-y-4 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              <h2 id="faq-heading" className="font-serif font-black text-xl text-gray-900">
                Frequently Asked Pediatric Questions
              </h2>
            </div>

            <div className="space-y-3">
              {article.faq.map((item, index) => {
                const isOpen = expandedFaq === index;
                return (
                  <div key={index} className="rounded-2xl border border-gray-200 bg-white overflow-hidden transition-colors">
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : index)}
                      className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-gray-900 hover:text-primary transition-colors cursor-pointer border-none bg-transparent"
                    >
                      <span>{item.question}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-primary shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-4 pb-4 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed font-normal border-t border-gray-50"
                        >
                          {item.answer}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-4">
          <span className="text-xs font-bold text-gray-400">Related Topics:</span>
          {article.tags.map((tag, i) => (
            <span key={i} className="px-3 py-1 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-colors">
              #{tag}
            </span>
          ))}
        </div>

        {/* Clinical Disclaimer Notice */}
        <footer className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <AlertCircle className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>Clinical Educational Notice</span>
          </div>
          <p>
            Ama Baby app content is for educational, tracking and record-keeping purposes only and does not replace doctor or substitute professional healthcare advice, diagnosis, or treatment. Always seek the advice of your pediatrician or qualified physician with any questions regarding infant medical conditions.
          </p>
        </footer>

        {/* AdSense Mid-Article Placement */}
        <AdSenseBanner isPremium={isPremium} slotId="9582048123" className="my-6" />

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <section className="space-y-4 pt-8 border-t border-gray-200">
            <h3 className="font-serif font-black text-xl text-gray-900">
              Related Evidence-Based Care Guides
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedArticles.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => {
                    onSelectArticle(rel);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-4 rounded-2xl bg-white border border-gray-200/80 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-primary tracking-wider block">
                      {rel.category}
                    </span>
                    <h4 className="font-serif font-bold text-sm text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {rel.title}
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-2 font-normal">
                      {rel.excerpt}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold pt-2 border-t border-gray-100">
                    <span>{rel.readTime}</span>
                    <span className="text-primary font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Read Guide <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </article>
  );
};
