export function clear_notifications(){
    return(
        {
            status : 200,
            message : "notifcations cleared",
            error : ""
        }
    );
}

export function get_notifications(){
    return(
        [
            {
                vendor_id : "1",
                message : "you owe 2000 rupee to safik",
                link : "",
                crated_at : 124325,
                read : false
            },
            {
                vendor_id : "1",
                message : "you owe 2000 rupee to safik",
                link : "",
                crated_at : 124325,
                read : false
            }
        ]
    );
}