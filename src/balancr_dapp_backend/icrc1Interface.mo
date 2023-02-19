module {
  public type Account = { owner : Principal; subaccount : ?Subaccount };
  public type Duration = Nat64;
  public type Subaccount = [Nat8];
  public type Timestamp = Nat64;
  public type ApproveArgs = {
    fee : ?Nat;
    memo : ?[Nat8];
    from_subaccount : ?[Nat8];
    created_at_time : ?Nat64;
    amount : Int;
    expires_at : ?Nat64;
    spender : Principal;
  };
  public type ApproveError = {
    #GenericError : { message : Text; error_code : Nat };
    #TemporarilyUnavailable;
    #Duplicate : { duplicate_of : Nat };
    #BadFee : { expected_fee : Nat };
    #CreatedInFuture : { ledger_time : Nat64 };
    #TooOld;
    #Expired : { ledger_time : Nat64 };
    #InsufficientFunds : { balance : Nat };
  };
  public type TransferArgs = {
    to : Account;
    fee : ?Nat;
    memo : ?[Nat8];
    from_subaccount : ?Subaccount;
    created_at_time : ?Timestamp;
    amount : Nat;
  };
  public type TransferError = {
    #GenericError : { message : Text; error_code : Nat };
    #TemporarilyUnavailable;
    #BadBurn : { min_burn_amount : Nat };
    #Duplicate : { duplicate_of : Nat };
    #BadFee : { expected_fee : Nat };
    #CreatedInFuture : { ledger_time : Timestamp };
    #TooOld;
    #InsufficientFunds : { balance : Nat };
  };
  public type TransferFromError = {
    #GenericError : { message : Text; error_code : Nat };
    #TemporarilyUnavailable;
    #InsufficientAllowance : { allowance : Nat };
    #BadBurn : { min_burn_amount : Nat };
    #Duplicate : { duplicate_of : Nat };
    #BadFee : { expected_fee : Nat };
    #CreatedInFuture : { ledger_time : Nat64 };
    #TooOld;
    #InsufficientFunds : { balance : Nat };
  };
  public type TransferFromArgs = {
    to : Account;
    fee : ?Nat;
    from : Account;
    memo : ?[Nat8];
    created_at_time : ?Nat64;
    amount : Nat;
  };
  public type Value = { #Int : Int; #Nat : Nat; #Blob : [Nat8]; #Text : Text };
  public type ICRC1 = actor {
    icrc1_balance_of : shared query Account -> async Nat;
    icrc1_decimals : shared query () -> async Nat8;
    icrc1_fee : shared query () -> async Nat;
    icrc1_metadata : shared query () -> async [(Text, Value)];
    icrc1_minting_account : shared query () -> async ?Account;
    icrc1_name : shared query () -> async Text;
    icrc1_supported_standards : shared query () -> async [
        { url : Text; name : Text }
      ];
    icrc1_symbol : shared query () -> async Text;
    icrc1_total_supply : shared query () -> async Nat;
    icrc1_transfer : shared TransferArgs -> async {
        #Ok : Nat;
        #Err : TransferError;
      };
    icrc2_transfer_from : shared TransferFromArgs -> async {
        #Ok : Nat;
        #Err : TransferFromError;
      };
    icrc2_approve : shared ApproveArgs -> async {
        #Ok : Nat;
        #Err : ApproveError;
      };
  }
}