import TrieMap "mo:base/TrieMap";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";
import Hash "mo:base/Hash";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Debug "mo:base/Debug";
import Buffer "mo:base/Buffer";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Text "mo:base/Text";

import Types "types";


actor {

    // ///////////////
    // IMPORT CANISTERS
    // //////////////

    let newsDAOToken = actor "l7kya-xqaaa-aaaak-qb23a-cai" : actor {
        icrc1_balance_of : ({owner: Principal; subaccount: ?[Nat8]}) -> async Nat;
        icrc1_transfer : shared Types.TransferArgs -> async {#Ok : Nat; #Err : Types.TransferError;};
        icrc1_total_supply : shared query () -> async Nat;
        icrc2_transfer_from : shared (Types.TransferFromArgs) -> async {#Ok : Nat; #Err : Types.TransferFromError };
        icrc2_approve : shared (Types.ApproveArgs) -> async {#Ok : Nat; #Err : Types.ApproveError};
    };

    let contentCanister = actor "lrivi-maaaa-aaaak-qb22a-cai" : actor {
        addComment : (Types.ArticleID, Types.UserID, Text, Text, ?Text) -> async {#ok: Text; #err: Text;};
    };


    // /////////////
    // STATE
    // /////////////

    private stable var proposalID = 0;

    stable var userDBStable : [(Types.UserID, Types.UserProfile)] = [];
    stable var proposalDBStable : [(Types.ProposalID, Types.Proposal)] = [];
    stable var usernameDBStable : [(Text, Types.UserID)] = [];
    stable var proposalUsersDBStable : [(Types.ProposalID, [Types.UserID])] = [];

    let userDB = TrieMap.fromEntries<Types.UserID, Types.UserProfile>(userDBStable.vals(), Principal.equal, Principal.hash);
    let proposalDB = TrieMap.fromEntries<Types.ProposalID, Types.Proposal>(proposalDBStable.vals(), Nat.equal, Hash.hash);
    let usernameDB = TrieMap.fromEntries<Text, Types.UserID>(usernameDBStable.vals(), Text.equal, Text.hash);

    // Helper to go from stable to TrieMap containing non-stable type Buffer
    private func instantiateRelations() : TrieMap.TrieMap<Types.ProposalID, Buffer.Buffer<Types.UserID>> {
        let relation = TrieMap.TrieMap<Types.ProposalID, Buffer.Buffer<Types.UserID>>(Nat.equal, Hash.hash);
        for (val in proposalUsersDBStable.vals()) {
            let buf = Buffer.Buffer<Types.UserID>(0);
            for (user in val.1.vals()) {
                buf.add(user);
            };
            relation.put(val.0, buf);
        };
        return relation;
    };

    let proposalUsersDB : TrieMap.TrieMap<Types.ProposalID, Buffer.Buffer<Types.UserID>> = instantiateRelations();

    system func preupgrade() {
        let interimDB = TrieMap.TrieMap<Types.ProposalID, [Types.UserID]>(Nat.equal, Hash.hash);
        for (entry in proposalUsersDB.entries()) { // need to loop over entries to make the value (Buffer) a stable array
            interimDB.put(entry.0, entry.1.toArray());
        };
        proposalUsersDBStable := Iter.toArray(interimDB.entries());
        userDBStable := Iter.toArray(userDB.entries());
        proposalDBStable := Iter.toArray(proposalDB.entries());
        usernameDBStable := Iter.toArray(usernameDB.entries());
    };

    system func postupgrade() {
        userDBStable := [];
        proposalDBStable := [];
        usernameDBStable := [];
        proposalUsersDBStable := [];
    };
    

    // ////////////
    // FUNCTIONS
    // ///////////

    // Create a user profile for msg.caller
    public shared(msg) func createUserProfile(username: Text, mail: ?Text, profileImage: ?Blob) : async Result.Result<Text, Text> {
        assert (msg.caller != Principal.fromText("2vxsx-fae"));
        let usernameEntry = usernameDB.get(username);
        switch (usernameEntry) {
            case (null) {
                let entry = userDB.get(msg.caller);
                switch (entry) {
                    case (null) {
                        let user : Types.UserProfile = {
                            id = msg.caller;
                            username = username;
                            mail = mail;
                            profileImage = profileImage;
                        };
                        userDB.put(msg.caller, user);
                        usernameDB.put(username, msg.caller);
                        let response = await newsDAOToken.icrc1_transfer({to = {owner = msg.caller; subaccount = null;}; fee = null; memo = null; from_subaccount = null; created_at_time = null; amount = 300000000});
                        return #ok("successfully created user with UserID" # Principal.toText(msg.caller));
                    };
                    case (?exists) {
                        return #err("a user with this UserID already exists");
                    };
                };
            };
            case (?usernameExists) {
                return #err("this username already exists.");
            };
        };
    };


    // Get a specific user by her UserID
    public query func getUser(userID: Types.UserID) : async ?Types.UserProfile {
        return userDB.get(userID);
    };


    // Mint new tokens to a user's account
    private func mintToUser(userID: Types.UserID, amount: Nat) : async Result.Result<Text, Text> {
        let response = await newsDAOToken.icrc1_transfer({to = {owner = userID; subaccount = null;}; fee = null; memo = null; from_subaccount = null; created_at_time = null; amount = amount});
        return #ok("successfully minted " # Nat.toText(amount) # " nu~ to user with userID " # Principal.toText(userID));
    };


    // Get token balance from newsDAOToken for a given UserID
    public shared func getTokenBalance(userID: Types.UserID) : async Nat {
        let balance = await newsDAOToken.icrc1_balance_of({owner = userID; subaccount = null});
        return balance;
    };


    // Check if user exists and return Boolean
    public query func checkUserExists(userID: Types.UserID) : async Bool {
        switch (userDB.get(userID)) {
            case (null) {return false};
            case (_) {return true};
        };
    };


    // get_all_proposals
    public query func get_all_proposals() : async [(Types.ProposalID, Types.Proposal)]  {
        let result : [(Types.ProposalID, Types.Proposal)] = Iter.toArray<(Types.ProposalID, Types.Proposal)>(proposalDB.entries());
        return result;
    };


    // submit_proposal
    public shared(msg) func submit_proposal(articleID : Types.ArticleID, action : {#addComment; #updateComment; #removeComment}, headline : Text, content : Text, url: ?Text) : async Types.ProposalID {
        assert (msg.caller != Principal.fromText("2vxsx-fae"));
        let newProposal : Types.Proposal = {
            id = proposalID;
            articleID = articleID;
            creator = msg.caller;
            createdAt = Time.now();
            action = action;
            status = #active;
            headline = headline;
            content = content;
            url = url;
            votingWeight = 0;
        };
        proposalDB.put(proposalID, newProposal);
        proposalID += 1;
        return proposalID;
    };


    // vote
    public shared(msg) func vote(proposalID : Types.ProposalID, vote : {#pro; #con}) : async Result.Result<Text, Text> {
        let voters = switch (proposalUsersDB.get(proposalID)) {
            case (null) {Buffer.Buffer<Types.UserID>(0)};
            case (?found) {
                found
            };
        };
        if (Buffer.contains<Types.UserID>(voters, msg.caller, Principal.equal) == true) {
            return #err("you have already voted on this proposal.");
        };

        let votingPower = await newsDAOToken.icrc1_balance_of({owner = msg.caller; subaccount = null});
        let totalSupply = await newsDAOToken.icrc1_total_supply();
        let quorum = totalSupply / 3;
        assert (votingPower >= 1);

        let proposal = proposalDB.get(proposalID);
        var proposalData = switch (proposal) {
            case (null) {return #err("proposal not found.")};
            case (?proposalFound) {
                {
                    id = proposalFound.id;
                    articleID = proposalFound.articleID;
                    creator = proposalFound.creator;
                    createdAt = proposalFound.createdAt;
                    action = proposalFound.action;
                    status = proposalFound.status;
                    headline = proposalFound.headline;
                    content = proposalFound.content;
                    url = proposalFound.url;
                    votingWeight = proposalFound.votingWeight;
                };
            };
        };
        switch (vote) {
            case (#pro) {
                if (proposalData.votingWeight + votingPower >= quorum) { // proposal passed when this vote is added
                    proposalData := {
                        id = proposalData.id;
                        articleID = proposalData.articleID;
                        creator = proposalData.creator;
                        createdAt = proposalData.createdAt;
                        action = proposalData.action;
                        status = #passed;
                        headline = proposalData.headline;
                        content = proposalData.content;
                        url = proposalData.url;
                        votingWeight = proposalData.votingWeight + votingPower;
                    };
                    proposalDB.put(proposalID, proposalData);
                } else { // proposal not passed yet
                    proposalData := {
                        id = proposalData.id;
                        articleID = proposalData.articleID;
                        creator = proposalData.creator;
                        createdAt = proposalData.createdAt;
                        action = proposalData.action;
                        status = proposalData.status;
                        headline = proposalData.headline;
                        content = proposalData.content;
                        url = proposalData.url;
                        votingWeight = proposalData.votingWeight + votingPower;
                    };
                    proposalDB.put(proposalID, proposalData);
                };
            };
            // there are no #con votes in this case:
            case (_) {
                return #err("there are no con-votes in nu~s");
            };
        };
        voters.add(msg.caller);
        proposalUsersDB.put(proposalID, voters);
        // voting earns 0.1 nu:
        let response = mintToUser(msg.caller, 10000000);
        switch (proposalData.status) {
            case (#passed) {
                switch (proposalData.action) {
                    case (#addComment) {
                        // ADD ACTION HERE!!!
                        let response = await contentCanister.addComment(proposalData.articleID, proposalData.creator, proposalData.content, proposalData.headline, proposalData.url);
                        return #ok("proposal passed. adding new source.")
                    };
                    case (#removeComment) {
                        // let response = await webpageCanister.removeArticleSource(proposalData.sourceID);
                        return #ok("removing a comment has not been implemented...")
                        };
                    case (#updateComment) {
                        // let response = await webpageCanister.updateArticleSource(proposalData.sourceID, proposalData.desiredChange);
                        return #ok("updating a comment has not been implemented...")
                        };
                };
            };
            case (#declined) {return #ok("proposal declined. no action to be taken.")};
            case (_) {return #ok("vote has been counted. no decision has been made yet.")};
        };
    };

};
