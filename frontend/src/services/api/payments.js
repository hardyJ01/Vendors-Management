export function get_payments(page, limit){
    return (
        [
            {
                payment_id : 1,
                vendor_name : "safik",
                amount : 2000,
                date : new Date(),
                bill_id : "1"
            },
            {
                payment_id : 1,
                vendor_name : "safik",
                amount : 2000,
                date : new Date(),
                bill_id : "1"
            }
        ]
    );
}

export function make_payment(vendor_id, amount, bill_id){
    return(
        {
            status : 200,
            message : "payment done sucessfully",
            payment_id : 1,
            error : ""
        }
    );
}

export function export_payment(from_date, to_date, formate){
    return(
        {
            status : 200,
            message : "",
            error : ""
        }
    );
}

export function ai_suggest(){
    return(
        {
            suggestions : [
                {
                    bill_id : "1",
                    priority_rank : "1",
                    urgency_level : "high",
                    reason : "",
                    vendor_name : "safik",
                    amount : 2000
                }
            ],
            cached_at : "1234",
            expires_at : "2123"
        }
    );
}

