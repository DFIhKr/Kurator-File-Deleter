/**
 * main.js
 * Application bootstrap and initialization.
 */

import { AppState } from './state/AppState.js';
import { FeatureDetection } from './core/FeatureDetection.js';
import { LoggerService } from './services/LoggerService.js';
import { STEPS, APP_NAME, APP_SUBTITLE } from './utils/constants.js';
import { h, clearElement } from './utils/helpers.js';
import { icon, icons } from './icons/icons.js';
import { ThemeToggle } from './components/ThemeToggle.js';
import { InputView } from './views/InputView.js';
import { ScanView } from './views/ScanView.js';
import { PreviewView } from './views/PreviewView.js';
import { ExecutionView } from './views/ExecutionView.js';
import { SummaryView } from './views/SummaryView.js';

const logger = LoggerService.getInstance();

class App {
  constructor() {
    this.root = document.getElementById('app');
    this.contentArea = null;
    this.stepIndicator = null;
  }

  init() {
    // Apply saved theme
    const theme = AppState.get('theme');
    document.documentElement.setAttribute('data-theme', theme);

    // Feature detection
    if (!FeatureDetection.isSupported()) {
      this.renderIncompatible();
      return;
    }

    logger.info(`Aplikasi ${APP_NAME} ${APP_SUBTITLE} dimulai. Browser: ${FeatureDetection.getBrowserInfo()}`);

    this.renderShell();
    this.navigate(AppState.get('currentStep'));

    // Listen for step changes
    AppState.subscribe('currentStep', (step) => {
      this.updateStepIndicator(step);
    });
  }

  renderIncompatible() {
    clearElement(this.root);
    const msg = FeatureDetection.getIncompatibilityMessage();
    this.root.appendChild(
      h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: 'var(--space-8)' } },
        h('div', { innerHTML: icons.shieldAlert, style: { width: '64px', height: '64px', color: 'var(--color-warning-500)', marginBottom: 'var(--space-4)' } }),
        h('h2', { style: { marginBottom: 'var(--space-3)' } }, 'Browser Tidak Didukung'),
        h('p', { style: { maxWidth: '480px', fontSize: 'var(--text-sm)' } }, msg)
      )
    );
  }

  renderShell() {
    clearElement(this.root);

    // Header
    const header = h('header', { className: 'app-header' });

    const brand = h('div', { className: 'app-header__brand' });
    const logo = h('div', { className: 'app-header__logo' });
    logo.innerHTML = icons.scissors;
    brand.appendChild(logo);

    const titleBlock = h('div', {});
    titleBlock.appendChild(h('div', { className: 'app-header__title' }, APP_NAME));
    titleBlock.appendChild(h('div', { className: 'app-header__subtitle' }, APP_SUBTITLE));
    brand.appendChild(titleBlock);
    header.appendChild(brand);

    const actions = h('div', { className: 'app-header__actions' });
    actions.appendChild(ThemeToggle());
    header.appendChild(actions);

    this.root.appendChild(header);

    // Step indicator
    this.stepIndicator = h('nav', { className: 'step-indicator', id: 'step-indicator' });
    this.renderStepIndicator(AppState.get('currentStep'));
    this.root.appendChild(this.stepIndicator);

    // Content area
    this.contentArea = h('main', { className: 'content-area', id: 'content-area' });
    this.root.appendChild(this.contentArea);
  }

  renderStepIndicator(activeStep) {
    clearElement(this.stepIndicator);
    const activeIndex = STEPS.findIndex(s => s.id === activeStep);

    STEPS.forEach((step, i) => {
      if (i > 0) {
        const connector = h('div', {
          className: `step-indicator__connector ${i <= activeIndex ? 'step-indicator__connector--completed' : ''}`,
        });
        this.stepIndicator.appendChild(connector);
      }

      const stepEl = h('div', { className: 'step-indicator__step' });
      const dotClass = i < activeIndex ? 'step-indicator__dot--completed'
        : i === activeIndex ? 'step-indicator__dot--active' : '';

      const dot = h('div', { className: `step-indicator__dot ${dotClass}` });
      if (i < activeIndex) {
        dot.innerHTML = icons.check;
        const svg = dot.querySelector('svg');
        if (svg) { svg.setAttribute('width', '14'); svg.setAttribute('height', '14'); }
      } else {
        dot.textContent = step.number;
      }
      stepEl.appendChild(dot);

      const labelClass = i === activeIndex ? 'step-indicator__label--active' : '';
      stepEl.appendChild(h('span', { className: `step-indicator__label ${labelClass}` }, step.label));

      this.stepIndicator.appendChild(stepEl);
    });
  }

  updateStepIndicator(step) {
    this.renderStepIndicator(step);
  }

  navigate(step) {
    AppState.set('currentStep', step);

    switch (step) {
      case 'input':
        InputView(this.contentArea, () => this.navigate('scan'));
        break;
      case 'scan':
        ScanView(this.contentArea, () => this.navigate('preview'), () => this.navigate('input'));
        break;
      case 'preview':
        PreviewView(this.contentArea, () => this.navigate('execution'), () => this.navigate('scan'));
        break;
      case 'execution':
        ExecutionView(this.contentArea, () => this.navigate('summary'));
        break;
      case 'summary':
        SummaryView(this.contentArea, () => this.navigate('input'));
        break;
      default:
        this.navigate('input');
    }
  }
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
