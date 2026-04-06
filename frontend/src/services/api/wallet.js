export function get_balance(){
    return(
        {
            balance : 10000,
            budget_overall : 5000,
            budget_spent_this_month : 2000
        }
    );
}

export function get_transaction_history(page, limit){
    return (
        {
            transactions : [
                {
                    amount : 2000,
                    type : "payment",
                    timestamp : "123455"
                }
            ]
        }
    );
}

export function deposit(amount){
    return (
        {
            status : 200,
            message : "deposited sucessfully",
            new_balance : 10200,
            error : ""
        }
    );
}

export function withdraw(amount){
    return (
        {
            status : 200,
            message : "withdrawen sucessfully",
            new_balance : 10000,
            error : ""
        }
    );
}

export function set_budget(overall_limit, vendor_limits){
    return (
        {
            status : 200,
            message : "budget set sucessfully",
            error : ""
        }
    );
}

