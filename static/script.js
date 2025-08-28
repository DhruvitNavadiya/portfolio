/* =========================================================
   Dhruvit Portfolio – Hardened Navbar & Smooth Scroll
   ========================================================= */

   const $ = (s, r=document)=>r.querySelector(s);
   const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));
   const root = document.documentElement;
   
   /* Year */
   const yearEl = $('#year');
   if (yearEl) yearEl.textContent = new Date().getFullYear();
   
   /* Fixed-nav height var */
   function setNavHeightVar() {
     const mobileBar = $('#mobile-nav');
     const desktopBar = document.querySelector('nav.fixed');
     const visible = (window.innerWidth < 768 ? mobileBar : desktopBar) || desktopBar || mobileBar;
     const h = visible ? visible.offsetHeight : 64;
     root.style.setProperty('--nav-h', `${h}px`);
   }
   window.addEventListener('load', setNavHeightVar);
   window.addEventListener('resize', setNavHeightVar);
   setNavHeightVar(); // ✅ set immediately so first click has correct offset
   
   /* Mobile menu */
   // --- Mobile menu (no other changes) ---
   const mobileMenuBtn = document.getElementById('mobile-menu-btn');
   const mobileMenu    = document.getElementById('mobile-menu');
   
   function setBurger(open) {
     if (!mobileMenuBtn) return;
     mobileMenuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
     const icon = mobileMenuBtn.querySelector('i');
     if (icon) icon.className = open ? 'fas fa-times text-xl' : 'fas fa-bars text-xl';
   }
   
   // Works whether Tailwind's `hidden` is present or not
   function isHidden(el) {
     if (!el) return true;
     return el.classList.contains('hidden') || getComputedStyle(el).display === 'none';
   }
   function show(el) {
     el.classList.remove('hidden');        // if present
     el.style.display = 'block';           // if not using Tailwind hidden
     document.body.classList.add('body-lock');
     setBurger(true);
   }
   function hide(el) {
     el.classList.add('hidden');           // if using Tailwind hidden
     el.style.display = 'none';            // if not
     document.body.classList.remove('body-lock');
     setBurger(false);
   }
   
   /* ✅ Define open/close wrappers that also sync your CSS state classes */
   function openMenu() {
     if (!mobileMenu) return;
     show(mobileMenu);
     mobileMenu.classList.add('active','open');   // match your CSS show-state
     // Inline fallback to guarantee visibility across devices
     mobileMenu.style.display = 'block';
     mobileMenu.style.opacity = '1';
     mobileMenu.style.transform = 'translateY(0)';
     mobileMenu.style.pointerEvents = 'auto';
     mobileMenu.style.visibility = 'visible';
   }  
   function closeMenu() {
     if (!mobileMenu) return;
     mobileMenu.classList.remove('active','open');
     hide(mobileMenu);
     // Reset inline overrides
     mobileMenu.style.opacity = '';
     mobileMenu.style.transform = '';
     mobileMenu.style.pointerEvents = '';
     mobileMenu.style.visibility = '';
     // display is handled by hide()
   }
   
   if (mobileMenuBtn && mobileMenu) {
     mobileMenuBtn.addEventListener('click', (e) => {
       e.preventDefault();
       isHidden(mobileMenu) ? openMenu() : closeMenu();
     });
   
     // Close after tapping any link in the menu
     mobileMenu.querySelectorAll('a').forEach(a =>
       a.addEventListener('click', () => closeMenu())
     );
   
     // Close on Escape
     document.addEventListener('keydown', (e) => {
       if (e.key === 'Escape' && !isHidden(mobileMenu)) closeMenu();
     });
   }
   
   
   /* Robust smooth scroll:
      - same origin
      - has hash
      - target exists in THIS document (no strict pathname checks)
   */
   function findTargetFromHash(hash) {
     if (!hash) return null;
     const clean = hash.startsWith('/#') ? hash.slice(1) : hash; // support "/#id"
     try { return document.querySelector(clean); } catch { return null; }
   }
   
   function shouldIntercept(a) {
     // Only same-origin links with a hash we can resolve in this document
     let u;
     try { u = new URL(a.getAttribute('href'), location.href); } catch { return false; }
     if (!u.hash || u.origin !== location.origin) return false;
     return !!findTargetFromHash(u.hash);
   }
   
   $$('a[href*="#"]').forEach(a => {
     a.addEventListener('click', (e) => {
       if (!shouldIntercept(a)) return;       // let browser navigate (e.g., /resume#foo)
       const u = new URL(a.getAttribute('href'), location.href);
       const target = findTargetFromHash(u.hash);
       if (!target) return;
   
       e.preventDefault();
       // Use scrollIntoView so CSS scroll-margin-top handles the offset
       try {
         target.scrollIntoView({ behavior: 'smooth', block: 'start' });
       } catch {
         const navOffset = parseFloat(getComputedStyle(root).getPropertyValue('--nav-h')) || (window.innerWidth >= 768 ? 80 : 70);
         const top = target.getBoundingClientRect().top + window.pageYOffset - navOffset;
         window.scrollTo({ top, behavior: 'smooth' });
       }
   
       // Close mobile panel if open
       if (mobileMenu && (mobileMenu.classList.contains('active') || mobileMenu.classList.contains('open'))) closeMenu();
     });
   });
   
   /* Active link highlight */
   (() => {
     const sections = $$('section[id]');
     const links = $$('nav a[href^="#"], nav a[href^="/#"], nav a[href^="./#"]');
     if (!sections.length || !links.length) return;
   
     let ticking = false;
     function onScroll() {
       if (ticking) return;
       ticking = true;
       requestAnimationFrame(() => {
         const navOffset = (parseFloat(getComputedStyle(root).getPropertyValue('--nav-h')) || 72) + 8;
         const pos = window.scrollY + navOffset;
         let current = '';
         for (const sec of sections) {
           if (pos >= sec.offsetTop && pos < sec.offsetTop + sec.offsetHeight) { current = sec.id; break; }
         }
         links.forEach(link => {
           const href = link.getAttribute('href') || '';
           const id = href.replace(/^(\/|\.\/)?#/, '');
           const active = id && current && (id === current);
           link.classList.toggle('text-teal-300', active);
           link.classList.toggle('text-gray-300', !active);
         });
         ticking = false;
       });
     }
     window.addEventListener('scroll', onScroll, { passive: true });
     window.addEventListener('load', onScroll);
   })();
   
   /* Back to top */
   const btt = $('#back-to-top');
   if (btt) {
     window.addEventListener('scroll', () => {
       (window.scrollY > 600) ? btt.classList.add('visible') : btt.classList.remove('visible');
     }, { passive: true });
     btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
   }
   
   /* Fade-in on scroll */
   const io = new IntersectionObserver(entries => {
     entries.forEach(e => {
       if (e.isIntersecting) {
         e.target.style.opacity = 1;
         e.target.style.transform = 'none';
         io.unobserve(e.target);
       }
     });
   }, { threshold: .12, rootMargin: '0px 0px -60px 0px' });
   
   $$('.fade-in-up').forEach(el => {
     el.style.opacity = 0.001;
     el.style.transform = 'translateY(12px)';
     io.observe(el);
   });
   
   /* Chatbot (unchanged) */
   const chatbotToggle = $('#chatbot-toggle');
   const chatbotWindow = $('#chatbot-window');
   const closeChatbot   = $('#close-chatbot');
   const chatbotInput   = $('#chatbot-input');
   const sendMessageBtn = $('#send-message');
   const chatbotMessages= $('#chatbot-messages');
   
   function addMsg(text, user=false) {
     if (!chatbotMessages) return;
     const div = document.createElement('div');
     div.className = 'message ' + (user ? 'user' : 'bot');
     div.textContent = text;
     chatbotMessages.appendChild(div);
     chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
     return div;
   }
   async function askLLM(question){
     try {
       const res = await fetch('/ask-stream', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ question }) });
       if (!res.ok || !res.body) throw new Error(`${res.status} ${res.statusText}`);
       const botDiv = addMsg(''); if (!botDiv) return;
       botDiv.classList.add('typing');
       const reader = res.body.getReader();
       const decoder = new TextDecoder();
       let buf = '';
       while (true) {
         const { value, done } = await reader.read();
         if (done) break;
         buf += decoder.decode(value, { stream:true });
         let idx;
         while ((idx = buf.indexOf('\n')) >= 0) {
           const line = buf.slice(0, idx).trim();
           buf = buf.slice(idx + 1);
           if (!line) continue;
           try {
             const obj = JSON.parse(line);
             if (obj.chunk) { botDiv.classList.remove('typing'); botDiv.textContent += obj.chunk; chatbotMessages.scrollTop = chatbotMessages.scrollHeight; }
             else if (obj.error) { botDiv.classList.remove('typing'); botDiv.textContent = `⚠️ ${obj.error}`; }
           } catch {}
         }
       }
     } catch (err) { addMsg(`⚠️ Chatbot unavailable. ${err.message}`); }
   }
   function sendChat(){
     if (!chatbotInput || !sendMessageBtn) return;
     const msg = chatbotInput.value.trim();
     if (!msg) return;
     addMsg(msg, true);
     chatbotInput.value = '';
     sendMessageBtn.disabled = true;
     askLLM(msg).finally(() => { sendMessageBtn.disabled = false; });
   }
   if (chatbotToggle && chatbotWindow) chatbotToggle.addEventListener('click', () => chatbotWindow.classList.add('active'));
   if (closeChatbot && chatbotWindow)   closeChatbot.addEventListener('click', () => chatbotWindow.classList.remove('active'));
   if (sendMessageBtn) sendMessageBtn.addEventListener('click', sendChat);
   if (chatbotInput)   chatbotInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(); });
   
   /* Hero subtitle role rotator (typewriter) */
   (() => {
     const subtitleEl = document.getElementById('hero-subtitle');
     if (!subtitleEl) return;
   
     const roles = [
       'Fastapi and AI application developer',
       'Python Engineer',
       'Machine Learning and Data Science'
     ];
   
     let roleIndex = 0;
     let charIndex = 0;
     let deleting = false;
   
     const TYPE_DELAY = 55;     // ms per character when typing
     const DELETE_DELAY = 35;   // ms per character when deleting
     const HOLD_AFTER_TYPE = 1200; // pause after completing a word
     const HOLD_AFTER_DELETE = 400; // pause before typing next word
   
     function tick() {
       const full = roles[roleIndex];
   
       if (!deleting) {
         // typing
         charIndex = Math.min(charIndex + 1, full.length);
         subtitleEl.textContent = full.slice(0, charIndex);
         if (charIndex === full.length) {
           setTimeout(() => { deleting = true; tick(); }, HOLD_AFTER_TYPE);
           return;
         }
         setTimeout(tick, TYPE_DELAY);
       } else {
         // deleting
         charIndex = Math.max(charIndex - 1, 0);
         subtitleEl.textContent = full.slice(0, charIndex);
         if (charIndex === 0) {
           deleting = false;
           roleIndex = (roleIndex + 1) % roles.length;
           setTimeout(tick, HOLD_AFTER_DELETE);
           return;
         }
         setTimeout(tick, DELETE_DELAY);
       }
     }
   
     // Kick off after load so fonts are ready
     window.addEventListener('load', () => {
       // Ensure we start from empty so the effect is visible on first cycle
       subtitleEl.textContent = '';
       tick();
     });
   })();
   
   /* Contact form submission */
