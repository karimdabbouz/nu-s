import 'bootstrap/dist/css/bootstrap.min.css';
import * as React from 'react';


const LoadingAnimation = () => {

    return (
        <>
            <div className="row p-lg-5 p-md-2">
                <div className="col text-center">
                    <div className="lds-ripple"><div></div><div></div></div>
                </div>
            </div>
        </>
    )
};

export default LoadingAnimation;