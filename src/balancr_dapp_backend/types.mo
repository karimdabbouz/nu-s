import ICRC1 "icrc1Interface";


module Types {


    public type UserID = Principal;
    public type CommentID = Nat;
    public type ArticleID = Nat;
    // public type HeaderField = (Text, Text);
    public type ProposalID = Nat;

    public type TransferArgs = ICRC1.TransferArgs;
    public type TransferFromArgs = ICRC1.TransferFromArgs;
    public type TransferError = ICRC1.TransferError;
    public type TransferFromError = ICRC1.TransferFromError;
    public type ApproveArgs = ICRC1.ApproveArgs;
    public type ApproveError = ICRC1.ApproveError;


    public type Article = {
        id : Nat;
        createdAt : Int;
        headline : Text;
        excerpt : Text;
        medium : Text;
    };


    public type Comment = {
        id : Nat;
        articleID : ArticleID;
        creator : UserID;
        createdAt : Int;
        headline : Text;
        content : Text;
        url : ?Text; // url to source
    };


    public type Proposal = {
        id : Nat;
        articleID : ArticleID;
        creator : Principal;
        createdAt : Int;
        action : {#addComment; #updateComment; #removeComment};
        status : {#active; #passed; #declined};
        headline : Text;
        content : Text;
        url : ?Text;
        votingWeight: Nat;
    };


    public type UserProfile = {
        id : UserID;
        username : Text;
        mail : ?Text;
        profileImage : ?Blob;
    };

    // public type HttpResponse = {
    //     status_code : Nat16;
    //     headers : [HeaderField];
    //     body : Blob;
    // };


    // public type HttpRequest = {
    //     method : Text;
    //     url : Text;
    //     headers : [HeaderField];
    //     body : Blob;
    // };



}