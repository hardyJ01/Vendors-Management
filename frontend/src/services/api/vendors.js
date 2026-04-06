export function get_vendors(page, limit){
    return (
        [
            {
                vendor_id : "1",
                name : "safik",
                business : "everything",
                profile_pic : "",
                phone_number : "7874483502",
                rating : 5,
                no_rating : 500
            },
            {
                vendor_id : "1",
                name : "safik",
                business : "everything",
                profile_pic : "",
                phone_number : "7874483502",
                rating : 5,
                no_rating : 500
            }
        ]
    );
}

export function get_all_vendors(name_query, business_query, page, limit){
    return (
        [
            {
                vendor_id : "1",
                name : "safik",
                business : "everything",
                profile_pic : "",
                phone_number : "7874483502",
                rating : 5,
                no_rating : 500
            },
            {
                vendor_id : "1",
                name : "safik",
                business : "everything",
                profile_pic : "",
                phone_number : "7874483502",
                rating : 5,
                no_rating : 500
            }
        ]
    );
}

export function add_vendor(vendor_id){
    return(
        {
            status : "201",
            message : "vendor added",
            error : ""
        }
    );
}

export function get_vendor(vendor_id){
    return(
        {
            name : "safik",
            business : "everthing",
            rating : 5,
            no_rating : 500,
            phone_number : "1234567891",
            address : "ghandhinager",
            email : "safik@gmail.com",
            qr_code_url : ""
        }
    );
}

export function has_rated(vendor_id){
    return(
        {
            has_rated : true
        }
    );
}

export function rate(vendor_id, rating){
    return(
        {
            status : "201",
            message : "vendor added",
            error : ""
        }
    );
}