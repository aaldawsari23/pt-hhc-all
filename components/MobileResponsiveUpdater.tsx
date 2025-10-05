import React, { useEffect } from 'react';

/**
 * Component to update existing components with mobile-responsive classes
 * This ensures all components work well on mobile devices
 */
const MobileResponsiveUpdater: React.FC = () => {
  useEffect(() => {
    // Update all form inputs to be mobile-friendly
    const updateFormElements = () => {
      // Update all input fields
      const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="number"], input[type="date"], input[type="time"], textarea, select');
      inputs.forEach(input => {
        const element = input as HTMLElement;
        element.classList.add('mobile-form-field');
        
        // Ensure proper touch target size
        if (!element.classList.contains('touch-target-44')) {
          element.style.minHeight = '44px';
        }
      });

      // Update all buttons
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        const element = button as HTMLElement;
        if (!element.classList.contains('touch-target-44')) {
          element.style.minHeight = '44px';
          element.style.minWidth = '44px';
        }
        
        // Add mobile-friendly padding for buttons without specific classes
        if (!element.className.includes('mobile-btn') && !element.className.includes('p-')) {
          element.style.padding = '12px 16px';
        }
      });

      // Update all cards
      const cards = document.querySelectorAll('.bg-white.rounded, .bg-white.rounded-lg, .bg-white.rounded-xl');
      cards.forEach(card => {
        const element = card as HTMLElement;
        if (!element.classList.contains('mobile-card')) {
          element.classList.add('mobile-card');
        }
      });

      // Update all modals to be mobile-friendly
      const modals = document.querySelectorAll('.fixed.inset-0');
      modals.forEach(modal => {
        const element = modal as HTMLElement;
        if (element.classList.contains('z-50')) {
          element.classList.add('mobile-modal');
          
          // Find modal content and make it mobile-friendly
          const modalContent = element.querySelector('.bg-white');
          if (modalContent && !modalContent.classList.contains('mobile-modal-content')) {
            modalContent.classList.add('mobile-modal-content');
          }
        }
      });
    };

    // Update elements on mount
    updateFormElements();

    // Create a MutationObserver to update new elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // Update new form elements
              if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
                (element as HTMLElement).classList.add('mobile-form-field');
              }
              
              // Update new buttons
              if (element.tagName === 'BUTTON') {
                const btnElement = element as HTMLElement;
                btnElement.style.minHeight = '44px';
                btnElement.style.minWidth = '44px';
              }
              
              // Update child elements
              const childInputs = element.querySelectorAll('input, textarea, select');
              childInputs.forEach(input => {
                (input as HTMLElement).classList.add('mobile-form-field');
              });
              
              const childButtons = element.querySelectorAll('button');
              childButtons.forEach(button => {
                const btnElement = button as HTMLElement;
                btnElement.style.minHeight = '44px';
                btnElement.style.minWidth = '44px';
              });
            }
          });
        }
      });
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);

  // Add mobile viewport meta tag if not present
  useEffect(() => {
    const existingViewport = document.querySelector('meta[name="viewport"]');
    if (!existingViewport) {
      const viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(viewport);
    }
  }, []);

  // Add mobile-specific styles for better touch interactions
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Mobile touch improvements */
      * {
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
        -webkit-touch-callout: none;
      }
      
      /* Prevent horizontal scroll on mobile */
      html, body {
        overflow-x: hidden;
        position: relative;
      }
      
      /* Smooth scrolling for mobile */
      html {
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
      }
      
      /* Improve button touch targets */
      button, input[type="button"], input[type="submit"] {
        min-height: 44px;
        min-width: 44px;
      }
      
      /* Improve link touch targets */
      a {
        min-height: 44px;
        display: inline-flex;
        align-items: center;
      }
      
      /* Improve form element appearance on mobile */
      input, textarea, select {
        font-size: 16px; /* Prevents zoom on iOS */
        border-radius: 8px;
      }
      
      /* Focus states for mobile */
      input:focus, textarea:focus, select:focus, button:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }
      
      /* Modal improvements for mobile */
      .mobile-modal {
        align-items: flex-end;
      }
      
      @media (min-width: 768px) {
        .mobile-modal {
          align-items: center;
        }
      }
      
      /* Hide scrollbars on mobile while maintaining functionality */
      .mobile-scroll-hide::-webkit-scrollbar {
        display: none;
      }
      
      .mobile-scroll-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      
      /* Improve checkbox and radio button touch targets */
      input[type="checkbox"], input[type="radio"] {
        min-width: 20px;
        min-height: 20px;
        transform: scale(1.2);
      }
      
      /* Improve table responsiveness */
      .table-responsive {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      
      /* Mobile-first spacing */
      @media (max-width: 640px) {
        .container {
          padding-left: 16px;
          padding-right: 16px;
        }
        
        .modal-content {
          margin: 0;
          border-radius: 16px 16px 0 0;
        }
        
        .grid {
          gap: 16px;
        }
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Handle orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      // Trigger a re-render after orientation change
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default MobileResponsiveUpdater;