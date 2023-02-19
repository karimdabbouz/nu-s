import * as React from 'react';
import 'bootstrap/dist/js/bootstrap.bundle';
import { useState, useEffect, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { Switch } from 'react-switch-input';

import ReactCrop from 'react-image-crop';
import { centerCrop, makeAspectCrop } from 'react-image-crop';
import { canvasPreview } from './canvasPreview';
import 'react-image-crop/dist/ReactCrop.css';

import LoadingAnimation from "./LoadingAnimation";

import { Principal } from '@dfinity/principal';
import { AuthClient } from "@dfinity/auth-client";
import { createActor } from '../../../declarations/balancr_dapp_dao';

import { balancr_dapp_dao } from "../../../declarations/balancr_dapp_dao";


const CreateProfileForm = ({loggedInUser, callbackCheckUserExists, callbackLoadUserData, callbackGetTotalSupply}) => {

    const [showReactCrop, setShowReactCrop] = useState(false);
    const handleShowReactCrop = () => setShowReactCrop(!showReactCrop);
    const [sizeWarning, setSizeWarning] = useState(false);
    const [profileImageData, setProfileImageData] = useState([]); // empty array is null in Motoko, but I can't wrap undefined in []
    const [username, setUsername] = useState();
    const [mail, setMail] = useState("foo");
    const [loading, setLoading] = useState(false);

    // ReactCrop and image upload:
    const imgRef = useRef(null);
    const previewCanvasRef = useRef(null);
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState();
    const [aspect, setAspect] = useState(1 / 1); // 1:1 aspect ratio -> square
    const [scale, setScale] = useState(1); // Optional: Let the user change this
    const [rotate, setRotate] = useState(0); // Optional: Let the user change this
    const [completedCrop, setCompletedCrop] = useState(0);
    

    // useEffect(() => {
    //     // getProfileData();
    // }, [loggedInUser]);


    // //////////////////
    // Stuff for ReactCrop and image upload:
    // /////////////////

    useEffect(() => {
        if (completedCrop.width && completedCrop.height && imgRef.current && previewCanvasRef.current) {
            canvasPreview(
                imgRef.current,
                previewCanvasRef.current,
                completedCrop,
                scale,
                rotate
            )
        };
    }, [completedCrop, scale, rotate]);

    const onSelectFile = (e) => {
        setCrop(undefined);
        const reader = new FileReader();
        reader.addEventListener('load', () => 
            setImgSrc(reader.result.toString() || '')
        );
        reader.readAsDataURL(e.target.files[0]);
    };

    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height, aspect));
    };

    const centerAspectCrop = (mediaWidth, mediaHeight, aspect) => {
        return centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 50,
                },
            aspect,
            mediaWidth,
            mediaHeight,
            ),
        mediaWidth,
        mediaHeight,
        );
    };

    const confirmImgSelection = () => {
        const image = previewCanvasRef.current;
        const ctx = image.getContext("2d");
        // const imageData = ctx.getImageData(0, 0, image.width, image.height);
        const dataURL = image.toDataURL();
        const uint8 = Uint8Array.from(window.atob(dataURL.replace(/^data:image\/(png|jpg);base64,/, "")), c => c.charCodeAt(0));
        if (uint8.length >= 2097152) {
            setSizeWarning(true);
        } else {
            setSizeWarning(false);
            setProfileImageData(uint8);
        };
    };


    // ////////////////////////////
    // Create Profile
    // ////////////////////////////


    const createProfile = async () => {
        setLoading(true);
        const authClient = await AuthClient.create();
        const identity = await authClient.getIdentity();
        const myActor = createActor("lwjt4-byaaa-aaaak-qb22q-cai", {agentOptions: {identity}}); // dao canister
        const response = await myActor.createUserProfile(username, [mail], [profileImageData]);
        callbackCheckUserExists();
        callbackGetTotalSupply();
        callbackLoadUserData();
        setLoading(false);
    };


    return (
        <>
            <div className="row p-lg-5 p-md-2 h-100">
                <div className="col text-center my-auto">
                    {(loading == true) ? 
                        <LoadingAnimation></LoadingAnimation> :                
                        <div className="row p-md-2">
                            <div className="col">
                                <div className="row">
                                    <div className="col text-center">
                                        <h2><strong>Please complete your registration to get your firt 3 nu~ tokens.</strong></h2>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col my-auto">
                                        <div className="container">
                                            <div className="row mx-auto p-2 maxwidth50">
                                                <div className="col">
                                                    <form>
                                                        <div className="row">
                                                            <div className="col">
                                                                <label>What's your name?</label>
                                                            </div>
                                                            <div className="col">
                                                                <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-100"></input>
                                                            </div>
                                                        </div>
                                                        {/* <div className="row">
                                                            <div className="col">
                                                                <label>Upload Profile Image</label>
                                                            </div>
                                                            <div className="col p-2">
                                                                <Switch
                                                                    checked={showReactCrop}
                                                                    onChange={handleShowReactCrop}
                                                                />
                                                            </div>
                                                        </div> */}
                                                        <div className="row">
                                                            <div className="col">
                                                            {(showReactCrop == true) ?
                                                            <div className="row p-2 border rounded">
                                                                <div className="row w-100">
                                                                    <div className="col">
                                                                        <input type="file" accept="image/*" onChange={onSelectFile} />
                                                                    </div>
                                                                </div>
                                                                <div className="row w-100">
                                                                    <div className="col">
                                                                        <ReactCrop crop={crop} maxHeight={1000} maxWidth={1000} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)} aspect={aspect}>
                                                                            {(imgSrc != '') ?
                                                                                <img
                                                                                    ref={imgRef}
                                                                                    alt="Crop me"
                                                                                    src={imgSrc}
                                                                                    style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                                                                                    onLoad={onImageLoad}
                                                                                /> :
                                                                                <></>
                                                                            }
                                                                        </ReactCrop>
                                                                    </div>
                                                                </div>
                                                                <div className="row w-100 p-2">
                                                                    <div className="col">
                                                                        {(completedCrop != 0) ?
                                                                            <canvas
                                                                                ref={previewCanvasRef}
                                                                                style={{
                                                                                    padding: 0,
                                                                                    objectFit: 'contain',
                                                                                    width: completedCrop.width,
                                                                                    height: completedCrop.height,
                                                                                }}
                                                                            /> :
                                                                            <></>
                                                                        }
                                                                    </div>
                                                                </div>
                                                                <div className="row w-100 p-2">
                                                                    <div className="col text-center">
                                                                        <Button className="btn btn-dark" onClick={() => {confirmImgSelection(); handleShowReactCrop();}}>Confirm Selection</Button>
                                                                    </div>
                                                                </div>
                                                            </div> :
                                                            <></>
                                                            }

                                                            </div>
                                                        </div>
                                                        <div className="row">
                                                            <div className="col text-center">
                                                                {(sizeWarning == true) ? <h4 style={{color: "red"}}><strong>Image too large, please make it smaller</strong></h4> : <></>}
                                                            </div>
                                                        </div>
                                                        <div className="row w-50 mx-auto p-2">
                                                            <div className="col">
                                                                <Button onClick={createProfile} className="w-100 btn btn-dark btn-lg">Create my profile</Button>
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>

        </>
    )
};

export default CreateProfileForm;


