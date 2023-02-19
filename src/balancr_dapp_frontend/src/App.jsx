import 'bootstrap/dist/css/bootstrap.min.css';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';

import Header from "./components/Header";
import FrontPage from "./pages/FrontPage";
import ArticlePage from "./pages/ArticlePage";
import SubmitPage from "./pages/SubmitPage";

import { AuthClient } from "@dfinity/auth-client";
import { Principal } from "@dfinity/principal";

import { balancr_dapp_dao } from "../../declarations/balancr_dapp_dao";
import { balancr_dapp_icrc1 } from "../../declarations/balancr_dapp_icrc1";
import { balancr_dapp_content } from "../../declarations/balancr_dapp_content";


const App = () => {

    const [loggedInUser, setLoggedInUser] = useState();
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [totalSupply, setTotalSupply] = useState();
    const [userBalance, setUserBalance] = useState();
    const [proposals, setProposals] = useState([]);
    const [username, setUsername] = useState();


    // Your application's name (URI encoded)
    const APPLICATION_NAME = "nu~s";
    // URL to 37x37px logo of your application (URI encoded)
    const APPLICATION_LOGO_URL = "https://nfid.one/icons/favicon-96x96.png";
    const AUTH_PATH = "/authenticate/?applicationName="+APPLICATION_NAME+"&applicationLogo="+APPLICATION_LOGO_URL+"#authorize";
    // Replace https://identity.ic0.app with NFID_AUTH_URL
    // as the identityProvider for authClient.login({}) 
    const NFID_AUTH_URL = "https://nfid.one" + AUTH_PATH;


    useEffect(() => {
        verifyConnection();
    }, []);


    useEffect(() => {
        loadUserData();
    }, [loggedInUser, isLoggedIn]);


    useEffect(() => {
        getTotalSupply();
        getProposals();
    }, [loggedInUser, isLoggedIn]);


    const explicitConnect = async () => {
        const authClient = await AuthClient.create();
        await authClient.login({
            onSuccess: async () => {
                verifyConnection();
            },
            identityProvider: NFID_AUTH_URL
        });
    };


    const verifyConnection = async () => {
        const authClient = await AuthClient.create();
        const loggedIn = await authClient.isAuthenticated();
        const user = await authClient.getIdentity();
        setIsLoggedIn(loggedIn);
        setLoggedInUser(user.getPrincipal().toText());
    };


    const getTotalSupply = async () => {
        const supply = await balancr_dapp_icrc1.icrc1_total_supply();
        setTotalSupply(Number(supply) / 100000000);
    };


    const loadUserData = async () => {
        const profile = await balancr_dapp_dao.getUser(Principal.fromText(loggedInUser));
        setUsername(profile[0].username);
        const balance = await balancr_dapp_icrc1.icrc1_balance_of({owner: Principal.fromText(loggedInUser), subaccount: []});
        setUserBalance(Number(balance) / 100000000);
    };


    // Gets all proposals (for comments) regardless of their voting weight (including accepted ones)
    const getProposals = async () => {
        const resultArray = [];
        const response = await balancr_dapp_dao.get_all_proposals();
        for (var entry of response.values()) {
            const data = {
                id: Number(entry[1].id),
                articleID: Number(entry[1].articleID),
                creator: entry[1].creator.toText(),
                createdAt: entry[1].createdAt,
                status: entry[1].status,
                action: entry[1].action,
                headline: entry[1].headline,
                content: entry[1].content,
                url: entry[1].url,
                votingWeight: Number(entry[1].votingWeight)
            };
            resultArray.push(data)
        };
        setProposals(resultArray);
    };


    return (
        <>
            <Header
                isLoggedIn={isLoggedIn}
                callbackConnect={explicitConnect}
                loggedInUser={loggedInUser}
                totalSupply={totalSupply}
                userBalance={userBalance}>
            </Header>
            <Routes>
                <Route exact path="/" element={<FrontPage isLoggedIn={isLoggedIn}
                                                        loggedInUser={loggedInUser}
                                                        callbackConnect={explicitConnect}
                                                        username={username}
                                                        userBalance={userBalance}
                                                        proposals={proposals}
                                                        totalSupply={totalSupply}
                                                        callbackVerifyConnection={verifyConnection}
                                                        callbackGetProposals={getProposals}
                                                        callbackLoadUserData={loadUserData}
                                                        callbackGetTotalSupply={getTotalSupply}
                />}></Route>
                <Route exact path="/article/:articleID" element={<ArticlePage></ArticlePage>}></Route>
                <Route exact path="/submit" element={<SubmitPage loggedInUser={loggedInUser} totalSupply={totalSupply}></SubmitPage>}></Route>
            </Routes>
        </>
    )
};


export default App;