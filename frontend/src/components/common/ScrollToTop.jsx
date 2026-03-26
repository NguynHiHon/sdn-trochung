import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Chỉ khi pathname đổi → cuộn đầu trang.
 * Không phụ thuộc location.key: đổi chỉ hash (#) trên cùng route (vd /faqs → /faqs#muc-0)
 * cũng làm key đổi → scroll top sẽ “đánh” với scroll tới neo và gây giật.
 */
export default function ScrollToTop() {
  const location = useLocation();

  useLayoutEffect(() => {
    globalThis.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return null;
}
