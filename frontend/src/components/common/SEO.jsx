import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://pharmacode07.onrender.com';
const DEFAULT_TITLE = 'PharmaCode07 – Pharmacy Test Series, Model Papers & Notes';
const DEFAULT_DESC =
  'Online Pharmacy Education & Competitive Exam Preparation platform. GSSSB Junior Pharmacist, UPSSSC, RRB, AIIMS, GPAT Mock Test Series, Model Papers, and High-Yield Study Materials.';
const DEFAULT_KEYWORDS =
  'Pharmacist Exam, GSSSB Junior Pharmacist, UPSSSC Pharmacist, RRB Pharmacist, AIIMS Pharmacist, GPAT Test Series, Pharmacy Model Papers, Pharmacy Study Notes, Pharma MCQs, PharmaCode07';

/**
 * Reusable SEO component for head management
 * @param {string} title - Page title (will be formatted as "${title} | PharmaCode07")
 * @param {string} description - Meta description
 * @param {string} keywords - Meta keywords
 * @param {string} path - Canonical URL path (e.g. "/test-series")
 * @param {string} image - Image URL for social sharing
 * @param {string} type - Open Graph type ('website' | 'article')
 */
const SEO = ({
  title,
  description = DEFAULT_DESC,
  keywords = DEFAULT_KEYWORDS,
  path = '',
  image = `${SITE_URL}/logo.jpg`,
  type = 'website',
}) => {
  const fullTitle = title ? `${title} | PharmaCode07` : DEFAULT_TITLE;
  const canonicalUrl = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image.startsWith('/') ? image : `/${image}`}`;

  return (
    <Helmet>
      {/* Standard metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="PharmaCode07" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={canonicalUrl} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
};

export default SEO;
