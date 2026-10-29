/* =========================================================================
   818 AI Agency — all website text lives here.
   Change a sentence here, run `npm run build`, and every page is rebuilt.
   ========================================================================= */

export const site = {
  name: '818 AI Agency',
  short: '818 AI',
  tagline: 'Intelligence. Engineered.',
  /* PLACEHOLDERS: replace with your real details */
  email: 'hello@818ai.com',
  whatsapp: '',            // e.g. '971500000000' (country code + number, no + or spaces). Empty = button hidden
  /* The contact form: leave empty to open the visitor's email app with the message filled in.
     Or paste a form service URL (Formspree, Getform, Web3Forms ...) to receive the message directly. */
  formEndpoint: '',
};

export const regions = [
  { code: 'AE', name: 'United Arab Emirates', main: true },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'QA', name: 'Qatar' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'OM', name: 'Oman' },
];

/* The 7 services. Order = order on the Services page and in the menu.
   `icon` must exist in templates/icons.js, `image` in site/assets/img. */
export const services = [
  {
    slug: 'ai-receptionist', num: '01', icon: 'headset', featured: true,
    category: 'Customer Communication', title: 'AI Receptionist', nav: 'AI Receptionist',
    image: 'ai-receptionist.webp',
    card: 'An always-on receptionist that answers calls, WhatsApp, email and chat, books appointments and hands over to your team.',
    point: 'Never miss an enquiry again',
    tagline: 'An always-on receptionist that answers, qualifies and books, so no enquiry goes unanswered.',
    intro: 'Our AI Receptionist answers incoming calls, WhatsApp messages, emails and website chats on behalf of your business. It gives clear answers, captures lead details, books appointments and passes complex conversations to your team, day and night.',
    buildTitle: 'One receptionist, every channel',
    build: [
      ['Phone Call Answering', 'Answer incoming calls, give clear information and take messages around the clock.'],
      ['WhatsApp & Live Chat', 'Reply to customers on WhatsApp and your website chat with consistent, on-brand answers.'],
      ['Email Support', 'Read and respond to routine enquiries, and route the rest to the right person.'],
      ['Appointment Booking', 'Check availability, then book, confirm and remind, connected to your calendar where supported.'],
      ['Smart Escalation', 'Hand over to a team member with the full conversation whenever a human is needed.'],
      ['Lead Capture', 'Collect names, needs and contact details and send them to your CRM or inbox.'],
    ],
    steps: [
      'Understand your business, services, opening hours and the questions customers ask most.',
      'Design the conversation flows, tone of voice and languages with you.',
      'Connect your phone line, WhatsApp, website chat, calendar and CRM where supported.',
      'Test with real scenarios and refine the answers before going live.',
      'Launch, review conversations and keep improving the receptionist.',
    ],
    deliver: [
      'An AI receptionist configured for your business and channels.',
      'Conversation flows, FAQs and tone of voice agreed with you.',
      'Calendar, CRM or inbox connections where supported.',
      'Escalation rules that route people to your team.',
      'Testing, handover and usage guidance.',
    ],
    value: [
      'Fewer missed calls and unanswered messages.',
      'Consistent answers at any hour, including weekends and holidays.',
      'Your team spends its time on higher-value conversations.',
      'Customers get a faster first response.',
    ],
    note: 'Available channels, languages and integrations depend on the providers and plans involved, and are confirmed when the scope is agreed.',
  },
  {
    slug: 'ai-solutions', num: '02', icon: 'chip',
    category: 'Intelligence', title: 'AI Solutions', nav: 'AI Solutions',
    image: 'ai-solutions.webp',
    card: 'Practical AI solutions that help businesses improve everyday operations, solve problems, and work more efficiently.',
    point: 'Put AI to work for your business',
    tagline: 'Practical AI capabilities built around defined business requirements.',
    intro: 'We identify suitable AI use cases and plan solutions around your workflows, information, and existing tools.',
    buildTitle: 'Designed around your requirements',
    build: [
      ['Use-Case Planning', 'Identify practical applications for your business.'],
      ['AI Implementation', 'Build and configure functionality within the agreed scope.'],
      ['Integration', 'Connect supported tools where required.'],
    ],
    steps: [
      'Understand business goals and candidate use cases.',
      'Review data, tools, and integration requirements.',
      'Build and test against agreed requirements.',
      'Prepare deployment and usage guidance.',
    ],
    deliver: [
      'An AI solution within the agreed scope.',
      'Supported integrations where required.',
      'Testing and implementation guidance.',
      'Documentation for delivered functionality.',
    ],
    value: [
      'Support for suitable repetitive tasks.',
      'Faster access to relevant information in supported workflows.',
      'More consistent handling of selected processes.',
    ],
  },
  {
    slug: 'ai-automation', num: '03', icon: 'flow',
    category: 'Automation', title: 'AI Automation', nav: 'AI Automation',
    image: 'ai-automation.webp',
    card: 'Automate repetitive tasks and business workflows to reduce manual effort, save time, and improve productivity.',
    point: 'Reduce repetitive manual work',
    tagline: 'Remove repetitive work by automating the steps that slow your team down.',
    intro: 'We map how work moves through your business, then automate the repeatable parts, such as data entry, follow-ups, notifications and hand-offs, so your team can focus on the work that needs people.',
    buildTitle: 'Designed around your requirements',
    build: [
      ['Workflow Mapping', 'Find the repetitive steps and decide what is worth automating.'],
      ['Process Automation', 'Automate routine tasks between the tools your team already uses.'],
      ['Alerts & Follow-ups', 'Trigger reminders, notifications and approvals at the right moment.'],
    ],
    steps: [
      'Map the current process and the time it takes.',
      'Choose the steps to automate and agree the rules.',
      'Build the automation and test it with real examples.',
      'Launch, monitor results and adjust as your process changes.',
    ],
    deliver: [
      'Automated workflows within the agreed scope.',
      'Connections between your supported tools.',
      'Testing and monitoring guidance.',
      'Documentation of how each automation works.',
    ],
    value: [
      'Less manual data entry and copy-and-paste work.',
      'Faster hand-offs between teams and tools.',
      'More consistent follow-up on enquiries and tasks.',
    ],
  },
  {
    slug: 'ai-tools-agents', num: '04', icon: 'bot',
    category: 'Agents', title: 'AI Tools & Agents', nav: 'AI Tools & Agents',
    image: 'ai-agents.webp',
    card: 'AI-powered tools and agents that assist with business tasks, information handling, and everyday workflows.',
    point: 'Extend what your team can do',
    tagline: 'AI-powered tools and agents that assist with tasks, information and everyday workflows.',
    intro: 'We build AI agents and internal tools that can research, draft, summarise, look up information and take supported actions across the tools your team already uses.',
    buildTitle: 'Designed around your requirements',
    build: [
      ['Custom AI Agents', 'Agents with a clear role, goals and instructions for a defined job.'],
      ['Internal AI Tools', 'Assistants that help your team find, draft and summarise information.'],
      ['Tool & Data Connections', 'Connect agents to supported apps, documents and data sources.'],
    ],
    steps: [
      'Define the role, goals and limits of the agent.',
      'Connect the tools and data it needs.',
      'Write instructions, test with real tasks and refine.',
      'Deploy with guidance on how your team uses it.',
    ],
    deliver: [
      'An AI agent or tool within the agreed scope.',
      'Connections to supported tools and data.',
      'Instructions, testing and refinement.',
      'Usage guidance for your team.',
    ],
    value: [
      'Faster research, drafting and information lookup.',
      'Routine tasks handled consistently.',
      'More time for your team to focus on decisions.',
    ],
  },
  {
    slug: 'custom-software', num: '05', icon: 'code',
    category: 'Engineering', title: 'Custom Software', nav: 'Custom Software',
    image: 'custom-software.webp',
    card: 'Purpose-built software designed around your business requirements, workflows, and operational challenges.',
    point: 'Software built around your needs',
    tagline: 'Purpose-built software shaped around the way your business operates.',
    intro: 'When standard tools do not fit a business process, custom software can provide functionality designed around agreed requirements.',
    buildTitle: 'Designed around your requirements',
    build: [
      ['Requirements Planning', 'Define the problem, users, and essential functionality.'],
      ['Purpose-Built Features', 'Develop screens and workflows for the agreed use case.'],
      ['Connected Data', 'Add data storage and supported integrations where required.'],
    ],
    steps: [
      'Map the existing process and identify the main problem.',
      'Agree on requirements, user roles, and features.',
      'Build and test the software in manageable stages.',
      'Prepare deployment and handover.',
    ],
    deliver: [
      'Software features defined in the agreed scope.',
      'Relevant screens, forms, and workflow logic.',
      'Data storage or integrations where required.',
      'Testing and handover documentation.',
    ],
    value: [
      'Closer alignment between software and business processes.',
      'Fewer disconnected steps in supported workflows.',
      'A foundation for future improvements.',
    ],
  },
  {
    slug: 'web-development', num: '06', icon: 'globe',
    category: 'Digital Experiences', title: 'Web Development', nav: 'Web Development',
    image: 'web-development.webp',
    card: 'Professional, responsive websites built to present your business clearly and deliver better digital experiences.',
    point: 'Build your online presence',
    tagline: 'Custom websites designed around your business, your customers, and your next stage of growth.',
    intro: 'We build responsive business websites that bring your brand, services, and customer journey together in one clear digital experience. Depending on your requirements, a website can also include suitable AI features, automation workflows, third-party integrations, and interactive visual experiences.',
    buildTitle: 'Designed around your requirements',
    build: [
      ['Custom Website Development', 'Purpose-designed website pages and reusable components shaped around your brand, audience, and business requirements.'],
      ['Responsive User Experiences', 'Layouts and interactions designed to work across desktop, tablet, and mobile screen sizes.'],
      ['AI Features and Automation', 'Where appropriate, connect AI-powered capabilities and automated workflows to support specific business tasks.'],
      ['Business Integrations', 'Connect contact forms, communication channels, APIs, and business tools according to the agreed scope.'],
      ['Interactive and 3D Experiences', 'Add carefully designed motion, animation, or 3D elements when they support the brand and user experience.'],
      ['Testing and Deployment', 'Prepare the agreed website for launch with responsive checks, functionality testing, and deployment support.'],
    ],
    steps: [
      'Understand your business, audience, goals, and required functionality.',
      'Plan the website structure, page layouts, and customer journey.',
      'Develop the interface and implement the agreed features and integrations.',
      'Test the website across supported devices and fix identified issues.',
      'Deploy the agreed scope and provide handover guidance.',
    ],
    deliver: [
      'Website pages and functionality defined in the agreed scope.',
      'Responsive layouts for desktop, tablet, and mobile.',
      'Configured contact options and approved integrations.',
      'Testing and deployment support.',
      'Handover guidance for the delivered website.',
    ],
    value: [
      'A more professional and consistent online presence.',
      'A clearer way for visitors to understand your services.',
      'More accessible contact and enquiry options.',
      'A website that can be extended as your business requirements evolve.',
    ],
    projects: [
      { name: 'Guide to Pakistan', image: 'project-gtp.webp', url: 'https://guide-to-pakistan.vercel.app/', blurb: 'A travel and tourism platform showcasing Pakistan\'s destinations, tours, regional information, and travel discovery experiences.', notes: 'A digital travel experience focused on destination discovery and tourism information.' },
      { name: 'CyberXSoft.net', image: 'project-cyberxsoft.webp', url: 'https://cyber-x-soft-studio-net.vercel.app/', blurb: 'A company website presenting CyberXSoft\'s services and professional digital presence.', notes: 'A business website designed to communicate the company\'s services and capabilities.' },
      { name: 'Laveet Enterprises', image: 'project-laveet.webp', url: 'https://laveet-enterprises-portfolio.vercel.app/', blurb: 'A company website for Laveet Enterprises, civil and electrical contractors in Karachi, with sections for services, its journey, projects, team and a request-a-quote button.', notes: 'A professional business website that presents the company and makes it easy to ask for a quote.' },
      { name: 'Ridex Car Rental', image: 'project-ridex.webp', url: 'https://car-rent-website-teal.vercel.app/', blurb: 'A car rental and lease-takeover website with a car search by brand, monthly payment and year, car listings and a simple step-by-step process.', notes: 'A listings-style website built around searching for a car and making a deal.' },
    ],
  },
  {
    slug: 'crm-integrations', num: '07', icon: 'share',
    category: 'Connected Systems', title: 'CRM & Integrations', nav: 'CRM & Integrations',
    image: 'crm-integrations.webp', image2: 'crm-dashboard.webp',
    card: 'Connect customer information, business tools, and systems to create smoother, more coordinated workflows.',
    point: 'Keep business systems connected',
    tagline: 'Connect customer information and business tools to create a more organised workflow.',
    intro: 'We help businesses organise customer records, track enquiries, and connect supported applications. The solution is planned around your current tools and processes rather than assuming every business needs the same CRM or integration setup.',
    buildTitle: 'Designed around your requirements',
    build: [
      ['CRM Configuration', 'Structure customer records, fields, stages, and user access around your agreed requirements.'],
      ['Lead and Enquiry Management', 'Organise enquiries so your team can review their status and determine appropriate follow-up actions.'],
      ['Application Integrations', 'Connect compatible business tools using supported APIs, connectors, or integration platforms.'],
      ['Workflow Automation', 'Configure suitable notifications, reminders, and routine actions where the selected systems allow them.'],
      ['Data Flow and Permissions', 'Check field mapping, access permissions, and how information moves between connected systems.'],
      ['Testing and Handover', 'Test agreed workflows and provide guidance for the delivered configuration.'],
    ],
    steps: [
      'Review your current customer-management process and business tools.',
      'Agree on CRM structure, customer fields, access requirements, and workflow stages.',
      'Configure the CRM and connect the selected supported applications.',
      'Test data flow, permissions, duplicate handling, and follow-up workflows.',
      'Document the setup and provide handover guidance.',
    ],
    deliver: [
      'A CRM structure based on agreed business needs.',
      'Configured customer fields, enquiry stages, and pipeline organisation.',
      'Supported integrations between selected tools.',
      'Follow-up reminders or workflow automation where agreed.',
      'Data-flow checks and basic user guidance.',
    ],
    value: [
      'A more centralised view of customer and enquiry information.',
      'Clearer visibility into follow-up status.',
      'Less repeated manual entry where integrations support it.',
      'More consistent handling of customer records.',
    ],
    note: 'Available functionality depends on the CRM, third-party APIs, account permissions, and subscription plans. Data migration and advanced customisation should be agreed separately where applicable.',
  },
];

