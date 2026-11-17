/* =====================================================================
   ACCRION ASSISTANT: WHAT THE ASSISTANT KNOWS

   Everything the website assistant can say is in this one file.
   It never makes answers up: if a question matches nothing here, it
   says so and offers to pass the question to the team.

   HOW TO CHANGE AN ANSWER
     Edit the words between the quotation marks after  answer:
     Keep the quotation marks and the comma at the end of the line.

   HOW TO ADD A NEW QUESTION
     Copy one whole block, from its opening { to its closing },
     paste it below another block, then change these four things:
       id        a short name of your own, no spaces, not used elsewhere
       title     what the answer is about, in a few words
       keywords  the words and phrases a visitor might type, in lower
                 case. The more ways of saying it you list, the better.
       answer    what the assistant should say

   OPTIONAL EXTRAS IN A BLOCK
     deadlines  said when the visitor asks "when is it due?"
     need       said when the visitor asks "what do you need from me?"
     chips      suggested next questions shown as buttons
     general    true adds "general information, not advice" under the answer
     offer      "quote", "consultation", "callback" or "general": the
                assistant offers the enquiry form and opens it on "yes"
     handoff    true means this always goes to the team, whatever else
                the visitor mentions in the same question
     link       a button to a section of the website

   IN ANY ANSWER YOU CAN WRITE  {phone}  {whatsapp}  {email}  {licence}
   and the assistant fills in the practice's details.

   RULES
     Do not add prices, deadlines, qualifications or services here
     unless they are correct and you are happy for visitors to rely on
     them. Keep this file in step with the website.
     The AAT licence belongs to a licensed member, not to the company.
     Do not describe the business itself as licensed, regulated,
     authorised or chartered, and do not add services the licence does
     not cover.
   ===================================================================== */
