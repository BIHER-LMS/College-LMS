
import { Link } from 'react-router-dom';

function Home() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant"><div className="h-16 max-w-[1440px] mx-auto px-margin-mobile lg:px-margin flex items-center justify-between"><div className="flex items-center gap-space-sm"><img alt="Aura Academia Logo" className="h-8 w-auto object-contain" src="/logo.png" /><span className="font-headline-sm text-headline-sm uppercase tracking-tight text-on-surface font-semibold">Aura Academia</span></div><nav className="hidden md:flex items-center gap-space-lg" data-active-classes="text-on-surface font-semibold underline underline-offset-4 decoration-2 decoration-primary-container"><a aria-current="page" className="uppercase tracking-wider transition-colors text-on-surface font-semibold underline underline-offset-4 decoration-2 decoration-primary-container" data-path="home" href="#">Home</a><a className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors" data-path="features" href="#">Features</a><a className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors" data-path="courses" href="#">Courses</a><a className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors" data-path="how-it-works" href="#">How It Works</a><a className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors" data-path="about" href="#">About</a><a className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors" data-path="contact" href="#">Contact</a></nav><div className="flex items-center gap-space-md"><Link className="hidden sm:inline-block font-label-md text-label-md uppercase tracking-wider text-on-surface hover:text-primary transition-colors py-2 px-space-xs" data-path="login" to="/login">Log In</Link><Link className="inline-flex items-center justify-center font-label-md text-label-md uppercase tracking-wider bg-primary-container text-on-primary px-space-md py-2.5 transition-colors hover:bg-inverse-surface" data-path="signup" to="/login">Get Started</Link><Link to="/login" className="w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity" title="Account / Login"><span className="material-symbols-outlined text-on-primary text-[18px]">person</span></Link></div></div></header><main className="w-full pt-16 bg-surface min-h-screen"><div className="flex flex-col w-full">

<section className="w-full bg-surface-container-lowest border-b border-outline-variant py-space-xl lg:py-28">
<div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin">
<div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto">

<div className="inline-flex items-center gap-space-xs px-3 py-1.5 bg-surface-container-low border border-outline-variant text-on-surface mb-space-md">
<span className="w-2 h-2 rounded-full bg-on-tertiary-container"></span>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold">Learn Smarter. Achieve More.</span>
</div>

<h1 className="font-display text-display text-on-surface tracking-tight leading-[1.08] mb-space-md font-bold max-w-4xl mx-auto">
            Your Learning Journey, Simplified.
          </h1>

<p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-space-lg leading-relaxed">
            An institutional-grade learning platform designed for dedicated students. Streamline complex syllabi, track empirical performance metrics, organize research materials, and master coursework with unmatched clarity.
          </p>

<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-space-sm w-full sm:w-auto mb-space-lg mx-auto">
<Link className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-space-lg py-3.5 font-label-md text-label-md uppercase tracking-wider font-semibold transition-colors hover:bg-inverse-surface cursor-pointer" data-path="signup" to="/login">
<span>Get Started</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</Link>
<a className="inline-flex items-center justify-center bg-surface-container-lowest border border-outline-variant text-on-surface px-space-lg py-3.5 font-label-md text-label-md uppercase tracking-wider font-semibold transition-colors hover:border-on-surface" href="#courses">
              Explore Courses
            </a>
</div>

<div className="flex items-center justify-center gap-space-sm pt-space-xs border-t border-outline-variant/60 w-full max-w-lg mx-auto">
<span className="material-symbols-outlined text-secondary text-[20px]">verified_user</span>
<span className="font-body-sm text-body-sm text-secondary">
              Trusted by 10,000+ university scholars across leading academic institutions.
            </span>
</div>

</div>
</div>
</section>

<section className="w-full bg-surface border-b border-outline-variant py-space-xl">
<div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin">
<div className="text-center max-w-2xl mx-auto mb-space-lg">
<h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">
          Everything you need to learn, organized in one place.
        </h2>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
