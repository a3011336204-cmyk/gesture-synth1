import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { GoogleAnalytics } from './google-analytics';

describe('GoogleAnalytics', () => {
  it('renders one GA4 loader and initializes the configured property', () => {
    const html = renderToStaticMarkup(
      <GoogleAnalytics measurementId=" G-MQLN7DCHQ6 " />
    );

    expect(html.match(/id="ga-loader"/g)).toHaveLength(1);
    expect(html.match(/id="ga-init"/g)).toHaveLength(1);
    expect(html).toContain(
      'src="https://www.googletagmanager.com/gtag/js?id=G-MQLN7DCHQ6"'
    );
    expect(html).toContain(`gtag('config',"G-MQLN7DCHQ6")`);
  });

  it('rejects an invalid Measurement ID before rendering a script', () => {
    expect(() =>
      renderToStaticMarkup(
        <GoogleAnalytics measurementId={`G-INVALID';alert(1)//`} />
      )
    ).toThrow('Invalid Google Analytics Measurement ID');
  });
});
