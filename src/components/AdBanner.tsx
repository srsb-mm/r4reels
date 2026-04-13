import { useEffect, useRef } from 'react';

const AdBanner = () => {
  const adRef = useRef<HTMLDivElement>(null);
  const adLoaded = useRef(false);

  useEffect(() => {
    if (adLoaded.current || !adRef.current) return;
    adLoaded.current = true;

    try {
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className="flex justify-center items-center py-4 bg-card rounded-lg my-4">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-1476688498273602"
        data-ad-slot="auto"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBanner;