<div className="p-space-lg bg-surface-container-lowest border border-outline-variant flex flex-col justify-between">
<div className="flex items-center justify-between mb-space-md">
<span className="material-symbols-outlined text-primary text-[28px]">group</span>
<span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Metrics</span>
</div>
<div>
<div className="font-display text-display text-on-surface font-bold tracking-tight mb-1">10,000+</div>
<div className="font-body-md text-body-md text-secondary font-medium">Enrolled Students</div>
</div>
</div>
<div className="p-space-lg bg-surface-container-lowest border border-outline-variant flex flex-col justify-between">
<div className="flex items-center justify-between mb-space-md">
<span className="material-symbols-outlined text-primary text-[28px]">auto_stories</span>
<span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Curriculum</span>
</div>
<div>
<div className="font-display text-display text-on-surface font-bold tracking-tight mb-1">500+</div>
<div className="font-body-md text-body-md text-secondary font-medium">Verified University Courses</div>
</div>
</div>
<div className="p-space-lg bg-surface-container-lowest border border-outline-variant flex flex-col justify-between">
<div className="flex items-center justify-between mb-space-md">
<span className="material-symbols-outlined text-primary text-[28px]">trending_up</span>
<span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Efficacy</span>
</div>
<div>
<div className="font-display text-display text-on-surface font-bold tracking-tight mb-1">95%</div>
<div className="font-body-md text-body-md text-secondary font-medium">Term Completion Rate</div>
</div>
</div>
<div className="p-space-lg bg-surface-container-lowest border border-outline-variant flex flex-col justify-between">
<div className="flex items-center justify-between mb-space-md">
<span className="material-symbols-outlined text-primary text-[28px]">dataset</span>
<span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Availability</span>
</div>
<div>
<div className="font-display text-display text-on-surface font-bold tracking-tight mb-1">24/7</div>
<div className="font-body-md text-body-md text-secondary font-medium">Persistent Research Access</div>
</div>
</div>
</div>

<div className="mt-space-lg pt-space-md border-t border-outline-variant flex flex-wrap items-center justify-between gap-space-sm text-secondary font-label-sm text-label-sm uppercase tracking-wider">
<span>Accreditation Standards: ABET • AACSB • IEEE Scholarly Index Compliant</span>
<span>Institutional Single Sign-On (SAML / EduGAIN Compatible)</span>
</div>
</div>
</section>

<section className="w-full bg-surface-container-lowest border-b border-outline-variant py-space-xl lg:py-24" id="features">
<div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin">

<div className="max-w-3xl mb-space-xl">
<span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold block mb-2">PLATFORM CAPABILITIES</span>
<h2 className="font-display text-headline-lg lg:text-display text-on-surface font-bold tracking-tight mb-space-sm">
          Everything You Need to Learn Better
        </h2>
<p className="font-body-lg text-body-lg text-on-surface-variant">
          Engineered to remove friction from academic workflows and replace scattered tools with structured mastery.
        </p>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">

<div className="p-space-lg bg-surface border border-outline-variant flex flex-col justify-between hover:border-on-surface transition-colors">
<div>
<div className="w-12 h-12 bg-surface-container-low border border-outline-variant flex items-center justify-center text-primary mb-space-md">
<span className="material-symbols-outlined text-[24px]">devices</span>
</div>
<h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">Learn Anywhere</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Access lecture recordings, syllabi, and interactive code sandboxes from any workstation, laptop, or tablet device seamlessly.
            </p>
</div>
<div className="pt-space-md mt-space-md border-t border-outline-variant/60 font-label-sm text-label-sm uppercase text-secondary">
            Cross-platform sync • Offline cache
          </div>
</div>

