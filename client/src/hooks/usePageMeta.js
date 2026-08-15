import { useEffect } from "react";

/** Sets the browser document title and meta description for a page. */
export function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title ? `${title} · GEO SOFTWARE HUB` : "GEO SOFTWARE HUB";
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "description");
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", description || "Discover and download GIS, remote sensing, CAD, BIM, planning, survey and geospatial software from official sources.");
  }, [title, description]);
}
