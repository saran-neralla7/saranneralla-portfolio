/* ==========================================================================
   Saran Neralla Portfolio JavaScript
   Handles theme toggle, typing animations, mobile nav, skills tabs,
   project filtering, AJAX form submission, and scroll animation fallbacks.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================
       1. Dark/Light Theme Switcher
       ========================================== */
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const htmlElement = document.documentElement;

    // Check for saved theme preference, otherwise default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });


    /* ==========================================
       2. Mobile Navigation Menu Toggle
       ========================================== */
    const mobileNavToggleBtn = document.getElementById('mobile-nav-toggle-btn');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    const toggleMenu = () => {
        const isExpanded = mobileNavToggleBtn.getAttribute('aria-expanded') === 'true';
        mobileNavToggleBtn.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');
    };

    mobileNavToggleBtn.addEventListener('click', toggleMenu);

    // Close menu when clicking link, update active link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNavToggleBtn.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('active');
        });
    });

    // Update active class on scroll
    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });


    /* ==========================================
       3. Typewriting Animation (Hero)
       ========================================== */
    const typingTextEl = document.getElementById('typing-text');
    const words = ['Software Architect', 'Edu-Tech Builder', 'Problem Solver'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    const typeAnimation = () => {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            typingTextEl.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50; // Deletes faster
        } else {
            typingTextEl.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 120; // Normal typing speed
        }

        // Typing finished a word
        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            typingSpeed = 1500; // Pause before deleting
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typingSpeed = 500; // Pause before next word
        }

        setTimeout(typeAnimation, typingSpeed);
    };

    if (typingTextEl) {
        setTimeout(typeAnimation, 1000);
    }


    /* ==========================================
       4. Expandable Tech Stack Cards Toggle
       ========================================== */
    const expandButtons = document.querySelectorAll('.expand-btn');

    expandButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.tech-card');
            const expandableWrapper = card.querySelector('.tech-chips-expandable');
            const btnText = btn.querySelector('.btn-text');
            const isExpanded = btn.getAttribute('aria-expanded') === 'true';

            // Toggle active state attributes
            btn.setAttribute('aria-expanded', !isExpanded);
            btn.classList.toggle('active');
            expandableWrapper.classList.toggle('expanded');

            // Update text matching state
            if (isExpanded) {
                btnText.textContent = 'Show More';
            } else {
                btnText.textContent = 'Show Less';
            }
        });
    });


    /* ==========================================
       5. Projects Filtering Logic
       ========================================== */
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state of filter buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                // Animate fade-out first
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';
                
                setTimeout(() => {
                    if (filterValue === 'all' || category === filterValue) {
                        card.classList.remove('filtered-out');
                        // Trigger reflow to restart transition
                        void card.offsetWidth;
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    } else {
                        card.classList.add('filtered-out');
                    }
                }, 300);
            });
        });
    });


    /* ==========================================
       6. Scroll-Driven Fallbacks (Firefox & Older)
       ========================================== */

    // Fallback 1: Shrinking Header
    const shrinkingHeaderSupport = CSS.supports('(animation-timeline: scroll()) and (animation-range: 0% 100%)');
    if (!shrinkingHeaderSupport) {
        const header = document.getElementById('main-header');
        
        const handleScrollHeader = () => {
            if (window.scrollY > 60) {
                header.classList.add('header-shrunk');
            } else {
                header.classList.remove('header-shrunk');
            }
        };

        window.addEventListener('scroll', handleScrollHeader);
        handleScrollHeader(); // Initial call
    }

    // Fallback 2: Section Scroll Reveal
    const scrollRevealSupport = CSS.supports('(animation-timeline: view()) and (animation-range: entry)');
    if (!scrollRevealSupport) {
        const revealElements = document.querySelectorAll('.scroll-reveal');
        
        // Hide elements initially
        revealElements.forEach(el => el.classList.add('scroll-reveal-hidden'));

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('scroll-reveal-active');
                    // Stop observing once animated in
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealElements.forEach(el => revealObserver.observe(el));
    }


    /* ==========================================
       7. Contact Form AJAX Submission (Web3Forms)
       ========================================== */
    const contactForm = document.getElementById('contact-form');
    const toastResponse = document.getElementById('form-response-toast');
    const responseIcon = toastResponse?.querySelector('.response-icon');
    const responseText = toastResponse?.querySelector('.response-text');
    const submitBtn = document.getElementById('btn-contact-submit');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Check if default access key is still present
            const accessKeyEl = contactForm.querySelector('input[name="access_key"]');
            if (accessKeyEl && accessKeyEl.value === 'YOUR_ACCESS_KEY_HERE') {
                showToast(
                    'warning', 
                    'Form configured successfully! Please configure your Web3Forms access_key in index.html to receive actual messages.'
                );
                return;
            }

            // Disable submit button & show loading state
            const originalBtnContent = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <span>Sending...</span>
                <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M6.34 17.66l2.83-2.83M17.66 6.34l2.83-2.83"></path>
                </svg>
            `;

            // CSS animation style for loading spinner
            const style = document.createElement('style');
            style.innerHTML = '@keyframes spin { 100% { transform: rotate(360deg); } }';
            document.head.appendChild(style);

            const formData = new FormData(contactForm);
            const jsonObject = Object.fromEntries(formData);
            const jsonBody = JSON.stringify(jsonObject);

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: jsonBody
                });

                const result = await response.json();

                if (response.status === 200) {
                    showToast('success', 'Message sent successfully! I will get back to you soon.');
                    contactForm.reset();
                } else {
                    console.error('Web3Forms Error:', result);
                    showToast('error', result.message || 'Something went wrong. Please try again later.');
                }
            } catch (err) {
                console.error('Network Error:', err);
                showToast('error', 'Network error. Please check your internet connection and try again.');
            } finally {
                // Restore button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;
            }
        });
    }

    const showToast = (type, message) => {
        if (!toastResponse || !responseIcon || !responseText) return;

        // Reset classes
        toastResponse.className = 'form-response';
        toastResponse.classList.add(type);
        
        // Set content and icon
        responseText.textContent = message;
        
        if (type === 'success') {
            responseIcon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            `;
        } else if (type === 'warning') {
            responseIcon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
            `;
        } else {
            responseIcon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
            `;
        }

        // Show Toast
        toastResponse.style.display = 'flex';

        // Auto hide warning/success toasts after 7 seconds, keep error toast for visibility
        if (type !== 'error') {
            setTimeout(() => {
                toastResponse.style.display = 'none';
            }, 7000);
        }
    };

    /* ==========================================
       8. Automation Playground Terminal Engine
       ========================================== */
    const terminalClearBtn = document.getElementById('terminal-clear-btn');
    const terminalDisplayBody = document.getElementById('terminal-display-body');
    const terminalActiveCommand = document.getElementById('terminal-active-command');
    const scriptOptionItems = document.querySelectorAll('.script-option-item');
    const runButtons = document.querySelectorAll('.btn-execute-script');
    
    let isScriptRunning = false;
    
    // Log outputs library for the script simulations
    const scriptLogs = {
        dbSync: [
            { type: 'system', text: '[SYSTEM] Spawning V8 script subprocess...' },
            { type: 'info', text: '[dbSync.js] Fetching active student records from PostgreSQL...' },
            { type: 'info', text: '[dbSync.js] Found 14 un-synchronized registration updates.' },
            { type: 'info', text: '[dbSync.js] Handshaking with Google Sheets API v4...' },
            { type: 'success', text: '[dbSync.js] Connected to Spreadsheet ID: 17xSraNe...' },
            { type: 'info', text: '[dbSync.js] Batch updating rows 240-254...' },
            { type: 'success', text: '[dbSync.js] Rows synchronised. Status code: 200 (OK).' },
            { type: 'info', text: '[dbSync.js] Truncating local migration caches...' },
            { type: 'success', text: '[SYSTEM] Script dbSync.js executed successfully (Exit Code: 0)' }
        ],
        pdfEngine: [
            { type: 'system', text: '[SYSTEM] Initializing Apps Script PDF Engine...' },
            { type: 'info', text: '[pdfEngine.gs] Reading grade sheet arrays...' },
            { type: 'info', text: '[pdfEngine.gs] Calculating statistical distributions and CGP averages...' },
            { type: 'info', text: '[pdfEngine.gs] Building HTML report template cache...' },
            { type: 'info', text: '[pdfEngine.gs] Compiling Blob payload using DocumentApp / DriveApp...' },
            { type: 'success', text: '[pdfEngine.gs] PDF generated successfully: saran_report_2026.pdf' },
            { type: 'info', text: '[pdfEngine.gs] Uploading file to Google Drive directory...' },
            { type: 'success', text: '[pdfEngine.gs] File linked. Shareable URL: https://drive.google.com/...' },
            { type: 'success', text: '[SYSTEM] Script pdfEngine.gs executed successfully (Exit Code: 0)' }
        ],
        notifier: [
            { type: 'system', text: '[SYSTEM] Spawning Alert Hook Listener...' },
            { type: 'info', text: '[alertSystem.gs] Hooking into API Gateway listener port 443...' },
            { type: 'info', text: '[alertSystem.gs] Received HTTP webhook callback (Event: ElectiveAllocation)...' },
            { type: 'info', text: '[alertSystem.gs] Formatting JSON alert payload...' },
            { type: 'info', text: '[alertSystem.gs] Pushing message payload via UrlFetchApp...' },
            { type: 'success', text: '[alertSystem.gs] Message dispatched to Telegram Bot API.' },
            { type: 'success', text: '[alertSystem.gs] Telegram notification broadcasted to channel.' },
            { type: 'success', text: '[SYSTEM] Script alertSystem.gs executed successfully (Exit Code: 0)' }
        ]
    };

    // Helper: Delay function
    const delay = ms => new Promise(res => setTimeout(res, ms));

    // Clear Terminal Console
    if (terminalClearBtn) {
        terminalClearBtn.addEventListener('click', () => {
            if (isScriptRunning) return;
            // Clear all lines except prompt
            const lines = terminalDisplayBody.querySelectorAll('.terminal-log-line');
            lines.forEach(l => l.remove());
            terminalActiveCommand.textContent = '';
        });
    }

    // Handle Script Selection
    scriptOptionItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (isScriptRunning) return;
            if (e.target.closest('.btn-execute-script')) return; // handled by button trigger
            
            scriptOptionItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Execute scripts
    runButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            if (isScriptRunning) return;
            isScriptRunning = true;
            
            const item = btn.closest('.script-option-item');
            const scriptName = item.getAttribute('data-script');
            const fileName = item.querySelector('.script-file').textContent.trim();
            const logs = scriptLogs[scriptName] || [];

            // Set active script tab visually
            scriptOptionItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Disable all execution buttons
            runButtons.forEach(b => b.disabled = true);
            btn.classList.add('executing');

            // Clear active command line first
            terminalActiveCommand.textContent = '';
            
            // Append terminal command execution prompt
            await typeCommand(`node ${fileName}`);
            await delay(400);

            // Hide the active terminal cursor during printing of log lines
            const cursor = terminalDisplayBody.querySelector('.terminal-cursor');
            if (cursor) cursor.style.display = 'none';

            // Print script logs line by line
            for (const log of logs) {
                appendLogLine(log.text, log.type);
                // Random delay to simulate CPU/Network overhead
                await delay(200 + Math.random() * 400);
            }

            // Restore prompt line
            if (cursor) cursor.style.display = 'inline-block';
            terminalActiveCommand.textContent = '';
            
            // Re-enable execution buttons
            runButtons.forEach(b => b.disabled = false);
            btn.classList.remove('executing');
            isScriptRunning = false;
        });
    });

    const typeCommand = (text) => {
        return new Promise(resolve => {
            let index = 0;
            const typingInterval = setInterval(() => {
                terminalActiveCommand.textContent += text[index];
                index++;
                if (index >= text.length) {
                    clearInterval(typingInterval);
                    resolve();
                }
            }, 60);
        });
    };

    const appendLogLine = (text, type = '') => {
        const line = document.createElement('div');
        line.className = `terminal-log-line ${type ? 'output-' + type : ''}`;
        
        // Add timestamp
        const now = new Date();
        const timeStr = `[${now.toTimeString().split(' ')[0]}]`;
        line.textContent = `${timeStr} ${text}`;
        
        // Insert before prompt line
        const promptLine = terminalDisplayBody.querySelector('.terminal-prompt-line');
        terminalDisplayBody.insertBefore(line, promptLine);
        
        // Scroll terminal to bottom
        terminalDisplayBody.scrollTop = terminalDisplayBody.scrollHeight;
    };


    /* ==========================================
       9. Slide-Over Project Specification Drawer
       ========================================== */
    const specDrawer = document.getElementById('spec-drawer');
    const drawerBackdrop = document.getElementById('drawer-backdrop');
    const drawerCloseBtn = document.getElementById('drawer-close-btn');
    const drawerContentBody = document.getElementById('drawer-content-body');
    const solutionCards = document.querySelectorAll('.solution-card');

    // Rich database details for each solution card (mapped by index/code SOL_01 to SOL_13)
    const projectSpecs = {
        SOL_01: {
            title: "College ERP",
            tagline: "Enterprise Grade Academic & Billing Operations Ledger",
            desc: "Designed to fully automate administrative records and ledger balances for educational institutions. Eliminates manual fee tracking logs, coordinates department library allocations, and synchronizes real-time billing states across administrative portals.",
            tech: ["React.js", "Express.js", "Node.js", "PostgreSQL", "Prisma ORM", "Tailwind CSS"],
            metrics: [
                { val: "18ms", label: "Ledger Query Latency" },
                { val: "3NF / BCNF", label: "DB Normalization" }
            ],
            filename: "erp_ledger.prisma",
            lang: "prisma",
            code: `model Student {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  balance   Decimal  @default(0.00)
  ledgers   Ledger[]
  createdAt DateTime @default(now())
}

model Ledger {
  id         String   @id @default(uuid())
  studentId  String
  amount     Decimal
  type       String   // "DEBIT", "CREDIT"
  student    Student  @relation(fields: [studentId], references: [id])
  createdAt  DateTime @default(now())
}`
        },
        SOL_02: {
            title: "NBA OBE Attainment",
            tagline: "Outcome-Based Education Goal Assessment Engine",
            desc: "Calculates course outcome (CO) and program outcome (PO) mapping statistics based on accreditation requirements. Automates calculations for student attainment sheets, saving weeks of manual report preparation.",
            tech: ["Next.js", "TypeScript", "Tailwind CSS", "Prisma", "Chart.js"],
            metrics: [
                { val: "< 1s", label: "Report Compile Speed" },
                { val: "100%", label: "CO-PO Accuracy" }
            ],
            filename: "attainment_calculator.ts",
            lang: "typescript",
            code: `export interface COAttainment {
  coCode: string;
  targetWeight: number;
  averageScore: number;
  attainmentPercentage: number;
}

export function computePOAttainment(coScores: COAttainment[], poWeightMatrix: number[][]): number[] {
  // Multiply score matrices by weights to map Course Outcomes to Program Outcomes
  return poWeightMatrix.map(row => {
    const totalWeightedScore = row.reduce((sum, weight, idx) => {
      return sum + (weight * coScores[idx].attainmentPercentage);
    }, 0);
    return Math.round((totalWeightedScore / row.length) * 100) / 100;
  });
}`
        },
        SOL_03: {
            title: "Examination Management",
            tagline: "High-Security Hall Ticket & Transcript Generator",
            desc: "A secure records portal managing registration matrices, hall-ticket schedules, internal assessment grades, final marks transcripts, and room allocation grids.",
            tech: ["React.js", "Node.js", "PostgreSQL", "JWT Authorization", "Bcrypt"],
            metrics: [
                { val: "Secured", label: "JWT Auth Layer" },
                { val: "500+", label: "Seats Scheduled/Sec" }
            ],
            filename: "exam_allocator.sql",
            lang: "sql",
            code: `-- Seat Allocation Query
SELECT 
    s.student_id, 
    s.name, 
    c.course_code,
    room.room_number,
    seat.seat_index
FROM students s
JOIN enrollments e ON e.student_id = s.student_id
JOIN courses c ON c.course_id = e.course_id
JOIN rooms room ON room.exam_id = e.exam_id
JOIN seats seat ON seat.room_id = room.id
WHERE seat.is_available = TRUE 
ORDER BY s.student_id ASC;`
        },
        SOL_04: {
            title: "Open Elective Selection",
            tagline: "Conflict-Free Student Preference Sorting Algorithm",
            desc: "Distributes students to open elective courses across departments according to academic cumulative GPA scores, course vacancy limitations, and student selection rankings.",
            tech: ["Next.js", "TypeScript", "Google Apps Script", "Supabase", "Tailwind CSS"],
            metrics: [
                { val: "98.5%", label: "First-Preference Rates" },
                { val: "3.5s", label: "Allocation Duration" }
            ],
            filename: "elective_allocation.ts",
            lang: "typescript",
            code: `export interface Student {
  id: string;
  cgpa: number;
  choices: string[]; // Preferred course IDs
}

export function runOpenElectiveSort(students: Student[], capacities: Record<string, number>) {
  // Sort students by CGPA descending to allocate by merit
  const sortedStudents = [...students].sort((a, b) => b.cgpa - a.cgpa);
  const courseAllocations: Record<string, string[]> = {};
  
  for (const student of sortedStudents) {
    for (const choice of student.choices) {
      const currentAllocated = courseAllocations[choice]?.length || 0;
      if (currentAllocated < capacities[choice]) {
        if (!courseAllocations[choice]) courseAllocations[choice] = [];
        courseAllocations[choice].push(student.id);
        break; // allocated to best possible vacancy
      }
    }
  }
  return courseAllocations;
}`
        },
        SOL_05: {
            title: "Student Management System",
            tagline: "High-Throughput Academic Registry & Profile Portal",
            desc: "Consolidated academic profiling dashboard tracking individual registrations, exam reports, attendance metrics, and profile details with role-based access control.",
            tech: ["React.js", "Express.js", "Node.js", "JWT Authentication", "PostgreSQL"],
            metrics: [
                { val: "5,000+", label: "Active Profiles" },
                { val: "Role-Based", label: "Security Layer" }
            ],
            filename: "auth_middleware.js",
            lang: "javascript",
            code: `const jwt = require('jsonwebtoken');

function authorizeRoles(allowedRoles = []) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access Denied' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Permission Insufficient' });
      }
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(400).json({ error: 'Invalid Token' });
    }
  };
}`
        },
        SOL_06: {
            title: "Result Analysis",
            tagline: "Statistical Performance Evaluator & Chart Compiler",
            desc: "Aggregates exam outputs to output statistical histograms, pass/fail averages, section compare metrics, and automatic grade report PDFs.",
            tech: ["Next.js", "Chart.js", "Google Sheets API", "TypeScript", "PDF-Lib"],
            metrics: [
                { val: "120 rec/s", label: "Processing Speed" },
                { val: "Instant", label: "PDF Document Render" }
            ],
            filename: "result_chart.js",
            lang: "javascript",
            code: `import { Chart } from 'chart.js/auto';

export function renderPassFailDistribution(canvasEl, passCount, failCount) {
  return new Chart(canvasEl, {
    type: 'doughnut',
    data: {
      labels: ['Pass', 'Fail'],
      datasets: [{
        data: [passCount, failCount],
        backgroundColor: ['#10b981', '#ef4444'],
        borderWidth: 1,
        borderColor: 'var(--border-color)'
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });
}`
        },
        SOL_07: {
            title: "Lab Inventory Management",
            tagline: "Real-time Equipment Resource Register",
            desc: "Automated inventory register tracking lab components, equipment check-out logs, return deadlines, and warning emails when items go out of stock.",
            tech: ["Google Apps Script", "Google Sheets API", "HTML5", "Email Alert Webhooks"],
            metrics: [
                { val: "800+", label: "Tracked Devices" },
                { val: "< 2 mins", label: "Webhook Alert Latency" }
            ],
            filename: "inventory_triggers.gs",
            lang: "javascript",
            code: `function checkInventoryLevels() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Inventory");
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    const itemName = data[i][0];
    const currentStock = data[i][2];
    const minimumRequired = data[i][3];
    
    if (currentStock < minimumRequired) {
      sendLowStockNotification(itemName, currentStock);
    }
  }
}

function sendLowStockNotification(item, stock) {
  MailApp.sendEmail({
    to: "admin@college-labs.edu",
    subject: \`[ALERT] Low Stock: \${item}\`,
    body: \`Attention: The inventory for "\${item}" is down to \${stock} units. Re-order is recommended.\`
  });
}`
        }
    };

    // Open Drawer
    solutionCards.forEach(card => {
        card.addEventListener('click', () => {
            const numEl = card.querySelector('.solution-num');
            if (!numEl) return;
            const solKey = numEl.textContent.replace(/[\[\]]/g, '').trim();
            const spec = projectSpecs[solKey];
            
            // Generate content
            if (spec) {
                drawerContentBody.innerHTML = `
                    <div class="drawer-section">
                        <span class="drawer-sec-title">specifications // metadata</span>
                        <h1 class="drawer-p-name">${spec.title}</h1>
                        <p class="drawer-p-tagline font-accent">${spec.tagline}</p>
                        <p class="drawer-p-desc">${spec.desc}</p>
                    </div>
                    
                    <div class="drawer-section">
                        <span class="drawer-sec-title">technical stack</span>
                        <div class="drawer-tech-grid">
                            ${spec.tech.map(t => \`<span class="drawer-tech-chip">\${t}</span>\`).join('')}
                        </div>
                    </div>
                    
                    <div class="drawer-section">
                        <span class="drawer-sec-title">system performance telemetry</span>
                        <div class="drawer-metric-grid">
                            \${spec.metrics.map(m => \`
                                <div class="drawer-metric-card">
                                    <span class="d-met-val font-accent">\${m.val}</span>
                                    <span class="d-met-label">\${m.label}</span>
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                    
                    <div class="drawer-section">
                        <span class="drawer-sec-title">source architecture snippet</span>
                        <div class="drawer-code-window">
                            <div class="code-win-header">
                                <span class="code-win-title">\${spec.filename}</span>
                                <span class="code-win-lang">\${spec.lang}</span>
                            </div>
                            <pre class="drawer-code-block"><code>\${spec.code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>
                        </div>
                    </div>
                `;
            } else {
                // Fallback for solutions cards without pre-defined spec schemas
                const title = card.querySelector('.solution-title').textContent.trim();
                const desc = card.querySelector('.solution-description').textContent.trim();
                const tags = Array.from(card.querySelectorAll('.sol-tag')).map(t => t.textContent.trim());
                
                drawerContentBody.innerHTML = `
                    <div class="drawer-section">
                        <span class="drawer-sec-title">specifications // metadata</span>
                        <h1 class="drawer-p-name">\${title}</h1>
                        <p class="drawer-p-tagline font-accent">Production Ready Core System</p>
                        <p class="drawer-p-desc">\${desc}</p>
                    </div>
                    
                    <div class="drawer-section">
                        <span class="drawer-sec-title">technical stack</span>
                        <div class="drawer-tech-grid">
                            \${tags.map(t => \`<span class="drawer-tech-chip">\${t}</span>\`).join('')}
                            <span class="drawer-tech-chip">HTML5</span>
                            <span class="drawer-tech-chip">CSS3</span>
                            <span class="drawer-tech-chip">JavaScript</span>
                        </div>
                    </div>
                    
                    <div class="drawer-section">
                        <span class="drawer-sec-title">system performance telemetry</span>
                        <div class="drawer-metric-grid">
                            <div class="drawer-metric-card">
                                <span class="d-met-val font-accent">100%</span>
                                <span class="d-met-label">COMPLETED SPEC</span>
                            </div>
                            <div class="drawer-metric-card">
                                <span class="d-met-val font-accent">STABLE</span>
                                <span class="d-met-label">BUILD STATUS</span>
                            </div>
                        </div>
                    </div>
                `;
            }

            // Open drawer
            specDrawer.classList.add('active');
            specDrawer.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden'; // prevent page scrolling background
        });
    });

    // Close Drawer
    const closeDrawer = () => {
        specDrawer.classList.remove('active');
        specDrawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
    if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

    // Escape Key to close drawer
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && specDrawer.classList.contains('active')) {
            closeDrawer();
        }
    });
});