<div className="p-space-lg bg-surface border border-outline-variant flex flex-col justify-between hover:border-on-surface transition-colors">
<div>
<div className="w-12 h-12 bg-surface-container-low border border-outline-variant flex items-center justify-center text-primary mb-space-md">
<span className="material-symbols-outlined text-[24px]">insights</span>
</div>
<h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">Track Your Progress</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Understand your learning trajectory through quantitative mastery analytics, syllabus checkpoints, and cohort grade distributions.
            </p>
</div>
<div className="pt-space-md mt-space-md border-t border-outline-variant/60 font-label-sm text-label-sm uppercase text-secondary">
            Empirical evaluation • Vector logs
          </div>
</div>

<div className="p-space-lg bg-surface border border-outline-variant flex flex-col justify-between hover:border-on-surface transition-colors">
<div>
<div className="w-12 h-12 bg-surface-container-low border border-outline-variant flex items-center justify-center text-primary mb-space-md">
<span className="material-symbols-outlined text-[24px]">calendar_month</span>
</div>
<h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">Smart Study Planning</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Coordinate assignment deadlines, laboratory submissions, and revision blocks without schedule clashes or cognitive overload.
            </p>
</div>
<div className="pt-space-md mt-space-md border-t border-outline-variant/60 font-label-sm text-label-sm uppercase text-secondary">
            Algorithmic pacing • Priority queue
          </div>
</div>

<div className="p-space-lg bg-surface border border-outline-variant flex flex-col justify-between hover:border-on-surface transition-colors">
<div>
<div className="w-12 h-12 bg-surface-container-low border border-outline-variant flex items-center justify-center text-primary mb-space-md">
<span className="material-symbols-outlined text-[24px]">quiz</span>
</div>
<h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">Practice & Assess</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Reinforce conceptual comprehension with formative problem sets, simulated test environments, and standardized rubric scoring.
            </p>
</div>
<div className="pt-space-md mt-space-md border-t border-outline-variant/60 font-label-sm text-label-sm uppercase text-secondary">
            Automated testbench • Rubrics
          </div>
</div>

<div className="p-space-lg bg-surface border border-outline-variant flex flex-col justify-between hover:border-on-surface transition-colors">
<div>
<div className="w-12 h-12 bg-surface-container-low border border-outline-variant flex items-center justify-center text-primary mb-space-md">
<span className="material-symbols-outlined text-[24px]">library_books</span>
</div>
<h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">Study Materials</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Instant repository access to verified lecture slides, peer-reviewed monographs, past university exams, and computational notebooks.
            </p>
</div>
<div className="pt-space-md mt-space-md border-t border-outline-variant/60 font-label-sm text-label-sm uppercase text-secondary">
            DOI indexing • Full-text OCR
          </div>
</div>

<div className="p-space-lg bg-surface border border-outline-variant flex flex-col justify-between hover:border-on-surface transition-colors">
<div>
<div className="w-12 h-12 bg-surface-container-low border border-outline-variant flex items-center justify-center text-primary mb-space-md">
<span className="material-symbols-outlined text-[24px]">folder_special</span>
</div>
<h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">Stay Organized</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Centralize your active coursework, faculty communications, and academic transcripts in a single verified, audit-ready record.
            </p>
</div>
<div className="pt-space-md mt-space-md border-t border-outline-variant/60 font-label-sm text-label-sm uppercase text-secondary">
            Transcripts • Faculty comms
          </div>
</div>
</div>
</div>
</section>

<section className="w-full bg-surface border-b border-outline-variant py-space-xl lg:py-24" id="how-it-works">
<div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin">

<div className="max-w-2xl mb-space-xl">
<span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold block mb-2">SEAMLESS ONBOARDING</span>
<h2 className="font-display text-headline-lg lg:text-display text-on-surface font-bold tracking-tight">
          How Aura Academia Works
        </h2>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-gutter relative">

<div className="p-space-lg bg-surface-container-lowest border border-outline-variant flex flex-col justify-between relative">
<div>
<div className="flex items-center justify-between pb-space-sm border-b border-outline-variant mb-space-md">
<span className="font-headline-lg text-headline-lg font-bold text-primary font-mono">01</span>
<span className="px-2 py-0.5 bg-surface-container text-on-surface font-label-sm text-label-sm uppercase font-semibold">Setup</span>
</div>
<h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">Create Your Account</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Register your institutional credentials and set up your student profile in under two minutes with automated credential matching.
            </p>
