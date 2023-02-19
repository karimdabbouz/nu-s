import 'bootstrap/dist/css/bootstrap.min.css';
import * as React from 'react';
import { useState } from 'react';
import { Button } from 'react-bootstrap';

import LoadingAnimation from "../components/LoadingAnimation";

import { Principal } from '@dfinity/principal';
import { AuthClient } from "@dfinity/auth-client";
import { createActor } from '../../../declarations/balancr_dapp_dao';
import { createActor as createActorICRC1 } from '../../../declarations/balancr_dapp_icrc1';


const SubmitPage = ({totalSupply}) => {

    const [articleID, setArticleID] = useState(0);
    const [headline, setHeadline] = useState();
    const [content, setContent] = useState();
    const [loading, setLoading] = useState(false);


    // Submit a comment (proposal)
    const submitComment = async () => {
        setLoading(true);
        const authClient = await AuthClient.create();
        const identity = await authClient.getIdentity();
        const myActor = createActor("lwjt4-byaaa-aaaak-qb22q-cai", {agentOptions: {identity}}); // dao canister
        const response = await myActor.submit_proposal(articleID, {addComment: null}, headline, content, []);
        const myActorICRC1 = createActorICRC1("l7kya-xqaaa-aaaak-qb23a-cai", {agentOptions: {identity}}); // icrc1 canister
        const response2 = await myActorICRC1.icrc1_transfer({
            to: {owner: Principal.fromText("lwjt4-byaaa-aaaak-qb22q-cai"), subaccount: []},
            fee: [],
            memo: [],
            from_subaccount: [],
            created_at_time: [],
            amount: 100000000
        });
        setLoading(false);
    };


    return (
        <>
            <div className="container-fluid above-the-fold">
                <div className="row p-lg-5 p-md-2" style={{backgroundColor: "salmon"}}>
                    <div className="col text-center">
                        <h2><strong>Submit a Comment</strong></h2>
                        <p>Your comment will be visible to the community once submitted. Once 1/3 of the total voting power has voted in favor of your comment, it will be added to the article for everyone to see. The current total voting power is {totalSupply}. Submitting a comment burns 1.0 of your tokens.</p>
                        <p><strong>note: this demo has only one dummy article.</strong></p>
                    </div>
                </div>
                {(loading == false) ? 
                    <div className="row p-lg-5 p-md-2">
                        <div className="col">
                            <div className="row">
                                <div className="col my-auto">
                                    <div className="container">
                                        <div className="row mx-auto p-2" style={{maxWidth: "600px"}}>
                                            <div className="col">
                                                <form>
                                                    <div className="row p-2">
                                                        <div className="col">
                                                            <label>Headline</label>
                                                        </div>
                                                        <div className="col">
                                                            <input type="text" onChange={e => setHeadline(e.target.value)} className="w-100"></input>
                                                        </div>
                                                    </div>
                                                    <div className="row p-2">
                                                        <div className="col">
                                                            <label>Content</label>
                                                        </div>
                                                        <div className="col">
                                                            <textarea cols="35" rows="4" onChange={e => setContent(e.target.value)} className="w-100"></textarea>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                        <div className="row w-50 mx-auto p-2">
                                            <div className="col text-center">
                                                <Button onClick={submitComment} className="w-100 btn btn-dark">Submit Comment</Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> :
                <LoadingAnimation></LoadingAnimation>
                }
                
            </div>
        </>
    )
  };

export default SubmitPage;