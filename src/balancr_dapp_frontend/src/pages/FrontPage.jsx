import 'bootstrap/dist/css/bootstrap.min.css';
import * as React from 'react';
import { useState, useEffect } from 'react';

import FrontPageStats from '../components/FrontPageStats';
import Welcome from "../components/Welcome";
import CreateProfileForm from "../components/CreateProfileForm";
import Comment from "../components/Comment";

import { Principal } from '@dfinity/principal';

import { balancr_dapp_dao } from "../../../declarations/balancr_dapp_dao";


const FrontPage = ({isLoggedIn,
                    loggedInUser, 
                    callbackConnect,
                    username,
                    userBalance,
                    proposals, 
                    totalSupply,
                    callbackVerifyConnection,
                    callbackGetProposals,
                    callbackGetTotalSupply,
                    callbackLoadUserData
                }) => {

    const [userExists, setUserExists] = useState(false);

    console.log(`userExists: ${userExists}`);


    useEffect(() => {
        checkUserExists();
    }, [loggedInUser]);


    const checkUserExists = async () => {
        const userExists = await balancr_dapp_dao.checkUserExists(Principal.fromText(loggedInUser));
        setUserExists(userExists);
    };


    return (
        <>
            <div className="container-fluid vh-100">
                {(isLoggedIn == true && userExists == false) ?
                    <CreateProfileForm
                        callbackCheckUserExists={checkUserExists}
                        callbackGetTotalSupply={callbackGetTotalSupply}
                        callbackLoadUserData={callbackLoadUserData}
                    ></CreateProfileForm> :
                    (isLoggedIn == true && userExists == true) ?
                    <FrontPageStats loggedInUser={loggedInUser} username={username} userBalance={userBalance}></FrontPageStats> :
                    <Welcome callbackConnect={callbackConnect}></Welcome>
                }
            </div>
            <div className="container-fluid">
                <div className="row p-lg-5 p-md-2" style={{backgroundColor: "salmon"}}>
                    <div className="col text-center">
                        <h2><strong>Comments</strong></h2>
                        <p>Your voting weight is equal to your current balance of nu~. A comment gets added to the comment section of an article once it has attracted at least 1/3 of the total voting power of the community.</p>
                    </div>
                </div>
                {proposals.map((entry) => (
                    <Comment proposal={entry} totalSupply={totalSupply} userBalance={userBalance} isLoggedIn={isLoggedIn} callbackVerifyConnection={callbackVerifyConnection} callbackGetProposals={callbackGetProposals} callbackGetTotalSupply={callbackGetTotalSupply} callbackLoadUserData={callbackLoadUserData}></Comment>
                ))}
            </div>
            <div className="container-fluid">
                <div className="row" style={{height: "200px"}}></div>
            </div>
        </>
    )
  };

export default FrontPage;