</div>
<div className="mt-space-lg pt-space-sm border-t border-outline-variant/40 flex items-center gap-2 text-secondary font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[16px] text-on-tertiary-container">check_circle</span>
            Instant .edu authorization
          </div>
</div>

<div className="p-space-lg bg-surface-container-lowest border border-outline-variant flex flex-col justify-between relative">
<div>
<div className="flex items-center justify-between pb-space-sm border-b border-outline-variant mb-space-md">
<span className="font-headline-lg text-headline-lg font-bold text-primary font-mono">02</span>
<span className="px-2 py-0.5 bg-surface-container text-on-surface font-label-sm text-label-sm uppercase font-semibold">Curate</span>
</div>
<h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">Choose What to Learn</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Select enrolled courses, import syllabus modules directly from campus feeds, and access prerequisite reading archives.
            </p>
</div>
<div className="mt-space-lg pt-space-sm border-t border-outline-variant/40 flex items-center gap-2 text-secondary font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[16px] text-on-tertiary-container">check_circle</span>
            Automated syllabus mapping
          </div>
</div>

<div className="p-space-lg bg-surface-container-lowest border border-outline-variant flex flex-col justify-between relative">
<div>
<div className="flex items-center justify-between pb-space-sm border-b border-outline-variant mb-space-md">
<span className="font-headline-lg text-headline-lg font-bold text-primary font-mono">03</span>
<span className="px-2 py-0.5 bg-surface-container text-on-surface font-label-sm text-label-sm uppercase font-semibold">Master</span>
</div>
<h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">Learn & Track Progress</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Engage with lecture materials, submit verified assignments, and watch your empirical subject mastery grow term over term.
            </p>
</div>
<div className="mt-space-lg pt-space-sm border-t border-outline-variant/40 flex items-center gap-2 text-secondary font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[16px] text-on-tertiary-container">check_circle</span>
            Real-time mastery index
          </div>
</div>
</div>
</div>
</section>

<section className="w-full bg-surface-container-lowest border-b border-outline-variant py-space-xl lg:py-24" id="courses">
<div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin">

<div className="flex flex-col md:flex-row md:items-end justify-between mb-space-xl gap-space-md">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold block mb-2">ACADEMIC CURRICULUM</span>
<h2 className="font-display text-headline-lg lg:text-display text-on-surface font-bold tracking-tight">
            Explore Popular Courses
          </h2>
<p className="font-body-lg text-body-lg text-on-surface-variant mt-2 max-w-xl">
            Rigorous, accredited modules taught by distinguished research faculty.
          </p>
</div>
<div>
<a className="inline-flex items-center gap-2 text-on-surface font-label-md text-label-md uppercase tracking-wider font-semibold hover:text-secondary transition-colors" href="#">
<span>Browse Full Directory</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</a>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">

<div className="bg-surface border border-outline-variant flex flex-col justify-between hover:border-on-surface transition-colors">
<div>
<div className="p-space-md bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase font-semibold text-primary">Computer Science</span>
<span className="px-2 py-0.5 bg-surface-container-lowest border border-outline-variant text-on-surface font-label-sm text-label-sm font-semibold">Advanced</span>
</div>
<div className="p-space-lg">
<h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-3 leading-snug">
                CS-302: Advanced Algorithms & Complexity
              </h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-space-md">
                Rigorous exploration of graph theory, divide-and-conquer, dynamic programming, and NP-completeness proofs with automated verification.
              </p>
<div className="flex items-center gap-2 text-secondary font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[18px]">menu_book</span>
<span>25 Lessons • 4.0 Credits</span>
</div>
</div>
</div>
<div className="p-space-lg pt-0">
<button className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface py-3 font-label-md text-label-md uppercase tracking-wider font-semibold hover:bg-primary hover:text-on-primary hover:border-primary transition-colors">
              View Course
            </button>
