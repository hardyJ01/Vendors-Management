export function get_bills(status, page, limit){
    return(
        [
            {
                bill_id : "1",
                amount : 2000,
                vendor_name : "safik",
                vendor_id : "1",
                status : "paid",
                created_at : "12341453",
                is_recurring : false,
                is_split : false
            },
            {
                bill_id : "1",
                amount : 2000,
                vendor_name : "safik",
                vendor_id : "1",
                status : "pending",
                created_at : "12341453",
                is_recurring : false,
                is_split : false
            }
        ]
    );
}

export function get_owed_bills(status, page, limit){
    return(
        [
            {
                bill_id : "1",
                amount : 2000,
                vendor_name : "safik",
                vendor_id : "1",
                status : "paid",
                created_at : "12341453",
                is_recurring : false,
                is_split : false
            },
            {
                bill_id : "1",
                amount : 2000,
                vendor_name : "safik",
                vendor_id : "1",
                status : "pending",
                created_at : "12341453",
                is_recurring : false,
                is_split : false
            }
        ]
    );
}

export function add_bill(vendor_id, amount, is_recurring, recurrence_frequency, split_participents){
    return(
        {
            status : 201,
            message : "bill added sucessfully",
            bill_id : 2,
            error : ""
        }
    );
}

export function dispute_bill(bill_id, reason){
    return(
        {
            status : 200,
            message : "bill disputed sucessfully",
            error : ""
        }
    );
}

export function resolve_bill(bill_id){
    return(
        {
            status : 200,
            message : "bill resolve sucessfully",
            error : ""
        }
    );
}

export function cancel_recurring(bill_id){
    return(
        {
            status : 200,
            message : "bill recurring sucessfully",
            error : ""
        }
    );
}

