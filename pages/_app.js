import '../styles/globals.css'
import Script from "next/script";
import Layout from "./components/layout";

// Microsoft Clarity project id for the booking site. Swap this to point the
// session recordings at a different Clarity project.
const CLARITY_PROJECT_ID = 'xu74qfglq3';

function MyApp({ Component, pageProps }) {
  return (
      <>
        {process.env.NODE_ENV === 'production' && (
            <Script id="ms-clarity" strategy="afterInteractive">
              {`(function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");`}
            </Script>
        )}
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </>
  )
}

export default MyApp