</div>
</div>

<div className="bg-surface border border-outline-variant flex flex-col justify-between hover:border-on-surface transition-colors">
<div>
<div className="p-space-md bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase font-semibold text-primary">Physics</span>
<span className="px-2 py-0.5 bg-surface-container-lowest border border-outline-variant text-on-surface font-label-sm text-label-sm font-semibold">Intermediate</span>
</div>
<div className="p-space-lg">
<h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-3 leading-snug">
                PHYS-210: Quantum Mechanics & Wavefunctions
              </h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-space-md">
                Mathematical foundations of state-vector projections, Hermitian operator spectra, and harmonic oscillators in Hilbert space.
              </p>
<div className="flex items-center gap-2 text-secondary font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[18px]">menu_book</span>
<span>22 Lessons • 4.0 Credits</span>
</div>
</div>
</div>
<div className="p-space-lg pt-0">
<button className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface py-3 font-label-md text-label-md uppercase tracking-wider font-semibold hover:bg-primary hover:text-on-primary hover:border-primary transition-colors">
              View Course
            </button>
</div>
</div>

<div className="bg-surface border border-outline-variant flex flex-col justify-between hover:border-on-surface transition-colors">
<div>
<div className="p-space-md bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase font-semibold text-primary">Neuroscience</span>
<span className="px-2 py-0.5 bg-surface-container-lowest border border-outline-variant text-on-surface font-label-sm text-label-sm font-semibold">Advanced</span>
</div>
<div className="p-space-lg">
<h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-3 leading-snug">
                NEUR-405: Cognitive Modeling & Synaptic Plasticity
              </h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-space-md">
                Biophysical models of synaptic plasticity, computational neural networks, and hippocampal memory consolidation mechanics.
              </p>
<div className="flex items-center gap-2 text-secondary font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[18px]">menu_book</span>
<span>18 Lessons • 3.0 Credits</span>
</div>
</div>
</div>
<div className="p-space-lg pt-0">
<button className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface py-3 font-label-md text-label-md uppercase tracking-wider font-semibold hover:bg-primary hover:text-on-primary hover:border-primary transition-colors">
              View Course
            </button>
</div>
</div>
</div>
</div>
</section>

<section className="w-full bg-surface border-b border-outline-variant py-space-xl lg:py-24">
<div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin">

<div className="max-w-2xl mb-space-xl">
<span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold block mb-2">SCHOLAR TESTIMONIALS</span>
<h2 className="font-display text-headline-lg lg:text-display text-on-surface font-bold tracking-tight">
          Proven by High-Performing Students
        </h2>
</div>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">

<div className="p-space-lg bg-surface-container-lowest border border-outline-variant flex flex-col justify-between">
<div>
<div className="flex items-center gap-1 text-primary mb-space-md">
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span>
</div>
<p className="font-body-md text-body-md text-on-surface leading-relaxed mb-space-lg italic">
              “Aura Academia consolidated my fragmented study tools into a single, distraction-free environment. Tracking algorithmic problem sets alongside lecture notes helped me maintain a 3.88 GPA.”
            </p>
</div>
<div className="flex items-center gap-space-sm pt-space-md border-t border-outline-variant">
<img alt="Eleanor Vance" className="w-12 h-12 rounded-none object-cover border border-outline-variant" src="https://lh3.googleusercontent.com/aida/AEtjO1XFZdP_5VSSgRqCt9FRMMGqR9BTZbinrgksfTqAkyptXb56NDmmyfRoTv8OKNCfi6lp9rYl-sR3jZ_EhCl7OgVt_pkq-YrhXYSH1p3s49-WoJ8sxEVToK30i2A2zzMBV95xzobciXZmOiInO_yBVjJsS-pxcNJ22DH-dDExwvs63865R3fSMq6_2gqqJInqr6quizhVbxRR_rjsrkagQRCcrDWCd-McHqQkLXV4D_1VaejRv_guGPaGTFg"/>
<div>
<div className="font-headline-sm text-headline-sm font-semibold text-on-surface">Eleanor Vance</div>
<div className="font-body-sm text-body-sm text-secondary">Undergraduate Researcher (CS & Math)</div>
</div>
</div>
</div>