/* ==========================
   Contact form submission
   ========================== */
   const contactForm   = document.getElementById("contact-form");
   const contactStatus = document.getElementById("contact-status");
   
   if (contactForm && contactStatus) {
     contactForm.addEventListener("submit", async (e) => {
       e.preventDefault();
   
       contactStatus.textContent = "⏳ Sending...";
       contactStatus.classList.remove("text-red-400","text-emerald-400");
       contactStatus.classList.add("text-gray-400");
   
       const fd = new FormData(contactForm);
       const payload = {
         name:    fd.get("name")?.toString().trim(),
         email:   fd.get("email")?.toString().trim(),
         subject: fd.get("subject")?.toString().trim() || "",
         message: fd.get("message")?.toString().trim(),
       };
   
       // Frontend guards (mirror backend)
       if (!payload.name || !payload.email || !payload.message) {
         contactStatus.textContent = "⚠️ Name, email and message are required.";
         contactStatus.classList.replace("text-gray-400","text-red-400");
         return;
       }
       if (payload.message.length > 500) {
         contactStatus.textContent = "⚠️ Message too long. Max 500 characters.";
         contactStatus.classList.replace("text-gray-400","text-red-400");
         return;
       }
   
       try {
         const res  = await fetch("/contact", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify(payload),
         });
         const data = await res.json().catch(() => ({}));
   
         if (res.ok && !data.error) {
           contactStatus.textContent = "✅ Message sent successfully!";
           contactStatus.classList.replace("text-gray-400","text-emerald-400");
           contactForm.reset();
         } else {
           contactStatus.textContent = `⚠️ ${data.error || `Failed (${res.status})`}`;
           contactStatus.classList.replace("text-gray-400","text-red-400");
         }
       } catch (err) {
         contactStatus.textContent = `⚠️ Network error: ${err.message}`;
         contactStatus.classList.replace("text-gray-400","text-red-400");
       }
     });
   }
   
