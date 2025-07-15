// ===== DOM要素の取得 =====
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const header = document.querySelector('.header');
const faqQuestions = document.querySelectorAll('.faq-question');
const voiceControls = document.querySelectorAll('.voice-control');
const voiceIndicators = document.querySelectorAll('.voice-indicator');
const voiceItems = document.querySelectorAll('.voice-item');

// ===== ユーティリティ関数 =====
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// ===== ナビゲーション機能 =====
class Navigation {
  constructor() {
    this.isMenuOpen = false;
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupStickyHeader();
    this.setupSmoothScroll();
    this.setupActiveNavigation();
  }

  bindEvents() {
    // ハンバーガーメニューのトグル
    navToggle?.addEventListener('click', () => this.toggleMenu());
    
    // ナビリンククリック時にメニューを閉じる（モバイル）
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          this.closeMenu();
        }
      });
    });

    // メニュー外クリックで閉じる
    document.addEventListener('click', (e) => {
      if (this.isMenuOpen && !navMenu?.contains(e.target) && !navToggle?.contains(e.target)) {
        this.closeMenu();
      }
    });

    // ESCキーでメニューを閉じる
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMenu();
      }
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    navMenu?.classList.toggle('active');
    navToggle?.setAttribute('aria-expanded', this.isMenuOpen);
    
    // ハンバーガーアイコンのアニメーション
    const lines = navToggle?.querySelectorAll('.nav-toggle-line');
    lines?.forEach((line, index) => {
      if (this.isMenuOpen) {
        if (index === 0) line.style.transform = 'rotate(45deg) translate(5px, 5px)';
        if (index === 1) line.style.opacity = '0';
        if (index === 2) line.style.transform = 'rotate(-45deg) translate(7px, -6px)';
      } else {
        line.style.transform = '';
        line.style.opacity = '';
      }
    });

    // ボディスクロールの制御
    document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
  }

  closeMenu() {
    this.isMenuOpen = false;
    navMenu?.classList.remove('active');
    navToggle?.setAttribute('aria-expanded', 'false');
    
    const lines = navToggle?.querySelectorAll('.nav-toggle-line');
    lines?.forEach(line => {
      line.style.transform = '';
      line.style.opacity = '';
    });

    document.body.style.overflow = '';
  }

  setupStickyHeader() {
    const handleScroll = throttle(() => {
      if (!header) return;
      
      const scrollY = window.scrollY;
      if (scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
      } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '';
      }
    }, 16);

    window.addEventListener('scroll', handleScroll);
  }

  setupSmoothScroll() {
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href?.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            const headerHeight = header?.offsetHeight || 0;
            const targetPosition = target.offsetTop - headerHeight - 20;
            
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }
        }
      });
    });
  }

  setupActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    
    const handleScroll = throttle(() => {
      const scrollY = window.scrollY;
      const headerHeight = header?.offsetHeight || 0;
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop - headerHeight - 50;
        const sectionBottom = sectionTop + section.offsetHeight;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        
        if (scrollY >= sectionTop && scrollY < sectionBottom) {
          navLinks.forEach(link => link.classList.remove('active'));
          navLink?.classList.add('active');
        }
      });
    }, 16);

    window.addEventListener('scroll', handleScroll);
  }
}

// ===== スクロールアニメーション =====
class ScrollAnimations {
  constructor() {
    this.observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.setupParallaxEffects();
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
        }
      });
    }, this.observerOptions);

    // AOS属性を持つ要素を監視
    document.querySelectorAll('[data-aos]').forEach(el => {
      observer.observe(el);
    });

    // カードやその他のアニメーション要素も監視
    document.querySelectorAll('.about-card, .member-card, .achievement-item, .timeline-item').forEach(el => {
      observer.observe(el);
    });
  }

  setupParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.hero-bg-image');
    
    const handleScroll = throttle(() => {
      const scrollY = window.scrollY;
      
      parallaxElements.forEach(el => {
        const speed = 0.5;
        const yPos = -(scrollY * speed);
        el.style.transform = `scale(1.1) translateY(${yPos}px)`;
      });
    }, 16);

    window.addEventListener('scroll', handleScroll);
  }
}

// ===== FAQアコーディオン =====
class FAQAccordion {
  constructor() {
    this.init();
  }

  init() {
    faqQuestions.forEach(question => {
      question.addEventListener('click', () => this.toggleQuestion(question));
      
      // キーボードサポート
      question.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleQuestion(question);
        }
      });
    });
  }

  toggleQuestion(question) {
    const isExpanded = question.getAttribute('aria-expanded') === 'true';
    const answer = question.nextElementSibling;
    
    // すべての質問を閉じる
    faqQuestions.forEach(q => {
      q.setAttribute('aria-expanded', 'false');
      const a = q.nextElementSibling;
      if (a) {
        a.setAttribute('aria-hidden', 'true');
        a.style.maxHeight = '0';
      }
    });

    // クリックされた質問が閉じていた場合は開く
    if (!isExpanded) {
      question.setAttribute('aria-expanded', 'true');
      if (answer) {
        answer.setAttribute('aria-hidden', 'false');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    }
  }
}

