import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import VpSite from './VpSite';
import Invite from './Invite';
import reportWebVitals from './reportWebVitals';
import { 
  BrowserRouter,
  Routes,
  Route, } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<VpSite />} />
      <Route path="/invite" element={
      <Suspense fallback={<h1>loading...</h1>}>
        <Invite/>
      </Suspense>
      }/>
    </Routes>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
