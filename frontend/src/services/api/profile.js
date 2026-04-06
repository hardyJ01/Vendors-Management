export function get_user(){
    return (
        {
            name : "raj",
            email : "raj@gmail.com",
            phone : "1234123452",
            address : "palanpur",
            business : "farmer",
            profile_pic : "",
            rating : 4,
            no_rating : 1,
            rating_history : [
                {
                    name : "safik",
                    rating : 4,
                    business : "everything",
                    profil_pic : ""
                }
            ],
            qr_code_url : ""
        }
    );
}

export function update_user(name, phone, address, business, profile_pic){
    return (
        {
            status : 200,
            message : "user updated sucessfully",
            error : ""
        }
    );
}

