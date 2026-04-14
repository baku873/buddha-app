const fs = require('fs');

let content = fs.readFileSync('app/components/HomeSections.tsx', 'utf8');

// Add refs and observer hooks
const hookInjection = `  const sortedMonks = [...displayMonks]
    .sort((a, b) => getMonkRank(a) - getMonkRank(b))
    .slice(0, 6);

  // Scroll-driven section reveal using IntersectionObserver
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('section-hidden');
            entry.target.classList.add('section-visible');
            observer.unobserve(entry.target); // animate once only
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    const sections = document.querySelectorAll('.app-section');
    sections.forEach((el, i) => {
      (el as HTMLElement).style.transitionDelay = \`\${i * 0.06}s\`;
      el.classList.add('section-hidden');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [displayMonks, displayBlogs]);

  const featuredMonksRef = useRef<HTMLDivElement>(null);
  const blogCarouselRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleTouchEnd = (e) => {
      const el = e.currentTarget;
      const cardWidth = el.querySelector('div')?.offsetWidth || 300;
      const gap = 16;
      const scrollLeft = el.scrollLeft;
      const nearest = Math.round(scrollLeft / (cardWidth + gap)) * (cardWidth + gap);
      el.scrollTo({ left: nearest, behavior: 'smooth' });
    };
    
    if (featuredMonksRef.current) {
      featuredMonksRef.current.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
    if (blogCarouselRef.current) {
      blogCarouselRef.current.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
    
    return () => {
      if (featuredMonksRef.current) {
        featuredMonksRef.current.removeEventListener('touchend', handleTouchEnd);
      }
      if (blogCarouselRef.current) {
        blogCarouselRef.current.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, []);`;

content = content.replace(
  `  const sortedMonks = [...displayMonks]
    .sort((a, b) => getMonkRank(a) - getMonkRank(b))
    .slice(0, 6);`,
  hookInjection
);

// Update Featured Monks Carousel Container
content = content.replace(
  '<div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar pl-5 pr-10 gap-4 pb-4">',
  '<div ref={featuredMonksRef} className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 px-5 pb-4 scroll-smooth" style={{ WebkitOverflowScrolling: \'touch\', scrollPaddingLeft: \'20px\' }}>'
);

// Update Blog Carousel Container
content = content.replace(
  '<div className="app-carousel hide-scrollbar md:grid md:grid-cols-3">',
  '<div ref={blogCarouselRef} className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 px-5 pb-4 scroll-smooth md:grid md:grid-cols-3" style={{ WebkitOverflowScrolling: \'touch\', scrollPaddingLeft: \'20px\' }}>'
);

// Replace motion.div with div and native-press - replace specific blocks
// Featured Monks Card
content = content.replace(
  /<motion\.div[\s\S]*?key={monkId}[\s\S]*?whileTap={{ scale: 0\.97 }}[\s\S]*?className="([^"]+)"\s*>/g,
  '<div key={monkId} className="$1 native-press">'
);

// Blog Card
content = content.replace(
  /<motion\.div[\s\S]*?key={blog\.id}[\s\S]*?whileTap={{ scale: 0\.97 }}[\s\S]*?className="([^"]+)"\s*>/g,
  '<div key={blog.id} className="snap-center flex-shrink-0 $1 native-press">'
);

// Top Practitioners Card & Quick Actions
content = content.replace(
  /<motion\.div whileTap={{ scale: 0\.97 }}>/g,
  '<div className="native-press">'
);
content = content.replace(
  /<motion\.div key={monkId} whileTap={{ scale: 0\.97 }}>/g,
  '<div key={monkId} className="native-press">'
);

// Replace all closing tags
content = content.replace(/<\/motion\.div>/g, '</div>');

fs.writeFileSync('app/components/HomeSections.tsx', content);
console.log('Update Complete');
