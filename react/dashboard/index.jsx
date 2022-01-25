import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router';
import Dashboard from './components/Dashboard.jsx';


ReactDOM.render(
        <BrowserRouter>
                <Routes>
                        <Route path="/" element={Dashboard} />
                </Routes>
        </BrowserRouter>,
    document.getElementById('root-mount'),
);