<div className="p-space-lg bg-surface-container-lowest border border-outline-variant flex flex-col justify-between">
<div>
<div className="flex items-center gap-1 text-primary mb-space-md">
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span>
</div>
<p className="font-body-md text-body-md text-on-surface leading-relaxed mb-space-lg italic">
              “The resource library and syllabus tracking make literature reviews and problem set submissions effortless. It feels like an academic workstation built specifically for serious inquiry.”
            </p>
</div>
<div className="flex items-center gap-space-sm pt-space-md border-t border-outline-variant">
<div className="w-12 h-12 bg-surface-container-high border border-outline-variant flex items-center justify-center font-headline-sm text-headline-sm font-bold text-on-surface">
              MT
            </div>
<div>
<div className="font-headline-sm text-headline-sm font-semibold text-on-surface">Marcus Thorne</div>
<div className="font-body-sm text-body-sm text-secondary">M.S. Candidate in Quantum Systems</div>
</div>
</div>
</div>

<div className="p-space-lg bg-surface-container-lowest border border-outline-variant flex flex-col justify-between">
<div>
<div className="flex items-center gap-1 text-primary mb-space-md">
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span>
</div>
<p className="font-body-md text-body-md text-on-surface leading-relaxed mb-space-lg italic">
              “Having real-time analytics on my study allocation and direct access to faculty slides transformed how I prepare for comprehensive midterms. An essential tool for research honors.”
            </p>
</div>
<div className="flex items-center gap-space-sm pt-space-md border-t border-outline-variant">
<div className="w-12 h-12 bg-surface-container-high border border-outline-variant flex items-center justify-center font-headline-sm text-headline-sm font-bold text-on-surface">
              SC
            </div>
<div>
<div className="font-headline-sm text-headline-sm font-semibold text-on-surface">Sofia Chen</div>
<div className="font-body-sm text-body-sm text-secondary">Honors Cognitive Neuroscience</div>
</div>
</div>
</div>
</div>
</div>
</section>

<section className="w-full bg-primary-container text-on-primary py-space-xl lg:py-28">
<div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin text-center">
<div className="max-w-3xl mx-auto flex flex-col items-center">
<span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-fixed-dim font-semibold mb-space-xs block">
          INSTITUTIONAL ENROLLMENT
        </span>
<h2 className="font-display text-headline-lg lg:text-display font-bold tracking-tight text-on-primary mb-space-md">
          Start Your Learning Journey Today
        </h2>
<p className="font-body-lg text-body-lg text-primary-fixed-dim max-w-2xl mb-space-xl leading-relaxed">
          Build better learning habits, stay organized, and make meaningful progress in your university curriculum with a platform built for technical rigor.
        </p>

<div className="flex flex-col sm:flex-row items-center justify-center gap-space-md w-full sm:w-auto mb-space-md">
<Link className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-surface-container-lowest text-on-surface px-space-xl py-3.5 font-label-md text-label-md uppercase tracking-wider font-semibold transition-colors hover:bg-surface-container-low cursor-pointer" data-path="signup" to="/login">
<span>Get Started Free</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</Link>
<a className="w-full sm:w-auto inline-flex items-center justify-center border border-primary-fixed-dim/40 text-on-primary px-space-xl py-3.5 font-label-md text-label-md uppercase tracking-wider font-semibold hover:border-on-primary transition-colors" data-path="contact" href="#">
            Request Campus License
          </a>
</div>
<p className="font-body-sm text-body-sm text-primary-fixed-dim">
          No credit card required. Free for students with verified .edu accounts.
        </p>
