import { useEffect, useRef } from 'react';

interface AdBannerProps {
  type: 'native' | 'banner';
}

const AdBanner = ({ type }: AdBannerProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current || !adRef.current) return;
    scriptLoaded.current = true;

    if (type === 'native') {
      // Native banner ad
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = '//pl28214886.effectivegatecpm.com/0f7e60b368e48e4872332b9826d92f11/invoke.js';
      adRef.current.appendChild(script);
    } else {
      // Banner ad (300x250)
      const optionsScript = document.createElement('script');
      optionsScript.type = 'text/javascript';
      optionsScript.innerHTML = `
        atOptions = {
          'key' : 'c21ddd93ffc5f735e68de3c601a18fbc',
          'format' : 'iframe',
          'height' : 250,
          'width' : 300,
          'params' : {}
        };
      `;
      adRef.current.appendChild(optionsScript);

      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = '//www.highperformanceformat.com/c21ddd93ffc5f735e68de3c601a18fbc/invoke.js';
      adRef.current.appendChild(invokeScript);
    }
  }, [type]);

  return (
    <div className="flex justify-center items-center py-4 bg-card rounded-lg my-4">
      {type === 'native' ? (
        <div ref={adRef}>
          <div id="container-0f7e60b368e48e4872332b9826d92f11"></div>
        </div>
      ) : (
        <div ref={adRef} className="flex justify-center"></div>
      )}
    </div>
  );
};

export default AdBanner;
