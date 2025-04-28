// Helper function to load Razorpay script if not already loaded
export const ensureRazorpayLoaded = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve();
        return;
      }
  
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        resolve();
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        reject(new Error('Failed to load Razorpay script'));
      };
  
      document.body.appendChild(script);
    });
  };
  
  // Helper to check if Razorpay key is configured
  export const validateRazorpayConfig = () => {
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!keyId) {
      console.error('Razorpay Key ID is not configured in environment variables');
      return false;
    }
    return true;
  }; 