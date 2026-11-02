import { useEffect, useState } from 'react';

/** A phone-like screen: narrow, or a touch device without hover. Desktop keeps its own behaviour. */
export const MOBILE_QUERY = '(max-width: 640px), (hover: none) and (pointer: coarse)';

export function useMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  return mobile;
}
