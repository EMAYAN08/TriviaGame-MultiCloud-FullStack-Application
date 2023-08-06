import React, { useEffect } from 'react';
import '../../Css/admin.css';
import Header from './Header';
import { useNavigate } from 'react-router-dom';

function AnalyzeGameData() {
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("userDetails"));
        if (!user || (user && user.role !== "admin")) {
            navigate('/login-admin');
        }
    }, []);

    return (
        <div>
            <Header />
            <div className="container mt-5" style={{ textAlign: 'left' }}>
                <div className="mt-4">
                    <h3>Gameplay Data Analysis</h3>
                    <div className="mt-4">
                        <iframe
                            width="800"
                            height="700"
                            src="https://lookerstudio.google.com/embed/reporting/6b0ac292-5183-4a19-951f-089bb4b7790e/page/qiwYD"
                            frameborder="0"
                            style={{border:0}}
                            allowfullscreen
                        >
                        </iframe>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnalyzeGameData;
