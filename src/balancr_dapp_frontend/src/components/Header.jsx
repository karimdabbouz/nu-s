import * as React from 'react';
import { Nav, Navbar, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle';


const Header = ({isLoggedIn, callbackConnect, loggedInUser, totalSupply, userBalance}) => {

    return (
        <header>
            <Navbar expand="lg" className="fixed-top p-2" style={{backgroundColor: "white"}}>
                <Navbar.Brand><h2><strong><a href="./" style={{textDecoration: "none"}}>nu~s</a></strong></h2></Navbar.Brand>
                <Navbar.Toggle className="menu-button" aria-controls="basic-navbar-nav"></Navbar.Toggle>
                <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                    <Nav>
                        {(isLoggedIn == false) ?
                            <>
                                <span className="p-2">total supply: {totalSupply}</span>
                                <Button className="btn-sm btn-dark" onClick={callbackConnect}>Connect</Button>
                            </> :
                            <>
                                <span className="p-2">{loggedInUser}</span>
                                <span className="p-2">|</span>
                                <span className="p-2">total supply: {totalSupply} nu~</span>
                                <span className="p-2">|</span>
                                <span className="p-2">balance: {userBalance} nu~</span>
                                <Link className="nav-link" to={'./submit'}>Submit a Comment</Link>
                            </>   
                        }
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        </header>
    )
};

export default Header;