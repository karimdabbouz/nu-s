import TrieMap "mo:base/TrieMap";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Char "mo:base/Char";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";

import Types "types";


shared(init_msg) actor class Content() {

    let owner = init_msg.caller;


    // ////////////
    // STATE
    // ////////////
    /*
    - commentDB: Stores comments on articles
    - 
    */


    private stable var commentID = 0;

    stable var commentDBStable : [(Types.CommentID, Types.Comment)] = [];
    stable var articleCommentRelStable : [(Types.ArticleID, [Types.CommentID])] = [];

    let commentDB = TrieMap.fromEntries<Types.CommentID, Types.Comment>(commentDBStable.vals(), Nat.equal, Hash.hash);

    private func instantiateRelations() : TrieMap.TrieMap<Types.ArticleID, Buffer.Buffer<Types.CommentID>> {
        let relation = TrieMap.TrieMap<Types.ArticleID, Buffer.Buffer<Types.CommentID>>(Nat.equal, Hash.hash);
        for (val in articleCommentRelStable.vals()) {
            let buf : Buffer.Buffer<Types.CommentID> = Buffer.fromArray(val.1);
            relation.put(val.0, buf);
        };
        return relation;
    };

    let articleCommentRel : TrieMap.TrieMap<Types.ArticleID, Buffer.Buffer<Types.CommentID>> = instantiateRelations();

    system func preupgrade() {
        let interimDB = TrieMap.TrieMap<Types.ArticleID, [Types.CommentID]>(Nat.equal, Hash.hash);
        for (entry in articleCommentRel.entries()) { // need to loop over entries to make the value (Buffer) a stable array
            interimDB.put(entry.0, entry.1.toArray());
        };
        articleCommentRelStable := Iter.toArray(interimDB.entries());
        commentDBStable := Iter.toArray(commentDB.entries());
    };

    system func postupgrade() {
        commentDBStable := [];
        articleCommentRelStable := [];
    };


    // ////////////
    // FUNCTIONS
    // ////////////


    // Add a comment to an article
    public shared(msg) func addComment(articleID: Types.ArticleID, creator: Types.UserID, body: Text, headline: Text, url: ?Text) : async Result.Result<Text, Text> {
        assert (msg.caller == Principal.fromText("lwjt4-byaaa-aaaak-qb22q-cai")); // ONLY THE DAO CAN ADD A COMMENT
        // 1) Add contents of comment to commentDB
        let entry : Types.Comment = {
            id = commentID;
            articleID = articleID;
            creator = creator;
            createdAt = Time.now();
            headline = headline;
            content = body;
            url = url;
            votingWeight = 0;
        };
        commentDB.put(commentID, entry);
        // 2) Add CommentID to articleCommentRel
        let relation = articleCommentRel.get(articleID);
        switch (relation) {
            case (?found) {
                found.add(commentID);
            };
            case (null) {
                let newBuffer = Buffer.Buffer<Types.CommentID>(0);
                newBuffer.add(commentID);
                articleCommentRel.put(articleID, newBuffer);
            };
        };
        commentID += 1;
        return #ok("successfully added comment to article with ArticleID" # Nat.toText(articleID));
    };


    // Get all comments for a given article
    public query func getCommentsForArticle(articleID: Types.ArticleID) : async ?[(Types.CommentID, Types.Comment)] {
        let relation = articleCommentRel.get(articleID);
        switch (relation) {
            case (null) {
                return null;
            };
            case (?found) {
                let newMap = TrieMap.mapFilter<Types.CommentID, Types.Comment, Types.Comment>(
                    commentDB,
                    Nat.equal,
                    Hash.hash,
                    func(key, value) = if (Buffer.contains<Types.CommentID>(found, key, Nat.equal)) {
                        return ?value;
                    } else {
                        return null;
                    }
                );
                return ?Iter.toArray<(Types.CommentID, Types.Comment)>(newMap.entries());
            };
        };
    };


    // Get all comments for a given user
    public query func getCommentsForUser(userID: Types.UserID) : async ?[Types.Comment] {
        let newMap = TrieMap.mapFilter<Types.CommentID, Types.Comment, Types.Comment>(
            commentDB,
            Nat.equal,
            Hash.hash,
            func(key, value) = if (value.creator == userID) {
                return ?value;
            } else {
                return null;
            }
        );
        return ?Iter.toArray<Types.Comment>(newMap.vals());
    };


    // Get all comments
    public query func getAllComments(): async [Types.Comment] {
        return Iter.toArray(commentDB.vals());
    };



    // // ////////////
    // // HTTP ROUTES
    // // ////////////


    // // Simple dynamic routes to catch URLs of format /article/<ARTICLE_ID>
    // // Can trap and matches any digit at the end of a string. Also somewhat messy...
    // public query func http_request(request : Types.HttpRequest) : async Types.HttpResponse {
    //     if (request.method == "GET") {
    //         let pattern : Text.Pattern = #char('/');
    //         let dynamicURL = Array.reverse(Iter.toArray(Text.split(request.url, pattern)));
    //         let param = textToNat(dynamicURL[0]);
    //         if (param == null) {
    //             return {
    //                 status_code = 404;
    //                 headers = [("content-type", "text-plain")];
    //                 body = "404 invalid URL";
    //             };
    //         } else {
    //             let blob : ?Blob = getContentForURL(param);
    //             switch (blob) {
    //                 case (null) {
    //                     return {
    //                         status_code = 404;
    //                         headers = [("content-type", "text-plain")];
    //                         body = "404 invalid URL";
    //                     };
    //                 };
    //                 case (?found) {
    //                     return {
    //                         status_code = 200;
    //                         headers = [("content-type", "text-plain")];
    //                         body = found;
    //                     };
    //                 };
    //             };
    //         };
    //     } else { // no GET request
    //         return {
    //             status_code = 404;
    //             headers = [("content-type", "text-plain")];
    //             body = "404 invalid URL";
    //         };
    //     };
    // };



    // // ///////////////
    // // HELPER
    // // /////////////

    
    // // Helper function: Convert Text to Nat
    // // Credit: https://forum.dfinity.org/t/motoko-convert-text-123-to-nat-or-int-123/7033
    // private func textToNat( txt : Text) : ?Nat {
    //     if (txt.size() <= 0) {
    //         return null;
    //     } else {
    //         let chars = txt.chars();
    //         var num : Nat = 0;
    //         for (v in chars) {
    //             let char = switch (Char.isDigit(v)) {
    //                 case (false) {return null};
    //                 case (true) {
    //                     let charToNum = Nat32.toNat(Char.toNat32(v)-48);
    //                     num := num * 10 + charToNum;
    //                 };
    //             };
    //         };
    //         return ?num;
    //     };
    // };


    // // Helper function: Take an optional paramter of Nat and switch your way through it
    // private func getContentForURL(param : ?Nat) : ?Blob {
    //     switch (param) {
    //         case (null) {return null};
    //         case (?validParam) {
    //             let entry = CommentDB.get(validParam);
    //             switch (entry) {
    //                 case (null) {return null};
    //                 case (?found) {
    //                     switch (found.body) {
    //                         case (null) {return null};
    //                         case (?validText) {
    //                             return ?Text.encodeUtf8(validText);
    //                         };
    //                     };
    //                 };
    //             };
    //         };
    //     };
    // };

}