// ===== 生徒の声カルーセル =====
class VoiceCarousel {
  constructor() {
    this.currentIndex = 0;
    this.autoPlayInterval = null;
    this.autoPlayDelay = 5000;
    this.init();
  }

  init() {
    this.bindEvents();
    this.startAutoPlay();
    this.updateIndicators();
  }

  bindEvents() {
    // 前へボタン
    const prevButton = document.querySelector('.voice-control--prev');
    prevButton?.addEventListener('click', () => this.prevSlide());

    // 次へボタン
    const nextButton = document.querySelector('.voice-control--next');
    nextButton?.addEventListener('click', () => this.nextSlide());

    // インジケーター
    voiceIndicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goToSlide(index));
    });

    // ホバー時に自動再生を停止
    const carousel = document.querySelector('.voices-carousel');
    carousel?.addEventListener('mouseenter', () => this.stopAutoPlay());
    carousel?.addEventListener('mouseleave', () => this.startAutoPlay());

    // キーボードサポート
    document.addEventListener('keydown', (e) => {
      if (e.target.closest('.voices-carousel')) {
        if (e.key === 'ArrowLeft') this.prevSlide();
        if (e.key === 'ArrowRight') this.nextSlide();
      }
    });
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % voiceItems.length;
    this.updateSlides();
    this.updateIndicators();
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + voiceItems.length) % voiceItems.length;
    this.updateSlides();
    this.updateIndicators();
  }

  goToSlide(index) {
    this.currentIndex = index;
    this.updateSlides();
    this.updateIndicators();
  }

  updateSlides() {
    voiceItems.forEach((item, index) => {
      item.classList.toggle('active', index === this.currentIndex);
    });
  }

  updateIndicators() {
    voiceIndicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === this.currentIndex);
      indicator.setAttribute('aria-label', `${index + 1}番目の声を表示${index === this.currentIndex ? '（現在表示中）' : ''}`);
    });
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoPlayDelay);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }
}

// ===== フォーム機能 =====
class FormHandler {
  constructor() {
    this.init();
  }

  init() {
    this.setupFormValidation();
    this.setupFormSubmission();
  }

  setupFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');
      
      inputs.forEach(input => {
        input.addEventListener('blur', () => this.validateField(input));
        input.addEventListener('input', () => this.clearFieldError(input));
      });
    });
  }

  validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.hasAttribute('required');
    
    let isValid = true;
    let errorMessage = '';

    // 必須チェック
    if (required && !value) {
      isValid = false;
      errorMessage = 'この項目は必須です。';
    }

    // メールアドレスチェック
    if (type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = '正しいメールアドレスを入力してください。';
      }
    }

    // 電話番号チェック
    if (type === 'tel' && value) {
      const telRegex = /^[\d\-\(\)\+\s]+$/;
      if (!telRegex.test(value)) {
        isValid = false;
        errorMessage = '正しい電話番号を入力してください。';
      }
    }

    this.showFieldError(field, isValid ? '' : errorMessage);
    return isValid;
  }

  showFieldError(field, message) {
    this.clearFieldError(field);
    
    if (message) {
      field.classList.add('error');
      const errorElement = document.createElement('div');
      errorElement.className = 'field-error';
      errorElement.textContent = message;
      errorElement.setAttribute('role', 'alert');
      field.parentNode.appendChild(errorElement);
    }
  }

  clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  setupFormSubmission() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit(form);
      });
    });
  }

  handleFormSubmit(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    let isFormValid = true;

    // すべてのフィールドを検証
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isFormValid = false;
      }
    });

    if (isFormValid) {
      this.submitForm(form);
    } else {
      // 最初のエラーフィールドにフォーカス
      const firstError = form.querySelector('.error');
      if (firstError) {
        firstError.focus();
      }
    }
  }

  async submitForm(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton?.textContent;
    
    try {
      // ローディング状態
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = '送信中...';
      }

      // フォームデータの収集
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // ここで実際のAPI送信を行う
      // const response = await fetch('/api/submit', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });

      // デモ用の遅延
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 成功メッセージ
      this.showSuccessMessage(form);
      form.reset();

    } catch (error) {
      console.error('Form submission error:', error);
      this.showErrorMessage(form, 'エラーが発生しました。もう一度お試しください。');
    } finally {
      // ボタンを元に戻す
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    }
  }

  showSuccessMessage(form) {
    const message = document.createElement('div');
    message.className = 'form-message form-message--success';
    message.textContent = 'お問い合わせありがとうございます。内容を確認の上、ご連絡いたします。';
    message.setAttribute('role', 'alert');
    
    form.parentNode.insertBefore(message, form);
    
    setTimeout(() => {
      message.remove();
    }, 5000);
  }

  showErrorMessage(form, text) {
    const message = document.createElement('div');
    message.className = 'form-message form-message--error';
    message.textContent = text;
    message.setAttribute('role', 'alert');
    
    form.parentNode.insertBefore(message, form);
    
    setTimeout(() => {
      message.remove();
    }, 5000);
  }
}

