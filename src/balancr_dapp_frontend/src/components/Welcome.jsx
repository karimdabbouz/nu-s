import * as React from 'react';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/js/bootstrap.bundle';


const Welcome = ({callbackConnect}) => {


    return (
        <>
            <div className="row p-lg-5 p-md-2 h-100">
                <div className="col text-center my-auto">
                    <h1>Welcome</h1>
                    <p>Please sign in to participate in nu~s</p>
                    <Button onClick={callbackConnect} className="btn-dark">Sign In</Button>
                </div>
            </div>
        </>
    )
};

export default Welcome;