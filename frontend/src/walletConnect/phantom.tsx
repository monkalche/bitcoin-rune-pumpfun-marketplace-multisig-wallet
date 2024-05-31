export const getProvider = () => {
    if ('phantom' in window) {
      const anyWindow = window;
      const provider = (anyWindow.phantom as any)?.bitcoin;
     
      if (provider && provider.isPhantom) {
        return provider;
      }
    }
  
    window.open('https://phantom.app/', '_blank');
  };