/* Services page: "Technology should solve real problems" */
export const problems = [
  ['Disconnected systems', 'Bring business tools, data and everyday workflows together through connected software and integrations.'],
  ['Repetitive manual work', 'Reduce suitable repetitive tasks with intelligent automation, giving your team more time for meaningful work.'],
  ['Inconsistent communication', 'Support customer enquiries, timely responses and follow-ups with connected communication tools and AI assistance.'],
  ['Software that doesn\'t fit', 'Create tailored digital experiences and software around your business needs instead of forcing your team into rigid tools.'],
];

/* Services page: 5-step path */
export const path = [
  ['Discover', 'Understand your business, pain points and goals.', 'Clarity'],
  ['Design', 'Shape the strategy, experience and architecture.', 'Strategy'],
  ['Build', 'Develop and integrate your solution.', 'Development'],
  ['Launch', 'Test thoroughly and deploy with confidence.', 'Deployment'],
  ['Scale', 'Optimise and expand as your business grows.', 'Long-term growth'],
];

/* Home: three steps of "How we work" (stacking cards) */
export const process = [
  ['Map', 'We sit with your team, follow the real work and list where time and leads leak out of the business.', 'map'],
  ['Build', 'We design the workflows, train the assistants and ship working pieces you can try early and give feedback on.', 'build'],
  ['Run and improve', 'We launch, watch the numbers and keep tuning, so the system gets better the longer it runs.', 'run'],
];