</div>
</div>
</section>
</div></main><footer className="w-full bg-surface-container-lowest border-t border-outline-variant pt-space-xl pb-space-lg"><div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-gutter mb-space-xl"><div className="lg:col-span-4 flex flex-col gap-space-sm"><div className="flex items-center gap-space-sm"><img alt="Aura Academia Logo" className="h-8 w-auto object-contain" src="/logo.png" /><span className="font-headline-sm text-headline-sm uppercase tracking-tight text-on-surface font-semibold">Aura Academia</span></div><p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm leading-relaxed mt-space-xs">A precision academic platform empowering university students to master coursework, track empirical progress, and organize scholarly research.</p></div><div className="lg:col-span-2 lg:col-start-6 flex flex-col gap-space-sm"><h4 className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">Platform</h4><ul className="flex flex-col gap-space-xs"><li className="font-body-sm text-body-sm"><a className="text-on-surface-variant hover:text-on-surface transition-colors" data-path="features" href="#">Features</a></li><li className="font-body-sm text-body-sm"><a className="text-on-surface-variant hover:text-on-surface transition-colors" data-path="courses" href="#">Courses</a></li><li className="font-body-sm text-body-sm"><a className="text-on-surface-variant hover:text-on-surface transition-colors" data-path="academic-analytics" href="#">Academic Analytics</a></li><li className="font-body-sm text-body-sm"><a className="text-on-surface-variant hover:text-on-surface transition-colors" data-path="resource-library" href="#">Resource Library</a></li></ul></div><div className="lg:col-span-2 flex flex-col gap-space-sm"><h4 className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">Resources</h4><ul className="flex flex-col gap-space-xs"><li className="font-body-sm text-body-sm"><a className="text-on-surface-variant hover:text-on-surface transition-colors" data-path="student-help-center" href="#">Student Help Center</a></li><li className="font-body-sm text-body-sm"><a className="text-on-surface-variant hover:text-on-surface transition-colors" data-path="syllabus-archive" href="#">Syllabus Archive</a></li><li className="font-body-sm text-body-sm"><a className="text-on-surface-variant hover:text-on-surface transition-colors" data-path="citation-tools" href="#">Citation Tools</a></li><li className="font-body-sm text-body-sm"><a className="text-on-surface-variant hover:text-on-surface transition-colors" data-path="academic-faqs" href="#">Academic FAQs</a></li></ul></div><div className="lg:col-span-3 flex flex-col gap-space-sm"><h4 className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">Institution & Company</h4><ul className="flex flex-col gap-space-xs"><li className="font-body-sm text-body-sm"><a className="text-on-surface-variant hover:text-on-surface transition-colors" data-path="about" href="#">About Aura</a></li><li className="font-body-sm text-body-sm"><a className="text-on-surface-variant hover:text-on-surface transition-colors" data-path="research-faculty" href="#">Research Faculty</a></li><li className="font-body-sm text-body-sm"><a className="text-on-surface-variant hover:text-on-surface transition-colors" data-path="institutional-privacy" href="#">Institutional Privacy</a></li><li className="font-body-sm text-body-sm"><a className="text-on-surface-variant hover:text-on-surface transition-colors" data-path="honor-code-and-terms" href="#">Honor Code & Terms</a></li></ul></div></div><div className="pt-space-md border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-space-sm"><p className="font-body-sm text-body-sm text-on-surface-variant">© 2024 Aura Academia Inc. All rights reserved.</p><div className="flex items-center gap-space-md font-body-sm text-body-sm text-on-surface-variant"><a className="hover:text-on-surface transition-colors" href="#">X / Twitter</a><a className="hover:text-on-surface transition-colors" href="#">GitHub</a><a className="hover:text-on-surface transition-colors" href="#">LinkedIn</a><a className="hover:text-on-surface transition-colors" href="#">Discord</a></div></div></div></footer>
    </>
  );
}

export default Home;