// ===== パフォーマンス最適化 =====
class PerformanceOptimizer {
  constructor() {
    this.init();
  }

  init() {
    this.setupLazyLoading();
    this.setupImageOptimization();
    this.setupPreloading();
  }

  setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    } else {
      // フォールバック
      images.forEach(img => {
        img.src = img.dataset.src;
        img.classList.remove('lazy');
      });
    }
  }

  setupImageOptimization() {
    // WebP対応チェック
    const supportsWebP = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    };

    if (supportsWebP()) {
      document.documentElement.classList.add('webp');
    }
  }

  setupPreloading() {
    // 重要なリソースをプリロード
    const criticalImages = [
      'assets/images/school_building.jpg',
      'assets/images/school_logo.jpg'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }
}

// ===== アクセシビリティ機能 =====
class AccessibilityEnhancer {
  constructor() {
    this.init();
  }

  init() {
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupScreenReaderSupport();
    this.setupReducedMotion();
  }

  setupKeyboardNavigation() {
    // Tabキーでのナビゲーション改善
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });

    // スキップリンクの実装
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.textContent = 'メインコンテンツにスキップ';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: var(--color-primary);
      color: white;
      padding: 8px;
      text-decoration: none;
      border-radius: 4px;
      z-index: 1000;
      transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  setupFocusManagement() {
    // フォーカストラップ（モーダル用）
    const trapFocus = (element) => {
      const focusableElements = element.querySelectorAll(
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
      );
      
      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement = focusableElements[focusableElements.length - 1];

      element.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstFocusableElement) {
              lastFocusableElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastFocusableElement) {
              firstFocusableElement.focus();
              e.preventDefault();
            }
          }
        }
      });
    };

    // モバイルメニューでのフォーカストラップ
    const mobileMenu = document.querySelector('.nav-menu');
    if (mobileMenu) {
      trapFocus(mobileMenu);
    }
  }

  setupScreenReaderSupport() {
    // ライブリージョンの設定
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'live-region';
    document.body.appendChild(liveRegion);

    // 動的コンテンツの変更をアナウンス
    window.announceToScreenReader = (message) => {
      liveRegion.textContent = message;
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    };
  }

  setupReducedMotion() {
    // ユーザーがアニメーションを無効にしている場合の対応
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleReducedMotion = (mediaQuery) => {
      if (mediaQuery.matches) {
        document.documentElement.style.setProperty('--transition-fast', '0.01ms');
        document.documentElement.style.setProperty('--transition-normal', '0.01ms');
        document.documentElement.style.setProperty('--transition-slow', '0.01ms');
      }
    };

    prefersReducedMotion.addListener(handleReducedMotion);
    handleReducedMotion(prefersReducedMotion);
  }
}

// ===== 初期化 =====
document.addEventListener('DOMContentLoaded', () => {
  // 各クラスのインスタンス化
  new Navigation();
  new ScrollAnimations();
  new FAQAccordion();
  new VoiceCarousel();
  new FormHandler();
  new PerformanceOptimizer();
  new AccessibilityEnhancer();

  // ページ読み込み完了のアナウンス
  window.addEventListener('load', () => {
    if (window.announceToScreenReader) {
      window.announceToScreenReader('ページの読み込みが完了しました');
    }
  });

  // サービスワーカーの登録（PWA対応）
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
});

// ===== エラーハンドリング =====
window.addEventListener('error', (e) => {
  console.error('JavaScript error:', e.error);
  
  // ユーザーフレンドリーなエラーメッセージ
  if (window.announceToScreenReader) {
    window.announceToScreenReader('エラーが発生しました。ページを再読み込みしてください。');
  }
});

// ===== パフォーマンス監視 =====
if ('PerformanceObserver' in window) {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'largest-contentful-paint') {
        console.log('LCP:', entry.startTime);
      }
      if (entry.entryType === 'first-input') {
        console.log('FID:', entry.processingStart - entry.startTime);
      }
    });
  });

  observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
}

// ===== エクスポート（モジュール使用時） =====
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Navigation,
    ScrollAnimations,
    FAQAccordion,
    VoiceCarousel,
    FormHandler,
    PerformanceOptimizer,
    AccessibilityEnhancer
  };
}

