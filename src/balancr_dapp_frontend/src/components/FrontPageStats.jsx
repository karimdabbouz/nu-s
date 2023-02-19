import * as React from 'react';
import 'bootstrap/dist/js/bootstrap.bundle';



const FrontPageStats = ({loggedInUser, username, userBalance}) => {


    return (
        <>
            <div className="row p-lg-5 p-md-2 h-100">
                <div className="col text-center my-auto">
                    <div className="row">
                        <h2>Hello, <strong>{username}</strong></h2>
                        <p>Voting will help your favourite comments be added to an article. Once a comment has reached 1/3 of the total voting power, it is added to the comment section of the article. It can then be read by everyone outside of the community. Every vote earns you 0.1 nu~ tokens. Writing a comment will burn 1.0 nu~ tokens.</p>
                    </div>
                    <div className="row">
                        <span>YOUR BALANCE: <strong>{userBalance} nu~</strong></span>
                    </div>
                </div>
            </div>
        </>
    )
};

export default FrontPageStats;