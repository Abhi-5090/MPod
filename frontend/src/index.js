import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import App from './App';
import './App.scss';
import './scss/components/animate.scss';
import './scss/components/responsive.scss';
import './scss/components/btn-swiper.scss';
import './scss/components/popup.scss';
import ScrollToTop from "./ScrollToTop";

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<div>Loading...</div>}>
        <App />
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
);