/* About page: "How we turn technology into solutions" slider */
export const stories = [
  { tag: 'Customer conversations', title: 'Answer every enquiry.', em: 'Day and night.', text: 'An AI receptionist picks up calls, WhatsApp, email and chat, so customers get a reply while your team gets on with the work.', image: 'ai-receptionist.webp', link: 'ai-receptionist' },
  { tag: 'Digital experience', title: 'Build digital experiences.', em: 'Designed around people.', text: 'A digital experience should do more than look good. We create websites and digital experiences that communicate clearly, guide users naturally and are built around the goals of the business.', image: 'web-development.webp', link: 'web-development' },
  { tag: 'Intelligence', title: 'Make intelligence', em: 'practical.', text: 'We apply AI where it can remove friction: answering questions, handling routine tasks and surfacing the right information at the right moment.', image: 'ai-solutions.webp', link: 'ai-solutions' },
  { tag: 'Connected systems', title: 'Connect the tools', em: 'you already use.', text: 'CRM, email, calendars, payments and communication channels working together, so information moves smoothly instead of being retyped.', image: 'crm-integrations.webp', link: 'crm-integrations' },
  { tag: 'Built for you', title: 'Software shaped', em: 'around your business.', text: 'When standard tools do not fit, we design and build software around your workflows, with room to grow as your business changes.', image: 'custom-software.webp', link: 'custom-software' },
];