window.ACCRION_KNOWLEDGE = {

  /* ---------- Settings ---------- */
  welcome: "Hello! Welcome to our accountancy practice. I'm your virtual assistant. How can I help you today?",
  voice: true,        // true: microphone and spoken replies are offered. false: typing only.
  aiEndpoint: "",     // leave empty. Filled in only if a server-side AI service is set up for the practice.

  /* ---------- Practice details (keep the same as the SITE block near the top of index.html) ---------- */
  practice: {
    name: "Accrion Accountants",
    phone: "07496 693077",
    whatsapp: "07496 693077",
    email: "info@accrionaccountants.co.uk",
    aatLicence: "1010025"
  },

  /* ---------- Suggestions shown under the welcome message ---------- */
  starters: ["What services do you offer?", "Key tax deadlines", "How much will it cost?", "Request a call back"],

  /* ---------- Questions and answers ---------- */
  topics: [

    /* ===== Services ===== */
    { id: "services", title: "Our services",
      keywords: ["services", "what do you do", "what do you offer", "what can you do", "what you do", "accountancy services", "accounting services", "help with my accounts", "what can you help with", "looking for an accountant", "need an accountant", "find an accountant", "new accountant"],
      answer: "We work in four areas: accounts and tax returns, bookkeeping and VAT, payroll, and management accounts and business support. You can engage us for one service or for all of them.\n\nWhich would you like to know more about?",
      chips: ["Accounts and tax returns", "Bookkeeping and VAT", "Payroll", "Management accounts"],
      link: { text: "See our services", to: "services" } },

    { id: "accounts", title: "Annual accounts", service: true,
      keywords: ["accounts", "annual accounts", "year end accounts", "year end", "final accounts", "statutory accounts", "company accounts", "financial statements", "accounts and tax returns", "companies house", "filing accounts", "prepare accounts"],
      answer: "We prepare year-end accounts and the returns that go with them from your records, and file them with HMRC and, for limited companies, Companies House. That covers annual accounts for sole traders, partnerships and limited companies, Company Tax Returns and Corporation Tax computations, and Self Assessment tax returns for sole traders, landlords and directors.",
      deadlines: "For a limited company, annual accounts are due at Companies House 9 months after the financial year ends, or 21 months after incorporation for the first accounts. These are the general rules and some businesses have different dates.",
      need: "For your accounts we need your bank statements and your sales and purchase records, or access to your accounting software, along with your latest accounts and tax returns if you have them.",
      chips: ["When are accounts due?", "Self Assessment tax returns", "Corporation Tax", "Request a quotation"],
      link: { text: "See accounts and tax returns", to: "services" } },

    { id: "self-assessment", source: { text: "GOV.UK, Self Assessment tax returns: deadlines", href: "https://www.gov.uk/self-assessment-tax-returns/deadlines", checked: "November 2026" }, title: "Self Assessment tax returns", service: true, general: true,
      keywords: ["self assessment", "self assessment tax return", "tax return", "personal tax return", "personal tax", "income tax return", "sa100", "utr", "payment on account", "file my return", "do my tax return"],
      answer: "We prepare and file Self Assessment tax returns for sole traders, landlords and company directors.",
      deadlines: "The online return, and any tax you owe, are due by 31 January after the tax year ends. A paper return is due by 31 October. If you are new to Self Assessment you need to register by 5 October, and a second payment on account, where it applies, is due by 31 July.",
      need: "For a tax return we need your tax reference numbers, your records of income and expenses for the year, and your latest tax return if you have one.",
      chips: ["When is the deadline?", "What do you need from me?", "Making Tax Digital", "Request a quotation"] },

    { id: "corporation-tax", source: { text: "GOV.UK, Company Tax Returns", href: "https://www.gov.uk/company-tax-returns", checked: "November 2026" }, title: "Corporation Tax and Company Tax Returns", service: true, general: true,
      keywords: ["corporation tax", "company tax return", "company tax", "ct600", "corp tax", "tax for my company"],
      answer: "We prepare Company Tax Returns and Corporation Tax computations for limited companies, alongside the annual accounts.",
      deadlines: "Corporation Tax is due 9 months and 1 day after your accounting period ends. The Company Tax Return is due 12 months after it ends. These are the general rules and some businesses have different dates.",
      chips: ["When is it due?", "Annual accounts", "Request a quotation"] },

    { id: "bookkeeping", title: "Bookkeeping", service: true,
      keywords: ["bookkeeping", "book keeping", "bookkeeper", "keep my books", "do my books", "my books", "bank reconciliation", "reconciliations", "bookkeeping and vat", "receipts", "invoices", "day to day records", "record keeping"],
      answer: "We keep your day-to-day records accurate and current. That includes bookkeeping and bank reconciliations, and help choosing and setting up accounting software.",
      need: "For bookkeeping we need your bank statements and your sales and purchase records, or access to your accounting software.",
      chips: ["VAT returns", "What do you need from me?", "Request a quotation"],
      link: { text: "See bookkeeping and VAT", to: "services" } },

    { id: "software", title: "Accounting software",
      keywords: ["software", "accounting software", "xero", "quickbooks", "sage", "freeagent", "spreadsheet", "excel", "cloud accounting", "which software", "app"],
      answer: "We help clients choose and set up accounting software, and we send VAT returns and quarterly updates through software compatible with Making Tax Digital. I do not have a list of specific packages, so please ask us about the one you use.",
      chips: ["Bookkeeping", "Making Tax Digital", "Send an enquiry"] },

    { id: "vat", deadlinesSource: null, source: { text: "GOV.UK, Register for VAT", href: "https://www.gov.uk/register-for-vat", checked: "November 2026" }, title: "VAT returns and VAT registration", service: true, general: true,
      keywords: ["vat", "vatt", "value added tax", "vat return", "vat returns", "vat registration", "register for vat", "vat registered", "vat number", "vat threshold", "making tax digital for vat", "flat rate scheme", "vat quarter"],
      answer: "We deal with VAT registration and VAT returns, and send your returns through software compatible with Making Tax Digital.\n\nWhether you need to register depends on your turnover. HMRC publishes the current threshold on GOV.UK, and we can confirm where you stand.",
      deadlines: "A VAT return and its payment are normally due 1 month and 7 days after the VAT period ends. Some businesses have different dates.",
      chips: ["When is it due?", "Bookkeeping", "Request a quotation"] },

    { id: "mtd", source: { text: "GOV.UK, Check if you're eligible for Making Tax Digital for Income Tax", href: "https://www.gov.uk/guidance/check-if-youre-eligible-for-making-tax-digital-for-income-tax", checked: "November 2026" }, title: "Making Tax Digital for Income Tax", general: true,
      keywords: ["making tax digital", "making tax digital for income tax", "mtd for income tax", "quarterly updates", "quarterly update", "digital records", "qualifying income", "digital tax", "mtd itsa"],
      answer: "Making Tax Digital for Income Tax is HMRC's new way of reporting self-employment and property income. You keep your records in compatible software, send HMRC an update every quarter and submit your tax return through the same software by 31 January. We can set up the software, keep the records and send the updates for you.",
      deadlines: "It began on 6 April 2026 for people with qualifying income over £50,000. It extends to those over £30,000 from 6 April 2027 and over £20,000 from 6 April 2028. Qualifying income is your gross income from self-employment and property, before expenses.",
      chips: ["When does it apply?", "Do I need an accountant?", "Send an enquiry"] },

    { id: "payroll", title: "Payroll", service: true,
      keywords: ["payroll", "paye", "payslip", "payslips", "wages", "salary", "salaries", "staff pay", "pay my staff", "pay my employees", "employees", "employer", "rti", "real time information", "p60", "p45", "pension", "workplace pension", "auto enrolment", "national insurance"],
      answer: "We run payroll so staff are paid the right amount and each submission reaches HMRC when it falls due. That covers payslips and Real Time Information submissions, workplace pension automatic enrolment, and P60s, P45s and year-end payroll reporting.",
      deadlines: "The monthly PAYE and National Insurance payment to HMRC is due by the 22nd when paid electronically, or the 19th by post, and employees must have their P60 by 31 May. The key dates bar at the foot of the website shows what is due next.",
      chips: ["When is PAYE due?", "Request a quotation"],
      link: { text: "See payroll", to: "services" } },

    { id: "cis", title: "The Construction Industry Scheme (CIS)", handoff: true,
      keywords: ["cis", "construction industry scheme", "subcontractor", "subcontractors", "cis return", "cis returns", "deduction statement", "deduction statements", "subcontractor verification", "construction", "builder", "building firm"],
      answer: "The Construction Industry Scheme is not among the services on our website, so I cannot confirm it for you. We do run payroll for employers, and we can tell you whether we can help with CIS.\n\nWould you like to send us your question?",
      offer: "general",
      chips: ["Send an enquiry", "Payroll"] },

    { id: "management-accounts", title: "Management accounts and business support", service: true,
      keywords: ["management accounts", "management account", "management reporting", "management reports", "management information", "monthly accounts", "quarterly accounts", "business support", "general business support", "business financial support", "how is my business doing"],
      answer: "Yes. We prepare management accounts during the year, at intervals agreed with you, and provide general support on the financial side of running your business. Timely figures allow you to see how the business is performing and to plan with greater certainty.",
      chips: ["Request a quotation", "What services do you offer?"],
      link: { text: "See our services", to: "services" } },

    { id: "company-formation", title: "Setting up a company",
      keywords: ["company formation", "form a company", "forming a company", "set up a company", "setting up a company", "set up a limited company", "start a company", "incorporate", "incorporation", "register a company", "open a company", "new limited company"],
      answer: "Setting up a company is not listed among the services on our website, so I cannot confirm it for you. We can tell you whether we can help. Once a company is running, we look after its annual accounts, Company Tax Return, bookkeeping, VAT and payroll.\n\nWould you like to send us an enquiry?",
      offer: "general",
      chips: ["Send an enquiry", "Limited companies"] },

    { id: "compliance", title: "Tax compliance",
      keywords: ["compliance", "compliant", "tax compliance", "stay compliant", "obligations", "meet my obligations", "hmrc requirements"],
      answer: "Keeping you compliant is the core of our work. We prepare your accounts and returns from your records, file them with HMRC and, for limited companies, Companies House, and tell you about each deadline well before it arrives.",
      chips: ["Key tax deadlines", "What services do you offer?"] },

    /* ===== Who we work with ===== */
    { id: "who", title: "Who we work with",
      keywords: ["who do you work with", "who we work with", "what kind of clients", "type of clients", "clients", "who are your clients", "who do you help", "do you take on"],
      answer: "We work with small and medium-sized enterprises (SMEs), growing businesses and individuals. We welcome clients from all backgrounds, industries and business sectors.\n\nWhich best describes you?",
      chips: ["Sole trader", "Limited company", "Landlord", "Start-up", "Established business"],
      link: { text: "See who we work with", to: "clients" } },

    { id: "sole-traders", title: "Sole traders and the self-employed", businessType: "Sole trader or self-employed",
      keywords: ["sole trader", "sole traders", "self employed", "freelancer", "freelancers", "freelance", "independent professional", "work for myself", "my own business", "side business", "self employed professional"],
      answer: "We provide tailored accounting and tax support for independent professionals, freelancers and self-employed individuals. In practice that means your annual accounts and Self Assessment tax return, bookkeeping, and the quarterly updates under Making Tax Digital for Income Tax.",
      deadlines: "For sole traders, the online Self Assessment return and any tax owed are due by 31 January after the tax year ends. Making Tax Digital for Income Tax adds an update every quarter once it applies to you.",
      chips: ["Self Assessment tax returns", "Making Tax Digital", "Do I need an accountant?", "Request a quotation"] },

    { id: "limited-companies", title: "Limited companies and company directors", businessType: "Limited company",
      keywords: ["limited company", "limited companies", "company director", "company directors", "director", "directors", "my company", "dividends", "shareholder"],
      answer: "We provide company accounting, statutory reporting and Corporation Tax support for limited companies and their directors. That covers annual accounts filed with Companies House, the Company Tax Return and Corporation Tax computation, directors' Self Assessment tax returns, and payroll.",
      deadlines: "For a limited company, annual accounts are due at Companies House 9 months after the financial year ends, or 21 months after incorporation for the first accounts. Corporation Tax is due 9 months and 1 day after the accounting period ends, and the Company Tax Return 12 months after it ends. Some businesses have different dates.",
      chips: ["Limited company deadlines", "Corporation Tax", "Payroll", "Request a quotation"] },

    { id: "landlords", title: "Landlords and property owners", businessType: "Landlord or property owner",
      keywords: ["landlord", "landlords", "property", "properties", "rental", "rental income", "rent out", "buy to let", "letting", "property income", "property owner", "holiday let", "tenant"],
      answer: "We provide accounting and tax services for individuals and businesses with property-related income. That includes Self Assessment tax returns for landlords, and the quarterly updates under Making Tax Digital for Income Tax, which applies to property income as well as self-employment.",
      deadlines: "For landlords, the online Self Assessment return and any tax owed are due by 31 January after the tax year ends. Making Tax Digital for Income Tax adds an update every quarter once it applies to you.",
      chips: ["Making Tax Digital", "Self Assessment tax returns", "Request a quotation"] },

    { id: "partnerships", title: "Partnerships", businessType: "Partnership",
      keywords: ["partnership", "partnerships", "business partner", "partners"],
      answer: "Yes. We prepare annual accounts for partnerships, as well as for sole traders and limited companies. We can confirm what else your partnership needs.",
      chips: ["Annual accounts", "Send an enquiry"] },

    { id: "startups", title: "Start-ups and growing businesses", businessType: "Start-up",
      keywords: ["start up", "startup", "start ups", "new business", "just started", "starting a business", "starting out", "growing business", "expanding", "business growth"],
      answer: "For start-ups and growing businesses we help you keep sound records from the outset, make the right registrations with HMRC and meet your first deadlines on time. Tell us about your business and the work you want done, and we will confirm what we will do and what it costs before any work starts.",
      chips: ["How does it work?", "What services do you offer?", "Send an enquiry"] },

    { id: "sme", title: "Small and medium-sized enterprises",
      keywords: ["sme", "smes", "small business", "small businesses", "medium sized", "small company", "small firm", "small and medium"],
      answer: "For small and medium-sized enterprises we provide accountancy and tax support, handled together by one practice: year-end accounts and tax returns, bookkeeping and VAT, and payroll.",
      chips: ["What services do you offer?", "How much will it cost?", "Send an enquiry"] },

    { id: "established", title: "Established businesses",
      keywords: ["established business", "established businesses", "existing business", "been trading", "trading for years"],
      answer: "For established businesses we provide reliable accountancy, taxation and compliance services, to help you maintain accurate financial records and meet your obligations.",
      chips: ["Can you take over from my accountant?", "What services do you offer?", "Send an enquiry"] },

    { id: "industries", title: "Industries and sectors",
      keywords: ["industry", "industries", "sector", "sectors", "line of work", "type of business", "kind of business", "do you work with", "do you deal with", "restaurant", "takeaway", "shop", "retail", "ecommerce", "online business", "taxi", "salon", "barber", "consultant", "tradesman", "plumber", "electrician", "haulage", "wholesale"],
      answer: "We welcome clients from all backgrounds, industries and business sectors, so your line of work is no barrier. Tell us a little about your business and we will confirm how we can help.",
      chips: ["What services do you offer?", "Send an enquiry"] },

    /* ===== Becoming a client ===== */
    { id: "how-it-works", title: "How it works", facet: "start",
      keywords: ["how it works", "how does it work", "how do you work", "process", "the steps", "getting started", "get started", "become a client", "sign up", "join you", "onboarding", "engagement letter", "what happens next"],
      answer: "There are four stages. First, you tell us what you need by phone, email or the enquiry form. Second, we confirm the work and the fee in an engagement letter before any work starts. Third, we check your identity, as the Money Laundering Regulations require. Fourth, we collect your records, prepare and file what is due, and tell you what is coming next and when.",
      chips: ["What do you need from me?", "How much will it cost?", "Send an enquiry"],
      link: { text: "See our approach", to: "process" } },

    { id: "need", title: "What we need from you", facet: "need",
      keywords: ["what do you need", "what do you need from me", "what do i need", "documents", "paperwork", "what information", "what should i send", "agent authorisation", "authorise you", "tax reference"],
      answer: "To get started we need photo ID and proof of address for the identity check, your tax reference numbers, and your latest accounts and tax returns if you have them. For ongoing work we also need your bank statements, sales and purchase records, or access to your accounting software. We will also ask you to authorise us as your agent so we can deal with HMRC for you.",
      chips: ["How does it work?", "Send an enquiry"] },

    { id: "identity", title: "Identity checks",
      keywords: ["identity", "identity check", "id check", "anti money laundering", "money laundering", "aml", "passport", "proof of address", "photo id", "why do you need id", "verify"],
      answer: "The Money Laundering Regulations require us to verify the identity of every client, so we check your identity before work starts. We ask for photo ID and proof of address, and we will tell you exactly which documents to send." },

    { id: "switching", title: "Moving from another accountant",
      keywords: ["switch accountant", "switching accountant", "switch", "switching", "change accountant", "changing accountant", "move accountant", "current accountant", "existing accountant", "previous accountant", "old accountant", "take over", "leave my accountant", "handover", "transfer", "professional clearance", "clearance letter"],
      answer: "Yes. With your authority we write to your current accountant to request professional clearance and the information we need, such as your records and recent accounts and tax returns. You do not have to manage the handover yourself.",
      chips: ["What do you need from me?", "How much will it cost?", "Send an enquiry"] },


    { id: "support", title: "Calls and emails",
      keywords: ["unlimited calls", "unlimited emails", "unlimited support", "calls and emails", "phone support", "email support", "can i call you", "can i email you", "how often can i contact", "ongoing support", "ask questions", "extra charge for calls", "charge for emails"],
      answer: "Telephone and email support is part of working with us, without limit. Contact us whenever a question arises, as often as you need, on {phone} or at {email}.",
      chips: ["How much will it cost?", "Send an enquiry"] },

    { id: "fees", title: "Our fees", facet: "cost", offer: "quote",
      keywords: ["cost", "costs", "price", "prices", "pricing", "price list", "fee", "fees", "charge", "charges", "how much", "how much do you charge", "quote", "quotation", "estimate", "packages", "monthly fee", "expensive", "cheap", "affordable"],
      answer: "It depends on the work: a single tax return costs less than a year of bookkeeping, VAT and payroll. We do not publish a price list. Tell us what you need and we will give you a fee in writing before we start.\n\nWould you like to request a quotation?",
      chips: ["Request a quotation", "What services do you offer?"] },

    { id: "need-accountant", title: "Whether you need an accountant", general: true,
      keywords: ["do i need an accountant", "do i really need an accountant", "why use an accountant", "do it myself", "can i do it myself", "file my own", "is it worth it", "worth having an accountant", "why should i use you"],
      answer: "You can file your own tax return, and plenty of people do. An accountant is of most value when your affairs take more time than you have, when you are unsure which expenses you can claim, or when a mistake or a missed deadline would cost you a penalty.\n\nOnce your qualifying income is above the Making Tax Digital threshold, quarterly updates are required in addition to the yearly return, and that is often when sole traders decide to hand the work over.",
      chips: ["Making Tax Digital", "How much will it cost?", "Send an enquiry"] },

    { id: "consultation", title: "An initial conversation", offer: "consultation",
      keywords: ["consultation", "free consultation", "initial consultation", "appointment", "meeting", "book a meeting", "initial chat", "first meeting", "discovery call"],
      answer: "Yes. Tell us what you need and we will come back to you to talk it through. The website does not say whether an initial conversation is charged for, so please ask when we contact you.\n\nWould you like to arrange one?",
      chips: ["Arrange a consultation", "Request a call back"] },

    /* ===== The practice ===== */
    { id: "about", title: "About the practice",
      keywords: ["about you", "about the practice", "about accrion", "who are you", "tell me about you", "tell me about the practice", "the firm", "accrion", "your company"],
      answer: "Accrion Accountants Ltd is an accountancy practice based in Bury, Manchester, working with clients across the United Kingdom. We prepare accounts and tax returns, keep books and VAT in order, and run payroll for businesses and individuals across a wide range of sectors. We agree the work and the fee with you in writing before we start, and we tell you about each deadline well before it arrives.",
      chips: ["What services do you offer?", "Your professional standing", "How can I contact you?"],
      link: { text: "Read about the practice", to: "about" } },

    { id: "regulation", title: "Our professional standing",
      keywords: ["regulated", "regulation", "qualified", "qualification", "qualifications", "licence", "licensed", "aat", "accredited", "chartered", "acca", "icaew", "insured", "insurance", "indemnity", "ico", "registered", "company number", "legitimate", "genuine", "credentials", "can i trust you", "professional body", "professional standing", "professional standards", "code of ethics", "supervised", "supervisor", "supervision", "who supervises you", "supervises you for money laundering", "money laundering supervisor", "money laundering supervision", "supervised for money laundering", "aml supervisor", "aml supervision"],
      answer: "Our accounting services are provided by an AAT Licensed Accountant, who is licensed and regulated by AAT (the Association of Accounting Technicians) under licence number {licence}. The licence is held by the individual accountant rather than by the company. We work to AAT's Code of Professional Ethics and are supervised by AAT for anti-money laundering purposes. Accrion Accountants Ltd is registered with the Information Commission's Office (ICO) and holds professional indemnity insurance, and details of both are available on request. The company is registered in England and Wales under number 17121589.",
      chips: ["About the practice", "How can I contact you?"],
      link: { text: "See our professional disclosures", to: "credentials" } },

    { id: "location", title: "Where we are",
      keywords: ["where are you", "where are you based", "location", "located", "based", "address", "your office", "office", "bury", "manchester", "near me", "local", "nationwide", "across the uk", "anywhere in the uk", "remote", "remotely", "postcode", "london", "england", "scotland", "wales", "northern ireland", "visit", "in person", "face to face", "come in"],
      answer: "We are based in Bury, Manchester, and we work with clients across the UK, so you do not need to be local. Our registered office is Atrium House, 574 Manchester Road, Bury, BL9 9SW. The website does not say whether appointments are held at the office, so please ask us if you would like to meet in person.",
      chips: ["How can I contact you?", "Send an enquiry"] },

    { id: "hours", title: "Opening hours",
      keywords: ["opening hours", "opening times", "hours", "what time", "are you open", "open today", "closed", "weekend", "saturday", "sunday", "office hours"],
      answer: "Our opening hours are not published on the website, so I cannot tell you them. You can call or message us on {phone}, email {email}, or leave an enquiry and we will come back to you.",
      chips: ["Request a call back", "Send an enquiry"] },

    { id: "contact", title: "How to contact us",
      keywords: ["contact", "contact you", "contact details", "phone", "phone number", "telephone", "number", "call you", "email", "email address", "whatsapp", "get in touch", "reach you", "message you"],
      answer: "You can call us or message us on WhatsApp on {phone}, or email {email}. I can also take your details here and pass an enquiry to the practice.",
      chips: ["Send an enquiry", "Request a call back"],
      link: { text: "Go to the contact section", to: "contact" } },

    { id: "human", title: "Speaking to someone at the practice",
      keywords: ["speak to someone", "talk to someone", "speak to a person", "real person", "human", "speak to an accountant", "talk to an accountant", "speak to the team", "member of the team", "speak to an adviser", "someone call me"],
      answer: "Of course. You can call us on {phone}, message us on WhatsApp, or email {email}. If you would rather we contacted you, I can take your details for a call back.",
      offer: "callback",
      chips: ["Request a call back", "Send an enquiry"] },

    { id: "privacy", title: "Privacy and your information",
      keywords: ["privacy", "data protection", "gdpr", "personal information", "personal data", "my data", "confidential", "confidentiality", "secure", "security", "cookies", "is this chat saved", "do you store"],
      answer: "We use the details you give us only to reply to your enquiry and to provide the services you ask for, and we never sell personal information. What you type in this chat stays in your own browser: it is not sent to us or stored by the website, and it clears when you close this tab. If you use the microphone, your browser's own speech service turns your voice into text.",
      link: { text: "Read the privacy notice", to: "privacy" } },

    /* ===== Dates ===== */
    { id: "deadlines", source: { text: "GOV.UK, Self Assessment tax returns: deadlines", href: "https://www.gov.uk/self-assessment-tax-returns/deadlines", checked: "November 2026" }, title: "Key tax deadlines", facet: "deadlines", general: true,
      keywords: ["deadline", "deadlines", "key dates", "key tax deadlines", "tax deadlines", "tax dates", "due dates", "important dates", "tax calendar", "filing dates"],
      answer: "These are the general dates.\n\nSelf Assessment: the online return and payment are due by 31 January.\n\nLimited companies: accounts are due 9 months after the year end, Corporation Tax 9 months and 1 day after the accounting period ends, and the Company Tax Return 12 months after it ends.\n\nVAT: the return and payment are due 1 month and 7 days after the VAT period ends.\n\nPayroll: PAYE is due by the 22nd when paid electronically.\n\nSome businesses have different dates. The key dates bar at the foot of the website shows what is due next.",
      chips: ["Self Assessment tax returns", "Making Tax Digital", "Limited companies"] },

    /* ===== Things the assistant must hand to a person ===== */
    { id: "complaints", title: "Making a complaint", handoff: true,
      keywords: ["complaint", "complaints", "complain", "make a complaint", "complaints procedure", "unhappy with your service", "dissatisfied", "not happy with"],
      answer: "If you are dissatisfied with any aspect of our service, please tell us first so that we can look into the matter and put it right. You can email accrionaccountants@yahoo.com or telephone {phone}.\n\nIf we are unable to resolve your complaint and it concerns the conduct of our AAT Licensed Accountant, you may raise it with AAT's Professional Standards team.",
      link: { text: "See our complaints information", to: "complaints" } },

    { id: "hmrc-problem", title: "Letters and penalties from HMRC", handoff: true,
      keywords: ["penalty", "penalties", "fined", "hmrc fine", "hmrc letter", "letter from hmrc", "investigation", "tax investigation", "compliance check", "appeal", "late filing", "filed late", "late return", "late payment", "missed the deadline", "missed deadline", "miss the deadline", "miss a deadline", "missing the deadline", "overdue", "tax debt", "owe hmrc", "behind with", "arrears", "tax bill"],
      answer: "A letter, penalty or enquiry from HMRC needs looking at individually, so I cannot give you an answer on it here. Please send us the details, or ask for a call back, and a member of the practice will come back to you.",
      offer: "callback",
      chips: ["Request a call back", "Send an enquiry"] },

    { id: "not-offered", title: "Audit and investment advice", handoff: true,
      keywords: ["audit", "audits", "auditing", "statutory audit", "auditor", "investment advice", "investments", "where to invest", "financial advice", "financial adviser", "pension advice", "mortgage advice"],
      answer: "No. We do not carry out statutory audits or give investment advice. For the accounting, tax and payroll work we do offer, I can tell you more or pass an enquiry to the practice.",
      chips: ["What services do you offer?", "Send an enquiry"] },

    { id: "not-listed", title: "Something not covered on the website", handoff: true,
      keywords: ["capital gains", "capital gains tax", "cgt", "inheritance tax", "iht", "research and development", "ir35", "tax planning", "family trust", "trust fund", "set up a trust", "probate", "close my company", "close a company", "closing my company", "company closed", "dissolve", "strike off", "dormant company", "insolvency", "liquidation", "business plan", "business loan", "funding", "grant", "crypto", "cryptocurrency", "mortgage", "reference letter", "accountants reference", "charity accounts", "tax credits", "universal credit", "stamp duty"],
      answer: "That is not covered on our website, so I cannot tell you whether we handle it. We can give you a direct answer.\n\nWould you like to send us your question?",
      offer: "general",
      chips: ["Send an enquiry", "What services do you offer?"] },

    { id: "assistant", title: "This assistant",
      keywords: ["are you a robot", "robot", "bot", "chatbot", "are you real", "are you human", "are you ai", "artificial intelligence", "who am i talking to", "virtual assistant", "what can you do", "what can i ask", "help"],
      answer: "I am an automated assistant for Accrion Accountants. I answer from the information on this website, so I can explain our services, the key deadlines and how to get started. I cannot give advice on your own tax affairs, but I can put you in touch with the practice for that.",
      chips: ["What services do you offer?", "Key tax deadlines", "Speak to someone"] }
  ]
};
