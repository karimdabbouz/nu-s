import * as React from 'react';
import { useState, useEffect } from 'react';
import { ProgressBar, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle';

import LoadingAnimation from "./LoadingAnimation";

import { AuthClient } from "@dfinity/auth-client";
import { createActor } from '../../../declarations/balancr_dapp_dao';


const Comment = ({proposal, totalSupply, userBalance, isLoggedIn, callbackVerifyConnection, callbackGetProposals, callbackGetTotalSupply, callbackLoadUserData}) => {

    const [weight, setWeight] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        computeVotingWeight();
    }, [proposal, isLoggedIn, totalSupply, userBalance]);

    const computeVotingWeight = () => {
        const minimum = totalSupply / 3;
        setWeight([minimum - (proposal.votingWeight / 100000000) , (proposal.votingWeight / 100000000)])
    };


    // vote
    const vote = async () => {
        setLoading(true);
        const authClient = await AuthClient.create();
        const identity = await authClient.getIdentity();
        const myActor = createActor("lwjt4-byaaa-aaaak-qb22q-cai", {agentOptions: {identity}}); // dao canister
        const response = await myActor.vote(proposal.id, {pro: null});
        callbackGetProposals();
        callbackGetTotalSupply();
        callbackLoadUserData();
        setLoading(false);
    };



    return (
        <>
            <div className="row p-lg-5 p-md-2 mt-5 mx-auto border rounded maxwidth50">
                {(loading == false) ?
                    <>
                        <div className="row">
                            <div className="col">
                                <h2>{proposal.headline}</h2>
                                <h6><strong>By: </strong>{proposal.creator}</h6>
                                <h6><strong>Current weight: </strong>{proposal.votingWeight / 100000000} / {totalSupply} maximum weight</h6>
                                <h6><strong>Status: </strong>{Object.keys(proposal.status)[0]}</h6>
                                <ProgressBar className="mt-2 mb-2">
                                    <ProgressBar className="progress-bar-current" now={weight[1]}/>
                                    <ProgressBar className="progress-bar-one-third" now={weight[0]}/>
                                </ProgressBar>
                                <p>{proposal.content}</p>
                                <Link to={`./article/:${proposal.articleID}`}>Read full article</Link>
                            </div>
                        </div>
                        <div className="row mt-3">
                            {(isLoggedIn == true) ?
                                <div className="col text-center">
                                    <Button onClick={vote} className="btn-dark w-50">Add your vote</Button>
                                </div> :
                                <div className="col text-center">
                                    <h3>Please sign in to be able to vote</h3>
                                </div>
                            }
                        </div>
                    </> :
                    <LoadingAnimation></LoadingAnimation>
                }
            </div>
        </>
    )
};

export default Comment;