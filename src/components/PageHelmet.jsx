import { Helmet } from 'react-helmet-async';

const PageHelmet = ({ title, description, keywords, ogTitle, ogDescription, ogImage, ...props }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {ogTitle && <meta property="og:title" content={ogTitle} />}
      {ogDescription && <meta property="og:description" content={ogDescription} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {/* Ajoutez d'autres balises meta si nécessaire */}
    </Helmet>
  );
};

export default PageHelmet;